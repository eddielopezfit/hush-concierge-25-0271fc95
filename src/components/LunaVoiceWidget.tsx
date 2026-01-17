import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { getConciergeContext } from "@/lib/conciergeStore";
import type { ConciergeContext } from "@/types/concierge";

const LUNA_AGENT_ID = "agent_4001kf4kgx87fjysr38whwpghj86";

const DEFAULT_GREETING = "Welcome to Hush Salon & Day Spa. I'm Luna, your digital concierge. How may I guide you today?";

const buildLunaFirstMessage = (ctx: ConciergeContext | null): string => {
  if (!ctx) return DEFAULT_GREETING;

  const hasCategories = ctx.categories && ctx.categories.length > 0;
  const hasGoal = ctx.goal !== null && ctx.goal !== undefined;
  const hasTiming = ctx.timing !== null && ctx.timing !== undefined;

  // If no meaningful context, use default greeting
  if (!hasCategories && !hasGoal && !hasTiming) {
    return DEFAULT_GREETING;
  }

  const parts: string[] = ["Welcome."];

  // Categories - Title Case, proper joining
  if (hasCategories) {
    const categoryLabels: Record<string, string> = {
      hair: "Hair",
      nails: "Nails",
      lashes: "Lashes",
      skincare: "Skincare",
      massage: "Massage",
    };
    const names = ctx.categories.map(c => categoryLabels[c] || c);

    let categoryString: string;
    if (names.length === 1) {
      categoryString = names[0];
    } else if (names.length === 2) {
      categoryString = `${names[0]} and ${names[1]}`;
    } else {
      categoryString = `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
    }

    parts.push(`I see you're interested in ${categoryString}.`);
  }

  // Goal - natural phrasing
  if (hasGoal) {
    const goalLabels: Record<string, string> = {
      refresh: "Refresh",
      relax: "Relax",
      transform: "Transform",
      event: "Get event-ready",
    };
    parts.push(`Your goal is ${goalLabels[ctx.goal!] || ctx.goal}.`);
  }

  // Timing - natural phrasing
  if (hasTiming) {
    const timingLabels: Record<string, string> = {
      today: "Today",
      week: "This week",
      planning: "Planning ahead",
      browsing: "Just browsing",
    };
    parts.push(`You're looking to book ${timingLabels[ctx.timing!] || ctx.timing}.`);
  }

  parts.push("Let me guide you through the best next step.");

  return parts.join(" ");
};

export const LunaVoiceWidget = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => console.log("Connected to Luna"),
    onDisconnect: () => console.log("Disconnected from Luna"),
    onError: (error) => console.error("Luna error:", error),
  });

  const startConversation = useCallback(async () => {
    console.log("Speak start: clicked");
    setError(null);
    setIsConnecting(true);
    try {
      console.log("Requesting mic permission...");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Mic permission granted");
      setHasPermission(true);

      // Read context from store and build personalized first message
      const ctx = getConciergeContext();
      const dynamicMessage = buildLunaFirstMessage(ctx);

      console.log("Starting ElevenLabs session with agent:", LUNA_AGENT_ID);
      console.log("FirstMessage:", dynamicMessage);

      await conversation.startSession({
        agentId: LUNA_AGENT_ID,
        overrides: {
          agent: {
            firstMessage: dynamicMessage,
          },
        },
      } as any);
    } catch (err) {
      console.error("Voice start failed:", err);
      setError(String(err));
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
        {error && (
          <p className="mt-2 text-sm text-red-400 max-w-xs mx-auto break-words">
            Error: {error}
          </p>
        )}
      </motion.div>
    </div>
  );
};
