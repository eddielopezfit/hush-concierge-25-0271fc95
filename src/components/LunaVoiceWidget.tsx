import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";
import { getConciergeContext, buildDynamicVariables, buildLunaFirstMessage } from "@/lib/conciergeStore";
import {
  requestVoiceStart,
  endVoiceSession,
  getVoiceActive,
  subscribeToVoiceState,
} from "@/lib/lunaVoiceBus";

const LUNA_AGENT_ID = "agent_9501kkz62prjevdt34t1ny4dpzf5";

interface LunaVoiceWidgetProps {
  isPrimary?: boolean;
}

export const LunaVoiceWidget = ({ isPrimary = false }: LunaVoiceWidgetProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceActiveElsewhere, setVoiceActiveElsewhere] = useState(false);
  const isStartingRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("[Luna] Connected successfully");
      setError(null);
    },
    onDisconnect: (details: any) => {
      console.log("[Luna] Disconnected, details:", details);
      if (details?.reason === "error" && details?.message) {
        setError(details.message);
      }
      endVoiceSession();
    },
    onError: (err) => {
      console.error("[Luna] Error:", err);
      setError(typeof err === "string" ? err : JSON.stringify(err));
      endVoiceSession();
    },
    onMessage: (message) => {
      console.log("[Luna] Message:", message);
    },
  });

  useEffect(() => {
    const unsubscribe = subscribeToVoiceState((active) => {
      if (active && conversation.status !== "connected") {
        setVoiceActiveElsewhere(true);
      } else if (!active) {
        setVoiceActiveElsewhere(false);
      }
    });

    if (getVoiceActive() && conversation.status !== "connected") {
      setVoiceActiveElsewhere(true);
    }

    return unsubscribe;
  }, [conversation.status]);

  const startConversation = useCallback(async () => {
    if (isStartingRef.current || conversation.status === "connected") {
      return;
    }

    isStartingRef.current = true;
    console.log("Luna voice start requested");
    setError(null);
    setIsConnecting(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const ctx = getConciergeContext();
      const dynamicVariables = buildDynamicVariables(ctx);
      const firstMessage = buildLunaFirstMessage(ctx);

      console.log("[LunaVoiceWidget] Dynamic vars:", dynamicVariables);
      console.log("[LunaVoiceWidget] First message:", firstMessage);

      const sessionOptions = {
        agentId: LUNA_AGENT_ID,
        connectionType: "webrtc" as const,
        dynamicVariables,
        overrides: {
          agent: {
            firstMessage,
          },
        },
      };

      console.log(
        "[LunaVoiceWidget] Starting session with options:",
        JSON.stringify(sessionOptions, null, 2)
      );

      await conversation.startSession(sessionOptions);
      console.log("[LunaVoiceWidget] Session started, status:", conversation.status);
    } catch (err) {
      console.error("[LunaVoiceWidget] Voice start failed:", err);
      setError(String(err));
      endVoiceSession();
    } finally {
      setIsConnecting(false);
      isStartingRef.current = false;
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    console.log("Ending existing Luna session");
    await conversation.endSession();
    endVoiceSession();
  }, [conversation]);

  useEffect(() => {
    if (!isPrimary) return;

    const handleVoiceStartRequest = () => {
      startConversation();
    };

    window.addEventListener("luna:voice-start-request", handleVoiceStartRequest);
    return () => {
      window.removeEventListener("luna:voice-start-request", handleVoiceStartRequest);
    };
  }, [isPrimary, startConversation]);

  const handleButtonClick = useCallback(() => {
    if (conversation.status === "connected") {
      stopConversation();
      return;
    }

    if (isPrimary) {
      const granted = requestVoiceStart("primary-widget");
      if (granted) {
        startConversation();
      }
    } else {
      // Non-primary widget: fire bus event — the primary widget will catch it
      requestVoiceStart("secondary-widget");
    }
  }, [conversation.status, isPrimary, startConversation, stopConversation]);

  const isConnected = conversation.status === "connected";
  const isDisabled = isConnecting || voiceActiveElsewhere;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-500 cursor-pointer
          ${isDisabled && !isConnected ? "opacity-50 cursor-not-allowed" : ""}
          ${isConnected
            ? "bg-accent glow-gold"
            : "bg-gradient-to-br from-gold to-gold-glow"
          }
        `}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        animate={isConnected ? {
          boxShadow: [
            "0 0 20px hsl(38 50% 55% / 0.3)",
            "0 0 40px hsl(38 50% 55% / 0.5)",
            "0 0 20px hsl(38 50% 55% / 0.3)"
          ]
        } : {}}
        transition={isConnected ? { duration: 2, repeat: Infinity } : {}}
      >
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-gold"
            />
          )}
        </AnimatePresence>

        {isConnecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-background border-t-transparent rounded-full"
          />
        ) : isConnected ? (
          <motion.div
            animate={conversation.isSpeaking ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {conversation.isSpeaking ? (
              <Volume2 className="w-10 h-10 text-cream" />
            ) : (
              <Mic className="w-10 h-10 text-cream" />
            )}
          </motion.div>
        ) : (
          <Mic className="w-10 h-10 text-background" />
        )}
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className="font-display text-xl text-cream">
          {isConnecting
            ? "Connecting..."
            : isConnected
              ? conversation.isSpeaking
                ? "Luna is speaking..."
                : "Luna is listening..."
              : voiceActiveElsewhere
                ? "Luna is active below"
                : "Speak with Luna"}
        </p>
        {isConnected && (
          <button
            onClick={stopConversation}
            className="mt-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            End conversation
          </button>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-400 max-w-xs mx-auto break-words">
            Error: {error}
          </p>
        )}
      </motion.div>
    </div>
  );
};