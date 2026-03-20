import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Mic, Send } from "lucide-react";
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

const QUICK_REPLIES = [
  "Explore Services",
  "Book an Appointment",
  "Ask a Question",
];

const LUNA_GREETING = "Hi, I'm Luna — Hush's digital concierge. Whether you're looking to book, explore services, or have a question, I'm here. How can I help you today?";

const LEAD_CAPTURE_PROMPT = "I'd love to help you get booked. Can I get your name and best phone number?";

export const LunaChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show notification badge after 8s of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowBadge(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Auto-open after 12s if no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAutoOpened && !isOpen) {
        handleOpen();
        setHasAutoOpened(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
    if (messages.length === 0) {
      // Check if there's context to personalize the greeting
      const ctx = getConciergeContext();
      if (ctx && ctx.categories && ctx.categories.length > 0) {
        const names = formatCategoryList(ctx.categories);
        setMessages([{
          id: "greeting",
          role: "luna",
          content: `Hi, I'm Luna — Hush's digital concierge. I see you're interested in ${names}. I can help with recommendations, pricing, or booking. What would you like to know?`,
        }]);
      } else {
        setMessages([{ id: "greeting", role: "luna", content: LUNA_GREETING }]);
      }
    }
  };

  const handleClose = () => setIsOpen(false);

  const addLunaResponse = (content: string, delay = 1200) => {
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

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    // Use Luna Brain for intelligent responses
    const ctx = getConciergeContext();
    const response = generateChatResponse(msg, ctx);
    addLunaResponse(response);

    // Lead capture after 3 messages
    if (newCount >= 3 && !leadCaptured) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `luna-lead-${Date.now()}`,
          role: "luna",
          content: LEAD_CAPTURE_PROMPT,
          isForm: true,
        }]);
      }, 2500);
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

    // Save lead to database
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
    <>
      {/* Collapsed Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full bg-gold flex items-center justify-center shadow-[0_0_30px_hsl(43_45%_58%/0.4)] hover:shadow-[0_0_50px_hsl(43_45%_58%/0.6)] transition-shadow"
          >
            <MessageCircle className="w-7 h-7 text-background" />
            {showBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-cream rounded-full border-2 border-gold" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed z-[9999] bottom-6 right-6 w-[380px] h-[520px] md:w-[380px] md:h-[520px] max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[90vh] max-md:rounded-none rounded-2xl border border-gold/30 bg-[#0f0f0f] flex flex-col overflow-hidden shadow-[0_0_60px_hsl(0_0%_0%/0.6)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                  <span className="font-display text-sm text-background font-semibold">L</span>
                </div>
                <div>
                  <span className="font-display text-lg text-gold">Luna</span>
                  <span className="font-body text-xs text-cream/50 ml-2 italic">Hush Concierge</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-cream/50 hover:text-cream hover:bg-cream/10 transition-all md:block hidden"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-cream/50 hover:text-cream hover:bg-cream/10 transition-all md:hidden"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "luna" && (
                      <div className="w-2 h-2 rounded-full bg-gold mt-2 mr-2 flex-shrink-0" />
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${
                        msg.role === "user"
                          ? "bg-cream/10 text-cream rounded-br-sm"
                          : "bg-card text-cream/90 rounded-bl-sm border border-border"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  {/* Inline lead capture form */}
                  {msg.isForm && !leadCaptured && (
                    <div className="mt-3 ml-4 space-y-2">
                      <input
                        type="text"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-background/50 border border-gold/20 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold/50 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="(520) 000-0000"
                        className="w-full bg-background/50 border border-gold/20 rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold/50 focus:outline-none"
                      />
                      <button
                        onClick={handleLeadSubmit}
                        disabled={!leadName.trim() || !leadPhone.trim()}
                        className="w-full bg-gold text-background text-sm font-body py-2 rounded-lg disabled:opacity-40 transition-opacity"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                  <div className="flex gap-1 px-4 py-3 bg-card rounded-2xl rounded-bl-sm border border-border">
                    <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Quick replies on first open */}
              {messages.length === 1 && !isTyping && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSend(reply)}
                      className="px-4 py-2 rounded-full border border-gold/40 text-gold text-xs font-body hover:bg-gold/10 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gold/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const lunaSection = document.getElementById("luna");
                    if (lunaSection) {
                      lunaSection.scrollIntoView({ behavior: "smooth" });
                      handleClose();
                    }
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-cream/40 hover:text-gold hover:bg-gold/10 transition-all flex-shrink-0"
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
                  className="flex-1 bg-background/50 border border-gold/20 rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold/50 focus:outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-background disabled:opacity-40 transition-opacity flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
