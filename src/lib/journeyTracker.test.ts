import { describe, it, expect, beforeEach, vi } from "vitest";

// The module holds singleton state, so we re-import a fresh copy in each test.
type Tracker = typeof import("./journeyTracker");

let tracker: Tracker;

// ----- IntersectionObserver mock -----
type IOCallback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IOCallback;
  options: IntersectionObserverInit | undefined;
  observed: Element[] = [];

  constructor(cb: IOCallback, options?: IntersectionObserverInit) {
    this.callback = cb;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element) { this.observed.push(el); }
  unobserve(el: Element) { this.observed = this.observed.filter((x) => x !== el); }
  disconnect() { this.observed = []; }
  takeRecords() { return []; }

  // Test helper — fire entries through the registered callback
  trigger(entries: Array<{ isIntersecting: boolean; target: Element }>) {
    this.callback(entries);
  }
}

function makeSection(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

function installEnv() {
  // @ts-expect-error — install mock IO on globalThis (module reads it at call time)
  globalThis.IntersectionObserver = MockIntersectionObserver;
  // Synchronous rAF — assign directly so it survives fake timers
  // @ts-expect-error
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 1; };
}

describe("journeyTracker", () => {
  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = "";
    localStorage.clear();
    MockIntersectionObserver.instances = [];
    installEnv();
    tracker = await import("./journeyTracker");
  });

  describe("initJourneyTracking", () => {
    it("creates an IntersectionObserver with threshold 0.3", () => {
      tracker.initJourneyTracking();
      expect(MockIntersectionObserver.instances).toHaveLength(1);
      expect(MockIntersectionObserver.instances[0].options).toEqual({ threshold: 0.3 });
    });

    it("observes every section[id] in the DOM", () => {
      makeSection("services");
      makeSection("artists");
      makeSection("booking");
      // sections without an id should be ignored
      const noId = document.createElement("section");
      document.body.appendChild(noId);

      tracker.initJourneyTracking();

      const io = MockIntersectionObserver.instances[0];
      expect(io.observed).toHaveLength(3);
      expect(io.observed.map((el) => (el as HTMLElement).id).sort()).toEqual([
        "artists",
        "booking",
        "services",
      ]);
    });

    it("is idempotent — calling twice does not create a second observer", () => {
      tracker.initJourneyTracking();
      tracker.initJourneyTracking();
      expect(MockIntersectionObserver.instances).toHaveLength(1);
    });

    it("records a section_viewed event the first time a section intersects", () => {
      const services = makeSection("services");
      tracker.initJourneyTracking();
      const io = MockIntersectionObserver.instances[0];

      io.trigger([{ isIntersecting: true, target: services }]);

      const ctx = tracker.getJourneyContextString();
      expect(ctx).toContain("Services Menu");
    });

    it("does not double-count a section that intersects multiple times", () => {
      const services = makeSection("services");
      tracker.initJourneyTracking();
      const io = MockIntersectionObserver.instances[0];

      io.trigger([{ isIntersecting: true, target: services }]);
      io.trigger([{ isIntersecting: true, target: services }]);
      io.trigger([{ isIntersecting: true, target: services }]);

      // Only one section_viewed event for "services" should exist.
      // We can verify via the booking-intent path (recent events scan).
      // Simpler: trigger booking and ensure proactive logic still sees one services entry.
      const ctx = tracker.getJourneyContextString();
      const matches = ctx.match(/Services Menu/g) || [];
      expect(matches).toHaveLength(1);
    });

    it("ignores entries where isIntersecting is false", () => {
      const services = makeSection("services");
      tracker.initJourneyTracking();
      const io = MockIntersectionObserver.instances[0];

      io.trigger([{ isIntersecting: false, target: services }]);

      expect(tracker.getJourneyContextString()).not.toContain("Services Menu");
    });

    it("ignores intersecting elements with no id", () => {
      const noId = document.createElement("section");
      document.body.appendChild(noId);
      tracker.initJourneyTracking();
      const io = MockIntersectionObserver.instances[0];

      // Note: this element wasn't observed, but defensively trigger anyway
      expect(() => io.trigger([{ isIntersecting: true, target: noId }])).not.toThrow();
      expect(tracker.getJourneyContextString()).toBe("");
    });

    it("schedules section discovery via requestAnimationFrame", () => {
      const rafSpy = vi.spyOn(globalThis, "requestAnimationFrame");
      makeSection("services");
      tracker.initJourneyTracking();
      expect(rafSpy).toHaveBeenCalledTimes(1);
      rafSpy.mockRestore();
    });
  });

  describe("trackArtistClick / trackServiceClick deduplication", () => {
    it("dedupes repeated artist clicks", () => {
      tracker.trackArtistClick("Sheri");
      tracker.trackArtistClick("Sheri");
      tracker.trackArtistClick("Danielle");
      const ctx = tracker.getJourneyContextString();
      expect(ctx).toContain("Sheri, Danielle");
      expect(ctx).not.toContain("Sheri, Sheri");
    });

    it("dedupes repeated service clicks", () => {
      tracker.trackServiceClick("Balayage", "hair");
      tracker.trackServiceClick("Balayage", "hair");
      const ctx = tracker.getJourneyContextString();
      const matches = ctx.match(/Balayage/g) || [];
      expect(matches).toHaveLength(1);
    });
  });

  describe("getProactiveSuggestion", () => {
    it("returns null when nothing has happened", () => {
      expect(tracker.getProactiveSuggestion()).toBeNull();
    });

    it("suggests artist help after 3+ artist views and >30s on site", () => {
      vi.useFakeTimers();
      const start = Date.now();
      vi.setSystemTime(start);

      tracker = require("./journeyTracker"); // reload so pageLoadTime aligns? not needed — module already loaded
      // Reload module so pageLoadTime = `start`
      vi.resetModules();
      // Re-stub IO before reloading
      // @ts-expect-error
      globalThis.IntersectionObserver = MockIntersectionObserver;

      return import("./journeyTracker").then((fresh) => {
        fresh.trackArtistClick("Sheri");
        fresh.trackArtistClick("Danielle");
        fresh.trackArtistClick("Kathy");

        vi.setSystemTime(start + 31_000);
        const sug = fresh.getProactiveSuggestion();
        expect(sug?.type).toBe("artist");
        expect(sug?.message).toContain("Sheri");
        vi.useRealTimers();
      });
    });

    it("suggests booking after 2min on site + booking section viewed", async () => {
      vi.useFakeTimers();
      const start = Date.now();
      vi.setSystemTime(start);
      vi.resetModules();
      // @ts-expect-error
      globalThis.IntersectionObserver = MockIntersectionObserver;

      const fresh = await import("./journeyTracker");
      const booking = makeSection("booking");
      fresh.initJourneyTracking();
      MockIntersectionObserver.instances.at(-1)!.trigger([
        { isIntersecting: true, target: booking },
      ]);

      vi.setSystemTime(start + 121_000);
      const sug = fresh.getProactiveSuggestion();
      expect(sug?.type).toBe("booking");
      expect(sug?.message).toContain("(520) 327-6753");
      vi.useRealTimers();
    });
  });

  describe("getJourneyContextString — concierge context", () => {
    it("incorporates Experience Finder selections from localStorage", () => {
      localStorage.setItem(
        "hush_concierge_context",
        JSON.stringify({
          categories: ["hair", "lashes"],
          goal: "refresh",
          timing: "this_week",
          preferredArtist: "Allison",
        })
      );

      const ctx = tracker.getJourneyContextString();
      expect(ctx).toContain("hair, lashes");
      expect(ctx).toContain("refresh");
      expect(ctx).toContain("this_week");
      expect(ctx).toContain("Allison");
    });

    it("does not throw on malformed concierge JSON", () => {
      localStorage.setItem("hush_concierge_context", "{not json");
      expect(() => tracker.getJourneyContextString()).not.toThrow();
    });
  });
});
