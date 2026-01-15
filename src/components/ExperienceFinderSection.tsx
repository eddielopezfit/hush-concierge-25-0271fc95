import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Hand, Sparkles, Eye, Heart, ChevronRight, Mic, MessageSquare } from "lucide-react";

type Step = 1 | 2 | 3 | "result";

interface Selection {
  category: string | null;
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
    category: null,
    goal: null,
    timing: null,
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelection((prev) => ({ ...prev, category: categoryId }));
    setTimeout(() => setCurrentStep(2), 300);
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
    setSelection({ category: null, goal: null, timing: null });
    setCurrentStep(1);
  };

  const handleSpeakWithLuna = () => {
    // Scroll to Luna widget or trigger it
    const lunaSection = document.getElementById("luna");
    if (lunaSection) {
      lunaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChatWithLuna = () => {
    const lunaSection = document.getElementById("luna");
    if (lunaSection) {
      lunaSection.scrollIntoView({ behavior: "smooth" });
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
        <div className="min-h-[400px] flex items-center justify-center">
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
                <h3 className="font-display text-2xl md:text-3xl text-cream text-center mb-10">
                  {getStepTitle()}
                </h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      variants={itemVariants}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`group card-luxury p-6 md:p-8 rounded-lg text-center transition-all duration-300 hover:border-gold/50 ${
                        selection.category === cat.id
                          ? "border-gold bg-gold/10"
                          : ""
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <cat.icon
                        className={`w-8 h-8 mx-auto mb-4 transition-colors duration-300 ${
                          selection.category === cat.id
                            ? "text-gold"
                            : "text-muted-foreground group-hover:text-gold"
                        }`}
                      />
                      <span
                        className={`font-display text-lg transition-colors duration-300 ${
                          selection.category === cat.id
                            ? "text-gold"
                            : "text-cream group-hover:text-gold"
                        }`}
                      >
                        {cat.label}
                      </span>
                    </motion.button>
                  ))}
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
                      className={`group card-luxury p-6 md:p-8 rounded-lg text-center transition-all duration-300 hover:border-gold/50 ${
                        selection.goal === goal.id
                          ? "border-gold bg-gold/10"
                          : ""
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
                      className={`group card-luxury p-6 md:p-8 rounded-lg text-center transition-all duration-300 hover:border-gold/50 ${
                        selection.timing === timing.id
                          ? "border-gold bg-gold/10"
                          : ""
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
                  className="card-luxury p-10 md:p-14 rounded-xl text-center border-gold/30"
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
  );
};
