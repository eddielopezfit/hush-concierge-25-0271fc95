import { m } from "framer-motion";

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
export function LeadCaptureForm({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onSubmit,
  onDismiss,
}: LeadCaptureFormProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="ml-4 p-3 rounded-xl border border-primary/20 bg-card/50 space-y-2"
    >
      <p className="text-xs text-muted-foreground font-body">
        Love chatting with you — want me to have Kendell or the team follow up personally?
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Your name"
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="(520) 000-0000"
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={!name.trim() || !phone.trim()}
          className="flex-1 bg-primary text-primary-foreground text-sm font-body py-2 rounded-lg disabled:opacity-40 transition-opacity"
        >
          Submit
        </button>
        <button
          onClick={onDismiss}
          className="px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Not now
        </button>
      </div>
    </m.div>
  );
}
