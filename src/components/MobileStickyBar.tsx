import { motion } from "framer-motion";
import { Mic, Phone } from "lucide-react";
import { LunaModal, useLunaModal, type LunaContext } from "./LunaModal";

export const MobileStickyBar = () => {
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleSpeakWithLuna = () => {
    const lunaContext: LunaContext = {
      source: "Mobile Sticky Bar",
      services: [],
      goal: null,
      timing: null,
    };
    openModal(lunaContext);
  };

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-background/90 border-t border-charcoal-light z-40 md:hidden"
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <motion.button
            onClick={handleSpeakWithLuna}
            className="flex-1 btn-gold py-4 px-6 flex items-center justify-center gap-3"
            whileTap={{ scale: 0.98 }}
          >
            <Mic className="w-5 h-5" />
            <span>Speak with Luna</span>
          </motion.button>

          <motion.a
            href="tel:+15203276753"
            className="btn-outline-gold py-4 px-4 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <Phone className="w-5 h-5" />
            <span className="hidden xs:inline">(520) 327-6753</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Luna Modal */}
      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
