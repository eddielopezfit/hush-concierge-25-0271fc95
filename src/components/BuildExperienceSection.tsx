import { motion } from "framer-motion";
import { Clock, Layers, ChevronRight } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";
import { categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";
import { ServiceCategoryId } from "@/types/concierge";
import { useMemo } from "react";

interface ExperienceSnapshot {
  categories: ServiceCategoryId[];
  goal: string | null;
  timing: string | null;
}

function getTimeEstimate(snap: ExperienceSnapshot): string | null {
  if (snap.categories.length === 0) return null;
  const timeMap: Record<ServiceCategoryId, [number, number]> = {
    hair: [45, 180],
    nails: [30, 90],
    lashes: [45, 120],
    skincare: [45, 90],
    massage: [60, 120],
  };
  let min = 0;
  let max = 0;
  for (const cat of snap.categories) {
    const [lo, hi] = timeMap[cat] || [30, 60];
    min += lo;
    max += hi;
  }
  const fmtTime = (m: number) => m >= 60 ? `${Math.round(m / 60 * 10) / 10}`.replace(/\.0$/, "") + " hr" + (m > 60 ? "s" : "") : `${m} min`;
  if (min === max) return `~${fmtTime(min)}`;
  return `${fmtTime(min)} – ${fmtTime(max)}`;
}

export const BuildExperienceSection = () => {
  const { conciergeContext } = useLuna();

  const snap = useMemo<ExperienceSnapshot>(() => ({
    categories: conciergeContext?.categories || [],
    goal: conciergeContext?.goal || null,
    timing: conciergeContext?.timing || null,
  }), [conciergeContext]);

  const timeEstimate = getTimeEstimate(snap);
  const hasContext = snap.categories.length > 0;

  // Hide entirely when no context
  if (!hasContext) return null;

  const catLabels = snap.categories.map(c => categoryLabels[c] || c);
  const goalLabel = snap.goal ? goalLabels[snap.goal] || snap.goal : null;
  const timingLabel = snap.timing ? timingLabels[snap.timing] || snap.timing : null;
  const isMultiService = snap.categories.length > 1;

  const handleScrollToBooking = () => {
    const el = document.getElementById("callback");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-16 px-6 relative overflow-hidden">
      {/* Video background — hidden on mobile */}
      <div className="absolute inset-0 hidden md:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
          poster="/videos/hush-interior-poster.jpg"
        >
          <source src="/videos/hush-interior.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="absolute inset-0 pointer-events-none md:hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-luxury rounded-xl p-6 md:p-8"
        >
          <h3 className="font-display text-xl md:text-2xl text-cream mb-4 text-center">
            Your Visit Summary
          </h3>

          {/* Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {catLabels.map(label => (
              <span key={label} className="text-xs font-body bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                {label}
              </span>
            ))}
            {goalLabel && (
              <span className="text-xs font-body bg-accent/10 text-accent-foreground border border-accent/20 px-3 py-1 rounded-full">
                {goalLabel}
              </span>
            )}
            {timingLabel && (
              <span className="text-xs font-body bg-secondary text-secondary-foreground border border-border px-3 py-1 rounded-full">
                {timingLabel}
              </span>
            )}
            {isMultiService && (
              <span className="text-xs font-body bg-primary/5 text-primary/70 border border-primary/15 px-3 py-1 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Multi-service
              </span>
            )}
          </div>

          {/* Time estimate */}
          {timeEstimate && (
            <p className="font-body text-xs text-muted-foreground flex items-center justify-center gap-1.5 mb-5">
              <Clock className="w-3 h-3 text-primary/50" />
              Estimated visit: {timeEstimate}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleScrollToBooking}
            className="btn-gold py-3 px-8 text-sm w-full flex items-center justify-center gap-2"
          >
            Request Your Appointment
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
