import { m } from "framer-motion";
import { Clock, Layers, ChevronRight, Sparkles, CalendarClock, Plus, Zap, RefreshCw, Heart, Star, MessageCircle } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";
import { categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";

import { getUpsells, UpsellItem } from "@/lib/upsellEngine";
import { getCadenceRecommendations, CadenceRecommendation } from "@/lib/cadenceEngine";
import { buildCategoryPlanItems, computePlanTotals } from "@/lib/experienceReveal";
import { getEmotionalLine } from "@/lib/emotionalCopy";
import { useMemo, useState, useEffect } from "react";

const visitTypeMap: Record<string, { label: string; icon: typeof Sparkles }> = {
  transform: { label: "Transformation", icon: Zap },
  refresh:   { label: "Maintenance", icon: RefreshCw },
  relax:     { label: "Relaxation", icon: Heart },
  event:     { label: "Event Prep", icon: Star },
};


const PlanSkeleton = () => (
  <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-card to-background overflow-hidden">
    <div className="h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent animate-pulse" />
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-48 bg-gold/10 rounded-full animate-pulse" />
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-muted/50 rounded animate-pulse" />
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-7 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="h-32 bg-muted/30 rounded-xl animate-pulse" />
      <div className="h-12 bg-gold/20 rounded-lg animate-pulse" />
    </div>
  </div>
);

export const PersonalizedPlanSection = () => {
  const { conciergeContext, openChatWidget } = useLuna();
  const [isLoading, setIsLoading] = useState(true);

  const categories = conciergeContext?.categories || [];
  const goal = conciergeContext?.goal || null;
  const timing = conciergeContext?.timing || null;

  const upsells = useMemo(() => getUpsells(conciergeContext), [conciergeContext]);
  const cadence = useMemo(() => getCadenceRecommendations(categories), [categories]);
  const planTotals = useMemo(() => computePlanTotals(buildCategoryPlanItems(conciergeContext)), [conciergeContext]);
  const timeEstimate = planTotals?.timeRange || null;
  const emotionalLine = getEmotionalLine(goal);

  useEffect(() => {
    if (categories.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [categories.length]);

  if (categories.length === 0) return null;

  const catLabels = categories.map(c => categoryLabels[c] || c);
  const goalLabel = goal ? goalLabels[goal] || goal : null;
  const timingLabel = timing ? timingLabels[timing] || timing : null;
  const visitType = goal ? visitTypeMap[goal] || visitTypeMap.refresh : visitTypeMap.refresh;
  const VisitIcon = visitType.icon;
  const isMulti = categories.length > 1;

  const handleScrollToBooking = () => {
    const el = document.getElementById("callback");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenPlanInLuna = () => {
    openChatWidget("plan");
  };

  return (
    <section id="personalized-plan" className="py-12 md:py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {isLoading ? (
          <PlanSkeleton />
        ) : (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-gold/20 bg-gradient-to-b from-card to-background overflow-hidden shadow-[0_0_60px_-15px_hsl(38_50%_55%/0.15)]"
          >
            {/* Gold accent bar */}
            <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

            <div className="p-6 md:p-8 space-y-6">
              {/* Header */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[11px] font-body uppercase tracking-widest text-gold">
                    Your Personalized Hush Plan
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl text-cream mb-2 flex items-center justify-center gap-2">
                  <VisitIcon className="w-5 h-5 text-gold" />
                  {visitType.label} Visit
                </h3>
                {emotionalLine && (
                  <p className="font-body text-sm text-cream/60 leading-relaxed max-w-md mx-auto italic">
                    {emotionalLine}
                  </p>
                )}
              </m.div>

              {/* Service + context pills */}
              <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap justify-center gap-2"
              >
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
                {isMulti && (
                  <span className="text-xs font-body bg-primary/5 text-primary/70 border border-primary/15 px-3 py-1 rounded-full flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Multi-service
                  </span>
                )}
              </m.div>

              {/* Time estimate */}
              {timeEstimate && (
                <m.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="font-body text-xs text-muted-foreground flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3 h-3 text-primary/50" />
                  Estimated visit: {timeEstimate}
                </m.p>
              )}

              {/* Enhance Your Visit (Upsells) */}
              {upsells.length > 0 && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4 md:p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4 text-gold" />
                    <span className="text-xs font-body uppercase tracking-wider text-gold">
                      Enhance Your Visit
                    </span>
                  </div>
                  <div className="space-y-2">
                    {upsells.map((item: UpsellItem) => (
                      <m.div
                        key={item.name}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/50 transition-colors hover:border-gold/20 hover:bg-gold/[0.02]"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-body text-sm text-cream">{item.name}</span>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                        <span className="font-body text-xs text-gold ml-3 shrink-0">{item.price}</span>
                      </m.div>
                    ))}
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground/60 mt-3 text-center">
                    Mention these add-ons when booking — your concierge will include them
                  </p>
                </m.div>
              )}

              {/* Your Ideal Cadence */}
              {cadence.length > 0 && (
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl border border-border bg-secondary/30 p-4 md:p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarClock className="w-4 h-4 text-gold" />
                    <span className="text-xs font-body uppercase tracking-wider text-gold">
                      Your Ideal Cadence
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cadence.map((rec: CadenceRecommendation) => (
                      <div key={rec.category} className="flex items-center justify-between py-1.5">
                        <span className="font-body text-sm text-cream">{rec.label}</span>
                        <div className="text-right">
                          <span className="font-body text-xs text-muted-foreground">
                            Every {rec.intervalWeeks[0]}–{rec.intervalWeeks[1]} weeks
                          </span>
                          <p className="font-body text-[11px] text-gold/70">
                            Next visit: {rec.nextDateRange}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </m.div>
              )}

              {/* Artist matching — neutral */}
              <m.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55 }}
                className="rounded-xl border border-gold/10 bg-gold/[0.02] p-4 text-center"
              >
                <p className="font-body text-sm text-cream/70 leading-relaxed">
                  For this experience, our team will pair you with a stylist who specializes in exactly what you're looking for.
                </p>
              </m.div>

              {/* CTA */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="grid gap-2 sm:grid-cols-2"
              >
                <button
                  onClick={handleOpenPlanInLuna}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-6 py-3 font-body text-sm text-primary transition-colors hover:bg-primary/10"
                >
                  <MessageCircle className="w-4 h-4" />
                  Review with Luna
                </button>
                <button
                  onClick={handleScrollToBooking}
                  className="btn-gold py-3 px-8 text-sm w-full flex items-center justify-center gap-2"
                >
                  Reserve Your Experience
                  <ChevronRight className="w-4 h-4" />
                </button>
              </m.div>
            </div>
          </m.div>
        )}
      </div>
    </section>
  );
};
