import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export const InlineCallbackCTA = () => {
  const handleScroll = () => {
    const el = document.getElementById("callback");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-8 px-6 flex items-center justify-center gap-4"
    >
      <motion.button
        onClick={handleScroll}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-outline-gold py-3 px-6 flex items-center gap-2 text-sm"
      >
        <Phone className="w-4 h-4" />
        Request a Callback
      </motion.button>
    </motion.div>
  );
};
