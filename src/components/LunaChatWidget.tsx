import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus } from "lucide-react";
import { FindMyLookTab } from "./luna/FindMyLookTab";
import { ExploreTab } from "./luna/ExploreTab";
import { ArtistsTab } from "./luna/ArtistsTab";
import { MyPlanTab } from "./luna/MyPlanTab";
import { ChatTab } from "./luna/ChatTab";
import { LunaTabNav, type LunaTabId } from "./luna/LunaTabNav";
import { useLuna } from "@/contexts/LunaContext";
import { buildChimeAudio } from "@/lib/lunaChime";

const tabVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const LunaChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [activeTab, setActiveTab] = useState<LunaTabId>("find");
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const { chatWidgetRequested, clearChatWidgetRequest } = useLuna();
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const chimeBuilt = useRef(false);

  const buildChime = useCallback(() => {
    if (chimeBuilt.current) return;
    chimeBuilt.current = true;
    chimeRef.current = buildChimeAudio();
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
    if (isFirstOpen) {
      setIsFirstOpen(false);
      buildChime();
      chimeRef.current?.play().catch(() => {});
    }
  };

  const handleClose = () => setIsOpen(false);
  const closePanel = () => setIsOpen(false);
  const switchTab = (tab: string) => setActiveTab(tab as LunaTabId);

  // Listen for tab-switch events from ChatTab action buttons
  useEffect(() => {
    const handler = (e: Event) => {
      const target = (e as CustomEvent).detail;
      if (target) setActiveTab(target as LunaTabId);
    };
    window.addEventListener("luna-switch-tab", handler);
    return () => window.removeEventListener("luna-switch-tab", handler);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "find": return <FindMyLookTab onSwitchTab={switchTab} />;
      case "explore": return <ExploreTab onSwitchTab={switchTab} />;
      case "artists": return <ArtistsTab onSwitchTab={switchTab} onClosePanel={closePanel} />;
      case "plan": return <MyPlanTab onSwitchTab={switchTab} />;
      case "chat": return <ChatTab />;
    }
  };

  return (
    <>
      {/* Collapsed Bubble + Label */}
      <AnimatePresence>
        {!isOpen && (
          <m.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-[6.5rem] md:bottom-6 right-6 z-[9999] flex flex-col items-center gap-1.5"
          >
            <m.button
              onClick={handleOpen}
              className="w-[56px] h-[56px] rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-gold)] hover:shadow-[0_0_50px_hsl(38_50%_55%/0.5)] transition-shadow"
            >
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
              {showBadge && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-foreground rounded-full border-2 border-primary" />
              )}
            </m.button>
            <span className="font-body text-[10px] text-muted-foreground tracking-wide">Your Hush Guide</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[9999] bottom-6 right-6 w-[390px] h-[560px] md:w-[390px] md:h-[560px] max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[100dvh] max-md:rounded-none rounded-2xl border border-primary/25 bg-card flex flex-col overflow-hidden shadow-[var(--shadow-elegant)]"
          >
            {/* Header */}
            <m.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex items-center justify-between px-4 py-3 border-b border-border"
            >
              <div className="flex items-center gap-2.5">
                <m.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 15 }}
                  className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                >
                  <span className="font-display text-xs text-primary-foreground font-semibold">L</span>
                </m.div>
                <m.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <span className="font-display text-base text-foreground">Luna</span>
                  <span className="font-body text-[10px] text-muted-foreground ml-1.5">at Hush Salon & Day Spa</span>
                </m.div>
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
            </m.div>

            {/* Tab Navigation */}
            <LunaTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content with transitions */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <m.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="h-full"
                >
                  {renderTabContent()}
                </m.div>
              </AnimatePresence>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
