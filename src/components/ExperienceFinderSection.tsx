import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Hand, Sparkles, Eye, Heart,
  Check, ArrowLeft, HelpCircle, Layers,
} from "lucide-react";
import { ConciergeContext, ServiceCategoryId, ServiceSubtype, MultiServiceMode } from "@/types/concierge";
import { setGuestFirstName } from "@/lib/conciergeStore";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { startSession } from "@/lib/sessionManager";
import { useLuna } from "@/contexts/LunaContext";
import { buildRevealData, RevealData } from "@/lib/experienceReveal";
import { ExperienceRevealCard } from "@/components/ExperienceRevealCard";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | "reveal";

interface Selection {
  services:  string[];
  goal:      string | null;
  timing:    string | null;
  subtype:   ServiceSubtype | null;
  primaryCategory: ServiceCategoryId | null;
  multiServiceMode: MultiServiceMode;
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

// Category-specific step qualifiers
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
    primaryCategory: null, multiServiceMode: null,
  });
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [guestName, setGuestName] = useState("");
  const { openModal, markInteracted, setConcierge, clearConcierge } = useLuna();

  const isMultiService = selection.services.length > 1;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleService = (id: string) => {
    setSelection(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id],
      subtype: null,
      primaryCategory: null,
      multiServiceMode: null,
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
    else if (currentStep === 4) {
      setCurrentStep(3);
      setSelection(p => ({ ...p, subtype: null, primaryCategory: null, multiServiceMode: null }));
    }
    else if (currentStep === 5) {
      // Step 5 is the qualifier after multi-service priority pick
      setCurrentStep(4);
      setSelection(p => ({ ...p, subtype: null }));
    }
  };

  const handleReset = () => {
    setSelection({ services: [], goal: null, timing: null, subtype: null, primaryCategory: null, multiServiceMode: null });
    setCurrentStep(1);
    setRecommendation(null);
    setRevealData(null);
    setGuestName("");
    clearConcierge();
    try { sessionStorage.removeItem("hush_luna_recommendation"); } catch { /* ignore */ }
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
      if (isMultiService) {
        // Multi-service: go to priority picker (step 4)
        const t = setTimeout(() => setCurrentStep(4), 350);
        return () => clearTimeout(t);
      } else {
        // Single service: go to qualifier (step 4) or launch
        const singleCat = selection.services[0] as ServiceCategoryId | undefined;
        const hasQualifier = singleCat && subtypeOptions[singleCat];
        if (hasQualifier) {
          const t = setTimeout(() => setCurrentStep(4), 350);
          return () => clearTimeout(t);
        } else {
          const t = setTimeout(() => handleLunaAction(), 400);
          return () => clearTimeout(t);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selection.timing]);

  // NOTE: Subtype auto-launch removed intentionally.
  // QualifierStep has its own "Speak with Luna" / "Chat with Luna" CTAs
  // which serve as the explicit launch trigger after subtype selection.

  // ── Build context ──────────────────────────────────────────────────────────

  const buildContext = (): ConciergeContext => ({
    source:            "find_your_experience",
    categories:        selection.services as ServiceCategoryId[],
    goal:              selection.goal,
    timing:            selection.timing,
    service_subtype:   selection.subtype,
    is_multi_service:  isMultiService,
    primary_category:  selection.primaryCategory,
    multi_service_mode: selection.multiServiceMode,
    group:   null,
    item:    null,
    price:   null,
    preferredArtist:   null,
    preferredArtistId: null,
  });

  // ── Launch Luna ─────────────────────────────────────────────────────────────

  const handleLunaAction = () => {
    const ctx = buildContext();
    setConcierge(ctx);
    const rec = generateRecommendation(ctx);
    setRecommendation(rec);
    startSession(ctx, "finder");
    try {
      sessionStorage.setItem("hush_luna_recommendation", JSON.stringify(rec));
    } catch { /* ignore */ }
    const reveal = buildRevealData(ctx);
    setRevealData(reveal);
    setCurrentStep("reveal");
    // Auto-scroll to the reveal card after render
    setTimeout(() => {
      document.getElementById("experience-reveal")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  };

  // ── Multi-service priority handlers ────────────────────────────────────────

  const handlePrimaryPick = (catId: ServiceCategoryId) => {
    setSelection(prev => ({
      ...prev,
      primaryCategory: catId,
      multiServiceMode: "primary_focus" as MultiServiceMode,
    }));
    // Check if that category has qualifiers
    if (subtypeOptions[catId]) {
      setTimeout(() => setCurrentStep(5), 350);
    } else {
      setTimeout(() => handleLunaAction(), 400);
    }
  };

  const handleBundleGuidance = () => {
    setSelection(prev => ({
      ...prev,
      primaryCategory: null,
      multiServiceMode: "bundle_guidance" as MultiServiceMode,
    }));
    setTimeout(() => handleLunaAction(), 400);
  };

  const handleMultiUnsure = () => {
    setSelection(prev => ({
      ...prev,
      primaryCategory: null,
      multiServiceMode: "unsure" as MultiServiceMode,
    }));
    setTimeout(() => handleLunaAction(), 400);
  };

  // ── Step meta ──────────────────────────────────────────────────────────────

  const qualifierCat = isMultiService
    ? selection.primaryCategory
    : (selection.services[0] as ServiceCategoryId | undefined);

  const getStepTitle = (s: Step): string => {
    if (s === 1) return "What are you looking for?";
    if (s === 2) return "What's your goal today?";
    if (s === 3) return "How soon are you thinking?";
    if (s === 4 && isMultiService) return "Which feels most important right now?";
    if (s === 4) {
      // single-service qualifier
      const cat = selection.services[0];
      if (cat === "hair") return "What kind of change are you thinking about?";
      if (cat === "nails") return "What nail service interests you?";
      if (cat === "lashes") return "What lash service are you after?";
      if (cat === "massage") return "What kind of massage?";
      return "What specifically interests you?";
    }
    if (s === 5) {
      const cat = selection.primaryCategory;
      if (cat === "hair") return "What kind of change are you thinking about?";
      if (cat === "nails") return "What nail service interests you?";
      if (cat === "lashes") return "What lash service are you after?";
      if (cat === "massage") return "What kind of massage?";
      return "What specifically interests you?";
    }
    return "";
  };

  const getStepSubtitle = (s: Step): string => {
    if (s === 1) return "Select one or more.";
    if (s === 2) return "Pick what resonates.";
    if (s === 3) return "No pressure — just helps Luna prepare.";
    if (s === 4 && isMultiService) return "We'll focus here first, then Luna can help with the rest.";
    if (s === 4 || s === 5) return "One more thing — then Luna takes it from here.";
    return "";
  };

  // ── Step indicator ────────────────────────────────────────────────────────

  const TOTAL_VISUAL_STEPS = 4;
  const numericStep: number = currentStep === "reveal" ? 5 : currentStep;
  // On reveal screen, mark ALL 4 steps as completed (visualStep = 5 means step 4 < visualStep)
  const visualStep: number = numericStep >= 5 ? 5 : numericStep >= 4 ? 4 : numericStep;

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
          {Array.from({ length: TOTAL_VISUAL_STEPS }, (_, i) => i + 1).map(step => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display text-sm transition-all duration-300 ${
                step === visualStep
                  ? "bg-gold text-background"
                  : step < visualStep
                  ? "bg-gold/25 text-gold"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {step < visualStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < TOTAL_VISUAL_STEPS && (
                <div className={`w-8 md:w-16 h-px transition-all duration-300 ${
                  step < visualStep ? "bg-gold/40" : "bg-secondary"
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
                  {getStepTitle(1)}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {getStepSubtitle(1)}
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
                        {cat.id === "hair" && (
                          <span className="block text-[9px] font-body text-gold/60 mt-1 uppercase tracking-wider">Most popular</span>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* ── Name capture ──────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-xs mx-auto mt-8"
                >
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="What should Luna call you? (optional)"
                    className="w-full bg-background/40 border border-gold/15 rounded-lg px-4 py-3 text-cream text-sm font-body placeholder-muted-foreground/50 focus:outline-none focus:border-gold/50 text-center transition-colors"
                    onKeyDown={e => {
                      if (e.key === "Enter" && selection.services.length > 0) {
                        if (guestName.trim()) setGuestFirstName(guestName.trim());
                        setCurrentStep(2);
                      }
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-4 mt-6"
                >
                  <motion.button
                    onClick={() => {
                      if (selection.services.length === 0) return;
                      if (guestName.trim()) setGuestFirstName(guestName.trim());
                      setCurrentStep(2);
                    }}
                    disabled={selection.services.length === 0}
                    className={`btn-gold py-4 px-10 min-w-[160px] transition-all ${selection.services.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    whileHover={selection.services.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={selection.services.length > 0 ? { scale: 0.98 } : {}}
                  >
                    Show Me Options
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
                  {getStepTitle(2)}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {getStepSubtitle(2)}
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
                  {getStepTitle(3)}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {getStepSubtitle(3)}
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

            {/* ── STEP 4 — Multi-service: priority picker OR Single-service: qualifier */}
            {currentStep === 4 && isMultiService && (
              <motion.div
                key="step4-multi"
                variants={stepVariants}
                initial="initial" animate="animate" exit="exit"
                className="w-full"
              >
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-2">
                  {getStepTitle(4)}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">
                  {getStepSubtitle(4)}
                </p>
                <motion.div
                  variants={containerVariants} initial="hidden" animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
                >
                  {/* Selected category buttons */}
                  {selection.services.map(svcId => {
                    const cat = categories.find(c => c.id === svcId);
                    if (!cat) return null;
                    const sel = selection.primaryCategory === svcId;
                    return (
                      <motion.button
                        key={cat.id} variants={itemVariants}
                        onClick={() => handlePrimaryPick(cat.id as ServiceCategoryId)}
                        className={`${optionBase} ${sel ? optionActive : optionIdle}`}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      >
                        <cat.icon className={`w-7 h-7 mx-auto mb-3 transition-colors ${sel ? "text-gold" : "text-muted-foreground group-hover:text-gold"}`} />
                        <span className={`font-display text-lg transition-colors ${sel ? "text-gold" : "text-cream group-hover:text-gold"}`}>
                          {cat.label}
                        </span>
                      </motion.button>
                    );
                  })}

                  {/* Help me combine them */}
                  <motion.button
                    variants={itemVariants}
                    onClick={handleBundleGuidance}
                    className={`${optionBase} ${optionIdle}`}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <Layers className="w-7 h-7 mx-auto mb-3 text-muted-foreground group-hover:text-gold transition-colors" />
                    <span className="font-display text-lg text-cream group-hover:text-gold transition-colors">
                      Help me combine them
                    </span>
                  </motion.button>

                  {/* Not sure yet */}
                  <motion.button
                    variants={itemVariants}
                    onClick={handleMultiUnsure}
                    className={`${optionBase} ${optionIdle}`}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <HelpCircle className="w-7 h-7 mx-auto mb-3 text-muted-foreground group-hover:text-gold transition-colors" />
                    <span className="font-display text-lg text-cream group-hover:text-gold transition-colors">
                      Not sure yet
                    </span>
                  </motion.button>
                </motion.div>
                <BackButton onClick={handleBack} />
              </motion.div>
            )}

            {/* ── STEP 4 — Single-service qualifier ─────────────────────── */}
            {currentStep === 4 && !isMultiService && qualifierCat && subtypeOptions[qualifierCat] && (
              <QualifierStep
                step={4}
                title={getStepTitle(4)}
                subtitle={getStepSubtitle(4)}
                category={qualifierCat}
                selectedSubtype={selection.subtype}
                onSelect={handleSubtypeSelect}
                onLunaAction={handleLunaAction}
                onBack={handleBack}
              />
            )}

            {/* ── STEP 5 — Multi-service qualifier (after priority pick) ── */}
            {currentStep === 5 && qualifierCat && subtypeOptions[qualifierCat] && (
              <QualifierStep
                step={5}
                title={getStepTitle(5)}
                subtitle={getStepSubtitle(5)}
                category={qualifierCat}
                selectedSubtype={selection.subtype}
                onSelect={handleSubtypeSelect}
                onLunaAction={handleLunaAction}
                onBack={handleBack}
              />
            )}

            {/* ── REVEAL — Experience Reveal Card ────────────────────── */}
            {currentStep === "reveal" && revealData && (
              <motion.div
                key="step-reveal"
                variants={stepVariants}
                initial="initial" animate="animate" exit="exit"
                className="w-full"
              >
                <ExperienceRevealCard data={revealData} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Reset link */}
        {currentStep !== 1 && (
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

// ── Qualifier step sub-component ──────────────────────────────────────────────

interface QualifierStepProps {
  step: number;
  title: string;
  subtitle: string;
  category: ServiceCategoryId;
  selectedSubtype: ServiceSubtype | null;
  onSelect: (id: ServiceSubtype) => void;
  onLunaAction: () => void;
  onBack: () => void;
}

const QualifierStep = ({ step, title, subtitle, category, selectedSubtype, onSelect, onLunaAction, onBack }: QualifierStepProps) => (
  <motion.div
    key={`step${step}-qualifier`}
    variants={stepVariants}
    initial="initial" animate="animate" exit="exit"
    className="w-full"
  >
    <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-2">
      {title}
    </h3>
    <p className="font-body text-sm text-muted-foreground text-center mb-10">
      {subtitle}
    </p>
    <motion.div
      variants={containerVariants} initial="hidden" animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
    >
      {subtypeOptions[category]?.map(opt => (
        <motion.button
          key={opt.id} variants={itemVariants}
          onClick={() => onSelect(opt.id as ServiceSubtype)}
          className={`${optionBase} ${selectedSubtype === opt.id ? optionActive : optionIdle}`}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        >
          <span className={`font-display text-lg transition-colors ${selectedSubtype === opt.id ? "text-gold" : "text-cream group-hover:text-gold"}`}>
            {opt.label}
          </span>
        </motion.button>
      ))}
    </motion.div>

    {/* Manual CTA */}
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex justify-center mt-10"
    >
      <motion.button
        onClick={onLunaAction}
        disabled={!selectedSubtype}
        className={`btn-gold py-4 px-10 flex items-center gap-3 ${!selectedSubtype ? "opacity-40 cursor-not-allowed" : ""}`}
        whileHover={selectedSubtype ? { scale: 1.02 } : {}}
        whileTap={selectedSubtype ? { scale: 0.98 } : {}}
      >
        <Sparkles className="w-5 h-5" />
        See My Results
      </motion.button>
    </motion.div>
    <BackButton onClick={onBack} className="mt-4" />
  </motion.div>
);

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
