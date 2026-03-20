import { useState, useEffect, useRef } from "react";
import { Mic, Send } from "lucide-react";
import { getConciergeContext } from "@/lib/conciergeStore";
import { generateChatResponse } from "@/lib/lunaBrain";
import { saveLead } from "@/lib/saveSession";
import { formatCategoryList } from "@/lib/conciergeLabels";

interface ChatMessage {
  id: string;
  role: "luna" | "user";
  content: string;
  isForm?: boolean;
}

const QUICK_REPLIES = ["Explore Services", "Book an Appointment", "Ask a Question"];

const LUNA_GREETING = "Hi, I'm Luna — Hush's digital concierge. Whether you're looking to book, explore services, or have a question, I'm here. How can I help?";

const LEAD_CAPTURE_PROMPT = "I'd love to help you get booked. Can I get your name and best phone number?";

export const ChatTab = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialized) {
      const ctx = getConciergeContext();
      if (ctx?.categories && ctx.categories.length > 0) {
        const names = formatCategoryList(ctx.categories);
        setMessages([{
          id: "greeting",
          role: "luna",
          content: `Hi, I'm Luna — Hush's digital concierge. I see you're interested in ${names}. I can help with recommendations, pricing, or booking. What would you like to know?`,
        }]);
      } else {
        setMessages([{ id: "greeting", role: "luna", content: LUNA_GREETING }]);
      }
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addLunaResponse = (content: string, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `luna-${Date.now()}`,
        role: "luna",
        content,
      }]);
    }, delay);
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: "user", content: msg }]);
    setInput("");
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    const ctx = getConciergeContext();
    const response = generateChatResponse(msg, ctx);
    addLunaResponse(response);

    if (newCount >= 3 && !leadCaptured) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `luna-lead-${Date.now()}`,
          role: "luna",
          content: LEAD_CAPTURE_PROMPT,
          isForm: true,
        }]);
      }, 2200);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadName.trim() || !leadPhone.trim()) return;
    setLeadCaptured(true);
    setMessages(prev => prev.filter(m => !m.isForm));
    setMessages(prev => [...prev, {
      id: `user-lead-${Date.now()}`,
      role: "user",
      content: `${leadName} — ${leadPhone}`,
    }]);

    const ctx = getConciergeContext();
    await saveLead({
      name: leadName,
      phone: leadPhone,
      category: ctx?.categories?.join(", ") || undefined,
      goal: ctx?.goal || undefined,
      timing: ctx?.timing || undefined,
    });

    addLunaResponse("Perfect — someone from our team will reach out to confirm your appointment. You can also call us directly at (520) 327-6753.", 800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "luna" && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 mr-2 flex-shrink-0" />
              )}
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm font-body leading-relaxed ${
                msg.role === "user"
                  ? "bg-muted text-foreground rounded-br-sm"
                  : "bg-card text-foreground/90 rounded-bl-sm border border-border"
              }`}>
                {msg.content}
              </div>
            </div>
            {msg.isForm && !leadCaptured && (
              <div className="mt-3 ml-4 space-y-2">
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
                <button
                  onClick={handleLeadSubmit}
                  disabled={!leadName.trim() || !leadPhone.trim()}
                  className="w-full bg-primary text-primary-foreground text-sm font-body py-2 rounded-lg disabled:opacity-40 transition-opacity"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div className="flex gap-1 px-3.5 py-2.5 bg-card rounded-2xl rounded-bl-sm border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {messages.length === 1 && !isTyping && (
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const lunaSection = document.getElementById("luna");
              if (lunaSection) lunaSection.scrollIntoView({ behavior: "smooth" });
            }}
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
            placeholder="Message Luna..."
            className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
