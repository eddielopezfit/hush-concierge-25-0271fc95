import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Hand, Sparkles, Eye, Heart, Mic, MessageSquare, X, Phone, Check } from "lucide-react";

type Step = 1 | 2 | 3 | "result";

interface Selection {
  services: string[];
  goal: string | null;
  timing: string | null;
}

interface LunaContext {
  source: string;
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
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const ExperienceFinderSection = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selection, setSelection] = useState<Selection>({
    services: [],
    goal: null,
    timing: null,
  });
  const [showTextChatModal, setShowTextChatModal] = useState(false);

  const toggleService = (serviceId: string) => {
    setSelection((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleContinueToStep2 = () => {
    if (selection.services.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleClearServices = () => {
    setSelection((prev) => ({ ...prev, services: [] }));
  };

  const handleGoalSelect = (goalId: string) => {
    setSelection((prev) => ({ ...prev, goal: goalId }));
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handleTimingSelect = (timingId: string) => {
    setSelection((prev) => ({ ...prev, timing: timingId }));
    setTimeout(() => setCurrentStep("result"), 300);
  };

  const handleReset = () => {
    setSelection({ services: [], goal: null, timing: null });
    setCurrentStep(1);
  };

  const buildContext = (): LunaContext => ({
    source: "Experience Finder",
    services: selection.services,
    goal: selection.goal,
    timing: selection.timing,
  });

  const launchLuna = (mode: "voice" | "text", context: LunaContext) => {
    console.log("Launching Luna", { mode, context });
    
    if (mode === "voice") {
      // Scroll to Luna section and trigger voice widget
      const lunaSection = document.getElementById("luna");
      if (lunaSection) {
        lunaSection.scrollIntoView({ behavior: "smooth" });
        // Store context for Luna to pick up
        sessionStorage.setItem("lunaContext", JSON.stringify(context));
      }
    } else {
      // Text chat - show modal fallback for now
      setShowTextChatModal(true);
    }
  };

  const handleSpeakWithLuna = () => {
    launchLuna("voice", buildContext());
  };

  const handleChatWithLuna = () => {
    launchLuna("text", buildContext());
  };

  const scrollToCallback = () => {
    setShowTextChatModal(false);
    const callbackSection = document.getElementById("callback");
    if (callbackSection) {
      callbackSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "What are you here for?";
      case 2:
        return "What's your goal today?";
      case 3:
        return "How soon?";
      default:
        return "";
    }
  };

  const getStepNumber = () => {
    if (currentStep === "result") return 3;
    return currentStep;
  };

  return (
    <>
      <section className="py-32 px-6 bg-gradient-to-b from-card to-background relative overflow-hidden">
        {/* Subtle background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-crimson/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-6">
              Find Your Perfect <span className="text-gold-gradient">Experience</span>
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple questions. Luna takes it from there.
            </p>
          </motion.div>

          {/* Step Indicator */}
          {currentStep !== "result" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center gap-3 mb-12"
            >
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-sm transition-all duration-300 ${
                      step === currentStep
                        ? "bg-gold text-background"
                        : step < getStepNumber()
                        ? "bg-gold/30 text-gold"
                        : "bg-charcoal-light text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 md:w-20 h-px transition-all duration-300 ${
                        step < getStepNumber() ? "bg-gold/50" : "bg-charcoal-light"
                      }`}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Step Content */}
          <div className="min-h-[450px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-3">
                    {getStepTitle()}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground text-center mb-10">
                    Select one or more.
                  </p>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                  >
                    {categories.map((cat) => {
                      const isSelected = selection.services.includes(cat.id);
                      return (
                        <motion.button
                          key={cat.id}
                          variants={itemVariants}
                          onClick={() => toggleService(cat.id)}
                          className={`group relative p-6 md:p-8 rounded-lg text-center transition-all duration-300 border ${
                            isSelected
                              ? "border-gold bg-gold/10 shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.4)]"
                              : "border-charcoal-light bg-card hover:border-gold/50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Selected checkmark */}
                          <AnimatePresence>
                            {isSelected && (
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
                          
                          <cat.icon
                            className={`w-8 h-8 mx-auto mb-4 transition-colors duration-300 ${
                              isSelected
                                ? "text-gold"
                                : "text-muted-foreground group-hover:text-gold"
                            }`}
                          />
                          <span
                            className={`font-display text-lg transition-colors duration-300 ${
                              isSelected
                                ? "text-gold"
                                : "text-cream group-hover:text-gold"
                            }`}
                          >
                            {cat.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>

                  {/* Action buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
                  >
                    <motion.button
                      onClick={handleContinueToStep2}
                      disabled={selection.services.length === 0}
                      className={`btn-gold py-4 px-10 min-w-[180px] transition-all duration-300 ${
                        selection.services.length === 0
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                      whileHover={selection.services.length > 0 ? { scale: 1.02 } : {}}
                      whileTap={selection.services.length > 0 ? { scale: 0.98 } : {}}
                    >
                      Continue
                    </motion.button>
                    
                    {selection.services.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={handleClearServices}
                        className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
                      >
                        Clear selection
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-10">
                    {getStepTitle()}
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                  >
                    {goals.map((goal) => (
                      <motion.button
                        key={goal.id}
                        variants={itemVariants}
                        onClick={() => handleGoalSelect(goal.id)}
                        className={`group p-6 md:p-8 rounded-lg text-center transition-all duration-300 border ${
                          selection.goal === goal.id
                            ? "border-gold bg-gold/10 shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.4)]"
                            : "border-charcoal-light bg-card hover:border-gold/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          className={`font-display text-xl transition-colors duration-300 ${
                            selection.goal === goal.id
                              ? "text-gold"
                              : "text-cream group-hover:text-gold"
                          }`}
                        >
                          {goal.label}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-10">
                    {getStepTitle()}
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                  >
                    {timings.map((timing) => (
                      <motion.button
                        key={timing.id}
                        variants={itemVariants}
                        onClick={() => handleTimingSelect(timing.id)}
                        className={`group p-6 md:p-8 rounded-lg text-center transition-all duration-300 border ${
                          selection.timing === timing.id
                            ? "border-gold bg-gold/10 shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.4)]"
                            : "border-charcoal-light bg-card hover:border-gold/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          className={`font-display text-lg md:text-xl transition-colors duration-300 ${
                            selection.timing === timing.id
                              ? "text-gold"
                              : "text-cream group-hover:text-gold"
                          }`}
                        >
                          {timing.label}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {currentStep === "result" && (
                <motion.div
                  key="result"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full max-w-2xl mx-auto"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="p-10 md:p-14 rounded-xl text-center border border-gold/30 bg-card shadow-[0_0_60px_-15px_hsl(43_45%_58%/0.3)]"
                  >
                    <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-gold" />
                    </div>
                    
                    <h3 className="font-display text-3xl md:text-4xl text-cream mb-4">
                      Perfect — Luna can guide you from here.
                    </h3>
                    
                    <p className="font-body text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                      Based on what you selected, Luna will recommend the best next step and help you book.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        onClick={handleSpeakWithLuna}
                        className="btn-gold py-4 px-8 flex items-center justify-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Mic className="w-5 h-5" />
                        <span>Speak with Luna</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={handleChatWithLuna}
                        className="btn-outline-gold py-4 px-8 flex items-center justify-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Chat with Luna</span>
                      </motion.button>
                    </div>

                    <button
                      onClick={handleReset}
                      className="mt-8 font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
                    >
                      Start over
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Text Chat Modal (Fallback) */}
      <AnimatePresence>
        {showTextChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowTextChatModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md p-8 md:p-10 rounded-xl border border-gold/30 bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTextChatModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-gold" />
                </div>
                
                <h3 className="font-display text-2xl text-cream mb-4">
                  Text chat is being prepared
                </h3>
                
                <p className="font-body text-muted-foreground mb-8">
                  For now, speak with Luna or request a callback from our front desk.
                </p>

                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={() => {
                      setShowTextChatModal(false);
                      handleSpeakWithLuna();
                    }}
                    className="btn-gold py-3 px-6 flex items-center justify-center gap-2 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Speak with Luna</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={scrollToCallback}
                    className="btn-outline-gold py-3 px-6 flex items-center justify-center gap-2 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Request a Callback</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
