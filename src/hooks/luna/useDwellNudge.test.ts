import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDwellNudge, type DwellNudge } from "./useDwellNudge";

type IOCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;

let ioCallback: IOCallback | null = null;

class MockIntersectionObserver {
  callback: IOCallback;
  constructor(cb: IOCallback) {
    this.callback = cb;
    ioCallback = cb;
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

class MockMutationObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(_cb: MutationCallback) {}
}

beforeEach(() => {
  sessionStorage.clear();
  ioCallback = null;
  // @ts-expect-error - install mocks
  globalThis.IntersectionObserver = MockIntersectionObserver;
  // @ts-expect-error - install mocks
  globalThis.MutationObserver = MockMutationObserver;

  // Stub rAF to a setTimeout-driven loop so vi.advanceTimersByTime drives it
  let rafCounter = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCounter += 1;
    return setTimeout(() => cb(performance.now()), 16) as unknown as number;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));

  // Add target sections so getElementById succeeds
  document.body.innerHTML = `
    <section id="services"></section>
    <section id="artists"></section>
  `;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("useDwellNudge", () => {
  it("fires compare nudge after threshold dwell on visible section", () => {
    const onFire = vi.fn<(n: DwellNudge) => void>();
    renderHook(() =>
      useDwellNudge({ isOpen: false, onFire, thresholdMs: 1000 })
    );

    // Mark services as visible
    act(() => {
      ioCallback?.([
        {
          target: document.getElementById("services")!,
          isIntersecting: true,
          intersectionRatio: 0.6,
        } as unknown as IntersectionObserverEntry,
      ]);
    });

    // Drive rAF ticks past the 1s threshold
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onFire).toHaveBeenCalledTimes(1);
    expect(onFire).toHaveBeenCalledWith({ kind: "compare", section: "services" });
    expect(sessionStorage.getItem("hush_luna_compare_nudge_shown")).toBe("1");
  });

  it("does not fire when panel is open", () => {
    const onFire = vi.fn();
    renderHook(() =>
      useDwellNudge({ isOpen: true, onFire, thresholdMs: 500 })
    );

    act(() => {
      ioCallback?.([
        {
          target: document.getElementById("services")!,
          isIntersecting: true,
          intersectionRatio: 1,
        } as unknown as IntersectionObserverEntry,
      ]);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onFire).not.toHaveBeenCalled();
  });

  it("does not fire if already shown this session", () => {
    sessionStorage.setItem("hush_luna_compare_nudge_shown", "1");
    const onFire = vi.fn();
    renderHook(() =>
      useDwellNudge({ isOpen: false, onFire, thresholdMs: 100 })
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onFire).not.toHaveBeenCalled();
  });

  it("does not fire when section is not sufficiently visible", () => {
    const onFire = vi.fn();
    renderHook(() =>
      useDwellNudge({ isOpen: false, onFire, thresholdMs: 500 })
    );

    act(() => {
      ioCallback?.([
        {
          target: document.getElementById("artists")!,
          isIntersecting: true,
          intersectionRatio: 0.1, // below 0.4 threshold
        } as unknown as IntersectionObserverEntry,
      ]);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onFire).not.toHaveBeenCalled();
  });
});
