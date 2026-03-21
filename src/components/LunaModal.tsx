import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MessageSquare, Phone } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { ConciergeContext } from "@/types/concierge";
import { setConciergeContext } from "@/lib/conciergeStore";
import { requestVoiceStart, getVoiceActive, subscribeToVoiceState } from "@/lib/lunaVoiceBus";
import { categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";

interface LunaModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  context?: ConciergeContext;
}

const subtypeDisplayLabels: Record<string, string> = {
  cut:         "Cut or cleanup",
  color:       "Color or highlights",
  both:        "Cut + color",
  manicure:    "Manicure",
  pedicure:    "Pedicure",
  full_set:    "Full set",
  nail_art:    "Nail art",
  fill:        "Lash fill",
  lift:        "Lash lift",
  relaxation:  "Relaxation massage",
  deep_tissue: "Deep tissue",
  pain_relief: "Pain relief",
  facial:      "Facial",
  acne:        "Acne / correction",
  glow:        "Glow / refresh",
  unsure:      "Open to guidance",
};

export const LunaModal = ({ isOpen, onClose, context }: LunaModalProps) => {
  const [voiceAlreadyActive, setVoiceAlreadyActive] = useState(false);

  // Voice state tracking
  useEffect(() => {
    if (!isOpen) return;
    setVoiceAlreadyActive(getVoiceActive());
    const unsub = subscribeToVoiceState(active => setVoiceAlreadyActive(active));
    return unsub;
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else        document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSpeakWithLuna = () => {
    console.debug("[LunaModal] Speak with Luna clicked", {
      categories: context?.categories,
      primary_category: context?.primary_category,
      service_subtype: context?.service_subtype,
      multi_service_mode: context?.multi_service_mode,
      is_multi_service: context?.is_multi_service,
    });
    if (context) setConciergeContext(context);
    onClose();
    console.debug("[LunaModal] requestVoiceStart('modal') called");
    requestVoiceStart("modal");
    setTimeout(() => {
      const lunaSection = document.getElementById("luna");
      if (lunaSection) {
        lunaSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleChatWithLuna = () => {
    if (context) setConciergeContext(context);
    onClose();
    setTimeout(() => {
      const el = document.getElementById("callback");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleRequestCallback = () => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById("callback");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          const inp = document.querySelector<HTMLInputElement>('#callback input[name="fullName"]');
          inp?.focus();
        }, 800);
      }
    }, 100);
  };

  // ── Context display helpers ──────────────────────────────────────────────────

  const hasContext = !!(
    context?.categories?.length ||
    context?.goal ||
    context?.timing ||
    context?.service_subtype
  );

  const isUnsure = context?.service_subtype === "unsure";
  const isMultiBundle = context?.multi_service_mode === "bundle_guidance";
  const isMultiUnsure = context?.multi_service_mode === "unsure";
  const isMultiService = context?.is_multi_service;

  const contextChips = (() => {
    const chips: string[] = [];
    if (context?.categories?.length) {
      chips.push(...context.categories.map(c => categoryLabels[c] || c));
    }
    if (context?.goal)           chips.push(goalLabels[context.goal]    || context.goal);
    if (context?.timing)         chips.push(timingLabels[context.timing] || context.timing);
    if (context?.service_subtype && context.service_subtype !== "unsure") {
      chips.push(subtypeDisplayLabels[context.service_subtype] || context.service_subtype);
    }
    if (context?.primary_category && isMultiService) {
      chips.push(`Focus: ${categoryLabels[context.primary_category] || context.primary_category}`);
    }
    return chips;
  })();

  // Soft direction text — multi-service aware
  const softDirection = (() => {
    if (!context?.categories?.length) return null;

    // Multi-service: bundle or unsure — no single-service recommendation
    if (isMultiBundle) {
      const catList = context.categories.map(c => categoryLabels[c] || c).join(", ");
      return `This looks more like a custom experience than a single service — you're interested in ${catList}. Luna can help map the best combination and next step.`;
    }
    if (isMultiUnsure) {
      const catList = context.categories.map(c => categoryLabels[c] || c).join(", ");
      return `You're exploring ${catList} and not sure where to start. Luna can help figure out what to prioritize.`;
    }

    // Multi-service with primary focus
    if (isMultiService && context.primary_category) {
      const primaryLabel = categoryLabels[context.primary_category] || context.primary_category;
      const sub = context.service_subtype;
      if (!sub || sub === "unsure") {
        return `You may be leaning toward ${primaryLabel.toLowerCase()} services as a starting point. Luna can help with the rest.`;
      }
      return `Based on what you shared, you may be leaning toward ${primaryLabel.toLowerCase()} services. Luna can help refine this and plan across your other interests.`;
    }

    // Single service
    const cat = context.categories[0];
    const sub = context.service_subtype;
    if (!sub || sub === "unsure") return null;
    const catLabel = categoryLabels[cat] || cat;
    const goalLabel = context.goal ? (goalLabels[context.goal] || context.goal).toLowerCase() : "";
    if (goalLabel) {
      return `Based on what you shared, you may be leaning toward ${catLabel.toLowerCase()} services — with a focus on ${goalLabel}. Luna can help refine this.`;
    }
    return `It sounds like ${catLabel.toLowerCase()} services could be a good fit. Luna can help you narrow it down.`;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-background/85 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full max-w-md p-8 md:p-10 rounded-xl border border-gold/20 bg-card shadow-[0_0_60px_-15px_hsl(38_50%_55%/0.2)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/15 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── SECTION 1 — Context reflection ────────────────────────── */}
            {hasContext && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6"
              >
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  You're exploring
                </p>
                <div className="flex flex-wrap gap-2">
                  {contextChips.map((chip, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-body bg-gold/10 text-gold border border-gold/20"
                    >
                      {chip}
                    </span>
                  ))}
                  {isUnsure && (
                    <span className="px-3 py-1 rounded-full text-xs font-body bg-secondary text-muted-foreground">
                      Open to guidance
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── SECTION 2 — Soft direction ────────────────────────────── */}
            {softDirection && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-4 rounded-lg border border-gold/15 bg-background/40"
              >
                <p className="font-body text-[10px] text-gold uppercase tracking-wider mb-2">
                  A possible direction
                </p>
                <p className="font-body text-sm text-cream/80 leading-relaxed">
                  {softDirection}
                </p>
              </motion.div>
            )}

            {/* ── SECTION 3 — Trust layer ───────────────────────────────── */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-body text-xs text-muted-foreground leading-relaxed mb-7 italic"
            >
              This isn't final — Luna can refine this with you based on your preferences, history, and desired outcome.
            </motion.p>

            {/* ── SECTION 4 — Primary CTA ───────────────────────────────── */}
            <motion.button
              onClick={handleSpeakWithLuna}
              className={`w-full btn-gold py-4 px-6 flex items-center justify-center gap-3 text-base mb-3 ${voiceAlreadyActive ? "opacity-70" : ""}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Mic className="w-5 h-5" />
              {voiceAlreadyActive ? "Go to Luna" : "Speak with Luna to personalize this"}
            </motion.button>

            {/* ── SECTION 5 — Secondary CTAs ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex flex-col gap-2"
            >
              <motion.button
                onClick={handleChatWithLuna}
                className="w-full btn-outline-gold py-3 px-6 flex items-center justify-center gap-3 text-sm"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Luna
              </motion.button>

              <motion.button
                onClick={handleRequestCallback}
                className="w-full py-3 px-6 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors font-body"
                whileHover={{ scale: 1.01 }}
              >
                <Phone className="w-3.5 h-3.5" />
                Request a callback
              </motion.button>
            </motion.div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Re-export type alias for backward compatibility
export type { ConciergeContext as LunaContext };

// Hook for components that manage their own modal state
export const useLunaModal = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [context, setContext]   = useState<ConciergeContext | undefined>();
  const openModal  = useCallback((ctx?: ConciergeContext) => { setContext(ctx); setIsOpen(true); }, []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  return { isOpen, context, openModal, closeModal };
};
