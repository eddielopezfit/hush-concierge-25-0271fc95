import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw, ChevronRight, Clock, Layers } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";
import { categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";
import { ServiceCategoryId } from "@/types/concierge";
import { useMemo } from "react";

// ── Interpretation engine ────────────────────────────────────────────────────

interface ExperienceSnapshot {
  categories: ServiceCategoryId[];
  goal: string | null;
  timing: string | null;
}

function getDepthLevel(snap: ExperienceSnapshot): 1 | 2 | 3 {
  if (snap.categories.length === 0) return 1;
  if (snap.goal && snap.timing) return 3;
  return 2;
}

const depthLabels: Record<1 | 2 | 3, string> = {
  1: "Exploring",
  2: "Shaping",
  3: "Ready to design",
};

function getInterpretation(snap: ExperienceSnapshot): string | null {
  const cats = snap.categories;
  const goal = snap.goal;
  if (cats.length === 0) return null;

  const names = cats.map(c => categoryLabels[c] || c);
  const catStr = names.join(" + ");
  const goalStr = goal ? (goalLabels[goal] || goal).toLowerCase() : null;

  // Multi-service interpretations
  if (cats.length >= 2) {
    if (cats.includes("skincare") && cats.includes("massage")) {
      return "This is a reset experience — relaxation and skin care together. Luna can map the best sequence.";
    }
    if (cats.includes("hair") && cats.includes("nails")) {
      if (goalStr === "transform" || goalStr === "event-ready") {
        return `A full ${goalStr || "refresh"} day — ${catStr} and overall transformation. Luna can help plan timing and flow.`;
      }
      return `You're building a multi-service visit with ${catStr}. Luna can coordinate artists and timing.`;
    }
    if (cats.includes("hair") && cats.includes("lashes")) {
      return "This is an event-ready combination — hair and lashes for maximum impact. Luna can sequence the appointments.";
    }
    return `A ${catStr} experience${goalStr ? ` focused on ${goalStr}` : ""}. Luna can help coordinate the best flow.`;
  }

  // Single-service interpretations
  const cat = cats[0];
  if (cat === "hair" && goalStr === "transform") {
    return "You're looking at a real change — Luna can help figure out the right approach for your hair.";
  }
  if (cat === "massage" && goalStr === "relax") {
    return "A dedicated massage for deep relaxation. Luna can help match the right pressure and duration.";
  }
  if (goalStr) {
    return `You're exploring ${names[0]} with a ${goalStr} focus. Luna can refine this further.`;
  }
  return `You're exploring ${names[0]} services. Add a goal and timing to shape your experience.`;
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

// ── Component ────────────────────────────────────────────────────────────────

export const BuildExperienceSection = () => {
  const { openModal } = useLuna();
  const [snap, setSnap] = useState<ExperienceSnapshot>({ categories: [], goal: null, timing: null });

  const refreshSnap = useCallback(() => {
    const ctx = getConciergeContext();
    setSnap({
      categories: ctx?.categories || [],
      goal: ctx?.goal || null,
      timing: ctx?.timing || null,
    });
  }, []);

  // Poll localStorage for context changes (set by ExperienceFinder)
  useEffect(() => {
    refreshSnap();
    const interval = setInterval(refreshSnap, 1500);
    return () => clearInterval(interval);
  }, [refreshSnap]);

  const depth = getDepthLevel(snap);
  const interpretation = getInterpretation(snap);
  const timeEstimate = getTimeEstimate(snap);
  const isMultiService = snap.categories.length > 1;
  const hasContext = snap.categories.length > 0;

  const catLabels = snap.categories.map(c => categoryLabels[c] || c);
  const goalLabel = snap.goal ? goalLabels[snap.goal] || snap.goal : null;
  const timingLabel = snap.timing ? timingLabels[snap.timing] || snap.timing : null;

  const handleLetLunaDesign = () => {
    openModal({
      source: "build_experience",
      categories: snap.categories,
      goal: snap.goal,
      timing: snap.timing,
      is_multi_service: isMultiService,
      multi_service_mode: isMultiService ? "bundle_guidance" : null,
    });
  };

  const handleExploreServices = () => {
    const el = document.getElementById("services");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCustomize = () => {
    const el = document.getElementById("experience-finder");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-24 px-6 bg-gradient-to-b from-background to-card relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Build Your <span className="text-gold-gradient">Experience</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-xl mx-auto">
            Your experience is shaped by your choices — not a fixed menu. Luna helps you design something that fits.
          </p>
        </motion.div>

        {/* Dynamic preview card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-luxury rounded-xl p-6 md:p-8 mb-6"
        >
          {/* Depth indicator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(level => (
                <div
                  key={level}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    level <= depth ? "w-8 bg-primary" : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="font-body text-xs text-muted-foreground tracking-wide uppercase">
              {depthLabels[depth]}
            </span>
          </div>

          {/* Experience preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${snap.categories.join(",")}-${snap.goal}-${snap.timing}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-display text-xl md:text-2xl text-cream mb-3">
                {hasContext ? "Your Experience So Far" : "Start Building Your Experience"}
              </h3>

              {/* Pills */}
              {hasContext ? (
                <div className="flex flex-wrap gap-2 mb-4">
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
              ) : (
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Use the Experience Finder above to select your services, goal, and timing. Your experience will take shape here.
                </p>
              )}

              {/* Interpretation */}
              {interpretation && (
                <div className="bg-background/50 border border-border/50 rounded-lg px-4 py-3 mb-4">
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">
                    {interpretation}
                  </p>
                </div>
              )}

              {/* Multi-service note */}
              {isMultiService && (
                <p className="font-body text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary/60" />
                  Luna can help coordinate timing, artists, and flow between services.
                </p>
              )}

              {/* Time estimate */}
              {timeEstimate && hasContext && (
                <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary/50" />
                  Estimated visit: {timeEstimate} depending on services
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-3"
        >
          {/* Primary */}
          <motion.button
            onClick={handleLetLunaDesign}
            className="btn-gold py-3.5 px-8 text-sm inline-flex items-center gap-2.5 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4" />
            Let Luna Design Your Experience
          </motion.button>

          {/* Secondary row */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleExploreServices}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              Explore Services First
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {hasContext && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={handleCustomize}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Customize Further
                </button>
              </>
            )}

            {hasContext && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={() => {
                    localStorage.removeItem("hush_concierge_context");
                    refreshSnap();
                  }}
                  className="font-body text-xs text-muted-foreground/60 hover:text-destructive transition-colors inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Start Over
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
