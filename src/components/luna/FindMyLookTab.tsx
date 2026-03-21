import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { setConciergeContext } from "@/lib/conciergeStore";
import { saveSession } from "@/lib/saveSession";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";

const categories: { id: ServiceCategoryId; label: string; emoji: string }[] = [
  { id: "hair", label: "Hair", emoji: "✂️" },
  { id: "nails", label: "Nails", emoji: "💅" },
  { id: "lashes", label: "Lashes", emoji: "👁️" },
  { id: "skincare", label: "Skincare", emoji: "✨" },
  { id: "massage", label: "Massage", emoji: "🧖" },
];

const goals: { id: string; label: string }[] = [
  { id: "refresh", label: "Quick refresh" },
  { id: "transform", label: "Full transformation" },
  { id: "relax", label: "Relax & unwind" },
  { id: "event", label: "Event-ready" },
];

const timings: { id: string; label: string }[] = [
  { id: "today", label: "Today / ASAP" },
  { id: "week", label: "This week" },
  { id: "planning", label: "Planning ahead" },
  { id: "browsing", label: "Just exploring" },
];

interface FindMyLookTabProps {
  onSwitchTab: (tab: string) => void;
}

export const FindMyLookTab = ({ onSwitchTab }: FindMyLookTabProps) => {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryId[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);

  const toggleCategory = (id: ServiceCategoryId) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleGoalSelect = (id: string) => {
    setSelectedGoal(id);
    setTimeout(() => setStep(3), 300);
  };

  const handleTimingSelect = (id: string) => {
    setSelectedTiming(id);
    const context: ConciergeContext = {
      source: "Find My Look",
      categories: selectedCategories,
      goal: id === selectedTiming ? selectedGoal : selectedGoal,
      timing: id,
    };
    setConciergeContext(context);
    saveSession(context);
    const rec = generateRecommendation(context);
    setRecommendation(rec);
    setTimeout(() => setStep(4), 300);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCategories([]);
    setSelectedGoal(null);
    setSelectedTiming(null);
    setRecommendation(null);
  };

  const stepLabels = ["Services", "Goal", "Timing", "Your Look"];

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-primary" : "bg-muted"
              }`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {stepLabels.map((label, i) => (
            <span key={label} className={`text-[10px] font-body ${
              i + 1 === step ? "text-primary" : "text-muted-foreground"
            }`}>{label}</span>
          ))}
        </div>
      </div>

      {/* Back button */}
      {step > 1 && step < 4 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="flex items-center gap-1 px-4 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
      )}

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <p className="font-body text-sm text-foreground">What are you looking for?</p>
              <p className="font-body text-xs text-muted-foreground">Select one or more</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm font-body transition-all ${
                      selectedCategories.includes(cat.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setStep(2)}
                  className="w-full btn-gold py-3 text-sm flex items-center justify-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <p className="font-body text-sm text-foreground">What's your goal?</p>
              <div className="space-y-2">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleGoalSelect(g.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-body transition-all ${
                      selectedGoal === g.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <p className="font-body text-sm text-foreground">When are you thinking?</p>
              <div className="space-y-2">
                {timings.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTimingSelect(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-body transition-all ${
                      selectedTiming === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && recommendation && (
            <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-display text-lg text-foreground">Your Look</p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-body text-primary uppercase tracking-wider">Recommended Service</p>
                  <p className="font-display text-base text-foreground">{recommendation.recommendedService}</p>
                  {recommendation.priceRange && (
                    <p className="text-xs text-muted-foreground mt-0.5">{recommendation.priceRange}</p>
                  )}
                </div>


                <div>
                  <p className="text-[10px] font-body text-primary uppercase tracking-wider">Next Step</p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">{recommendation.nextStep}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const callbackSection = document.getElementById("callback");
                    if (callbackSection) callbackSection.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full btn-gold py-3 text-sm"
                >
                  Book This Look
                </button>
                <button
                  onClick={() => onSwitchTab("chat")}
                  className="w-full btn-outline-gold py-3 text-sm"
                >
                  Chat with Luna
                </button>
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 font-body"
                >
                  Start over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
