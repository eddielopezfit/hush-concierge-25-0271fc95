import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, ArrowRight, Sparkles, Phone, Calendar, ChevronRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getJourneyContextString } from "@/lib/journeyTracker";
import { getConciergeContext } from "@/lib/conciergeStore";
import { formatCategoryList, categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";
import { saveLead } from "@/lib/saveSession";
import { getConversationId, startSession } from "@/lib/sessionManager";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import ReactMarkdown from "react-markdown";
import { useLuna } from "@/contexts/LunaContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Optional in-chat action buttons rendered below the message */
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  type: "scroll" | "tab" | "callback" | "phone";
  target?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/luna-chat`;

// Known error fallback phrases used to detect error responses
const ERROR_PHRASES = [
  "having trouble connecting",
  "give me just a moment and try again",
];

function isErrorResponse(content: string): boolean {
  const lower = content.toLowerCase();
  return ERROR_PHRASES.some(p => lower.includes(p));
}

// ── Error-specific quick replies ────────────────────────────────────────────
const ERROR_QUICK_REPLIES = [
  "Try again",
  "Call (520) 327-6753",
  "Browse services",
  "Help me choose",
];

// ── Context-aware greeting builder ──────────────────────────────────────────
function buildContextGreeting(ctx: ConciergeContext | null): string {
  if (!ctx?.categories?.length) {
    return "Hey there — welcome to Hush. I'm Luna, your digital concierge.\n\nI know our entire team, every service we offer, and how to get you exactly what you're looking for. Think of me as your personal guide to the salon.\n\nWhat brings you in today?";
  }

  const cats = ctx.categories;
  const sub = ctx.service_subtype;
  const goal = ctx.goal;
  const timing = ctx.timing;
  const timingStr = timing ? (timingLabels[timing] || timing).toLowerCase() : "";

  // Multi-service
  if (cats.length > 1) {
    const names = formatCategoryList(cats);
    const timingPart = timingStr ? ` ${timingStr}` : "";
    return `You're building a ${names.toLowerCase()} experience${timingPart} — love that. Want me to help map out the best combination, or do you have questions about specific services?`;
  }

  const cat = cats[0];

  // Hair flows
  if (cat === "hair") {
    if (sub === "color") {
      const goalPart = goal === "transform" ? ", a full transformation" : "";
      const timingPart = timingStr ? ` ${timingStr}` : "";
      return `You're thinking color work${goalPart}${timingPart ? " —" + timingPart : ""}. I can help you understand the process, compare options, or figure out timing. What would be most helpful?`;
    }
    if (sub === "cut") {
      return `Looking for a fresh cut${timingStr ? " " + timingStr : ""}. Want help understanding what our stylists specialize in, or do you have questions about pricing?`;
    }
    if (sub === "both") {
      return `Cut and color together${timingStr ? " — " + timingStr : ""}. That's a great combo. Want me to walk you through what to expect, or help you compare options?`;
    }
    const goalPart = goal ? `, looking for ${(goalLabels[goal] || goal).toLowerCase()}` : "";
    return `You're exploring hair services${goalPart}${timingStr ? " — " + timingStr : ""}. Tell me more — are you thinking a cut, color, or something else?`;
  }

  // Nails
  if (cat === "nails") {
    if (sub === "manicure") return `Thinking about a manicure${timingStr ? " " + timingStr : ""}. Gel or regular? I can walk you through what we offer.`;
    if (sub === "pedicure") return `A pedicure sounds perfect${timingStr ? " for " + timingStr : ""}. Want details on our options, or ready to figure out timing?`;
    if (sub === "full_set") return `Full nail set${timingStr ? " " + timingStr : ""} — great choice. Want to know about gel options, or have questions about pricing?`;
    return `You're looking at nails${timingStr ? " " + timingStr : ""}. I can help you figure out the right service — gel, regular, full set, or nail art?`;
  }

  // Lashes
  if (cat === "lashes") {
    if (sub === "full_set") return `Lash full set${timingStr ? " " + timingStr : ""} — exciting! Want me to explain classic vs hybrid vs volume?`;
    if (sub === "fill") return `Lash fill${timingStr ? " " + timingStr : ""}. Quick question — do you know if you have classic, hybrid, or volume?`;
    return `You're exploring lashes${timingStr ? " — " + timingStr : ""}. Are you thinking a full set, fill, or lash lift?`;
  }

  // Skincare
  if (cat === "skincare") {
    if (sub === "facial") return `A facial${timingStr ? " " + timingStr : ""} — we have several options from signature to microneedling. What's your skin goal right now?`;
    if (sub === "acne") return `Dealing with breakouts or skin concerns${timingStr ? " — hoping to come in " + timingStr : ""}. Our estheticians are incredible at this. Want me to walk you through options?`;
    return `You're thinking skincare${timingStr ? " " + timingStr : ""}. Are you looking for relaxation, correction, or a glow-up?`;
  }

  // Massage
  if (cat === "massage") {
    if (sub === "relaxation") return `A relaxation massage${timingStr ? " " + timingStr : ""} — that sounds perfect. Are you thinking 60, 90, or 120 minutes?`;
    if (sub === "deep_tissue") return `Deep tissue work${timingStr ? " " + timingStr : ""}. Tammi is amazing at this. Are you thinking 60 or 90 minutes?`;
    return `You're interested in a massage${timingStr ? " — " + timingStr : ""}. Relaxation, deep tissue, or pain relief?`;
  }

  // Generic with context
  const names = formatCategoryList(cats);
  return `You're exploring ${names.toLowerCase()}${timingStr ? " — " + timingStr : ""}. I know everything about our services and team. What would be most helpful?`;
}

// ── Persistent quick replies — shown after EVERY Luna response ──────────────
function getQuickReplies(ctx: ConciergeContext | null, lastAssistantMsg: string): string[] {
  const lower = (lastAssistantMsg || "").toLowerCase();

  // Contextual variants based on conversation state
  if (lower.includes("price") || lower.includes("cost") || lower.includes("pricing")) {
    return ["I'm ready to book", "What affects the price?", "Help me decide", "Connect me with the team"];
  }
  if (lower.includes("stylist") || lower.includes("artist") || lower.includes("specialist")) {
    return ["I'm ready to book", "Help me find the right service", "What will it cost?", "Connect me with the team"];
  }
  if (lower.includes("event") || lower.includes("wedding") || lower.includes("occasion")) {
    return ["Let's plan my full look", "I'm ready to book", "What will it cost?", "Connect me with the team"];
  }
  if (lower.includes("option") || lower.includes("explore") || lower.includes("browse")) {
    return ["Walk me through options", "I'm ready to book", "What will it cost?", "Connect me with the team"];
  }
  if (lower.includes("recommend") || lower.includes("suggest")) {
    return ["That sounds perfect — book it", "Tell me more about that", "What will it cost?", "Connect me with the team"];
  }
  if (lower.includes("ready") || lower.includes("lock") || lower.includes("reserve") || lower.includes("book")) {
    return ["Let's lock it in", "Have someone call me", "Help me decide", "What will it cost?"];
  }

  // Default persistent set
  return ["I'm ready to book", "Help me decide", "What will it cost?", "Connect me with the team"];
}

// ── Detect intent from assistant message for in-chat CTAs ───────────────────
function detectChatActions(msg: string, ctx: ConciergeContext | null): ChatAction[] {
  const lower = msg.toLowerCase();
  const actions: ChatAction[] = [];

  // Service identified → offer booking + explore
  if (lower.includes("i'd suggest") || lower.includes("i'd recommend") || lower.includes("great option") || lower.includes("perfect for")) {
    actions.push({ label: "Reserve this service", type: "scroll", target: "callback" });
    actions.push({ label: "Build my personalized plan", type: "tab", target: "plan" });
  }

  // Stylist mentioned → offer artist browse
  if (lower.includes("stylist") || lower.includes("specialist") || lower.includes("artist") || lower.includes("our team")) {
    if (!actions.find(a => a.label.includes("Reserve"))) {
      actions.push({ label: "See our team", type: "tab", target: "artists" });
    }
  }

  // Booking/ready signals
  if (lower.includes("ready to book") || lower.includes("lock in") || lower.includes("reserve") || lower.includes("help you book")) {
    if (!actions.find(a => a.type === "scroll")) {
      actions.push({ label: "Reserve your experience", type: "scroll", target: "callback" });
    }
    actions.push({ label: "Get a quick call back", type: "callback" });
  }

  // Pricing mentioned → offer plan view
  if (lower.includes("pricing") || lower.includes("price range") || lower.includes("starts at")) {
    if (!actions.find(a => a.label.includes("plan"))) {
      actions.push({ label: "See my personalized plan", type: "tab", target: "plan" });
    }
  }

  // Call prompt
  if (lower.includes("(520) 327-6753") || lower.includes("call us") || lower.includes("front desk")) {
    actions.push({ label: "Call (520) 327-6753", type: "phone" });
  }

  return actions.slice(0, 3); // max 3 actions
}

// ── Initial smart chips for greeting only ───────────────────────────────────
function getSmartChips(ctx: ConciergeContext | null): string[] {
  if (!ctx?.categories?.length) {
    return [
      "I'm new — what should I know?",
      "What's everyone loving right now?",
      "I have something specific in mind",
    ];
  }

  const cat = ctx.categories[0];
  const sub = ctx.service_subtype;

  if (ctx.categories.length > 1) {
    return [
      "Help me combine these services",
      "How long will everything take?",
      "What's the total cost look like?",
    ];
  }

  if (cat === "hair") {
    if (sub === "color") return [
      "Balayage vs highlights — what's the difference?",
      "How long does color take?",
      "What's the price range for color?",
    ];
    if (sub === "cut") return [
      "What styles are trending right now?",
      "How much is a women's haircut?",
      "Do I need a consultation first?",
    ];
    if (sub === "both") return [
      "How long does cut + color take?",
      "What's the price range?",
      "Do you do consultations?",
    ];
    return [
      "Help me figure out what I need",
      "What's the difference between services?",
      "Show me hair pricing",
    ];
  }

  if (cat === "nails") return [
    "Gel vs regular — what's best?",
    "How long does a full set last?",
    "What's nail pricing like?",
  ];

  if (cat === "lashes") return [
    "Classic vs volume — what's the difference?",
    "How long do lashes last?",
    "What's lash pricing?",
  ];

  if (cat === "skincare") return [
    "Which facial is right for me?",
    "What's the difference between treatments?",
    "What's skincare pricing?",
  ];

  if (cat === "massage") return [
    "60 vs 90 minutes — what do you recommend?",
    "What's massage pricing?",
    "Do you have openings this week?",
  ];

  return [
    "Help me figure out what I need",
    "What's popular right now?",
    "Show me pricing",
  ];
}

// ── Context bar pills ───────────────────────────────────────────────────────
function getContextPills(ctx: ConciergeContext | null): string[] {
  if (!ctx) return [];
  const pills: string[] = [];
  if (ctx.categories?.length) {
    ctx.categories.forEach(c => pills.push(categoryLabels[c] || c));
  }
  if (ctx.service_subtype && ctx.service_subtype !== "unsure") {
    const subtypeDisplay: Record<string, string> = {
      cut: "Cut", color: "Color", both: "Cut + Color",
      manicure: "Manicure", pedicure: "Pedicure", full_set: "Full Set", nail_art: "Nail Art",
      fill: "Fill", lift: "Lash Lift",
      relaxation: "Relaxation", deep_tissue: "Deep Tissue", pain_relief: "Pain Relief",
      facial: "Facial", acne: "Acne Treatment", glow: "Glow Treatment",
    };
    pills.push(subtypeDisplay[ctx.service_subtype] || ctx.service_subtype);
  }
  if (ctx.goal) pills.push(goalLabels[ctx.goal] || ctx.goal);
  if (ctx.timing) pills.push(timingLabels[ctx.timing] || ctx.timing);
  return pills;
}

// ── In-Chat Action Button Component ─────────────────────────────────────────
function ChatActionButtons({
  actions,
  onAction,
}: {
  actions: ChatAction[];
  onAction: (action: ChatAction) => void;
}) {
  if (!actions.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-1.5 mt-2 ml-3.5"
    >
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onAction(action)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-body font-medium hover:bg-primary/20 transition-colors"
        >
          {action.type === "phone" && <Phone className="w-3 h-3" />}
          {action.type === "callback" && <Phone className="w-3 h-3" />}
          {action.type === "scroll" && <Calendar className="w-3 h-3" />}
          {action.type === "tab" && <ChevronRight className="w-3 h-3" />}
          {action.label}
        </button>
      ))}
    </motion.div>
  );
}

export const ChatTab = () => {
  const { conciergeContext, openChatWidget } = useLuna();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [successfulExchangeCount, setSuccessfulExchangeCount] = useState(0);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [contextPills, setContextPills] = useState<string[]>([]);
  const [smartChips, setSmartChips] = useState<string[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Reset / New conversation ────────────────────────────────────────────────
  const resetChat = useCallback(() => {
    const ctx = conciergeContext;
    const greeting = buildContextGreeting(ctx);
    setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
    setInput("");
    setUserMessageCount(0);
    setSuccessfulExchangeCount(0);
    setLeadCaptured(false);
    setShowLeadForm(false);
    setLeadDismissed(false);
    setLeadName("");
    setLeadPhone("");
    setContextPills(getContextPills(ctx));
    setSmartChips(getSmartChips(ctx));
    setQuickReplies(getQuickReplies(ctx, greeting));
  }, [conciergeContext]);

  // Track the context fingerprint to detect meaningful changes
  const contextFingerprintRef = useRef<string>("");

  const getContextFingerprint = (ctx: ConciergeContext | null): string => {
    if (!ctx) return "none";
    return `${ctx.categories?.join(",") || ""}_${ctx.service_subtype || ""}_${ctx.goal || ""}_${ctx.timing || ""}_${ctx.source || ""}`;
  };

  // Build contextual greeting + chips on first render AND when context changes meaningfully
  useEffect(() => {
    const ctx = conciergeContext;
    const newFingerprint = getContextFingerprint(ctx);

    // Skip if already initialized with this exact context
    if (initialized && newFingerprint === contextFingerprintRef.current) return;

    contextFingerprintRef.current = newFingerprint;

    const greeting = buildContextGreeting(ctx);
    setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
    setContextPills(getContextPills(ctx));
    setSmartChips(getSmartChips(ctx));
    setQuickReplies(getQuickReplies(ctx, greeting));
    setInput("");
    setUserMessageCount(0);
    setSuccessfulExchangeCount(0);
    setLeadCaptured(false);
    setShowLeadForm(false);
    setLeadDismissed(false);
    setLeadName("");
    setLeadPhone("");
    setInitialized(true);

    if (!getConversationId()) {
      startSession(ctx, "chat");
    }
  }, [initialized, conciergeContext]);

  // Update context pills reactively when concierge context changes after init
  useEffect(() => {
    if (!initialized) return;
    setContextPills(getContextPills(conciergeContext));
  }, [conciergeContext, initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Delayed scroll to catch quick replies / action buttons that animate in
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);
    return () => clearTimeout(t);
  }, [messages, isStreaming, quickReplies]);

  // ── Handle in-chat action buttons ──────────────────────────────────────────
  const handleChatAction = useCallback((action: ChatAction) => {
    if (action.type === "phone") {
      window.open("tel:+15203276753", "_self");
    } else if (action.type === "callback") {
      setShowLeadForm(true);
    } else if (action.type === "scroll" && action.target) {
      const el = document.getElementById(action.target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action.type === "tab" && action.target) {
      const tabEvent = new CustomEvent("luna-switch-tab", { detail: action.target });
      window.dispatchEvent(tabEvent);
    }
  }, []);

  const streamChat = useCallback(async (allMessages: ChatMessage[]) => {
    setIsStreaming(true);
    abortRef.current = new AbortController();

    const journeyContext = getJourneyContextString();
    const apiMessages = allMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    try {
      const conversationId = getConversationId();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, journeyContext, conversation_id: conversationId }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          const errorContent = "I'm getting a lot of questions right now — give me just a moment and try again!";
          setMessages((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, role: "assistant", content: errorContent },
          ]);
          setQuickReplies(ERROR_QUICK_REPLIES);
          setIsStreaming(false);
          return;
        }
        throw new Error(`Stream failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      const assistantId = `luna-${Date.now()}`;
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch { /* ignore */ }
        }
      }

      // After streaming completes — attach actions + update quick replies
      const actions = detectChatActions(assistantContent, conciergeContext);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, actions } : m))
      );
      setQuickReplies(getQuickReplies(conciergeContext, assistantContent));

      // Count as a successful exchange (for lead form timing)
      setSuccessfulExchangeCount(prev => prev + 1);

    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("[ChatTab] Stream error:", err);
      const errorContent = "I'm having trouble connecting right now. You can always call us directly at (520) 327-6753 — Kendell at the front desk will take great care of you!";
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: errorContent },
      ]);
      // Show error-specific quick replies instead of generic ones
      setQuickReplies(ERROR_QUICK_REPLIES);
    } finally {
      setIsStreaming(false);
    }
  }, [conciergeContext]);

  const handleSendInternal = useCallback(
    (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isStreaming) return;

      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: msg };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      const newCount = userMessageCount + 1;
      setUserMessageCount(newCount);

      streamChat(newMessages.filter((m) => m.id !== "greeting"));

      // Use successfulExchangeCount for lead form trigger, not raw message count
      if (successfulExchangeCount >= 3 && !leadCaptured && !showLeadForm && !leadDismissed) {
        setTimeout(() => setShowLeadForm(true), 3000);
      }
    },
    [input, isStreaming, messages, userMessageCount, successfulExchangeCount, leadCaptured, showLeadForm, leadDismissed, streamChat]
  );

  // ── Handle quick reply chips — preserves full conversation context ─────────
  const handleQuickReply = useCallback((reply: string) => {
    if (reply === "Connect me with the team" || reply === "Call the front desk" || reply === "Call (520) 327-6753") {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (isTouchDevice) {
        window.open("tel:+15203276753", "_self");
      } else {
        setMessages(prev => [...prev, {
          id: `luna-phone-${Date.now()}`,
          role: "assistant",
          content: "Give Kendell a call at **(520) 327-6753** — she'll get you all set up!",
          actions: [{ label: "Call (520) 327-6753", type: "phone" as const }],
        }]);
      }
      return;
    }
    handleSendInternal(reply);
  }, [handleSendInternal]);

  const handleSend = useCallback(
    (text?: string) => handleSendInternal(text),
    [handleSendInternal]
  );

  const handleLeadSubmit = async () => {
    if (!leadName.trim() || !leadPhone.trim()) return;
    setLeadCaptured(true);
    setShowLeadForm(false);

    const ctx = conciergeContext;
    await saveLead({
      name: leadName,
      phone: leadPhone,
      category: ctx?.categories?.join(", ") || undefined,
      goal: ctx?.goal || undefined,
      timing: ctx?.timing || undefined,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `luna-lead-${Date.now()}`,
        role: "assistant",
        content: `Thanks, ${leadName}! Someone from our team will reach out to you shortly. In the meantime, keep asking me anything — I'm here!`,
      },
    ]);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Find the last assistant message for quick reply context
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");

  return (
    <div className="flex flex-col h-full">
      {/* Context Bar + New Conversation */}
      <div className="px-3 py-2 border-b border-border bg-background/30 flex items-center justify-between gap-2">
        {contextPills.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            <span className="text-[10px] font-body text-muted-foreground mr-0.5">Your vibe:</span>
            {contextPills.map((pill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body font-medium"
              >
                {pill}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        {/* New conversation button */}
        {messages.length > 1 && (
          <button
            onClick={resetChat}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0"
            title="New conversation"
          >
            <RotateCcw className="w-3 h-3" />
            New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 mr-2 flex-shrink-0" />
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm font-body leading-relaxed ${
                  msg.role === "user"
                    ? "bg-muted text-foreground rounded-br-sm"
                    : "bg-card text-foreground/90 rounded-bl-sm border border-border"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:text-primary [&_a]:text-primary [&_ul]:my-1 [&_li]:my-0">
                    <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
            {/* In-chat action buttons */}
            {msg.role === "assistant" && msg.actions && !isStreaming && (
              <ChatActionButtons actions={msg.actions} onAction={handleChatAction} />
            )}
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div className="flex gap-1 px-3.5 py-2.5 bg-card rounded-2xl rounded-bl-sm border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Smart Chips — shown after greeting only (first message) */}
        {messages.length === 1 && !isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {smartChips.map((chip) => (
              <motion.button
                key={chip}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleSend(chip)}
                className="px-3 py-2 rounded-full border border-primary/30 text-primary text-xs font-body hover:bg-primary/10 active:scale-95 transition-all"
              >
                {chip}
              </motion.button>
            ))}
          </div>
        )}

        {/* Persistent Quick Replies — shown after EVERY assistant response (except greeting) */}
        {messages.length > 1 && !isStreaming && lastAssistantMsg && (
          <motion.div
            key={lastAssistantMsg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-1.5 mt-1 pb-1"
          >
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-2 rounded-full border border-primary/25 text-primary text-xs font-body font-medium hover:bg-primary/10 active:scale-95 transition-all"
              >
                {reply}
              </button>
            ))}
          </motion.div>
        )}

        {/* Lead capture form */}
        <AnimatePresence>
          {showLeadForm && !leadCaptured && (
            <motion.div
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
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="(520) 000-0000"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLeadSubmit}
                  disabled={!leadName.trim() || !leadPhone.trim()}
                  className="flex-1 bg-primary text-primary-foreground text-sm font-body py-2 rounded-lg disabled:opacity-40 transition-opacity"
                >
                  Submit
                </button>
                <button
                  onClick={() => { setShowLeadForm(false); setLeadDismissed(true); }}
                  className="px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Not now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tell me what you're thinking..."
            disabled={isStreaming}
            className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
