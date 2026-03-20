import { motion } from "framer-motion";
import { MessageCircle, Mic } from "lucide-react";
import { LunaVoiceWidget } from "./LunaVoiceWidget";
import { LunaModal, useLunaModal, type LunaContext } from "./LunaModal";

export const MeetLunaSection = () => {
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleChatWithLuna = () => {
    const lunaContext: LunaContext = {
      source: "Meet Luna Section",
      categories: [],
      goal: null,
      timing: null,
    };
    openModal(lunaContext);
  };

  return (
    <>
      <section id="luna" className="py-20 md:py-24 px-6 relative overflow-hidden">
        {/* Subtle Glow Background */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none"
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
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-6">
              Meet <span className="text-gold-gradient">Luna</span>
            </h2>
            <p className="font-display text-xl md:text-2xl text-muted-foreground italic mb-4">
              Your Digital Concierge
            </p>
            <div className="section-divider max-w-md mx-auto mb-8" />
            <p className="font-body text-lg text-cream/70 max-w-2xl mx-auto leading-relaxed">
              Luna is here to guide you through our services, answer your questions, 
              and help you feel confident before you ever book. She knows everything 
              about Hush and is available whenever you need her.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-12"
          >
            {/* Voice Option - PRIMARY WIDGET */}
            <div className="flex flex-col items-center gap-6 p-8 card-luxury rounded-lg w-full md:w-auto">
              <div className="flex items-center gap-3 text-gold mb-2">
                <Mic className="w-5 h-5" />
                <span className="font-body text-sm uppercase tracking-widest">Voice</span>
              </div>
              <LunaVoiceWidget isPrimary />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
            <div className="md:hidden h-px w-48 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

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
                Prefer to type? Luna is equally eloquent in text.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Luna Modal */}
      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
