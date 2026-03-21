import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Hand, Sparkles, Eye, Heart,
  Mic, MessageSquare, Check, ArrowLeft,
} from "lucide-react";
import { ConciergeContext, ServiceCategoryId, ServiceSubtype } from "@/types/concierge";
import { setConciergeContext } from "@/lib/conciergeStore";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { saveSession } from "@/lib/saveSession";
import { useLuna } from "@/contexts/LunaContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

interface Selection {
  services:  string[];
  goal:      string | null;
  timing:    string | null;
  subtype:   ServiceSubtype | null;
}

// ── Static data ───────────────────────────────────────────────────────────────

const categories = [
  { id: "hair",     label: "Hair",     icon: Scissors },
  { id: "nails",    label: "Nails",    icon: Hand },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "lashes",   label: "Lashes",   icon: Eye },
  { id: "massage",  label: "Massage",  icon: Heart },
];

const goals = [
  { id: "refresh",   label: "Refresh" },
  { id: "relax",     label: "Relax" },
  { id: "transform", label: "Transform" },
  { id: "event",     label: "Event-ready" },
];

const timings = [
  { id: "today",    label: "Today" },
  { id: "week",     label: "This week" },
  { id: "planning", label: "Planning ahead" },
  { id: "browsing", label: "Just browsing" },
];

// Category-specific step 4 qualifiers
const subtypeOptions: Record<string, { id: ServiceSubtype; label: string }[]> = {
  hair: [
    { id: "cut",   label: "Just a cut or cleanup" },
    { id: "color", label: "Color or highlights" },
    { id: "both",  label: "Cut + color" },
    { id: "unsure",label: "Not sure yet" },
  ],
  nails: [
    { id: "manicure",  label: "Manicure" },
    { id: "pedicure",  label: "Pedicure" },
    { id: "full_set",  label: "Full set" },
    { id: "nail_art",  label: "Nail art" },
    { id: "unsure",    label: "Not sure" },
  ],
  lashes: [
    { id: "full_set",  label: "Full set" },
    { id: "fill",      label: "Fill" },
    { id: "lift",      label: "Lift" },
    { id: "unsure",    label: "Not sure" },
  ],
  massage: [
    { id: "relaxation",  label: "Relaxation" },
    { id: "deep_tissue", label: "Deep tissue" },
    { id: "pain_relief", label: "Pain relief" },
    { id: "unsure",      label: "Not sure" },
  ],
  skincare: [
    { id: "facial",  label: "Facial" },
    { id: "acne",    label: "Acne / correction" },
    { id: "glow",    label: "Glow / refresh" },
    { id: "unsure",  label: "Not sure" },
  ],
};

// ── Animations ────────────────────────────────────────────────────────────────

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.25, ease: "easeIn"  as const } },
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

// ── Shared button styles ──────────────────────────────────────────────────────

const optionBase =
  "group relative p-5 md:p-7 rounded-lg text-center transition-all duration-300 border focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2";
const optionActive =
  "border-gold bg-gold/8 shadow-[0_0_20px_-5px_hsl(38_50%_55%/0.3)]";
const optionIdle =
  "border-secondary bg-card hover:border-gold/40";

// ── Component ─────────────────────────────────────────────────────────────────

export const ExperienceFinderSection = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selection, setSelection] = useState<Selection>({
    services: [], goal: null, timing: null, subtype: null,
  });
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);
  const { openModal, markInteracted } = useLuna();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleService = (id: string) => {
    setSelection(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id],
      subtype: null, // reset qualifier on category change
    }));
    markInteracted();
  };

  const handleGoalSelect = (id: string) => {
    setSelection(prev => ({ ...prev, goal: id }));
  };

  const handleTimingSelect = (id: string) => {
    setSelection(prev => ({ ...prev, timing: id }));
  };

  const handleSubtypeSelect = (id: ServiceSubtype) => {
    setSelection(prev => ({ ...prev, subtype: id }));
  };

  const handleBack = () => {
    if (currentStep === 2) { setCurrentStep(1); setSelection(p => ({ ...p, goal: null })); }
    else if (currentStep === 3) { setCurrentStep(2); setSelection(p => ({ ...p, timing: null })); }
    else if (currentStep === 4) { setCurrentStep(3); setSelection(p => ({ ...p, subtype: null })); }
  };

  const handleReset = () => {
    setSelection({ services: [], goal: null, timing: null, subtype: null });
    setCurrentStep(1);
    setRecommendation(null);
  };

  // ── Auto-advance step 2 → 3 after goal ────────────────────────────────────
  useEffect(() => {
    if (currentStep === 2 && selection.goal) {
      const t = setTimeout(() => setCurrentStep(3), 350);
      return () => clearTimeout(t);
    }
  }, [currentStep, selection.goal]);

  // ── Auto-advance step 3 → 4 after timing ──────────────────────────────────
  useEffect(() => {
    if (currentStep === 3 && selection.timing) {
      const primaryCat = selection.services[0] as ServiceCategoryId | undefined;
      const hasQualifier = primaryCat && subtypeOptions[primaryCat];
      if (hasQualifier) {
        const t = setTimeout(() => setCurrentStep(4), 350);
        return () => clearTimeout(t);
      } else {
        // No qualifier for this category — open modal (user chooses CTA)
        const t = setTimeout(() => handleLunaAction(), 400);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selection.timing]);

  // ── After step 4 subtype selection — open modal (no auto-voice) ─────────
  useEffect(() => {
    if (currentStep === 4 && selection.subtype) {
      const t = setTimeout(() => handleLunaAction(), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selection.subtype]);

  // ── Build context ──────────────────────────────────────────────────────────

  const buildContext = (): ConciergeContext => ({
    source:          "find_your_experience",
    categories:      selection.services as ServiceCategoryId[],
    goal:            selection.goal,
    timing:          selection.timing,
    service_subtype: selection.subtype,
    is_multi_service: selection.services.length > 1,
    group:   null,
    item:    null,
    price:   null,
    preferredArtist:   null,
    preferredArtistId: null,
  });

  // ── Launch Luna ─────────────────────────────────────────────────────────────

  const handleLunaAction = () => {
    const ctx = buildContext();
    setConciergeContext(ctx);
    const rec = generateRecommendation(ctx);
    setRecommendation(rec);
    saveSession(ctx);
    try {
      sessionStorage.setItem("hush_luna_recommendation", JSON.stringify(rec));
    } catch { /* ignore */ }
    openModal(ctx);
  };

  // ── Step meta ──────────────────────────────────────────────────────────────

  const primaryCat = selection.services[0] as ServiceCategoryId | undefined;

  const stepTitles: Record<Step, string> = {
    1: "What are you looking for?",
    2: "What's your goal today?",
    3: "How soon are you thinking?",
    4: primaryCat === "hair"     ? "What kind of change are you thinking about?"
       : primaryCat === "nails"  ? "What nail service interests you?"
       : primaryCat === "lashes" ? "What lash service are you after?"
       : primaryCat === "massage"? "What kind of massage?"
       : "What specifically interests you?",
  };

  const stepSubtitles: Record<Step, string> = {
    1: "Select one or more.",
    2: "Pick what resonates.",
    3: "No pressure — just helps Luna prepare.",
    4: "One more thing — then Luna takes it from here.",
  };

  // ── Step indicator (4 steps) ──────────────────────────────────────────────

  const TOTAL_STEPS = 4;

  return (
    <section
      id="experience-finder"
      className="py-20 md:py-28 px-6 bg-gradient-to-b from-card to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-4">
            Find Your <span className="text-gold-gradient">Experience</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            A few questions. Luna does the rest.
          </p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-2 mb-12"
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-sm transition-all duration-300 ${
                step === currentStep
                  ? "bg-gold text-background"
                  : step < currentStep
                  ? "bg-gold/25 text-gold"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < TOTAL_STEPS && (
                <div className={`w-8 md:w-16 h-px transition-all duration-300 ${
                  step < currentStep ? "bg-gold/40" : "bg-secondary"
                }`} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step content */}
        <div className="min-h-[420px] flex items-center justify-center pb-24 md:pb-0">
          <AnimatePresence mode="wait">

            {/* ── STEP 1 — Category ─────────────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial" animate="animate" exit="exit"
                className="w-full"
              >
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-2">
                  {stepTitles[1]}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {stepSubtitles[1]}
                </p>
                <motion.div
                  variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                  {categories.map(cat => {
                    const sel = selection.services.includes(cat.id);
                    return (
                      <motion.button
                        key={cat.id}
                        variants={itemVariants}
                        onClick={() => toggleService(cat.id)}
                        className={`${optionBase} ${sel ? optionActive : optionIdle}`}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      >
                        <AnimatePresence>
                          {sel && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-background" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <cat.icon className={`w-8 h-8 mx-auto mb-4 transition-colors ${sel ? "text-gold" : "text-muted-foreground group-hover:text-gold"}`} />
                        <span className={`font-display text-lg transition-colors ${sel ? "text-gold" : "text-cream group-hover:text-gold"}`}>
                          {cat.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-4 mt-10"
                >
                  <motion.button
                    onClick={() => selection.services.length > 0 && setCurrentStep(2)}
                    disabled={selection.services.length === 0}
                    className={`btn-gold py-4 px-10 min-w-[160px] transition-all ${selection.services.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    whileHover={selection.services.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={selection.services.length > 0 ? { scale: 0.98 } : {}}
                  >
                    Continue
                  </motion.button>
                  {selection.services.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => setSelection(p => ({ ...p, services: [] }))}
                      className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
                    >
                      Clear
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ── STEP 2 — Goal ─────────────────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial" animate="animate" exit="exit"
                className="w-full"
              >
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-2">
                  {stepTitles[2]}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {stepSubtitles[2]}
                </p>
                <motion.div
                  variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                >
                  {goals.map(goal => (
                    <motion.button
                      key={goal.id} variants={itemVariants}
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`${optionBase} ${selection.goal === goal.id ? optionActive : optionIdle}`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      <span className={`font-display text-xl transition-colors ${selection.goal === goal.id ? "text-gold" : "text-cream group-hover:text-gold"}`}>
                        {goal.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
                <BackButton onClick={handleBack} />
              </motion.div>
            )}

            {/* ── STEP 3 — Timing ───────────────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial" animate="animate" exit="exit"
                className="w-full"
              >
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-2">
                  {stepTitles[3]}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {stepSubtitles[3]}
                </p>
                <motion.div
                  variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                >
                  {timings.map(t => (
                    <motion.button
                      key={t.id} variants={itemVariants}
                      onClick={() => handleTimingSelect(t.id)}
                      className={`${optionBase} ${selection.timing === t.id ? optionActive : optionIdle}`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      <span className={`font-display text-lg md:text-xl transition-colors ${selection.timing === t.id ? "text-gold" : "text-cream group-hover:text-gold"}`}>
                        {t.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
                <BackButton onClick={handleBack} />
              </motion.div>
            )}

            {/* ── STEP 4 — Category qualifier ───────────────────────────── */}
            {currentStep === 4 && primaryCat && subtypeOptions[primaryCat] && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="initial" animate="animate" exit="exit"
                className="w-full"
              >
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-2">
                  {stepTitles[4]}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {stepSubtitles[4]}
                </p>
                <motion.div
                  variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                >
                  {subtypeOptions[primaryCat].map(opt => (
                    <motion.button
                      key={opt.id} variants={itemVariants}
                      onClick={() => handleSubtypeSelect(opt.id as ServiceSubtype)}
                      className={`${optionBase} ${selection.subtype === opt.id ? optionActive : optionIdle}`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    >
                      <span className={`font-display text-lg transition-colors ${selection.subtype === opt.id ? "text-gold" : "text-cream group-hover:text-gold"}`}>
                        {opt.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Manual CTA as fallback (auto-launch fires on selection) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col md:flex-row items-center justify-center gap-4 mt-10"
                >
                  <motion.button
                    onClick={handleLunaAction}
                    disabled={!selection.subtype}
                    className={`btn-gold py-4 px-8 flex items-center gap-3 ${!selection.subtype ? "opacity-40 cursor-not-allowed" : ""}`}
                    whileHover={selection.subtype ? { scale: 1.02 } : {}}
                    whileTap={selection.subtype ? { scale: 0.98 } : {}}
                  >
                    <Mic className="w-5 h-5" />
                    Speak with Luna
                  </motion.button>
                  <motion.button
                    onClick={handleLunaAction}
                    disabled={!selection.subtype}
                    className={`btn-outline-gold py-4 px-8 flex items-center gap-3 ${!selection.subtype ? "opacity-40 cursor-not-allowed" : ""}`}
                    whileHover={selection.subtype ? { scale: 1.02 } : {}}
                    whileTap={selection.subtype ? { scale: 0.98 } : {}}
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat with Luna
                  </motion.button>
                </motion.div>
                <BackButton onClick={handleBack} className="mt-4" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Reset link */}
        {currentStep > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
            <button
              onClick={handleReset}
              className="font-body text-xs text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
            >
              Start over
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// ── Shared sub-components ─────────────────────────────────────────────────────

const BackButton = ({ onClick, className = "" }: { onClick: () => void; className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className={`flex justify-center mt-8 ${className}`}
  >
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-gold transition-colors"
      whileHover={{ x: -3 }}
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </motion.button>
  </motion.div>
);
