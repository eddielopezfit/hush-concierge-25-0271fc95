import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Phone } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { ConciergeContext } from "@/types/concierge";
import { categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";
import { useLuna } from "@/contexts/LunaContext";

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
  const { openChatWidget, setConcierge } = useLuna();
  // Exit-intent lead capture
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadPhone, setLeadPhone]             = useState("");
  const [leadSubmitted, setLeadSubmitted]     = useState(false);
  const ctaClickedRef                         = useRef(false);

  // Reset CTA-clicked ref and lead capture state each time modal opens
  useEffect(() => {
    if (isOpen) {
      ctaClickedRef.current = false;
      setShowLeadCapture(false);
      setLeadSubmitted(false);
      setLeadPhone("");
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else        document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChatWithLuna = () => {
    ctaClickedRef.current = true;
    if (context) setConcierge(context);
    onClose();
    openChatWidget();
  };

  const handleRequestCallback = () => {
    ctaClickedRef.current = true;
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

  // Exit-intent: show lead capture if user closes without choosing a CTA
  const handleClose = () => {
    if (!ctaClickedRef.current && !leadSubmitted && context?.categories?.length) {
      setShowLeadCapture(true);
    } else {
      onClose();
    }
  };

  const handleLeadSubmit = async () => {
    if (leadPhone.trim().length >= 10) {
      try {
        const { saveLead } = await import("@/lib/saveSession");
        await saveLead({
          name: "Website Visitor",
          phone: leadPhone.trim(),
          category: context?.categories?.join(", "),
          goal: context?.goal ?? undefined,
          timing: context?.timing ?? undefined,
        });
      } catch { /* graceful degradation */ }
      setLeadSubmitted(true);
      setTimeout(() => {
        setShowLeadCapture(false);
        setLeadSubmitted(false);
        setLeadPhone("");
        ctaClickedRef.current = false;
        onClose();
      }, 2000);
    }
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

    if (isMultiBundle) {
      const catList = context.categories.map(c => categoryLabels[c] || c).join(", ");
      return `This looks more like a custom experience than a single service — you're interested in ${catList}. Luna can help map the best combination and next step.`;
    }
    if (isMultiUnsure) {
      const catList = context.categories.map(c => categoryLabels[c] || c).join(", ");
      return `You're exploring ${catList} and not sure where to start. Luna can help figure out what to prioritize.`;
    }

    if (isMultiService && context.primary_category) {
      const primaryLabel = categoryLabels[context.primary_category] || context.primary_category;
      const sub = context.service_subtype;
      if (!sub || sub === "unsure") {
        return `You may be leaning toward ${primaryLabel.toLowerCase()} services as a starting point. Luna can help with the rest.`;
      }
      return `Based on what you shared, you may be leaning toward ${primaryLabel.toLowerCase()} services. Luna can help refine this and plan across your other interests.`;
    }

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
          onClick={handleClose}
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
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/15 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── EXIT-INTENT LEAD CAPTURE ──────────── */}
            <AnimatePresence>
              {showLeadCapture && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 rounded-xl bg-card flex flex-col items-center justify-center p-8 z-10"
                >
                  {leadSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <p className="font-display text-2xl text-gold mb-2">✅ Got it.</p>
                      <p className="font-body text-sm text-muted-foreground">
                        The Hush team will follow up during business hours.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <p className="font-display text-xl text-cream mb-1 text-center">
                        Want Luna to text you
                        <br />a booking link?
                      </p>
                      <p className="font-body text-xs text-muted-foreground text-center mb-6">
                        We'll hold your preferences and follow up during business hours.
                      </p>
                      <input
                        type="tel"
                        value={leadPhone}
                        onChange={e => setLeadPhone(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLeadSubmit()}
                        placeholder="Your phone number"
                        className="w-full bg-background/60 border border-gold/20 rounded-lg px-4 py-3 text-cream text-sm font-body placeholder-muted-foreground focus:outline-none focus:border-gold/60 mb-3"
                        autoFocus
                      />
                      <button
                        onClick={handleLeadSubmit}
                        disabled={leadPhone.trim().length < 10}
                        className={`w-full btn-gold py-3 px-6 text-sm ${
                          leadPhone.trim().length < 10 ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      >
                        Text me availability
                      </button>
                      <button
                        onClick={() => { setShowLeadCapture(false); onClose(); }}
                        className="mt-3 text-xs text-muted-foreground hover:text-gold transition-colors font-body"
                      >
                        No thanks
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Context reflection ────────────────────────── */}
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

            {/* ── Soft direction ────────────────────────────── */}
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

            {/* ── Trust layer ───────────────────────────────── */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-body text-xs text-muted-foreground leading-relaxed mb-7 italic"
            >
              This isn't final — Luna can refine this with you based on your preferences, history, and desired outcome.
            </motion.p>

            {/* ── Primary CTA — Chat ───────────────────────── */}
            <motion.button
              onClick={handleChatWithLuna}
              className="w-full btn-gold py-4 px-6 flex items-center justify-center gap-3 text-base mb-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MessageSquare className="w-5 h-5" />
              Text me availability
            </motion.button>

            {/* ── Secondary CTA — Callback ─────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex flex-col gap-2"
            >
              <motion.button
                onClick={handleRequestCallback}
                className="w-full py-3 px-6 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors font-body"
                whileHover={{ scale: 1.01 }}
              >
                <Phone className="w-3.5 h-3.5" />
                Request follow-up
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
