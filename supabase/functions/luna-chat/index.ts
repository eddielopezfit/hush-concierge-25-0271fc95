import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildChatSystemPrompt } from "../_shared/luna-brain.ts";
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

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Build system prompt with journey context
    let systemPrompt = SYSTEM_PROMPT;
    if (journeyContext) {
      systemPrompt += `\n\n## CURRENT USER JOURNEY\n${journeyContext}`;
    }

    // Find the latest user message for persistence
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const startedAt = Date.now();

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

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Forward raw chunk to client immediately
            controller.enqueue(value);

            // Parse SSE lines for content capture
            let idx: number;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) assistantFullText += content;
              } catch { /* partial JSON across chunks, skip */ }
            }
          }
        } catch (e) {
          console.error("[luna-chat] stream read error:", e);
          controller.error(e);
        } finally {
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
