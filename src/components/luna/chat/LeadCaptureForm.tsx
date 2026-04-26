import { forwardRef, useState } from "react";
import { m } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface LeadCaptureFormProps {
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSubmit: () => void;
  onDismiss: () => void;
}

/**
 * Inline lead capture form rendered below the chat after a successful exchange
 * threshold or a high-intent user message.
 */
export const LeadCaptureForm = forwardRef<HTMLDivElement, LeadCaptureFormProps>(function LeadCaptureForm(
  { name, phone, onNameChange, onPhoneChange, onSubmit, onDismiss },
  ref,
) {
  const [consent, setConsent] = useState(false);
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="ml-4 space-y-2 rounded-xl border border-primary/20 bg-card/50 p-3"
    >
      <p className="font-body text-xs text-muted-foreground">
        Love chatting with you — want me to have Kendell or the team follow up personally?
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="(520) 000-0000"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />
      <label className="flex items-start gap-2 cursor-pointer group pt-1">
        <Checkbox
          checked={consent}
          onCheckedChange={(c) => setConsent(c === true)}
          className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
        />
        <span className="text-[11px] text-muted-foreground leading-snug group-hover:text-foreground/80 transition-colors">
          I agree to receive calls, texts, and emails from Hush. Msg &amp; data rates may apply. Reply STOP to opt out.
        </span>
      </label>
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={!name.trim() || !phone.trim() || !consent}
          className="flex-1 rounded-lg bg-primary py-2 font-body text-sm text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Submit
        </button>
        <button
          onClick={onDismiss}
          className="px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Not now
        </button>
      </div>
    </m.div>
  );
});
