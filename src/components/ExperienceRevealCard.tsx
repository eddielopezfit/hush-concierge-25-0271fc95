import { m } from "framer-motion";
import { Sparkles, Clock, DollarSign, ChevronDown } from "lucide-react";
import { RevealData, deriveBookingMode } from "@/lib/experienceReveal";
import { useLuna } from "@/contexts/LunaContext";
import { BookingDecisionCard } from "@/components/BookingDecisionCard";
import { PriceConfidenceAccordion } from "@/components/PriceConfidenceAccordion";

interface ExperienceRevealCardProps {
  data: RevealData;
  onBook?: () => void;
}

export const ExperienceRevealCard = ({ data, onBook: _onBook }: ExperienceRevealCardProps) => {
  const { conciergeContext } = useLuna();
  const bookingMode = deriveBookingMode(data, conciergeContext);
  const planLinkLabel =
    bookingMode === "consultation"
      ? "See what your visit may include"
      : "See your full personalized plan";

  const handleScrollToPlan = () => {
    const el = document.getElementById("personalized-plan");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <m.div
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
          <m.div
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
          </m.div>

          {/* Info pills */}
          <m.div
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
          </m.div>

          {/* Price confidence — hair only */}
          {conciergeContext?.categories?.includes("hair") && (
            <m.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
            >
              <PriceConfidenceAccordion />
            </m.div>
          )}

          {/* Booking Decision */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <BookingDecisionCard
              revealData={data}
              context={conciergeContext}
            />
          </m.div>

          {/* Scroll link to full plan */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={handleScrollToPlan}
              className="inline-flex items-center gap-2 font-body text-xs md:text-sm text-gold/85 hover:text-gold transition-colors group px-4 py-2 rounded-lg border border-gold/20 hover:border-gold/40 hover:bg-gold/5"
            >
              {planLinkLabel}
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </m.div>
        </div>
      </div>
    </m.div>
  );
};
