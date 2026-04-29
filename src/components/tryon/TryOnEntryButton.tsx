import { lazy, Suspense, useRef, useState } from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TryOnExperience = lazy(() => import("./TryOnExperience").then(m => ({ default: m.TryOnExperience })));

interface TryOnEntryButtonProps {
  variant?: "primary" | "ghost" | "chip";
  label?: string;
  source: string;
  className?: string;
}

/**
 * Reusable "Preview a New Hairstyle" CTA. Lazy-loads the heavy modal so it
 * never touches the eager hero bundle. Renamed from "Try Your New Look" so
 * guests don't expect nail/lash/skincare previews — this is hair-only.
 */
export const TryOnEntryButton = ({
  variant = "primary",
  label = "Preview a New Hairstyle",
  source,
  className,
}: TryOnEntryButtonProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Restore focus to the exact trigger the guest clicked when the modal
  // closes. Wait one frame so the modal's own focus traps fully tear down
  // before we steal focus back — prevents the browser dropping focus to
  // <body> and skipping the visible focus ring.
  const handleClose = () => {
    setOpen(false);
    requestAnimationFrame(() => {
      // preventScroll keeps the page steady — the trigger is already in
      // view since the guest just clicked it. Without this the browser
      // would scroll the trigger into the default position.
      triggerRef.current?.focus({ preventScroll: true });
    });
  };

  const base = "inline-flex items-center justify-center gap-2 font-body transition-colors";
  const styles = {
    primary: "btn-gold py-3 px-6 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-transform",
    ghost:   "rounded-full border border-gold/40 bg-charcoal/30 px-4 py-2 text-sm text-cream/85 hover:border-gold hover:text-gold backdrop-blur-sm",
    chip:    "rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20",
  } as const;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(base, styles[variant], className)}
        aria-label={label}
      >
        <Wand2 className={variant === "chip" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {label}
      </button>
      {open && (
        <Suspense fallback={null}>
          <TryOnExperience source={source} onClose={handleClose} />
        </Suspense>
      )}
    </>
  );
};