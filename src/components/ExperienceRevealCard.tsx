import { motion } from "framer-motion";
import { Sparkles, Clock, DollarSign, Users } from "lucide-react";
import { RevealData } from "@/lib/experienceReveal";
import { useLuna } from "@/contexts/LunaContext";
import { getConciergeContext } from "@/lib/conciergeStore";
import { BookingDecisionCard } from "@/components/BookingDecisionCard";

interface ExperienceRevealCardProps {
  data: RevealData;
  onBook?: () => void;
}

export const ExperienceRevealCard = ({ data, onBook }: ExperienceRevealCardProps) => {
  const { conciergeContext } = useLuna();
  return (
    <motion.div
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
              Your artist match depends on your unique needs — our front desk will pair you with the perfect fit.
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
        </div>
      </div>
    </motion.div>
  );
};
