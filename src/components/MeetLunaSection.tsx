import { motion } from "framer-motion";
import { MessageCircle, Mic } from "lucide-react";
import { LunaVoiceWidget } from "./LunaVoiceWidget";
import { useLuna } from "@/contexts/LunaContext";
import { ConciergeContext } from "@/types/concierge";

export const MeetLunaSection = () => {
  const { openModal } = useLuna();

  const handleChatWithLuna = () => {
    const lunaContext: ConciergeContext = {
      source: "Meet Luna Section",
      categories: [],
      goal: null,
      timing: null,
    };
    openModal(lunaContext);
  };

  return (
    <section id="luna" className="py-20 md:py-24 px-6 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Meet <span className="text-gold-gradient">Luna</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-4">
            Your personal guide to Hush
          </p>
          <div className="section-divider max-w-md mx-auto mb-8" />
          <p className="font-body text-base text-cream/60 max-w-xl mx-auto leading-relaxed">
            Not sure what to book? Luna knows every service, every stylist, and every detail.
            She'll help you find exactly what you need — no pressure, just great guidance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-center gap-12"
        >
          {/* Voice Option */}
          <div className="flex flex-col items-center gap-6 p-8 card-luxury rounded-lg w-full md:w-auto">
            <div className="flex items-center gap-3 text-gold mb-2">
              <Mic className="w-5 h-5" />
              <span className="font-body text-sm uppercase tracking-widest">Voice</span>
            </div>
            <LunaVoiceWidget isPrimary />
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Talk to Luna like you'd call the front desk.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
          <div className="md:hidden h-px w-48 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

          {/* Text Option */}
          <div className="flex flex-col items-center gap-6 p-8 card-luxury rounded-lg w-full md:w-auto">
            <div className="flex items-center gap-3 text-gold mb-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-body text-sm uppercase tracking-widest">Text</span>
            </div>
            <motion.button
              onClick={handleChatWithLuna}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
            >
              Chat with Luna
            </motion.button>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Prefer typing? Luna's just as helpful in text.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
