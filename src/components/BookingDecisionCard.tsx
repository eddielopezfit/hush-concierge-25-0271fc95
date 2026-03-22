import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, ArrowRight, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { RevealData, BookingMode, getBookingModeConfig, deriveBookingMode } from "@/lib/experienceReveal";
import { ConciergeContext } from "@/types/concierge";
import { useLuna } from "@/contexts/LunaContext";
import { saveLead } from "@/lib/saveSession";
import { Input } from "@/components/ui/input";

interface BookingDecisionCardProps {
  revealData: RevealData;
  context: ConciergeContext | null | undefined;
  /** Compact mode for Luna panel tabs */
  compact?: boolean;
  onChatWithLuna?: () => void;
}

export const BookingDecisionCard = ({
  revealData,
  context,
  compact = false,
  onChatWithLuna,
}: BookingDecisionCardProps) => {
  const { openChatWidget, openModal } = useLuna();
  const mode = deriveBookingMode(revealData, context);
  const config = getBookingModeConfig(mode, context?.timing);

  // Inline capture state for direct_or_callback
  const [showCapture, setShowCapture] = useState(false);
  const [captureName, setCaptureName] = useState("");
  const [captureContact, setCaptureContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePrimary = () => {
    if (mode === "direct_or_callback") {
      setShowCapture(true);
    } else {
      // Consultation or guided → scroll to callback
      const el = document.getElementById("callback");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmitCapture = async () => {
    if (!captureName.trim() || !captureContact.trim()) return;
    setSubmitting(true);

    const isEmail = captureContact.includes("@");
    const success = await saveLead({
      name: captureName.trim(),
      phone: isEmail ? "" : captureContact.trim(),
      email: isEmail ? captureContact.trim() : undefined,
      category: context?.categories?.join(", "),
      goal: context?.goal ?? undefined,
      timing: context?.timing ?? undefined,
    });

    setSubmitting(false);
    if (success) setSubmitted(true);
  };

  const handleSecondary = () => {
    window.location.href = "tel:+15203276753";
  };

  const handleTertiary = () => {
    if (onChatWithLuna) {
      onChatWithLuna();
    } else {
      openChatWidget();
      if (context) openModal(context);
    }
  };

  const py = compact ? "py-2.5" : "py-3";
  const textSm = compact ? "text-xs" : "text-sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Mode badge */}
      <div className="flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <span className="text-[10px] font-body uppercase tracking-widest text-primary px-2">
          {config.badge}
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>

      {/* Headline + subcopy */}
      <div className="text-center space-y-1">
        <p className={`font-display ${compact ? "text-sm" : "text-base"} text-foreground`}>
          {config.headline}
        </p>
        <p className="text-[11px] font-body text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {config.subcopy}
        </p>
      </div>

      {/* Inline capture form for direct_or_callback */}
      <AnimatePresence mode="wait">
        {showCapture && !submitted && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <Input
              placeholder="Your name"
              value={captureName}
              onChange={e => setCaptureName(e.target.value)}
              className="bg-secondary border-border text-foreground text-sm"
            />
            <Input
              placeholder="Phone or email"
              value={captureContact}
              onChange={e => setCaptureContact(e.target.value)}
              className="bg-secondary border-border text-foreground text-sm"
            />
            <motion.button
              onClick={handleSubmitCapture}
              disabled={submitting || !captureName.trim() || !captureContact.trim()}
              className={`w-full btn-gold ${py} ${textSm} font-display flex items-center justify-center gap-2 disabled:opacity-50`}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Check Availability
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {submitted && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-2"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display text-sm text-foreground">
              Got it — Hush is checking availability for you now
            </p>
            <p className="text-[11px] font-body text-muted-foreground">
              Someone will reach out shortly to lock this in
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTAs — only show if not in capture/submitted state */}
      {!submitted && (
        <div className="space-y-2">
          {/* Primary */}
          {!showCapture && (
            <motion.button
              onClick={handlePrimary}
              className={`w-full btn-gold ${py} ${textSm} font-display flex items-center justify-center gap-2`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {config.primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}

          {/* Secondary + Tertiary */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={handleSecondary}
              className={`btn-outline-gold ${compact ? "py-2" : "py-2.5"} text-xs font-body flex items-center justify-center gap-1.5`}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-3.5 h-3.5" />
              {config.secondaryLabel}
            </motion.button>
            <motion.button
              onClick={handleTertiary}
              className={`btn-outline-gold ${compact ? "py-2" : "py-2.5"} text-xs font-body flex items-center justify-center gap-1.5`}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {config.tertiaryLabel}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
