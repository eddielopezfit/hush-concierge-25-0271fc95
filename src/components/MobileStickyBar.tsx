import { m } from "framer-motion";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";

export const MobileStickyBar = () => {
  const { openChatWidget } = useLuna();

  const handleBookVisit = () => {
    const el = document.getElementById("callback");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <m.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-background/80 border-t border-border z-40 md:hidden"
    >
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Book a Visit — primary intent */}
        <m.button
          onClick={handleBookVisit}
          className="flex-[2] min-h-[48px] rounded-lg bg-gold text-background flex items-center justify-center gap-2 text-sm font-body font-medium shadow-[0_0_18px_hsl(38_50%_55%/0.25)]"
          whileTap={{ scale: 0.98 }}
          aria-label="Book a visit at Hush Salon"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Book a Visit</span>
        </m.button>

        {/* Call — direct contact */}
        <m.a
          href="tel:+15203276753"
          className="flex-1 min-h-[48px] rounded-lg border border-gold/40 text-gold flex items-center justify-center gap-2 text-sm font-body"
          whileTap={{ scale: 0.95 }}
          aria-label="Call Hush Salon at (520) 327-6753"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          <span>Call</span>
        </m.a>

        {/* Luna — concierge entry (compact) */}
        <m.button
          onClick={openChatWidget}
          className="min-h-[48px] w-12 rounded-lg border border-gold/40 text-gold flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
          aria-label="Open Luna concierge chat"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
        </m.button>
      </div>
    </m.div>
  );
};
