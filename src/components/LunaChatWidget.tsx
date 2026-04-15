import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Sparkles, Search, Users, ClipboardList, MessageSquare } from "lucide-react";
import { FindMyLookTab } from "./luna/FindMyLookTab";
import { ExploreTab } from "./luna/ExploreTab";
import { ArtistsTab } from "./luna/ArtistsTab";
import { MyPlanTab } from "./luna/MyPlanTab";
import { ChatTab } from "./luna/ChatTab";
import { useLuna } from "@/contexts/LunaContext";

type TabId = "find" | "explore" | "artists" | "plan" | "chat";

const tabs: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: "find", label: "Find My Look", icon: Sparkles },
  { id: "explore", label: "Explore", icon: Search },
  { id: "artists", label: "Artists", icon: Users },
  { id: "plan", label: "My Plan", icon: ClipboardList },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

const tabVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const LunaChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("find");
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const { chatWidgetRequested, clearChatWidgetRequest } = useLuna();
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  // Pre-create a subtle chime using Web Audio API
  useEffect(() => {
    // Build a tiny warm chime — two sine tones faded together
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sr = ctx.sampleRate;
    const len = sr * 0.6; // 600ms
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    const f1 = 880; // A5
    const f2 = 1318.5; // E6 — a perfect fifth for warmth
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 6) * 0.25; // quick decay, gentle volume
      data[i] = env * (Math.sin(2 * Math.PI * f1 * t) * 0.6 + Math.sin(2 * Math.PI * f2 * t) * 0.4);
    }
    // Encode to WAV blob for HTMLAudioElement
    const wavBlob = encodeWav(buf);
    const url = URL.createObjectURL(wavBlob);
    chimeRef.current = new Audio(url);
    chimeRef.current.volume = 0.35;

    return () => {
      URL.revokeObjectURL(url);
      ctx.close();
    };
  }, []);

  // Respond to external "open chat widget" requests
  useEffect(() => {
    if (chatWidgetRequested) {
      setIsOpen(true);
      setActiveTab("chat");
      clearChatWidgetRequest();
    }
  }, [chatWidgetRequested, clearChatWidgetRequest]);

  // Show subtle badge dot after 15s — passive, no pop-ups
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowBadge(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
    // Play chime only on the very first open
    if (isFirstOpen) {
      setIsFirstOpen(false);
      chimeRef.current?.play().catch(() => {});
    }
  };

  const handleClose = () => setIsOpen(false);

  const switchTab = (tab: string) => setActiveTab(tab as TabId);

  // Listen for tab-switch events from ChatTab action buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const target = (e as CustomEvent).detail;
      if (target) setActiveTab(target as TabId);
    };
    window.addEventListener("luna-switch-tab", handler);
    return () => window.removeEventListener("luna-switch-tab", handler);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "find": return <FindMyLookTab onSwitchTab={switchTab} />;
      case "explore": return <ExploreTab onSwitchTab={switchTab} />;
      case "artists": return <ArtistsTab onSwitchTab={switchTab} />;
      case "plan": return <MyPlanTab onSwitchTab={switchTab} />;
      case "chat": return <ChatTab />;
    }
  };

  return (
    <>
      {/* Collapsed Bubble + Label */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-[6.5rem] md:bottom-6 right-6 z-[9999] flex flex-col items-center gap-1.5"
          >
            <motion.button
              onClick={handleOpen}
              className="w-[56px] h-[56px] rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-gold)] hover:shadow-[0_0_50px_hsl(38_50%_55%/0.5)] transition-shadow"
            >
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-foreground rounded-full border-2 border-primary" />
              )}
            </motion.button>
            <span className="font-body text-[10px] text-muted-foreground tracking-wide">AI Concierge</span>
          </motion.div>
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
            className="fixed z-[9999] bottom-6 right-6 w-[390px] h-[560px] md:w-[390px] md:h-[560px] max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[100dvh] max-md:rounded-none rounded-2xl border border-primary/25 bg-card flex flex-col overflow-hidden shadow-[var(--shadow-elegant)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-display text-xs text-primary-foreground font-semibold">L</span>
                </div>
                <div>
                  <span className="font-display text-base text-foreground">Luna</span>
                  <span className="font-body text-[10px] text-muted-foreground ml-1.5">Hush Concierge</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all md:block hidden"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all md:hidden"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-background/50">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-body transition-colors relative ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="leading-none">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="luna-tab-indicator"
                        className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content with transitions */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="h-full"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
