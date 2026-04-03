import { motion } from "framer-motion";
import { Sparkles, Clock, DollarSign, Users, Plus, ChevronDown, CalendarClock } from "lucide-react";
import { RevealData } from "@/lib/experienceReveal";
import { useLuna } from "@/contexts/LunaContext";
import { BookingDecisionCard } from "@/components/BookingDecisionCard";
import { getUpsells } from "@/lib/upsellEngine";
import { getCadenceRecommendations } from "@/lib/cadenceEngine";

interface ExperienceRevealCardProps {
  data: RevealData;
  onBook?: () => void;
}

export const ExperienceRevealCard = ({ data, onBook }: ExperienceRevealCardProps) => {
  const { conciergeContext } = useLuna();
  const topUpsells = getUpsells(conciergeContext, 2);
  const categories = conciergeContext?.categories || [];
  const primaryCadence = categories.length > 0 ? getCadenceRecommendations(categories)[0] : null;

  const handleScrollToPlan = () => {
    const el = document.getElementById("personalized-plan");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      id="experience-reveal"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-card to-background overflow-hidden shadow-[0_0_60px_-15px_hsl(38_50%_55%/0.15)]">
        {/* Header glow bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="p-6 md:p-8 space-y-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-body uppercase tracking-widest text-gold">Your Experience</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl text-cream">
              {data.experienceLabel}
            </h3>
          </motion.div>

          {/* Info pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-body text-cream">{data.timeEstimate}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <DollarSign className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-body text-cream">{data.priceRange}</span>
            </div>
          </motion.div>

          {/* Upsell hints */}
          {topUpsells.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {topUpsells.map(u => (
                <span key={u.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gold/15 bg-gold/[0.04] text-[11px] font-body text-gold/80">
                  <Plus className="w-3 h-3" />
                  {u.name} {u.price}
                </span>
              ))}
            </motion.div>
          )}

          {/* Cadence teaser */}
          {primaryCadence && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="flex items-center justify-center gap-1.5"
            >
              <CalendarClock className="w-3 h-3 text-gold/60" />
              <span className="font-body text-[11px] text-cream/50 italic">
                Pro tip: Most guests refresh this every {primaryCadence.intervalWeeks[0]}–{primaryCadence.intervalWeeks[1]} weeks to keep it looking its best.
              </span>
            </motion.div>
          )}

          {/* Neutral artist matching message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4 md:p-5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-xs font-body uppercase tracking-wider text-gold">Artist Matching</span>
            </div>
            <p className="font-body text-sm text-cream/70 leading-relaxed">
              For this experience, our team will pair you with a stylist who specializes in exactly what you're looking for.
            </p>
          </motion.div>

          {/* Booking Decision */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <BookingDecisionCard
              revealData={data}
              context={conciergeContext}
            />
          </motion.div>

          {/* Scroll link to full plan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="text-center"
          >
            <button
              onClick={handleScrollToPlan}
              className="inline-flex items-center gap-1.5 font-body text-xs text-gold/70 hover:text-gold transition-colors group"
            >
              See your full personalized plan
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
