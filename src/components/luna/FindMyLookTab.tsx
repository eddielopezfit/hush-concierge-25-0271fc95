import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, ArrowRight, Clock, DollarSign, Users, RotateCcw, Scissors, Hand, Eye, Heart, Flower2 } from "lucide-react";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { startSession } from "@/lib/sessionManager";
import { ConciergeContext, ServiceCategoryId, ServiceSubtype } from "@/types/concierge";
import { buildRevealData, RevealData } from "@/lib/experienceReveal";
import { useLuna } from "@/contexts/LunaContext";
import { BookingDecisionCard } from "@/components/BookingDecisionCard";

const categories: { id: ServiceCategoryId; label: string; icon: typeof Scissors }[] = [
  { id: "hair", label: "Hair", icon: Scissors },
  { id: "nails", label: "Nails", icon: Hand },
  { id: "lashes", label: "Lashes", icon: Eye },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "massage", label: "Massage", icon: Heart },
];

// Category-specific subtype options
const subtypeOptions: Record<ServiceCategoryId, { id: string; label: string }[]> = {
  hair: [
    { id: "cut", label: "Haircut" },
    { id: "color", label: "Color / Highlights" },
    { id: "both", label: "Cut + Color" },
    { id: "unsure", label: "Not sure yet" },
  ],
  nails: [
    { id: "manicure", label: "Manicure" },
    { id: "pedicure", label: "Pedicure" },
    { id: "full_set", label: "Full Set / Acrylics" },
    { id: "unsure", label: "Not sure yet" },
  ],
  lashes: [
    { id: "full_set", label: "Full Set" },
    { id: "fill", label: "Fill / Refill" },
    { id: "lift", label: "Lash Lift" },
    { id: "unsure", label: "Not sure yet" },
  ],
  skincare: [
    { id: "facial", label: "Facial" },
    { id: "acne", label: "Acne / Skin Concerns" },
    { id: "glow", label: "Glow Treatment" },
    { id: "unsure", label: "Not sure yet" },
  ],
  massage: [
    { id: "relaxation", label: "Relaxation" },
    { id: "deep_tissue", label: "Deep Tissue" },
    { id: "pain_relief", label: "Pain Relief" },
    { id: "unsure", label: "Not sure yet" },
  ],
};

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
  const { conciergeContext, setConcierge } = useLuna();
  // Steps: 1=categories, 2=subtype, 3=goal, 4=timing, 5=reveal
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryId[]>([]);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [resumedFromContext, setResumedFromContext] = useState(false);

  // Only resume to reveal if quiz was completed THIS session (within 30 minutes)
  // Prevents stale cached results from confusing fresh visitors.
  const QUIZ_FRESH_MS = 30 * 60 * 1000;
  useEffect(() => {
    if (resumedFromContext || step !== 1) return;
    if (!conciergeContext?.categories?.length) return;
    const completedAt = conciergeContext.quizCompletedAt;
    if (!completedAt || Date.now() - completedAt > QUIZ_FRESH_MS) return;
    const reveal = buildRevealData(conciergeContext);
    if (reveal) {
      setSelectedCategories(conciergeContext.categories);
      setSelectedSubtype(conciergeContext.service_subtype ?? null);
      setSelectedGoal(conciergeContext.goal ?? null);
      setSelectedTiming(conciergeContext.timing ?? null);
      setRevealData(reveal);
      setRecommendation(generateRecommendation(conciergeContext));
      setStep(5);
      setResumedFromContext(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategory = (id: ServiceCategoryId) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleCategoriesNext = () => {
    // For multi-category or single-category, check if subtype step is needed
    if (selectedCategories.length === 1) {
      const cat = selectedCategories[0];
      if (subtypeOptions[cat]?.length) {
        setStep(2); // show subtype
        return;
      }
    }
    // Multi-service or no subtypes: skip to goal
    setStep(3);
  };

  const handleSubtypeSelect = (id: string) => {
    setSelectedSubtype(id);
    setTimeout(() => setStep(3), 300);
  };

  const handleGoalSelect = (id: string) => {
    setSelectedGoal(id);
    setTimeout(() => setStep(4), 300);
  };

  const handleTimingSelect = (id: string) => {
    setSelectedTiming(id);
    const context: ConciergeContext = {
      source: "Find My Look",
      categories: selectedCategories,
      goal: selectedGoal,
      timing: id,
      service_subtype: (selectedSubtype as ServiceSubtype) || null,
      primary_category: selectedCategories.length > 1 ? selectedCategories[0] : null,
      is_multi_service: selectedCategories.length > 1,
      quizCompletedAt: Date.now(),
    };
    setConcierge(context);
    startSession(context, "find_my_look");
    const rec = generateRecommendation(context);
    setRecommendation(rec);
    const reveal = buildRevealData(context);
    setRevealData(reveal);
    setTimeout(() => setStep(5), 300);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCategories([]);
    setSelectedSubtype(null);
    setSelectedGoal(null);
    setSelectedTiming(null);
    setRecommendation(null);
    setRevealData(null);
    setResumedFromContext(false);
  };

  const stepLabels = ["Services", "Type", "Goal", "Timing", "Your Look"];
  const totalSteps = selectedCategories.length === 1 && subtypeOptions[selectedCategories[0]]?.length ? 5 : 4;
  // Map internal step to display step for non-subtype flows
  const displayStep = totalSteps === 4 && step >= 3 ? step - 1 : step;

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          {(totalSteps === 5 ? stepLabels : [stepLabels[0], stepLabels[2], stepLabels[3], stepLabels[4]]).map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= displayStep ? "bg-primary" : "bg-muted"
              }`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {(totalSteps === 5 ? stepLabels : [stepLabels[0], stepLabels[2], stepLabels[3], stepLabels[4]]).map((label, i) => (
            <span key={label} className={`text-[10px] font-body ${
              i + 1 === displayStep ? "text-primary" : "text-muted-foreground"
            }`}>{label}</span>
          ))}
        </div>
      </div>

      {/* Back button */}
      {step > 1 && step < 5 && (
        <button
          onClick={() => {
            if (step === 3 && totalSteps === 4) {
              setStep(1); // skip subtype going back
            } else {
              setStep(s => s - 1);
            }
          }}
          className="flex items-center gap-1 px-4 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
      )}

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <m.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <p className="font-body text-sm text-foreground">What are you looking for?</p>
              <p className="font-body text-xs text-muted-foreground">Select one or more</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border text-sm font-body transition-all ${
                        selectedCategories.includes(cat.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/30"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <m.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleCategoriesNext}
                  className="w-full btn-gold py-3 text-sm flex items-center justify-center gap-2"
                >
                  Tell me more <ArrowRight className="w-4 h-4" />
                </m.button>
              )}
            </m.div>
          )}

          {step === 2 && selectedCategories.length === 1 && (
            <m.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
              <p className="font-body text-sm text-foreground">What kind of {selectedCategories[0]} service?</p>
              <div className="space-y-2">
                {(subtypeOptions[selectedCategories[0]] || []).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleSubtypeSelect(opt.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-body transition-all ${
                      selectedSubtype === opt.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </m.div>
          )}

          {step === 3 && (
            <m.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
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
            </m.div>
          )}

          {step === 4 && (
            <m.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pt-2">
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
            </m.div>
          )}

          {step === 5 && revealData && (
            <m.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-3">
                  <Sparkles className="w-3 h-3 text-gold" />
                  <span className="text-[10px] font-body uppercase tracking-widest text-gold">Your Experience</span>
                </div>
                <p className="font-display text-lg text-foreground">{revealData.experienceLabel}</p>
              </div>

              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border">
                  <Clock className="w-3 h-3 text-gold" />
                  <span className="text-[11px] font-body text-foreground">{revealData.timeEstimate}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border">
                  <DollarSign className="w-3 h-3 text-gold" />
                  <span className="text-[11px] font-body text-foreground">{revealData.priceRange}</span>
                </div>
              </div>

              <div className="rounded-lg border border-gold/10 bg-gold/[0.03] p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-body uppercase tracking-wider text-gold">Artist Matching</span>
                </div>
                <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                  Our front desk will pair you with the perfect artist for your needs.
                </p>
              </div>

              <BookingDecisionCard
                revealData={revealData}
                context={conciergeContext}
                compact
                onChatWithLuna={() => onSwitchTab("chat")}
              />

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-2 font-body"
              >
                <RotateCcw className="w-3 h-3" /> Edit selections
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
