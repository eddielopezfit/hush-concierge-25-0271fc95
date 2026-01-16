import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { getConciergeContext, buildLunaFirstMessage } from "@/lib/conciergeStore";

const LUNA_AGENT_ID = "agent_1301kf1rtamae0p8w88ns874akzk";

export const LunaVoiceWidget = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const conversation = useConversation({
    onConnect: () => console.log("Connected to Luna"),
    onDisconnect: () => console.log("Disconnected from Luna"),
    onError: (error) => console.error("Luna error:", error),
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);

      // Read context from store and build personalized first message
      const ctx = getConciergeContext();
      const firstMessage = buildLunaFirstMessage(ctx);

      // Build session options with optional overrides
      const sessionOptions: any = {
        agentId: LUNA_AGENT_ID,
      };

      // Only add overrides if we have a custom first message
      if (firstMessage) {
        sessionOptions.overrides = {
          agent: {
            firstMessage: firstMessage,
          },
        };
      }

      await conversation.startSession(sessionOptions);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={isConnected ? stopConversation : startConversation}
        disabled={isConnecting}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-500 cursor-pointer
          ${isConnected 
            ? "bg-crimson glow-gold" 
            : "bg-gradient-to-br from-gold to-gold-glow"
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isConnected ? { 
          boxShadow: [
            "0 0 20px hsl(43 45% 58% / 0.3)",
            "0 0 40px hsl(43 45% 58% / 0.5)",
            "0 0 20px hsl(43 45% 58% / 0.3)"
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
      </motion.div>
    </div>
  );
};
