export interface ChatAction {
  label: string;
  type: "scroll" | "tab" | "callback" | "phone" | "text";
  target?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Optional in-chat action buttons rendered below the message */
  actions?: ChatAction[];
  /** When true, render the inline booking form below this message */
  showInlineBooking?: boolean;
}

export interface PersistedChat {
  messages: ChatMessage[];
  fingerprint: string;
  successfulExchangeCount: number;
  leadCaptured: boolean;
  leadDismissed: boolean;
  savedAt: number;
}
