import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Hand, Sparkles, Eye, Heart, Mic, MessageSquare, Check, ArrowLeft, Star } from "lucide-react";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { setConciergeContext } from "@/lib/conciergeStore";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { saveSession } from "@/lib/saveSession";
import { useLuna } from "@/contexts/LunaContext";

type Step = 1 | 2 | 3 | "result";

interface Selection {
  services: string[];
  goal: string | null;
  timing: string | null;
}

const categories = [
  { id: "hair", label: "Hair", icon: Scissors },
  { id: "nails", label: "Nails", icon: Hand },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "lashes", label: "Lashes", icon: Eye },
  { id: "massage", label: "Massage", icon: Heart },
];

const goals = [
  { id: "refresh", label: "Refresh" },
  { id: "relax", label: "Relax" },
  { id: "transform", label: "Transform" },
  { id: "event", label: "Event-ready" },
];

const timings = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "planning", label: "Planning ahead" },
  { id: "browsing", label: "Just browsing" },
];

const stepVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const ExperienceFinderSection = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selection, setSelection] = useState<Selection>({ services: [], goal: null, timing: null });
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);
  const { openModal, markInteracted } = useLuna();

  const toggleService = (serviceId: string) => {
    setSelection((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
    markInteracted();
  };

  const handleContinueToStep2 = () => {
    if (selection.services.length > 0) setCurrentStep(2);
  };

  const handleClearServices = () => {
    setSelection((prev) => ({ ...prev, services: [] }));
  };

  const handleGoalSelect = (goalId: string) => {
    setSelection((prev) => ({ ...prev, goal: goalId }));
  };

  useEffect(() => {
    if (currentStep === 2 && selection.goal) {
      const timer = setTimeout(() => setCurrentStep(3), 350);
      return () => clearTimeout(timer);
    }
  }, [currentStep, selection.goal]);

  const handleTimingSelect = (timingId: string) => {
    setSelection((prev) => ({ ...prev, timing: timingId }));
  };

  // Auto-launch Luna 400ms after timing selection — the WOW moment
  // Guest completed all 3 choices; Luna opens already knowing everything
  useEffect(() => {
    if (currentStep === 3 && selection.timing) {
      const timer = setTimeout(() => {
        handleLunaAction(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selection.timing]);

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === "result") setCurrentStep(3);
  };

  const handleReset = () => {
    setSelection({ services: [], goal: null, timing: null });
    setCurrentStep(1);
    setRecommendation(null);
  };

  const buildContext = (includeTiming: boolean = true): ConciergeContext => ({
    source: "Experience Finder",
    categories: selection.services as ServiceCategoryId[],
    goal: selection.goal,
    timing: includeTiming ? selection.timing : null,
  });

  const handleLunaAction = (includeTiming: boolean = true) => {
    const ctx = buildContext(includeTiming);
    setConciergeContext(ctx);
    const rec = generateRecommendation(ctx);
    setRecommendation(rec);
    saveSession(ctx);
    // Persist recommendation so Luna voice can reference it
    try {
      sessionStorage.setItem("hush_luna_recommendation", JSON.stringify(rec));
    } catch { /* ignore */ }
    openModal(ctx);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "What are you looking for?";
      case 2: return "What's your goal?";
      case 3: return "How soon?";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return "Select one or more services.";
      case 2: return "Pick a goal — then voice or chat with Luna.";
      case 3: return "Choose your timeframe.";
      default: return "";
    }
  };

  const getStepNumber = () => (currentStep === "result" ? 3 : currentStep);

  const ActionButtons = ({ disabled, onSpeak, onChat, onBack }: { disabled: boolean; onSpeak: () => void; onChat: () => void; onBack?: () => void }) => (
    <>
      {/* Desktop */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="hidden md:flex items-center justify-center gap-4 mt-10">
        {onBack && (
          <motion.button onClick={onBack} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-gold transition-colors" whileHover={{ x: -3 }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
        )}
        <motion.button onClick={onSpeak} disabled={disabled} className={`btn-gold py-4 px-8 flex items-center justify-center gap-3 transition-all duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`} whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.98 } : {}}>
          <Mic className="w-5 h-5" /> Speak with Luna
        </motion.button>
        <motion.button onClick={onChat} disabled={disabled} className={`btn-outline-gold py-4 px-8 flex items-center justify-center gap-3 transition-all duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`} whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.98 } : {}}>
          <MessageSquare className="w-5 h-5" /> Chat with Luna
        </motion.button>
      </motion.div>
      {/* Mobile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex md:hidden flex-col items-center gap-3 mt-10">
        <motion.button onClick={onSpeak} disabled={disabled} className={`btn-gold py-4 px-8 w-full max-w-xs flex items-center justify-center gap-3 transition-all duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`} whileTap={!disabled ? { scale: 0.98 } : {}}>
          <Mic className="w-5 h-5" /> Speak with Luna
        </motion.button>
        <motion.button onClick={onChat} disabled={disabled} className={`btn-outline-gold py-4 px-8 w-full max-w-xs flex items-center justify-center gap-3 transition-all duration-300 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`} whileTap={!disabled ? { scale: 0.98 } : {}}>
          <MessageSquare className="w-5 h-5" /> Chat with Luna
        </motion.button>
        {onBack && (
          <motion.button onClick={onBack} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-gold transition-colors mt-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
        )}
      </motion.div>
    </>
  );

  return (
    <section id="experience-finder" className="py-20 md:py-28 px-6 bg-gradient-to-b from-card to-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-4">
            Find Your <span className="text-gold-gradient">Experience</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Three quick questions. Luna handles the rest.
          </p>
        </motion.div>

        {/* Step Indicator */}
        {currentStep !== "result" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-3 mb-12">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-sm transition-all duration-300 ${
                  step === currentStep ? "bg-gold text-background" : step < getStepNumber() ? "bg-gold/25 text-gold" : "bg-secondary text-muted-foreground"
                }`}>
                  {step}
                </div>
                {step < 3 && <div className={`w-12 md:w-20 h-px transition-all duration-300 ${step < getStepNumber() ? "bg-gold/40" : "bg-secondary"}`} />}
              </div>
            ))}
          </motion.div>
        )}

        {/* Step Content */}
        <div className="min-h-[450px] flex items-center justify-center pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-3">{getStepTitle()}</h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">{getStepSubtitle()}</p>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {categories.map((cat) => {
                    const isSelected = selection.services.includes(cat.id);
                    return (
                      <motion.button key={cat.id} variants={itemVariants} onClick={() => toggleService(cat.id)}
                        className={`group relative p-6 md:p-8 rounded-lg text-center transition-all duration-300 border focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${
                          isSelected ? "border-gold bg-gold/8 shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.3)]" : "border-secondary bg-card hover:border-gold/40"
                        }`}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                              <Check className="w-4 h-4 text-background" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <cat.icon className={`w-8 h-8 mx-auto mb-4 transition-colors duration-300 ${isSelected ? "text-gold" : "text-muted-foreground group-hover:text-gold"}`} />
                        <span className={`font-display text-lg transition-colors duration-300 ${isSelected ? "text-gold" : "text-cream group-hover:text-gold"}`}>{cat.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center gap-4 mt-10">
                  <motion.button onClick={handleContinueToStep2} disabled={selection.services.length === 0}
                    className={`btn-gold py-4 px-10 min-w-[180px] transition-all duration-300 ${selection.services.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    whileHover={selection.services.length > 0 ? { scale: 1.02 } : {}} whileTap={selection.services.length > 0 ? { scale: 0.98 } : {}}>
                    Continue
                  </motion.button>
                  {selection.services.length > 0 && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleClearServices} className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4">
                      Clear selection
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-3">{getStepTitle()}</h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">{getStepSubtitle()}</p>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {goals.map((goal) => (
                    <motion.button key={goal.id} variants={itemVariants} onClick={() => handleGoalSelect(goal.id)}
                      className={`group p-6 md:p-8 rounded-lg text-center transition-all duration-300 border focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${
                        selection.goal === goal.id ? "border-gold bg-gold/8 shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.3)]" : "border-secondary bg-card hover:border-gold/40"
                      }`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className={`font-display text-xl transition-colors duration-300 ${selection.goal === goal.id ? "text-gold" : "text-cream group-hover:text-gold"}`}>{goal.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
                <ActionButtons disabled={!selection.goal} onSpeak={() => handleLunaAction(false)} onChat={() => handleLunaAction(false)} onBack={handleBack} />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-3">{getStepTitle()}</h3>
                <p className="font-body text-sm text-muted-foreground text-center mb-10">{getStepSubtitle()}</p>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {timings.map((timing) => (
                    <motion.button key={timing.id} variants={itemVariants} onClick={() => handleTimingSelect(timing.id)}
                      className={`group p-6 md:p-8 rounded-lg text-center transition-all duration-300 border focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${
                        selection.timing === timing.id ? "border-gold bg-gold/8 shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.3)]" : "border-secondary bg-card hover:border-gold/40"
                      }`}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className={`font-display text-lg md:text-xl transition-colors duration-300 ${selection.timing === timing.id ? "text-gold" : "text-cream group-hover:text-gold"}`}>{timing.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
                <ActionButtons disabled={!selection.timing} onSpeak={() => handleLunaAction(true)} onChat={() => handleLunaAction(true)} onBack={handleBack} />
              </motion.div>
            )}

            {currentStep === "result" && (
              <motion.div key="result" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                  className="p-10 md:p-14 rounded-xl text-center border border-gold/25 bg-card shadow-[0_0_50px_-15px_hsl(38_50%_55%/0.25)]">
                  <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-gold/15 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl text-cream mb-4">Luna's ready for you.</h3>

                  {recommendation && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="mb-8 p-5 rounded-lg border border-gold/15 bg-background/50 text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-gold" />
                        <span className="font-body text-xs text-gold uppercase tracking-wider">Luna's Pick</span>
                      </div>
                      <p className="font-display text-lg text-cream mb-1">{recommendation.recommendedService}</p>
                      {recommendation.priceRange && <p className="font-body text-sm text-gold/70 mb-2">{recommendation.priceRange}</p>}
                      {recommendation.recommendedArtist && <p className="font-body text-sm text-cream/55 mb-3">Suggested: {recommendation.recommendedArtist}</p>}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-body ${
                          recommendation.urgency === "high" ? "bg-accent/20 text-accent" :
                          recommendation.urgency === "medium" ? "bg-gold/15 text-gold" : "bg-cream/8 text-cream/55"
                        }`}>
                          {recommendation.urgency === "high" ? "Book Now" : recommendation.urgency === "medium" ? "This Week" : "Take Your Time"}
                        </span>
                      </div>
                      <p className="font-body text-sm text-cream/45 mt-3">{recommendation.nextStep}</p>
                    </motion.div>
                  )}

                  {!recommendation && (
                    <p className="font-body text-muted-foreground text-base mb-10 max-w-md mx-auto">
                      Based on your selections, Luna will recommend the right service and stylist.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button onClick={() => handleLunaAction(true)} className="btn-gold py-4 px-8 flex items-center justify-center gap-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Mic className="w-5 h-5" /> Speak with Luna
                    </motion.button>
                    <motion.button onClick={() => handleLunaAction(true)} className="btn-outline-gold py-4 px-8 flex items-center justify-center gap-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <MessageSquare className="w-5 h-5" /> Chat with Luna
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-8">
                    <motion.button onClick={handleBack} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-gold transition-colors" whileHover={{ x: -3 }}>
                      <ArrowLeft className="w-4 h-4" /> Back
                    </motion.button>
                    <span className="text-secondary">|</span>
                    <button onClick={handleReset} className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4">
                      Start over
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
