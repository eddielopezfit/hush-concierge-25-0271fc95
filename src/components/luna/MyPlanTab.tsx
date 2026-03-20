import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { getConciergeContext } from "@/lib/conciergeStore";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { formatCategoryList } from "@/lib/conciergeLabels";
import { useState, useEffect } from "react";

interface MyPlanTabProps {
  onSwitchTab: (tab: string) => void;
}

export const MyPlanTab = ({ onSwitchTab }: MyPlanTabProps) => {
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);
  const [hasContext, setHasContext] = useState(false);

  const loadPlan = () => {
    const ctx = getConciergeContext();
    if (ctx && ctx.categories && ctx.categories.length > 0) {
      setHasContext(true);
      setRecommendation(generateRecommendation(ctx));
    } else {
      setHasContext(false);
      setRecommendation(null);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  if (!hasContext || !recommendation) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Sparkles className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="font-display text-lg text-foreground mb-2">No plan yet</p>
        <p className="font-body text-sm text-muted-foreground mb-6">
          Complete the Find My Look flow to get a personalized recommendation.
        </p>
        <button
          onClick={() => onSwitchTab("find")}
          className="btn-gold py-3 px-6 text-sm flex items-center gap-2"
        >
          Find My Look <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const ctx = getConciergeContext();
  const categoryNames = ctx?.categories ? formatCategoryList(ctx.categories) : "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="font-display text-lg text-foreground">Your Plan</p>
          {categoryNames && (
            <p className="text-xs text-muted-foreground font-body mt-1">{categoryNames}</p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3"
        >
          <div>
            <p className="text-[10px] font-body text-primary uppercase tracking-wider">Recommended Service</p>
            <p className="font-display text-base text-foreground">{recommendation.recommendedService}</p>
            {recommendation.priceRange && (
              <p className="text-xs text-muted-foreground mt-0.5">{recommendation.priceRange}</p>
            )}
          </div>

          {recommendation.recommendedArtist && (
            <div>
              <p className="text-[10px] font-body text-primary uppercase tracking-wider">Matched Artist</p>
              <p className="text-sm text-foreground font-body">{recommendation.recommendedArtist}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-body text-primary uppercase tracking-wider">Urgency</p>
            <span className={`inline-block text-xs font-body px-2 py-0.5 rounded-full ${
              recommendation.urgency === "high" ? "bg-accent/20 text-accent-foreground" :
              recommendation.urgency === "medium" ? "bg-primary/20 text-primary" :
              "bg-muted text-muted-foreground"
            }`}>
              {recommendation.urgency === "high" ? "Book now" : recommendation.urgency === "medium" ? "This week" : "Take your time"}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-body text-primary uppercase tracking-wider">Next Step</p>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">{recommendation.nextStep}</p>
          </div>
        </motion.div>

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
            className="w-full btn-outline-gold py-2.5 text-sm"
          >
            Chat with Luna
          </button>
          <button
            onClick={() => { onSwitchTab("find"); }}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 font-body"
          >
            <RefreshCw className="w-3 h-3" /> Start new search
          </button>
        </div>
      </div>
    </div>
  );
};
