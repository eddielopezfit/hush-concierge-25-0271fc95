import { useEffect } from "react";

export type InactivityNudge = { kind: "finder-stuck" };

interface Options {
  isOpen: boolean;
  onFire: (nudge: InactivityNudge) => void;
  targetId?: string;
  inactivityMs?: number;
  storageKey?: string;
}

/**
 * Fires a "stuck?" nudge once per session if the target section
 * (default #experience-finder) is visible and the user has been
 * inactive for `inactivityMs` (default 20s) while the panel is closed.
 */
export function useInactivityNudge({
  isOpen,
  onFire,
  targetId = "experience-finder",
  inactivityMs = 20_000,
  storageKey = "hush_luna_finder_stuck_nudge_shown",
}: Options) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(storageKey)) return;

    let visible = false;
    let timeoutId: number | null = null;
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let el: HTMLElement | null = null;

    const events: Array<keyof DocumentEventMap> = ["click", "keydown", "pointerdown", "touchstart"];

    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const fire = () => {
      if (isOpen || sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
      onFire({ kind: "finder-stuck" });
      teardown();
    };

    const armTimer = () => {
      clearTimer();
      if (!visible || isOpen) return;
      timeoutId = window.setTimeout(fire, inactivityMs);
    };

    const onActivity = () => armTimer();

    function teardown() {
      clearTimer();
      observer?.disconnect();
      mutationObserver?.disconnect();
      if (el) events.forEach((ev) => el!.removeEventListener(ev, onActivity));
      window.removeEventListener("scroll", onActivity);
    }

    const attach = (target: HTMLElement) => {
      el = target;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible = entry.isIntersecting && entry.intersectionRatio >= 0.4;
          }
          if (visible) armTimer();
          else clearTimer();
        },
        { threshold: [0, 0.4, 1] }
      );
      observer.observe(target);
      events.forEach((ev) =>
        target.addEventListener(ev, onActivity, { passive: true } as AddEventListenerOptions)
      );
      window.addEventListener("scroll", onActivity, { passive: true });
    };

    const found = document.getElementById(targetId);
    if (found) {
      attach(found);
    } else {
      mutationObserver = new MutationObserver(() => {
        const target = document.getElementById(targetId);
        if (target) {
          mutationObserver?.disconnect();
          mutationObserver = null;
          attach(target);
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return teardown;
  }, [isOpen, onFire, targetId, inactivityMs, storageKey]);
}
