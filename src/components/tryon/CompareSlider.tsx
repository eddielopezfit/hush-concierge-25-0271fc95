import { useCallback, useEffect, useRef, useState } from "react";

interface CompareSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * Lightweight before/after compare slider — touch + mouse + keyboard.
 * No external dep.
 */
export const CompareSlider = ({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Your new look",
}: CompareSliderProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPct((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      const clientX = "touches" in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
      if (typeof clientX === "number") setFromClientX(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [setFromClientX]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none overflow-hidden rounded-lg border border-border bg-charcoal"
      style={{ aspectRatio: "3 / 4" }}
      onMouseDown={(e) => { draggingRef.current = true; setFromClientX(e.clientX); }}
      onTouchStart={(e) => { draggingRef.current = true; const t = e.touches[0]; if (t) setFromClientX(t.clientX); }}
      role="img"
      aria-label={`${beforeLabel} vs ${afterLabel} comparison`}
    >
      <img src={afterSrc} alt={afterLabel} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 h-full w-full object-cover" style={{ width: `${100 / (pct / 100)}%`, maxWidth: "none" }} draggable={false} />
      </div>
      {/* Labels */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-charcoal/70 px-2.5 py-1 font-body text-[11px] uppercase tracking-wider text-cream/90 backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-gold/80 px-2.5 py-1 font-body text-[11px] uppercase tracking-wider text-charcoal backdrop-blur-sm">
        {afterLabel}
      </span>
      {/* Divider + handle */}
      <div
        className="absolute top-0 bottom-0 w-px bg-gold/90 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
        style={{ left: `${pct}%` }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gold flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-charcoal" fill="currentColor" aria-hidden="true">
            <path d="M9 7L4 12l5 5V7zM15 7v10l5-5-5-5z" />
          </svg>
        </div>
      </div>
    </div>
  );
};