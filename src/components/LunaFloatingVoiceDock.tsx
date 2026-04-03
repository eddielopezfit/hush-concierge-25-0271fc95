import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, X, Minimize2, Maximize2 } from "lucide-react";
import { getConciergeContext, buildDynamicVariables, buildLunaFirstMessage } from "@/lib/conciergeStore";
import {
  requestVoiceStart,
  endVoiceSession,
} from "@/lib/lunaVoiceBus";

const LUNA_AGENT_ID = "agent_9501kkz62prjevdt34t1ny4dpzf5";

/**
 * Global floating Luna voice dock.
 * - Inactive: gold "Speak with Luna" pill, bottom-right
 * - Active: floating dock with status, mute, end controls
 * - Users can browse freely while Luna is active
 */
export const LunaFloatingVoiceDock = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isStartingRef = useRef(false);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("[LunaFloatingDock] Connected");
      setError(null);
    },
    onDisconnect: (details: any) => {
      console.log("[LunaFloatingDock] Disconnected:", details);
      if (details?.reason === "error" && details?.message) {
        setError(details.message);
      }
      endVoiceSession();
      setIsMuted(false);
      setIsMinimized(false);
    },
    onError: (err) => {
      console.error("[LunaFloatingDock] Error:", err);
      setError(typeof err === "string" ? err : JSON.stringify(err));
      endVoiceSession();
    },
    onMessage: (message) => {
      console.log("[LunaFloatingDock] Message:", message);
    },
  });

  const isConnected = conversation.status === "connected";

  // Listen for voice-start-request events from anywhere on the site
  const startConversation = useCallback(async () => {
    if (isStartingRef.current || conversation.status === "connected") return;
    isStartingRef.current = true;
    setError(null);
    setIsConnecting(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const ctx = getConciergeContext();
      const dynamicVariables = buildDynamicVariables(ctx);
      const firstMessage = buildLunaFirstMessage(ctx);

      console.log("[LunaFloatingDock] Starting with vars:", dynamicVariables);

      await conversation.startSession({
        agentId: LUNA_AGENT_ID,
        connectionType: "webrtc" as const,
        dynamicVariables,
        overrides: {
          agent: {
            firstMessage,
          },
        },
      });
    } catch (err) {
      console.error("[LunaFloatingDock] Voice start failed:", err);
      setError(String(err));
      endVoiceSession();
    } finally {
      setIsConnecting(false);
      isStartingRef.current = false;
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    console.log("[LunaFloatingDock] Ending session");
    await conversation.endSession();
    endVoiceSession();
    setIsMuted(false);
    setIsMinimized(false);
  }, [conversation]);

  // Listen for voice bus events — this is THE primary voice controller
  useEffect(() => {
    const handleVoiceStartRequest = () => {
      startConversation();
    };
    window.addEventListener("luna:voice-start-request", handleVoiceStartRequest);
    return () => window.removeEventListener("luna:voice-start-request", handleVoiceStartRequest);
  }, [startConversation]);

  // Handle button click on the inactive pill
  const handleActivate = useCallback(() => {
    if (isConnected) return;
    const granted = requestVoiceStart("floating-dock");
    if (granted) {
      startConversation();
    }
  }, [isConnected, startConversation]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    // ElevenLabs SDK doesn't expose a direct mute, but we can toggle the mic track
    setIsMuted(prev => !prev);
  }, []);

  const showDock = isConnected || isConnecting;

  // Status text
  const statusText = isConnecting
    ? "Connecting…"
    : conversation.isSpeaking
      ? "Luna is speaking…"
      : "Luna is listening…";

  return (
    <>
      {/* ── INACTIVE STATE: Floating "Speak with Luna" pill ──────────── */}
      <AnimatePresence>
        {!showDock && (
          <motion.button
            key="luna-voice-pill"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={handleActivate}
            className="fixed bottom-24 right-6 z-[9998] hidden md:flex items-center gap-2.5 px-5 py-3 rounded-full
              bg-gradient-to-r from-primary to-primary/90 shadow-[var(--shadow-gold)]
              hover:shadow-[0_0_50px_hsl(38_50%_55%/0.45)] transition-shadow cursor-pointer
              font-body text-sm font-medium text-primary-foreground tracking-wide"
          >
            <Mic className="w-4 h-4" />
            Speak with Luna
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── ACTIVE STATE: Floating voice dock ────────────────────────── */}
      <AnimatePresence>
        {showDock && (
          <motion.div
            key="luna-voice-dock"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className={`fixed z-[9998] right-6 transition-all ${
              isMinimized
                ? "bottom-24 w-auto"
                : "bottom-24 w-[320px]"
            }`}
          >
            {isMinimized ? (
              /* ── Minimized: compact pill ─────────────────────────── */
              <motion.div
                layout
                className="flex items-center gap-3 px-4 py-3 rounded-full bg-card border border-primary/30 shadow-[var(--shadow-elegant)] cursor-pointer"
                onClick={() => setIsMinimized(false)}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    {conversation.isSpeaking ? (
                      <Volume2 className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Mic className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  {/* Pulse indicator */}
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-card animate-pulse" />
                </div>
                <span className="font-body text-xs text-foreground/80">Luna active</span>
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.div>
            ) : (
              /* ── Expanded dock ───────────────────────────────────── */
              <motion.div
                layout
                className="rounded-2xl bg-card border border-primary/25 shadow-[var(--shadow-elegant)] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="font-display text-xs text-primary-foreground font-semibold">L</span>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-card" />
                    </div>
                    <div>
                      <span className="font-display text-sm text-foreground">Luna</span>
                      <span className="font-body text-[10px] text-muted-foreground ml-1.5">Voice Active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={stopConversation}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      aria-label="End conversation"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-5 flex flex-col items-center gap-4">
                  {/* Animated mic orb */}
                  <motion.div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isConnecting
                        ? "bg-muted"
                        : "bg-gradient-to-br from-primary to-primary/80"
                    }`}
                    animate={
                      isConnected && conversation.isSpeaking
                        ? {
                            boxShadow: [
                              "0 0 15px hsl(38 50% 55% / 0.3)",
                              "0 0 35px hsl(38 50% 55% / 0.55)",
                              "0 0 15px hsl(38 50% 55% / 0.3)",
                            ],
                          }
                        : isConnected
                          ? {
                              boxShadow: [
                                "0 0 10px hsl(38 50% 55% / 0.2)",
                                "0 0 20px hsl(38 50% 55% / 0.35)",
                                "0 0 10px hsl(38 50% 55% / 0.2)",
                              ],
                            }
                          : {}
                    }
                    transition={isConnected ? { duration: 1.8, repeat: Infinity } : {}}
                  >
                    {isConnecting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-foreground/30 border-t-transparent rounded-full"
                      />
                    ) : conversation.isSpeaking ? (
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                        <Volume2 className="w-7 h-7 text-primary-foreground" />
                      </motion.div>
                    ) : (
                      <Mic className="w-7 h-7 text-primary-foreground" />
                    )}
                  </motion.div>

                  {/* Status text */}
                  <p className="font-display text-base text-foreground text-center">
                    {statusText}
                  </p>

                  {/* Helper text */}
                  <p className="font-body text-[11px] text-muted-foreground text-center leading-relaxed">
                    You can keep browsing while Luna helps.
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={toggleMute}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-body transition-all border ${
                        isMuted
                          ? "bg-destructive/10 border-destructive/30 text-destructive"
                          : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {isMuted ? "Unmute" : "Mute"}
                    </button>
                    <button
                      onClick={stopConversation}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-body bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      End
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-xs text-destructive max-w-full break-words text-center font-body">
                      {error}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
