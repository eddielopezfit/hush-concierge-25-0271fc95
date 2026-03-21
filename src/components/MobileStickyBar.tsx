import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export const MobileStickyBar = () => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-background/80 border-t border-border z-40 md:hidden"
    >
      <div className="flex items-center justify-center max-w-lg mx-auto">
        <motion.a
          href="tel:+15203276753"
          className="btn-outline-gold py-3 px-6 flex items-center justify-center gap-2 text-sm"
          whileTap={{ scale: 0.98 }}
        >
          <Phone className="w-4 h-4" />
          <span>Call (520) 327-6753</span>
        </motion.a>
      </div>
    </motion.div>
  );
};
