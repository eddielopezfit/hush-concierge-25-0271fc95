import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";
import { getConciergeContext, buildDynamicVariables } from "@/lib/conciergeStore";
import { 
  requestVoiceStart, 
  endVoiceSession, 
  getVoiceActive,
  subscribeToVoiceState 
} from "@/lib/lunaVoiceBus";

const LUNA_AGENT_ID = "agent_9501kkz62prjevdt34t1ny4dpzf5";

interface LunaVoiceWidgetProps {
  isPrimary?: boolean;
}

export const LunaVoiceWidget = ({ isPrimary = false }: LunaVoiceWidgetProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceActiveElsewhere, setVoiceActiveElsewhere] = useState(false);
  const isStartingRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("[Luna] Connected successfully");
    },
    onDisconnect: (details) => {
      console.log("[Luna] Disconnected, details:", details);
      endVoiceSession();
    },
    onError: (error) => {
      console.error("[Luna] Error:", error);
      setError(typeof error === "string" ? error : JSON.stringify(error));
      endVoiceSession();
    },
    onMessage: (message) => {
      console.log("[Luna] Message:", message);
    },
  });

  // Subscribe to voice state changes
  useEffect(() => {
    const unsubscribe = subscribeToVoiceState((active) => {
      // If voice became active but we're not the connected one, show disabled state
      if (active && conversation.status !== "connected") {
        setVoiceActiveElsewhere(true);
      } else if (!active) {
        setVoiceActiveElsewhere(false);
      }
    });

    // Check initial state
    if (getVoiceActive() && conversation.status !== "connected") {
      setVoiceActiveElsewhere(true);
    }

    return unsubscribe;
  }, [conversation.status]);

  const startConversation = useCallback(async () => {
    // Prevent double-starts
    if (isStartingRef.current || conversation.status === "connected") {
      return;
    }
    
    isStartingRef.current = true;
    console.log("Luna voice start requested");
    setError(null);
    setIsConnecting(true);
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);

      // Build dynamic variables from concierge context
      const ctx = getConciergeContext();
      const dynamicVariables = buildDynamicVariables(ctx);
      console.log("Dynamic vars:", dynamicVariables);

      // Build context-aware first message
      const contextSummary = dynamicVariables.luna_context_summary;
      let firstMessage: string | undefined;
      if (contextSummary && contextSummary.trim().length > 10) {
        firstMessage = `Welcome to Hush. ${contextSummary} How can I help you take the next step?`;
      }

      const sessionOptions: any = {
        agentId: LUNA_AGENT_ID,
        dynamicVariables,
      };
      if (firstMessage) {
        sessionOptions.overrides = { agent: { firstMessage } };
      }

      console.log("[LunaVoiceWidget] Starting session with options:", JSON.stringify(sessionOptions, null, 2));

      await conversation.startSession(sessionOptions);
      
      console.log("[LunaVoiceWidget] Session started, status:", conversation.status);
    } catch (err) {
      console.error("[LunaVoiceWidget] Voice start failed:", err);
      setError(String(err));
      // Clear the lock on failure
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

  // Only PRIMARY widget listens for start requests
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

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (conversation.status === "connected") {
      // Already connected - stop
      stopConversation();
      return;
    }

    if (isPrimary) {
      // Primary widget: request start directly
      const granted = requestVoiceStart("primary-widget");
      if (granted) {
        startConversation();
      }
    } else {
      // Non-primary widget: request via bus, scroll to primary
      const granted = requestVoiceStart("secondary-widget");
      
      // Always scroll to Luna section
      const lunaSection = document.getElementById("luna");
      if (lunaSection) {
        lunaSection.scrollIntoView({ behavior: "smooth" });
      }
      
      // If not granted, the primary will NOT start (already active)
      // The bus dispatches the event which primary listens to
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
        {/* Outer Ring Animation */}
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

        {/* Icon */}
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

      {/* Status Text */}
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
