import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Sparkles, Search, Users, ClipboardList, MessageSquare } from "lucide-react";
import { FindMyLookTab } from "./luna/FindMyLookTab";
import { ExploreTab } from "./luna/ExploreTab";
import { ArtistsTab } from "./luna/ArtistsTab";
import { MyPlanTab } from "./luna/MyPlanTab";
import { ChatTab } from "./luna/ChatTab";

type TabId = "find" | "explore" | "artists" | "plan" | "chat";

const tabs: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: "find", label: "Find My Look", icon: Sparkles },
  { id: "explore", label: "Explore", icon: Search },
  { id: "artists", label: "Artists", icon: Users },
  { id: "plan", label: "My Plan", icon: ClipboardList },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

export const LunaChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("find");
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Show notification badge after 8s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowBadge(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Auto-open after 12s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAutoOpened && !isOpen) {
        setIsOpen(true);
        setHasAutoOpened(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
  };

  const handleClose = () => setIsOpen(false);

  const switchTab = (tab: string) => setActiveTab(tab as TabId);

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
            className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-gold)] hover:shadow-[0_0_50px_hsl(38_50%_55%/0.5)] transition-shadow"
          >
            <MessageCircle className="w-7 h-7 text-primary-foreground" />
            {showBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-foreground rounded-full border-2 border-primary" />
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
            className="fixed z-[9999] bottom-6 right-6 w-[390px] h-[560px] md:w-[390px] md:h-[560px] max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:h-[92vh] max-md:rounded-none rounded-2xl border border-primary/25 bg-card flex flex-col overflow-hidden shadow-[var(--shadow-elegant)]"
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

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "find" && <FindMyLookTab onSwitchTab={switchTab} />}
              {activeTab === "explore" && <ExploreTab onSwitchTab={switchTab} />}
              {activeTab === "artists" && <ArtistsTab onSwitchTab={switchTab} />}
              {activeTab === "plan" && <MyPlanTab onSwitchTab={switchTab} />}
              {activeTab === "chat" && <ChatTab />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
