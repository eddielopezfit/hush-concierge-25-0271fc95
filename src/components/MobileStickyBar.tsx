import { m } from "framer-motion";
import { Phone, MessageCircle, MessageSquare } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";

export const MobileStickyBar = () => {
  const { openChatWidget } = useLuna();

  return (
    <m.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-background/80 border-t border-border z-40 md:hidden"
    >
      <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
        {/* Call — primary direct contact */}
        <m.a
          href="tel:+15203276753"
          className="flex-1 min-h-[48px] rounded-lg bg-gold text-background flex items-center justify-center gap-2 text-sm font-body font-medium"
          whileTap={{ scale: 0.98 }}
          aria-label="Call Hush Salon at (520) 327-6753"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          <span>Call</span>
        </m.a>

        {/* Text */}
        <m.a
          href="sms:+15203276753"
          className="flex-1 min-h-[48px] rounded-lg border border-gold/40 text-gold flex items-center justify-center gap-2 text-sm font-body"
          whileTap={{ scale: 0.95 }}
          aria-label="Text Hush Salon"
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          <span>Text</span>
        </m.a>

        {/* Talk to Luna */}
        <m.button
          onClick={openChatWidget}
          className="flex-1 min-h-[48px] rounded-lg border border-gold/40 text-gold flex items-center justify-center gap-2 text-sm font-body"
          whileTap={{ scale: 0.95 }}
          aria-label="Open Luna concierge chat"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          <span>Luna</span>
        </m.button>
      </div>
    </m.div>
  );
};
