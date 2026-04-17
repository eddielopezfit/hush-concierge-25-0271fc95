import { motion } from "framer-motion";
import { Phone, Sparkles, MapPin } from "lucide-react";

export const MobileStickyBar = () => {
  const handleFindExperience = () => {
    const finder = document.getElementById("experience-finder");
    if (finder) finder.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-background/80 border-t border-border z-40 md:hidden"
    >
      <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
        {/* Primary CTA — scrolls to quiz */}
        <motion.button
          onClick={handleFindExperience}
          className="btn-gold py-3 px-4 flex-1 flex items-center justify-center gap-2 text-sm"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Plan my visit</span>
        </motion.button>

        {/* Secondary — phone with label */}
        <motion.a
          href="tel:+15203276753"
          className="h-12 px-3 rounded-lg border border-gold/40 bg-gold/5 flex items-center justify-center gap-1.5 text-gold shrink-0 text-xs font-body font-medium"
          whileTap={{ scale: 0.95 }}
          aria-label="Call Hush Salon"
        >
          <Phone className="w-4 h-4" />
          <span>Call now</span>
        </motion.a>

        {/* Tertiary — directions */}
        <motion.a
          href="https://www.google.com/maps/dir/?api=1&destination=Hush+Salon+%26+Day+Spa+Tucson+AZ"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-lg border border-gold/30 flex items-center justify-center text-gold shrink-0"
          whileTap={{ scale: 0.95 }}
          aria-label="Get directions"
        >
          <MapPin className="w-5 h-5" />
        </motion.a>
      </div>
    </motion.div>
  );
};
