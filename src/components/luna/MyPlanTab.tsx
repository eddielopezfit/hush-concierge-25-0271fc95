import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCw, Phone, MessageCircle, Calendar, Star, Clock } from "lucide-react";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";
import { formatCategoryList } from "@/lib/conciergeLabels";
import { useLuna } from "@/contexts/LunaContext";

interface MyPlanTabProps {
  onSwitchTab: (tab: string) => void;
}

export const MyPlanTab = ({ onSwitchTab }: MyPlanTabProps) => {
  const { conciergeContext } = useLuna();

  const hasContext = !!(conciergeContext?.categories?.length);
  const recommendation = useMemo<LunaRecommendation | null>(() => {
    if (!hasContext || !conciergeContext) return null;
    return generateRecommendation(conciergeContext);
  }, [conciergeContext, hasContext]);

  const categoryNames = conciergeContext?.categories ? formatCategoryList(conciergeContext.categories) : "";

  if (!hasContext || !recommendation) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display text-lg text-foreground mb-2"
        >
          Your Beauty Plan Awaits
        </motion.p>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="font-body text-sm text-muted-foreground mb-8 max-w-[240px]"
        >
          Tell us what you're looking for and we'll craft a personalized experience just for you.
        </motion.p>
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSwitchTab("find")}
          className="btn-gold py-3 px-8 text-sm flex items-center gap-2 rounded-full"
        >
          Find My Look <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    );
  }

  const ctx = getConciergeContext();
  const categoryNames = ctx?.categories ? formatCategoryList(ctx.categories) : "";

  const urgencyConfig = {
    high: {
      label: "Ready Now",
      sublabel: "Same-day availability",
      color: "text-accent",
      bgColor: "bg-accent/15 border-accent/25",
      icon: Clock,
    },
    medium: {
      label: "This Week",
      sublabel: "Booking soon",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
      icon: Calendar,
    },
    low: {
      label: "Exploring",
      sublabel: "No rush — take your time",
      color: "text-muted-foreground",
      bgColor: "bg-muted border-border",
      icon: Star,
    },
  };

  const urgency = urgencyConfig[recommendation.urgency];
  const UrgencyIcon = urgency.icon;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* Header with glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative text-center py-3"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent rounded-xl" />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <p className="text-[10px] font-body text-primary uppercase tracking-[0.2em]">Curated For You</p>
              <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
            {categoryNames && (
              <p className="text-xs text-muted-foreground font-body">{categoryNames}</p>
            )}
          </div>
        </motion.div>

        {/* Main Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-xl overflow-hidden"
        >
          {/* Card background with subtle gradient border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent p-px">
            <div className="w-full h-full rounded-xl bg-card" />
          </div>

          <div className="relative p-4 space-y-4">
            {/* Service */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base text-foreground leading-tight">
                  {recommendation.recommendedService}
                </p>
                {recommendation.priceRange && (
                  <p className="text-sm text-primary font-body mt-0.5">{recommendation.priceRange}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Urgency Badge */}
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${urgency.bgColor}`}>
              <UrgencyIcon className={`w-4 h-4 shrink-0 ${urgency.color}`} />
              <div>
                <p className={`text-xs font-body font-medium ${urgency.color}`}>{urgency.label}</p>
                <p className="text-[10px] text-muted-foreground font-body">{urgency.sublabel}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Step Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary/50 rounded-xl p-3.5 border border-border"
        >
          <p className="text-[10px] font-body text-primary uppercase tracking-wider mb-1.5">Luna's Advice</p>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{recommendation.nextStep}</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 pt-1"
        >
          <button
            onClick={() => {
              const callbackSection = document.getElementById("callback");
              if (callbackSection) callbackSection.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full btn-gold py-3 text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book This Experience
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSwitchTab("chat")}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary hover:bg-primary/10 transition-colors font-body"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ask Luna
            </button>
            <a
              href="tel:5203276753"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Hush
            </a>
          </div>

          <button
            onClick={() => onSwitchTab("find")}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-2 font-body"
          >
            <RefreshCw className="w-3 h-3" /> Start a new search
          </button>
        </motion.div>
      </div>
    </div>
  );
};
