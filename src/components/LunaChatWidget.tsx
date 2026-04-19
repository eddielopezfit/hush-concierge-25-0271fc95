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
import { useDwellNudge, type DwellNudge } from "@/hooks/luna/useDwellNudge";
import { useInactivityNudge, type InactivityNudge } from "@/hooks/luna/useInactivityNudge";
import { saveLead } from "@/lib/saveSession";
import { loadPersistedChat, clearPersistedChat } from "./luna/chat/useChatPersistence";
import { toast } from "sonner";

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
  const [nudge, setNudge] = useState<DwellNudge | InactivityNudge | null>(null);
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

  // Proactive nudges — extracted into reusable hooks
  useDwellNudge({ isOpen, onFire: setNudge });
  useInactivityNudge({ isOpen, onFire: setNudge });

  const acceptNudge = () => {
    setNudge(null);
    setShowBadge(false);
    setIsOpen(true);
    setActiveTab("chat");
    if (isFirstOpen) {
      setIsFirstOpen(false);
      buildChime();
      chimeRef.current?.play().catch(() => {});
    }
  };

  const dismissNudge = () => setNudge(null);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
    if (isFirstOpen) {
      setIsFirstOpen(false);
      buildChime();
      chimeRef.current?.play().catch(() => {});
    }
  };

  const [showExitCapture, setShowExitCapture] = useState(false);
  const [exitName, setExitName] = useState("");
  const [exitPhone, setExitPhone] = useState("");
  const [exitSubmitting, setExitSubmitting] = useState(false);

  const hasUnsavedChat = useCallback((): boolean => {
    try {
      const persisted = loadPersistedChat();
      if (!persisted) return false;
      const userMsgs = persisted.messages.filter(m => m.role === "user").length;
      // Exit-intent fires whenever there's a real chat in progress without a captured lead.
      // Dismissing the inline 4-message form does NOT waive the exit-intent — it's the user's
      // last chance and a distinct conversion surface.
      return userMsgs >= 1 && !persisted.leadCaptured;
    } catch { return false; }
  }, []);

  const handleClose = () => {
    if (hasUnsavedChat() && !showExitCapture) {
      setShowExitCapture(true);
      return;
    }
    setIsOpen(false);
    setShowExitCapture(false);
  };
  const closePanel = () => setIsOpen(false);
  const switchTab = (tab: string) => setActiveTab(tab as LunaTabId);

  const handleExitSubmit = async () => {
    if (!exitName.trim() || !exitPhone.trim()) return;
    setExitSubmitting(true);
    await saveLead({ name: exitName, phone: exitPhone, goal: "exit_intent_chat" });
    setExitSubmitting(false);
    // Mark persisted chat as captured so the prompt doesn't re-fire
    try {
      const persisted = loadPersistedChat();
      if (persisted) {
        const updated = { ...persisted, leadCaptured: true };
        localStorage.setItem("hush_luna_chat_v1", JSON.stringify(updated));
      }
    } catch { /* ignore */ }
    toast.success("Got it — Kendell will reach out soon.", { duration: 3000 });
    setShowExitCapture(false);
    setIsOpen(false);
  };

  const handleExitDismiss = () => {
    // User explicitly skipped — mark dismissed and close
    try {
      const persisted = loadPersistedChat();
      if (persisted) {
        const updated = { ...persisted, leadDismissed: true };
        localStorage.setItem("hush_luna_chat_v1", JSON.stringify(updated));
      }
    } catch { /* ignore */ }
    setShowExitCapture(false);
    setIsOpen(false);
  };

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
      {/* Proactive nudge tooltip — anchored above the bubble */}
      <AnimatePresence>
        {!isOpen && nudge && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[10.5rem] md:bottom-24 right-6 z-[9999] max-w-[260px]"
            role="dialog"
            aria-label="Luna concierge suggestion"
          >
            <div className="relative rounded-2xl border border-primary/30 bg-card shadow-[var(--shadow-elegant)] p-4 pr-8">
              <button
                onClick={dismissNudge}
                aria-label="Dismiss"
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-display text-[11px] text-primary-foreground font-semibold">L</span>
                </div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-foreground leading-snug">
                    {nudge.kind === "compare"
                      ? `Want me to compare ${nudge.section === "services" ? "these services" : "these artists"} for you?`
                      : "Stuck? Want me to walk you through this?"}
                  </p>
                  <button
                    onClick={acceptNudge}
                    className="mt-2 font-body text-xs text-primary hover:text-primary/80 font-medium tracking-wide transition-colors"
                  >
                    {nudge.kind === "finder-stuck" ? "Yes, walk me through it →" : "Yes, help me decide →"}
                  </button>
                </div>
              </div>
              {/* tail */}
              <span className="absolute -bottom-1.5 right-8 w-3 h-3 rotate-45 bg-card border-r border-b border-primary/30" />
            </div>
          </m.div>
        )}
      </AnimatePresence>

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
              {(showBadge || nudge) && (
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

            {/* Exit-intent capture overlay — fires when closing mid-chat */}
            <AnimatePresence>
              {showExitCapture && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                >
                  <m.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-5 shadow-[var(--shadow-elegant)]"
                  >
                    <p className="font-display text-lg text-foreground mb-1">Before you go —</p>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Want Kendell to follow up personally? Drop your name and number and we'll reach out.
                    </p>
                    <input
                      type="text"
                      value={exitName}
                      onChange={(e) => setExitName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none mb-2"
                    />
                    <input
                      type="tel"
                      value={exitPhone}
                      onChange={(e) => setExitPhone(e.target.value)}
                      placeholder="(520) 000-0000"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleExitSubmit}
                        disabled={!exitName.trim() || !exitPhone.trim() || exitSubmitting}
                        className="flex-1 bg-primary text-primary-foreground text-sm font-body py-2 rounded-lg disabled:opacity-40 transition-opacity"
                      >
                        {exitSubmitting ? "Sending…" : "Yes, follow up"}
                      </button>
                      <button
                        onClick={handleExitDismiss}
                        className="px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        No thanks
                      </button>
                    </div>
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
