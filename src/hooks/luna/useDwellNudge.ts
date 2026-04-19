import { useEffect } from "react";

export type DwellNudge = { kind: "compare"; section: "services" | "artists" };

interface Options {
  isOpen: boolean;
  onFire: (nudge: DwellNudge) => void;
  thresholdMs?: number;
  storageKey?: string;
}

/**
 * Fires a "compare" nudge once per session when the user dwells on
 * #services or #artists for `thresholdMs` (default 30s) while the
 * Luna panel is closed.
 */
export function useDwellNudge({
  isOpen,
  onFire,
  thresholdMs = 30_000,
  storageKey = "hush_luna_compare_nudge_shown",
}: Options) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(storageKey)) return;

    const dwellMs: Record<string, number> = { services: 0, artists: 0 };
    const visible: Record<string, boolean> = { services: false, artists: false };
    let lastTick = performance.now();
    let rafId: number | null = null;
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    const observed = new Set<Element>();

    const tick = (now: number) => {
      const delta = now - lastTick;
      lastTick = now;
      for (const id of ["services", "artists"] as const) {
        if (visible[id]) {
          dwellMs[id] += delta;
          if (dwellMs[id] >= thresholdMs && !isOpen && !sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "1");
            onFire({ kind: "compare", section: id });
            cleanup();
            return;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id as "services" | "artists";
          visible[id] = entry.isIntersecting && entry.intersectionRatio >= 0.4;
        }
      },
      { threshold: [0, 0.4, 1] }
    );

    const tryObserve = (id: string) => {
      const el = document.getElementById(id);
      if (el && !observed.has(el)) {
        observed.add(el);
        observer!.observe(el);
      }
    };

    tryObserve("services");
    tryObserve("artists");

    mutationObserver = new MutationObserver(() => {
      tryObserve("services");
      tryObserve("artists");
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    lastTick = performance.now();
    rafId = requestAnimationFrame(tick);

    function cleanup() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer?.disconnect();
      mutationObserver?.disconnect();
    }
    return cleanup;
  }, [isOpen, onFire, thresholdMs, storageKey]);
}
