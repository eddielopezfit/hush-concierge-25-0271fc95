import { useCallback, useRef, useState } from "react";
import { ConciergeContext } from "@/types/concierge";
import { getJourneyContextString } from "@/lib/journeyTracker";
import { getConversationId } from "@/lib/sessionManager";
import type { ChatMessage } from "./types";
import { detectChatActions, ERROR_QUICK_REPLIES } from "./chatActionDetectors";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/luna-chat`;
const INLINE_BOOKING_MARKER = "[[INLINE_BOOKING_FORM]]";

export interface StreamChatCallbacks {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setQuickReplies: (replies: string[]) => void;
  onExchangeComplete: () => void;
  onInlineBookingDetected: () => void;
  onMissingThread: () => void;
  conciergeContext: ConciergeContext | null;
  getQuickReplies: (ctx: ConciergeContext | null, msg: string, qualifyingStage: number) => string[];
  qualifyingStage: number;
}

/**
 * Encapsulates the SSE streaming protocol with the luna-chat edge function.
 * Handles abort, error fallbacks, inline-booking marker detection, and
 * post-stream action attachment.
 */
export function useChatStreaming(cbs: StreamChatCallbacks) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const streamChat = useCallback(
    async (allMessages: ChatMessage[]) => {
      setIsStreaming(true);
      abortRef.current = new AbortController();

      const journeyContext = getJourneyContextString();
      const apiMessages = allMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      try {
        const conversationId = getConversationId();
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages, journeyContext, conversation_id: conversationId }),
          signal: abortRef.current.signal,
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 409) {
            let errorCode: string | undefined;
            try {
              const data = await resp.json();
              errorCode = data?.code;
            } catch {
              /* ignore */
            }
            if (errorCode === "THREAD_NOT_FOUND") {
              cbs.onMissingThread();
              setIsStreaming(false);
              return;
            }
          }
          if (resp.status === 429) {
            const errorContent = "I'm getting a lot of questions right now — give me just a moment and try again!";
            cbs.setMessages((prev) => [
              ...prev,
              { id: `err-${Date.now()}`, role: "assistant", content: errorContent },
            ]);
            cbs.setQuickReplies(ERROR_QUICK_REPLIES);
            setIsStreaming(false);
            return;
          }
          throw new Error(`Stream failed: ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";
        let streamDone = false;

        const assistantId = `luna-${Date.now()}`;
        cbs.setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                cbs.setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
                );
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                cbs.setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
                );
              }
            } catch {
              /* ignore */
            }
          }
        }

        // Detect & strip the inline-booking marker emitted by the edge function
        const showInlineBooking = assistantContent.includes(INLINE_BOOKING_MARKER);
        if (showInlineBooking) {
          assistantContent = assistantContent.replace(INLINE_BOOKING_MARKER, "").trim();
        }

        // Attach actions + update quick replies after streaming completes
        const actions = detectChatActions(assistantContent, cbs.conciergeContext);
        cbs.setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent, actions, showInlineBooking } : m
          )
        );
        cbs.setQuickReplies(cbs.getQuickReplies(cbs.conciergeContext, assistantContent, cbs.qualifyingStage));

        if (showInlineBooking) cbs.onInlineBookingDetected();
        cbs.onExchangeComplete();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("[useChatStreaming] Stream error:", err);
        const errorContent =
          "I'm having trouble connecting right now. You can always call us directly at (520) 327-6753 — Kendell at the front desk will take great care of you!";
        cbs.setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: "assistant", content: errorContent },
        ]);
        cbs.setQuickReplies(ERROR_QUICK_REPLIES);
      } finally {
        setIsStreaming(false);
      }
    },
    [cbs]
  );

  return { isStreaming, streamChat, abort };
}
