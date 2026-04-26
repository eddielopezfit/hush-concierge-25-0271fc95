import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildChatSystemPrompt } from "../_shared/luna-brain.ts";
import {
  isPricingQuery,
  detectPricingCategories,
  renderPricingBlock,
  PRICING_CATEGORIES,
} from "../_shared/pricing-tables.ts";
// ── Environment ─────────────────────────────────────────────────────────────
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://hush-salon.lovable.app",
  "http://localhost:5173",
];

function resolveOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (allowedOrigins.includes(origin)) return origin;
  if (/^https:\/\/.*\.lovable\.app$/.test(origin)) return origin;
  if (/^https:\/\/.*\.lovableproject\.com$/.test(origin)) return origin;
  return null;
}

function corsHeaders(origin: string | null) {
  const allowedOrigin = resolveOrigin(origin);
  return {
    allowedOrigin,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin ?? "null",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Vary": "Origin",
    },
  };
}

// ── Types ───────────────────────────────────────────────────────────────────
type ChatBody = {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  journeyContext?: string;
  conversation_id?: string;
};

// System prompt is now sourced from the canonical shared brain
// See supabase/functions/_shared/luna-brain.ts

// ── Main handler ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const { allowedOrigin, headers } = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: allowedOrigin ? 204 : 403, headers });
  }

  if (!allowedOrigin) {
    console.warn("[luna-chat] Blocked origin:", origin);
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = (await req.json()) as ChatBody;
    const { messages, journeyContext, conversation_id } = body;

    if (conversation_id) {
      const { data: existingConversation, error: conversationError } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversation_id)
        .maybeSingle();

      if (conversationError) {
        console.error("[luna-chat] conversation lookup error:", conversationError.message);
        return new Response(JSON.stringify({ error: "Conversation lookup failed" }), {
          status: 500,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (!existingConversation) {
        return new Response(JSON.stringify({ error: "Conversation not found", code: "THREAD_NOT_FOUND" }), {
          status: 409,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
    }

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Build system prompt from canonical shared brain
    let systemPrompt = buildChatSystemPrompt(journeyContext);

    // ── Self-intro guard (PREPENDED so it dominates the prompt) ─────────
    const hasPriorAssistantMessage = messages.some((m) => m.role === "assistant");
    if (hasPriorAssistantMessage) {
      const override = `## ⛔ ABSOLUTE RUNTIME RULE — NO SELF-INTRODUCTION ⛔
This is a CONTINUING conversation. The guest has ALREADY received your introduction.
You MUST NOT begin your response with any greeting that names yourself or your role.

FORBIDDEN openings (and any close variation):
- "Hey — I'm Luna..."   - "Hi, I'm Luna..."   - "I'm Luna..."   - "I am Luna..."
- "Welcome to Hush..."   - "Hey there — welcome..."   - "Welcome back..."
- "Hush's digital concierge"   - "Hush's AI concierge"
- "your digital concierge"   - "your AI concierge"   - "your personal guide"
- Any sentence whose purpose is to (re-)state your name, role, or that you are AI.

REQUIRED: Begin your reply DIRECTLY with the substantive answer. No preamble, no greeting, no name-drop. The guest already knows who you are.
If the guest explicitly asks "are you AI?" or "are you real?", you may briefly confirm — otherwise NEVER reintroduce yourself.

═══════════════════════════════════════════════════════════════════
`;
      systemPrompt = override + systemPrompt;
    }


    // Find the latest user message for persistence + booking-intent detection
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const startedAt = Date.now();

    // Detect explicit booking intent on the user's last message
    const BOOKING_INTENT_RE = /\b(book(?:\s+me)?|schedule(?:\s+an?)?\s+(?:appointment|visit)|make\s+an?\s+appointment|reserve\s+(?:a|my)\s+(?:spot|appointment))\b/i;
    const hasBookingIntent = !!(lastUserMessage?.content && BOOKING_INTENT_RE.test(lastUserMessage.content));

    // ── Deterministic pricing-table injection ─────────────────────────────
    // The LLM has a tendency to trim rows when summarizing menus. To guarantee
    // every row is shown, we render the canonical table ourselves whenever the
    // user is asking about pricing for a known category, then instruct the model
    // (via a one-shot rule) NOT to re-render the same table.
    let pricingPrefix = "";
    if (lastUserMessage?.content && isPricingQuery(lastUserMessage.content)) {
      let cats = detectPricingCategories(lastUserMessage.content);
      // Generic pricing question with no category → show all categories.
      if (cats.length === 0) cats = PRICING_CATEGORIES;
      pricingPrefix = renderPricingBlock(cats);

      const titles = cats.map((c) => c.title).join(", ");
      systemPrompt =
        `## ⛔ DETERMINISTIC PRICING TABLE ALREADY DELIVERED ⛔\n` +
        `The complete, authoritative pricing table for: ${titles} has ALREADY been shown to the guest immediately above your reply. ` +
        `You MUST NOT re-render the table, restate any row, or list prices again. ` +
        `Do NOT output a markdown table. Do NOT bullet the services. ` +
        `Begin your reply with a single short, warm sentence (e.g., "Here's the full ${titles.toLowerCase()} menu — anything you'd like me to break down?") and then offer ONE concrete next step (a recommendation, a question, or a booking nudge). Keep it under 3 sentences.\n\n` +
        `═══════════════════════════════════════════════════════════════════\n\n` +
        systemPrompt;
    }

    // Call AI gateway
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
      const errText = await upstream.text();
      console.error("[luna-chat] AI gateway error:", upstream.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    if (!upstream.body) {
      return new Response(
        JSON.stringify({ error: "No response body from AI" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Stream to client while capturing assistant content for persistence
    let assistantFullText = "";

    // When this is a continuing turn, buffer the first sentence so we can strip
    // any rogue self-intro the model leaks despite the system-prompt override.
    const stripIntroMode = hasPriorAssistantMessage;
    const INTRO_LINE_RE = /^\s*(hey|hi|hello)?[\s,—\-–]*(there)?[\s,—\-–]*(welcome\s+(back\s+)?to\s+hush|i['’]?m\s+luna|i\s+am\s+luna|luna\s+here)[^.!?\n]*[.!?\n]+\s*/i;
    let introBuffer = "";
    let introHandled = !stripIntroMode; // if not in strip mode, skip buffering

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const enqueueContentChunk = (text: string) => {
          if (!text) return;
          const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
          controller.enqueue(encoder.encode(sse));
        };

        // Emit the deterministic pricing table first so the user sees the
        // complete data before the LLM commentary streams in.
        if (pricingPrefix) {
          enqueueContentChunk(pricingPrefix + "\n\n");
          assistantFullText += pricingPrefix + "\n\n";
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Parse SSE lines for content capture + (optional) intro-strip rewrite
            let idx: number;
            let passthroughChunk = ""; // raw forwarding when not in strip mode
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              const rawLine = buffer.slice(0, idx + 1); // includes \n
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);

              if (!line.startsWith("data: ")) {
                // Forward non-data lines (blank separators) only when not stripping
                if (introHandled) passthroughChunk += rawLine;
                continue;
              }

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") {
                if (introHandled) passthroughChunk += rawLine;
                continue;
              }

              try {
                const parsed = JSON.parse(jsonStr);
                const content: string | undefined = parsed.choices?.[0]?.delta?.content;
                if (content) assistantFullText += content;

                if (!introHandled) {
                  if (content) introBuffer += content;
                  // Once we have enough text to make a decision (first sentence terminator
                  // or 200 chars), strip the intro and flush the rest.
                  if (/[.!?\n]/.test(introBuffer) || introBuffer.length > 200) {
                    const cleaned = introBuffer.replace(INTRO_LINE_RE, "").trimStart();
                    introHandled = true;
                    enqueueContentChunk(cleaned);
                  }
                  // Don't forward this delta as-is
                  continue;
                }

                // Pass-through after intro handled
                passthroughChunk += rawLine;
              } catch {
                if (introHandled) passthroughChunk += rawLine;
              }
            }

            if (passthroughChunk) controller.enqueue(encoder.encode(passthroughChunk));
          }
        } catch (e) {
          console.error("[luna-chat] stream read error:", e);
          controller.error(e);
        } finally {
          // If we never reached the flush threshold (very short response), flush now.
          if (!introHandled) {
            const cleaned = introBuffer.replace(INTRO_LINE_RE, "").trimStart();
            if (cleaned) enqueueContentChunk(cleaned);
            introHandled = true;
          }
          // Normalize the persisted text to match what the user actually saw.
          if (stripIntroMode) {
            assistantFullText = assistantFullText.replace(INTRO_LINE_RE, "").trimStart();
          }
          // If user expressed explicit booking intent, append a structured marker
          // so the client can render an inline booking form below the message.
          if (hasBookingIntent) {
            const marker = "\n\n[[INLINE_BOOKING_FORM]]";
            const sseChunk = `data: ${JSON.stringify({ choices: [{ delta: { content: marker } }] })}\n\n`;
            try {
              controller.enqueue(new TextEncoder().encode(sseChunk));
              assistantFullText += marker;
            } catch { /* ignore */ }
          }
          controller.close();

          // Persist messages after stream completes
          if (conversation_id && lastUserMessage?.content) {
            const latencyMs = Date.now() - startedAt;
            await supabase.from("messages").insert([
              {
                conversation_id,
                role: "user",
                content: lastUserMessage.content,
                source: "chat",
              },
              {
                conversation_id,
                role: "assistant",
                content: assistantFullText,
                latency_ms: latencyMs,
                source: "chat",
              },
            ]).then(({ error }) => {
              if (error) console.error("[luna-chat] message persist error:", error.message);
            });

            // ── Summarize throttling ────────────────────────────────
            // Fetch conversation throttle state + current message count
            const [{ count }, { data: convoState }] = await Promise.all([
              supabase
                .from("messages")
                .select("id", { count: "exact", head: true })
                .eq("conversation_id", conversation_id),
              supabase
                .from("conversations")
                .select("last_summarized_at, last_summarized_message_count")
                .eq("id", conversation_id)
                .single(),
            ]);

            const messageCount = count ?? 0;
            const lastSummarizedCount = convoState?.last_summarized_message_count ?? 0;
            const lastSummarizedAt = convoState?.last_summarized_at
              ? new Date(convoState.last_summarized_at).getTime()
              : 0;
            const secsSinceLastSummarize = (Date.now() - lastSummarizedAt) / 1000;

            let shouldSummarize = false;

            // Periodic: 6+ new messages since last summarize
            if (messageCount >= 6 && messageCount >= lastSummarizedCount + 6) {
              shouldSummarize = true;
            }

            // High-intent: immediate, but only if >60s since last summarize
            const lowerMsg = lastUserMessage.content.toLowerCase();
            const highIntentSignals = [
              "book", "appointment", "schedule", "call me", "callback",
              "phone number", "available", "availability", "openings",
              "my number is", "call back", "reach me",
            ];
            if (
              highIntentSignals.some((s) => lowerMsg.includes(s)) &&
              messageCount >= 2 &&
              secsSinceLastSummarize > 60
            ) {
              shouldSummarize = true;
            }

            if (shouldSummarize) {
              fetch(`${SUPABASE_URL}/functions/v1/session-summarize`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ conversation_id }),
              }).catch((err) => console.error("[luna-chat] auto-summarize error:", err));
            }
          }
        }
      },
    });

    return new Response(stream, { status: 200, headers });
  } catch (error) {
    console.error("[luna-chat] error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
});
