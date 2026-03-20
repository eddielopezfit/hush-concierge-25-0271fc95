import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MessageSquare, Phone, Sparkles, Star } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { setConciergeContext } from "@/lib/conciergeStore";
import { requestVoiceStart, getVoiceActive, subscribeToVoiceState } from "@/lib/lunaVoiceBus";
import { generateRecommendation, LunaRecommendation } from "@/lib/lunaBrain";

interface LunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ConciergeContext;
}

const serviceLabels: Record<string, string> = {
  hair: "Hair",
  nails: "Nails",
  skincare: "Skincare",
  lashes: "Lashes",
  massage: "Massage",
};

const goalLabels: Record<string, string> = {
  refresh: "Refresh",
  relax: "Relax",
  transform: "Transform",
  event: "Event-ready",
};

const timingLabels: Record<string, string> = {
  today: "Today",
  week: "This week",
  planning: "Planning ahead",
  browsing: "Just browsing",
};

export const LunaModal = ({ isOpen, onClose, context }: LunaModalProps) => {
  const [voiceAlreadyActive, setVoiceAlreadyActive] = useState(false);
  const [recommendation, setRecommendation] = useState<LunaRecommendation | null>(null);

  // Track voice state
  useEffect(() => {
    if (!isOpen) return;
    
    // Check initial state
    setVoiceAlreadyActive(getVoiceActive());
    
    const unsubscribe = subscribeToVoiceState((active) => {
      setVoiceAlreadyActive(active);
    });
    
    return unsubscribe;
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Generate recommendation from context when modal opens
      if (context && context.categories && context.categories.length > 0) {
        setRecommendation(generateRecommendation(context));
      } else {
        setRecommendation(null);
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, context]);

  const handleSpeakWithLuna = () => {
    console.log("[LunaModal] Speak with Luna CTA clicked");
    
    // Store context for Luna to pick up
    if (context) {
      setConciergeContext(context);
    }
    
    // Close modal first
    onClose();
    
    // Request voice start via the bus
    const granted = requestVoiceStart("modal");
    console.log("[LunaModal] Voice start request granted:", granted);
    
    // Always scroll to Luna section
    setTimeout(() => {
      const lunaSection = document.getElementById("luna");
      if (lunaSection) {
        console.log("[LunaModal] Scrolling to #luna section");
        lunaSection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn("[LunaModal] Luna section (#luna) not found in DOM");
      }
    }, 100);
  };

  const handleChatWithLuna = () => {
    // For now, show a message - text chat is being prepared
    // This will be replaced when text chat is implemented
    onClose();
    if (context) {
      setConciergeContext(context);
    }
    // Show text chat placeholder - for now, open callback as fallback
    setTimeout(() => {
      const callbackSection = document.getElementById("callback");
      if (callbackSection) {
        callbackSection.scrollIntoView({ behavior: "smooth" });
        // Focus name field after scroll
        setTimeout(() => {
          const nameInput = document.querySelector<HTMLInputElement>('#callback input[name="fullName"]');
          if (nameInput) {
            nameInput.focus();
          }
        }, 800);
      }
    }, 100);
  };

  const handleRequestCallback = () => {
    onClose();
    const callbackSection = document.getElementById("callback");
    if (callbackSection) {
      callbackSection.scrollIntoView({ behavior: "smooth" });
      // Focus name field after scroll
      setTimeout(() => {
        const nameInput = document.querySelector<HTMLInputElement>('#callback input[name="fullName"]');
        if (nameInput) {
          nameInput.focus();
        }
      }, 800);
    }
  };

  const getContextSummary = () => {
    if (!context) return null;
    
    const parts: string[] = [];
    
    // Categories
    if (context.categories && context.categories.length > 0) {
      const serviceNames = context.categories.map(s => serviceLabels[s] || s);
      parts.push(serviceNames.join(", "));
    }
    
    // Goal
    if (context.goal) {
      parts.push(goalLabels[context.goal] || context.goal);
    }
    
    // Timing
    if (context.timing) {
      parts.push(timingLabels[context.timing] || context.timing);
    }
    
    return parts.length > 0 ? parts.join(" • ") : null;
  };

  const getViewingContext = () => {
    if (!context?.category || !context?.group || !context?.item) return null;
    
    const categoryLabel = serviceLabels[context.category] || context.category;
    const priceStr = context.price ? ` (${context.price})` : "";
    
    return `${categoryLabel} > ${context.group} > ${context.item}${priceStr}`;
  };

  const contextSummary = getContextSummary();
  const viewingContext = getViewingContext();

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
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg p-8 md:p-10 rounded-xl border border-gold/30 bg-card shadow-[0_0_60px_-15px_hsl(43_45%_58%/0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-charcoal-light flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/20 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              {/* Icon */}
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-gold" />
              </motion.div>

              {/* Title */}
              <h3 className="font-display text-3xl md:text-4xl text-cream mb-3">
                Your Concierge Path
              </h3>

              {/* Context Summary */}
              {contextSummary && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-body text-gold text-sm md:text-base mb-2 px-4"
                >
                  Selected: {contextSummary}
                </motion.p>
              )}

              {/* Viewing Context (for service menu deep links) */}
              {viewingContext && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-body text-gold/70 text-xs md:text-sm mb-4 px-4"
                >
                  Viewing: {viewingContext}
                </motion.p>
              )}

              {!contextSummary && !viewingContext && (
                <div className="mb-6" />
              )}

              <p className="font-body text-muted-foreground mb-8 max-w-sm mx-auto">
                Choose how you'd like to connect with Luna, your personal concierge.
              </p>

              {/* Already Active Notice */}
              {voiceAlreadyActive && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gold text-sm mb-4"
                >
                  Luna is already speaking below.
                </motion.p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={handleSpeakWithLuna}
                  className={`btn-gold py-4 px-6 flex items-center justify-center gap-3 w-full ${
                    voiceAlreadyActive ? "opacity-70" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mic className="w-5 h-5" />
                  <span>{voiceAlreadyActive ? "Go to Luna" : "Speak with Luna"}</span>
                </motion.button>

                <motion.button
                  onClick={handleChatWithLuna}
                  className="btn-outline-gold py-4 px-6 flex items-center justify-center gap-3 w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat with Luna</span>
                </motion.button>

                <motion.button
                  onClick={handleRequestCallback}
                  className="py-4 px-6 flex items-center justify-center gap-3 w-full text-muted-foreground hover:text-gold transition-colors font-body text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Phone className="w-4 h-4" />
                  <span>Request a Callback</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Re-export LunaContext type for backwards compatibility
export type { ConciergeContext as LunaContext };

// Custom hook for managing Luna modal state
export const useLunaModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ConciergeContext | undefined>(undefined);

  const openModal = useCallback((newContext?: ConciergeContext) => {
    setContext(newContext);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, context, openModal, closeModal };
};
