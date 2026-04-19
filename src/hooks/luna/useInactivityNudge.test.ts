import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInactivityNudge, type InactivityNudge } from "./useInactivityNudge";

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
  document.body.innerHTML = `<section id="experience-finder"></section>`;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("useInactivityNudge", () => {
  it("fires after inactivity when section is visible", () => {
    const onFire = vi.fn<(n: InactivityNudge) => void>();
    renderHook(() =>
      useInactivityNudge({ isOpen: false, onFire, inactivityMs: 1000 })
    );

    act(() => {
      ioCallback?.([
        {
          target: document.getElementById("experience-finder")!,
          isIntersecting: true,
          intersectionRatio: 0.6,
        } as IntersectionObserverEntry,
      ]);
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onFire).toHaveBeenCalledTimes(1);
    expect(onFire).toHaveBeenCalledWith({ kind: "finder-stuck" });
    expect(sessionStorage.getItem("hush_luna_finder_stuck_nudge_shown")).toBe("1");
  });

  it("resets timer on user activity", () => {
    const onFire = vi.fn();
    renderHook(() =>
      useInactivityNudge({ isOpen: false, onFire, inactivityMs: 1000 })
    );

    const target = document.getElementById("experience-finder")!;
    act(() => {
      ioCallback?.([
        {
          target,
          isIntersecting: true,
          intersectionRatio: 0.6,
        } as IntersectionObserverEntry,
      ]);
    });

    // Advance partway, then trigger activity to reset
    act(() => {
      vi.advanceTimersByTime(700);
    });
    act(() => {
      target.dispatchEvent(new Event("click", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(onFire).not.toHaveBeenCalled();

    // Now let it fully elapse
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it("does not fire when section is not visible", () => {
    const onFire = vi.fn();
    renderHook(() =>
      useInactivityNudge({ isOpen: false, onFire, inactivityMs: 500 })
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onFire).not.toHaveBeenCalled();
  });

  it("does not fire when panel is open", () => {
    const onFire = vi.fn();
    renderHook(() =>
      useInactivityNudge({ isOpen: true, onFire, inactivityMs: 500 })
    );
    act(() => {
      ioCallback?.([
        {
          target: document.getElementById("experience-finder")!,
          isIntersecting: true,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onFire).not.toHaveBeenCalled();
  });

  it("does not fire if already shown this session", () => {
    sessionStorage.setItem("hush_luna_finder_stuck_nudge_shown", "1");
    const onFire = vi.fn();
    renderHook(() =>
      useInactivityNudge({ isOpen: false, onFire, inactivityMs: 100 })
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onFire).not.toHaveBeenCalled();
  });
});
