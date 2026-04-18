import { useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, ArrowRight, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { RevealData, BookingMode, getBookingModeConfig, deriveBookingMode } from "@/lib/experienceReveal";
import { ConciergeContext } from "@/types/concierge";
import { useLuna } from "@/contexts/LunaContext";
import { saveLead, saveCallbackRequest } from "@/lib/saveSession";
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

  // Inline capture state — used by ALL modes now
  const [showCapture, setShowCapture] = useState(false);
  const [captureName, setCaptureName] = useState("");
  const [captureContact, setCaptureContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false); // idempotency guard

  const handlePrimary = () => {
    setShowCapture(true);
  };

  const handleSubmitCapture = async () => {
    if (!captureName.trim() || !captureContact.trim()) return;
    if (submittedRef.current || submitting) return; // prevent double submit
    setSubmitting(true);
    submittedRef.current = true;

    const isEmail = captureContact.includes("@");
    const phone = isEmail ? "" : captureContact.trim();
    const email = isEmail ? captureContact.trim() : undefined;

    // Fire both in parallel — saveLead for Slack routing, saveCallbackRequest for ops record
    const leadPromise = saveLead({
      name: captureName.trim(),
      phone,
      email,
      category: context?.categories?.join(", "),
      goal: context?.goal ?? undefined,
      timing: context?.timing ?? undefined,
    });

    // Only save callback if we have a phone (required by callback_requests schema)
    const callbackPromise = phone
      ? saveCallbackRequest({
          full_name: captureName.trim(),
          phone,
          email,
          interested_in: context?.categories?.join(", "),
          timing: context?.timing,
          source: `booking_${mode}`,
          concierge_context: context,
        })
      : Promise.resolve(true);

    const [leadOk] = await Promise.all([leadPromise, callbackPromise]);

    setSubmitting(false);
    if (leadOk) {
      setSubmitted(true);
    } else {
      submittedRef.current = false; // allow retry on failure
    }
  };

  const handleSecondary = () => {
    window.location.href = "tel:+15203276753";
  };

  const handleTertiary = () => {
    if (onChatWithLuna) {
      onChatWithLuna();
    } else {
      openChatWidget();
    }
  };

  const py = compact ? "py-2.5" : "py-3";
  const textSm = compact ? "text-xs" : "text-sm";

  // Context reminder for inline form
  const contextLines: string[] = [];
  if (revealData.experienceLabel) contextLines.push(revealData.experienceLabel);
  if (context?.timing) {
    const timingLabel = context.timing === "today" ? "Same day" : context.timing === "week" ? "This week" : context.timing;
    contextLines.push(timingLabel);
  }
  if (revealData.timeEstimate) contextLines.push(revealData.timeEstimate);

  return (
    <m.div
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

      {/* Inline capture form — ALL modes */}
      <AnimatePresence mode="wait">
        {showCapture && !submitted && (
          <m.div
            key="capture"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {/* Context reminder */}
            {contextLines.length > 0 && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                <p className="text-[10px] font-body uppercase tracking-wider text-muted-foreground mb-1">You're requesting</p>
                {contextLines.map((line, i) => (
                  <p key={i} className="text-xs font-body text-foreground">• {line}</p>
                ))}
              </div>
            )}
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
            <m.button
              onClick={handleSubmitCapture}
              disabled={submitting || !captureName.trim() || !captureContact.trim()}
              className={`w-full btn-gold ${py} ${textSm} font-display flex items-center justify-center gap-2 disabled:opacity-50`}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {config.primaryLabel}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </m.button>
          </m.div>
        )}

        {submitted && (
          <m.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-2"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display text-sm text-foreground">
              {config.confirmHeadline}
            </p>
            <p className="text-[11px] font-body text-muted-foreground">
              {config.confirmSubcopy}
            </p>
          </m.div>
        )}
      </AnimatePresence>

      {/* CTAs — only show if not in capture/submitted state */}
      {!submitted && (
        <div className="space-y-2">
          {/* Primary */}
          {!showCapture && (
            <m.button
              onClick={handlePrimary}
              className={`w-full btn-gold ${py} ${textSm} font-display flex items-center justify-center gap-2`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {config.primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </m.button>
          )}

          {/* Secondary (Call) + Text + Tertiary (Chat) */}
          <div className="grid grid-cols-3 gap-2">
            <m.a
              href="tel:+15203276753"
              className={`btn-outline-gold ${compact ? "py-2" : "py-2.5"} text-[11px] font-body flex items-center justify-center gap-1`}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </m.a>
            <m.a
              href="sms:+15203276753"
              className={`btn-outline-gold ${compact ? "py-2" : "py-2.5"} text-[11px] font-body flex items-center justify-center gap-1`}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Text us
            </m.a>
            <m.button
              onClick={handleTertiary}
              className={`btn-outline-gold ${compact ? "py-2" : "py-2.5"} text-[11px] font-body flex items-center justify-center gap-1`}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {config.tertiaryLabel}
            </m.button>
          </div>
        </div>
      )}
    </m.div>
  );
};
