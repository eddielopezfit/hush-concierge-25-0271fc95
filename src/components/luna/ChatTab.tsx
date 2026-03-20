import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Send, Loader2 } from "lucide-react";
import { getJourneyContextString } from "@/lib/journeyTracker";
import { getConciergeContext } from "@/lib/conciergeStore";
import { formatCategoryList } from "@/lib/conciergeLabels";
import { saveLead } from "@/lib/saveSession";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/luna-chat`;

const QUICK_REPLIES = ["What services do you offer?", "Help me choose a stylist", "I need a color consultation"];

export const ChatTab = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Build contextual greeting
  useEffect(() => {
    if (initialized) return;
    const ctx = getConciergeContext();
    let greeting: string;
    if (ctx?.categories && ctx.categories.length > 0) {
      const names = formatCategoryList(ctx.categories);
      greeting = `Hey! I see you're interested in ${names}. I know our whole team and menu inside out — ask me anything about services, pricing, or which stylist would be perfect for you.`;
    } else {
      greeting = "Hi, I'm Luna — Hush's digital concierge. I know every stylist, every service, and every price. Whether you're exploring or ready to book, just ask. How can I help?";
    }
    setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
    setInitialized(true);
  }, [initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const streamChat = useCallback(async (allMessages: ChatMessage[]) => {
    setIsStreaming(true);
    abortRef.current = new AbortController();

    const journeyContext = getJourneyContextString();
    const apiMessages = allMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, journeyContext }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          setMessages((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, role: "assistant", content: "I'm getting a lot of questions right now — give me just a moment and try again!" },
          ]);
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

      // Create the assistant message placeholder
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

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
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("[ChatTab] Stream error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I'm having trouble connecting right now. You can always call us directly at (520) 327-6753 — Kendell at the front desk will take great care of you!",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const handleSend = useCallback(
    (text?: string) => {
      const msg = text || input.trim();
      if (!msg || isStreaming) return;

      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: msg };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      const newCount = userMessageCount + 1;
      setUserMessageCount(newCount);

      // Stream AI response
      streamChat(newMessages.filter((m) => m.id !== "greeting"));

      // Show lead capture after 3 messages
      if (newCount >= 3 && !leadCaptured && !showLeadForm) {
        setTimeout(() => setShowLeadForm(true), 3000);
      }
    },
    [input, isStreaming, messages, userMessageCount, leadCaptured, showLeadForm, streamChat]
  );

  const handleLeadSubmit = async () => {
    if (!leadName.trim() || !leadPhone.trim()) return;
    setLeadCaptured(true);
    setShowLeadForm(false);

    const ctx = getConciergeContext();
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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

        {/* Quick replies on first message */}
        {messages.length === 1 && !isStreaming && (
          <div className="flex flex-wrap gap-2 mt-1">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-body hover:bg-primary/10 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Lead capture form */}
        {showLeadForm && !leadCaptured && (
          <div className="ml-4 p-3 rounded-xl border border-primary/20 bg-card/50 space-y-2">
            <p className="text-xs text-muted-foreground font-body">
              Want me to have someone reach out to you? Drop your info:
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
                onClick={() => setShowLeadForm(false)}
                className="px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0"
            title="Switch to voice"
          >
            <Mic className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Luna anything..."
            disabled={isStreaming}
            className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
