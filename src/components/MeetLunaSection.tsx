import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";

export const MeetLunaSection = () => {
  const { openChatWidget } = useLuna();

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
          className="flex flex-col items-center gap-6"
        >
          <div className="flex flex-col items-center gap-6 p-8 card-luxury rounded-lg w-full max-w-md">
            <div className="flex items-center gap-3 text-gold mb-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-body text-sm uppercase tracking-widest">Chat</span>
            </div>
            <motion.button
              onClick={() => openChatWidget()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold py-4 px-10 flex items-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Luna
            </motion.button>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Luna can help you find the right service, the right stylist, and the best way to book.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
