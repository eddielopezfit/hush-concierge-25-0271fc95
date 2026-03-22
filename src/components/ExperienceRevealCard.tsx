import { motion } from "framer-motion";
import { Sparkles, Clock, DollarSign, Phone, MessageSquare, Users, ArrowRight } from "lucide-react";
import { RevealData } from "@/lib/experienceReveal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLuna } from "@/contexts/LunaContext";
import { getConciergeContext } from "@/lib/conciergeStore";

interface ExperienceRevealCardProps {
  data: RevealData;
  onBook?: () => void;
}

export const ExperienceRevealCard = ({ data, onBook }: ExperienceRevealCardProps) => {
  const { openModal, openChatWidget } = useLuna();

  const handleBook = () => {
    if (onBook) {
      onBook();
    } else {
      const el = document.getElementById("callback");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChat = () => {
    const ctx = getConciergeContext();
    openChatWidget();
    if (ctx) openModal(ctx);
  };

  const handleCall = () => {
    window.location.href = "tel:+15203276753";
  };

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

          {/* Stylist fits */}
          {data.stylistFits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4 md:p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gold" />
                <span className="text-xs font-body uppercase tracking-wider text-gold">Great fits for your goals</span>
              </div>
              <div className="space-y-2.5">
                {data.stylistFits.map((fit, i) => (
                  <motion.div
                    key={fit.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="w-8 h-8 border border-gold/20">
                      {fit.photo ? (
                        <AvatarImage src={fit.photo} alt={fit.name} />
                      ) : null}
                      <AvatarFallback className="bg-secondary text-gold text-xs font-display">
                        {fit.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-display text-cream truncate">{fit.name}</p>
                      <p className="text-[11px] font-body text-muted-foreground truncate">{fit.specialty}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Consultation / booking path */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-center"
          >
            {data.consultationRequired ? (
              <p className="text-xs font-body text-muted-foreground mb-4">
                This experience starts with a quick consultation to personalize your service and pricing.
              </p>
            ) : (
              <p className="text-xs font-body text-muted-foreground mb-4">
                You can book this experience directly — we'll match you with the perfect artist.
              </p>
            )}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="space-y-3"
          >
            {/* Primary */}
            <motion.button
              onClick={handleBook}
              className="w-full btn-gold py-4 text-sm font-display flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {data.consultationRequired ? "Request Consultation" : "Book This Experience"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Secondary */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={handleChat}
                className="btn-outline-gold py-3 text-xs font-body flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat with Luna
              </motion.button>
              <motion.button
                onClick={handleCall}
                className="btn-outline-gold py-3 text-xs font-body flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Phone className="w-3.5 h-3.5" />
                Call Front Desk
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
