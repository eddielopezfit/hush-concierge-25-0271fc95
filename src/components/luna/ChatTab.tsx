import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, Phone, Calendar, ChevronRight, RotateCcw, ArrowDown, X, MessageSquare } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { saveLead } from "@/lib/saveSession";
import { getConversationId, startSession, clearConversation } from "@/lib/sessionManager";
import { formatCategoryList } from "@/lib/conciergeLabels";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLuna } from "@/contexts/LunaContext";
import { toast } from "sonner";

import type { ChatMessage, ChatAction } from "./chat/types";
import {
  buildContextGreeting,
  buildContextTransition,
  getQuickReplies,
  getSmartChips,
  getContextPills,
  getContextFingerprint,
  userHasHighBookingIntent,
} from "./chat/chatActionDetectors";
import {
  loadPersistedChat,
  savePersistedChat,
  clearPersistedChat,
  getVisitThreadId,
  setVisitThreadId,
} from "./chat/useChatPersistence";
import { useChatStreaming } from "./chat/useChatStreaming";
import { LeadCaptureForm } from "./chat/LeadCaptureForm";

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
    <m.div
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
          {action.type === "text" && <MessageSquare className="w-3 h-3" />}
          {action.type === "scroll" && <Calendar className="w-3 h-3" />}
          {action.type === "tab" && <ChevronRight className="w-3 h-3" />}
          {action.label}
        </button>
      ))}
    </m.div>
  );
}

export const ChatTab = () => {
  const { conciergeContext, clearConcierge } = useLuna();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const [dividerFading, setDividerFading] = useState(false);
  const dividerFadeTimerRef = useRef<number | null>(null);
  const lastSeenAssistantIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contextFingerprintRef = useRef<string>("");

  // ── Streaming hook ───────────────────────────────────────────────────────
  const { isStreaming, streamChat, abort } = useChatStreaming({
    setMessages,
    setQuickReplies,
    onExchangeComplete: () => setSuccessfulExchangeCount((p) => p + 1),
    onInlineBookingDetected: () => {
      if (!leadCaptured && !leadDismissed) setShowLeadForm(true);
    },
    conciergeContext,
    getQuickReplies,
  });

  // ── Reset / New conversation ─────────────────────────────────────────────
  const resetChat = useCallback(() => {
    abort();
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
    clearPersistedChat();

    // Rotate the server-side conversation_id so the next turn lands fresh
    clearConversation();
    startSession(ctx, "chat");
    toast.success("Started a fresh chat", {
      description: "Luna will reintroduce herself on your next message.",
      duration: 3000,
    });
  }, [conciergeContext, abort]);

  useEffect(() => {
    const handleStartFresh = () => resetChat();
    window.addEventListener("luna-start-fresh", handleStartFresh);
    return () => window.removeEventListener("luna-start-fresh", handleStartFresh);
  }, [resetChat]);

  // Build contextual greeting + chips on first render AND when context changes
  useEffect(() => {
    const ctx = conciergeContext;
    const newFingerprint = getContextFingerprint(ctx);
    if (initialized && newFingerprint === contextFingerprintRef.current) return;

    const previousFingerprint = contextFingerprintRef.current;
    contextFingerprintRef.current = newFingerprint;

    const persisted = loadPersistedChat();
    const currentVisitThreadId = getVisitThreadId();
    const matchesCurrentVisit = Boolean(
      persisted?.visitThreadId && currentVisitThreadId && persisted.visitThreadId === currentVisitThreadId,
    );

    if (
      !initialized &&
      persisted &&
      (matchesCurrentVisit || persisted.fingerprint === newFingerprint) &&
      persisted.messages.length > 0
    ) {
      setMessages(persisted.messages);
      setSuccessfulExchangeCount(persisted.successfulExchangeCount || 0);
      setLeadCaptured(persisted.leadCaptured || false);
      setLeadDismissed(persisted.leadDismissed || false);
      const lastAssistant = [...persisted.messages].reverse().find((m) => m.role === "assistant");
      setQuickReplies(getQuickReplies(ctx, lastAssistant?.content || ""));
    } else if (initialized && previousFingerprint && previousFingerprint !== "none") {
      const transition = buildContextTransition(ctx);
      const transitionMsg: ChatMessage = {
        id: `transition-${Date.now()}`,
        role: "assistant",
        content: transition,
      };
      setMessages((prev) => [...prev, transitionMsg]);
      setQuickReplies(getQuickReplies(ctx, transition));
    } else {
      const greeting = buildContextGreeting(ctx);
      setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
      setSuccessfulExchangeCount(0);
      setLeadCaptured(false);
      setLeadDismissed(false);
      setQuickReplies(getQuickReplies(ctx, greeting));
    }

    setContextPills(getContextPills(ctx));
    setSmartChips(getSmartChips(ctx));
    if (!initialized) {
      setInput("");
      setUserMessageCount(0);
      setShowLeadForm(false);
      setLeadName("");
      setLeadPhone("");
    }
    setInitialized(true);

    if (!getConversationId()) {
      startSession(ctx, "chat");
    } else {
      setVisitThreadId(getConversationId());
    }
  }, [initialized, conciergeContext]);

  // Consume a pending prompt seeded by other tabs
  const handleSendRef = useRef<((text?: string) => void) | null>(null);
  useEffect(() => {
    if (!initialized || isStreaming) return;
    let pending: string | null = null;
    try { pending = sessionStorage.getItem("hush_chat_pending_prompt"); } catch { /* ignore */ }
    if (!pending) return;
    try { sessionStorage.removeItem("hush_chat_pending_prompt"); } catch { /* ignore */ }
    const t = window.setTimeout(() => handleSendRef.current?.(pending!), 150);
    return () => window.clearTimeout(t);
  }, [initialized, isStreaming]);

  // Persist messages whenever they change (skip greeting-only state)
  useEffect(() => {
    if (!initialized || isStreaming) return;
    if (messages.length <= 1) return;
    savePersistedChat({
      messages,
      fingerprint: contextFingerprintRef.current,
      visitThreadId: getConversationId() ?? getVisitThreadId() ?? undefined,
      successfulExchangeCount,
      leadCaptured,
      leadDismissed,
      savedAt: Date.now(),
    });
  }, [messages, isStreaming, initialized, successfulExchangeCount, leadCaptured, leadDismissed]);

  // Update context pills reactively when concierge context changes after init
  useEffect(() => {
    if (!initialized) return;
    setContextPills(getContextPills(conciergeContext));
  }, [conciergeContext, initialized]);

  // Auto-scroll the chat container itself (not the page) to the latest message
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = () => el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    const scrollToBottom = () => { el.scrollTop = el.scrollHeight; };
    if (isNearBottom()) scrollToBottom();
    if (isStreaming) {
      const interval = setInterval(() => {
        if (isNearBottom()) scrollToBottom();
      }, 120);
      return () => clearInterval(interval);
    }
    const t = setTimeout(() => {
      if (isNearBottom()) scrollToBottom();
    }, 500);
    return () => clearTimeout(t);
  }, [messages, isStreaming, quickReplies, showLeadForm]);

  // Show floating "scroll to bottom" button when user has scrolled up
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const scrolledUp = distanceFromBottom > 140;
      setShowScrollToBottom(scrolledUp);
      if (!scrolledUp) {
        setUnreadCount(0);
        const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
        if (lastAssistant) lastSeenAssistantIdRef.current = lastAssistant.id;
      }
    };
    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [initialized, messages]);

  // Track unread assistant messages when user is scrolled up
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    if (!showScrollToBottom) {
      lastSeenAssistantIdRef.current = lastAssistant.id;
      setUnreadCount(0);
      return;
    }
    if (lastAssistant.id !== lastSeenAssistantIdRef.current) {
      const assistantMsgs = messages.filter((m) => m.role === "assistant" && m.id !== "greeting");
      const lastSeenIdx = assistantMsgs.findIndex((m) => m.id === lastSeenAssistantIdRef.current);
      const unreadList = lastSeenIdx === -1 ? assistantMsgs.slice(-1) : assistantMsgs.slice(lastSeenIdx + 1);
      setUnreadCount(unreadList.length || 1);
      setFirstUnreadId((prev) => prev ?? unreadList[0]?.id ?? lastAssistant.id);
      setDividerFading(false);
      if (dividerFadeTimerRef.current) {
        window.clearTimeout(dividerFadeTimerRef.current);
        dividerFadeTimerRef.current = null;
      }
    }
  }, [messages, showScrollToBottom]);

  // Schedule auto-fade of the "New" divider once user is back at the bottom
  useEffect(() => {
    if (!firstUnreadId) return;
    if (showScrollToBottom) return;
    if (dividerFadeTimerRef.current) window.clearTimeout(dividerFadeTimerRef.current);
    dividerFadeTimerRef.current = window.setTimeout(() => {
      setDividerFading(true);
      dividerFadeTimerRef.current = window.setTimeout(() => {
        setFirstUnreadId(null);
        setDividerFading(false);
        dividerFadeTimerRef.current = null;
      }, 600);
    }, 3000);
    return () => {
      if (dividerFadeTimerRef.current) {
        window.clearTimeout(dividerFadeTimerRef.current);
        dividerFadeTimerRef.current = null;
      }
    };
  }, [firstUnreadId, showScrollToBottom]);

  const scrollChatToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setUnreadCount(0);
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) lastSeenAssistantIdRef.current = lastAssistant.id;
  }, [messages]);

  // ── Handle in-chat action buttons ────────────────────────────────────────
  const handleChatAction = useCallback((action: ChatAction) => {
    if (action.type === "phone") {
      window.open("tel:+15203276753", "_self");
    } else if (action.type === "text") {
      window.open("sms:+15203276753", "_self");
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

  const handleSendInternal = useCallback(
    (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isStreaming) return;

      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: msg };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setFirstUnreadId(null);
      setInput("");
      const newCount = userMessageCount + 1;
      setUserMessageCount(newCount);

      // Force-scroll to bottom on send so the user follows their own message
      // and Luna's incoming response — eliminates the "1 new" hidden-reply problem.
      requestAnimationFrame(() => {
        const el = scrollContainerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        setUnreadCount(0);
        setShowScrollToBottom(false);
      });

      streamChat(newMessages.filter((m) => m.id !== "greeting"));

      if (userHasHighBookingIntent(msg) && !leadCaptured && !showLeadForm && !leadDismissed) {
        setTimeout(() => setShowLeadForm(true), 600);
      } else if ((newCount >= 4 || successfulExchangeCount >= 3) && !leadCaptured && !showLeadForm && !leadDismissed) {
        setTimeout(() => setShowLeadForm(true), 1500);
      }
    },
    [input, isStreaming, messages, userMessageCount, successfulExchangeCount, leadCaptured, showLeadForm, leadDismissed, streamChat]
  );

  // Quick reply chips — preserves full conversation context
  const handleQuickReply = useCallback(
    (reply: string) => {
      if (reply === "Connect me with the team" || reply === "Call the front desk" || reply === "Call (520) 327-6753") {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
          window.open("tel:+15203276753", "_self");
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `luna-phone-${Date.now()}`,
              role: "assistant",
              content: "Give Kendell a call at **(520) 327-6753** — or text us if that's easier!",
              actions: [
                { label: "Call (520) 327-6753", type: "phone" as const },
                { label: "Text us", type: "text" as const },
              ],
            },
          ]);
        }
        return;
      }
      handleSendInternal(reply);
    },
    [handleSendInternal]
  );

  const handleSend = useCallback(
    (text?: string) => handleSendInternal(text),
    [handleSendInternal]
  );

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

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

    const firstName = leadName.trim().split(/\s+/)[0];
    const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const serviceLabel = ctx?.categories?.length ? formatCategoryList(ctx.categories) : null;
    const artistLabel = ctx?.preferredArtist || null;

    let confirmMsg = `Thanks, ${capitalizedName}! `;
    if (artistLabel && serviceLabel) {
      confirmMsg += `Kendell will call you about your ${serviceLabel.toLowerCase()} appointment with ${artistLabel}.`;
    } else if (serviceLabel) {
      confirmMsg += `Kendell will call you about your ${serviceLabel.toLowerCase()} appointment.`;
    } else if (artistLabel) {
      confirmMsg += `Kendell will call you about booking with ${artistLabel}.`;
    } else {
      confirmMsg += `Kendell from our front desk will reach out to you shortly.`;
    }
    confirmMsg += ` In the meantime, keep asking me anything — I'm here!`;

    setMessages((prev) => [
      ...prev,
      { id: `luna-lead-${Date.now()}`, role: "assistant", content: confirmMsg },
    ]);
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");

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
            <button
              onClick={() => {
                clearConcierge();
                toast.success("Vibe cleared", {
                  description: "Tell me what you'd like to explore next.",
                  duration: 2500,
                });
              }}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Clear vibe and start fresh"
              aria-label="Clear vibe"
            >
              <X className="w-2.5 h-2.5" />
              <span className="text-[9px] font-body uppercase tracking-wider">Clear</span>
            </button>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <button
          onClick={resetChat}
          disabled={messages.length <= 1 && !isStreaming}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:bg-transparent transition-colors flex-shrink-0"
          title="Start a new conversation"
          aria-label="Start new chat"
        >
          <RotateCcw className="w-3 h-3" />
          Start new chat
        </button>
      </div>

      {/* Messages */}
      <div className="relative flex-1 min-h-0">
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto px-4 py-4 space-y-3 overscroll-contain">
        {messages.map((msg) => (
          <div key={msg.id}>
            {firstUnreadId === msg.id && (
              <div
                className={`flex items-center gap-2 my-3 transition-opacity duration-[600ms] ease-out ${
                  dividerFading ? "opacity-0" : "opacity-100"
                }`}
                aria-label="New messages start here"
              >
                <div className="flex-1 h-px bg-primary/30" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-body text-primary/80 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5">
                  New
                </span>
                <div className="flex-1 h-px bg-primary/30" />
              </div>
            )}
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
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:text-primary [&_a]:text-primary [&_ul]:my-1 [&_li]:my-0 [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:text-primary [&_th]:text-xs [&_th]:bg-primary/5 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
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

        {/* Smart Chips — shown after greeting only */}
        {messages.length === 1 && !isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {smartChips.map((chip) => (
              <m.button
                key={chip}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleSend(chip)}
                className="px-3 py-2 rounded-full border border-primary/30 text-primary text-xs font-body hover:bg-primary/10 active:scale-95 transition-all"
              >
                {chip}
              </m.button>
            ))}
          </div>
        )}

        {/* Persistent Quick Replies — after every assistant response */}
        {messages.length > 1 && !isStreaming && lastAssistantMsg && (
          <m.div
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
          </m.div>
        )}

        {/* Lead capture form */}
        <AnimatePresence>
          {showLeadForm && !leadCaptured && (
            <LeadCaptureForm
              name={leadName}
              phone={leadPhone}
              onNameChange={setLeadName}
              onPhoneChange={setLeadPhone}
              onSubmit={handleLeadSubmit}
              onDismiss={() => { setShowLeadForm(false); setLeadDismissed(true); }}
            />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>
        <AnimatePresence>
          {showScrollToBottom && !isStreaming && (
            <m.button
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={
                unreadCount > 0
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        "0 4px 12px hsl(var(--primary) / 0.25), 0 0 0 0 hsl(var(--primary) / 0.45)",
                        "0 4px 20px hsl(var(--primary) / 0.6), 0 0 0 6px hsl(var(--primary) / 0.15)",
                        "0 4px 12px hsl(var(--primary) / 0.25), 0 0 0 0 hsl(var(--primary) / 0)",
                      ],
                    }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={
                unreadCount > 0
                  ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.18 }
              }
              onClick={scrollChatToBottom}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg text-[11px] font-body font-medium hover:bg-primary/90 transition-colors"
              aria-label={unreadCount > 0 ? `Scroll to ${unreadCount} new message${unreadCount > 1 ? "s" : ""}` : "Scroll to latest message"}
            >
              <ArrowDown className="w-3.5 h-3.5" />
              {unreadCount > 0 ? `${unreadCount} new` : "Latest"}
              {unreadCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </m.button>
          )}
        </AnimatePresence>
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
