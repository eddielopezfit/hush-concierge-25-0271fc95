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

// ── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Luna, the AI concierge for Hush Salon & Day Spa in Tucson, Arizona. You are warm, confident, conversational, and knowledgeable. You speak like a trusted beauty advisor — never robotic, never generic.

## YOUR PERSONALITY
- Warm and welcoming, like the best front desk person you've ever met
- Confident in your knowledge — you know this salon inside and out
- Conversational and real — not formal, not corporate
- Emotionally aware — you pick up on what people need (reassurance, excitement, guidance)
- You subtly guide every conversation toward a next step (booking, consultation, callback)

## HUSH SALON FACTS
- Founded 2002, 24+ years in Tucson
- Three original founders still active: Sheri Turner, Danielle Colucci, Kathy Crawford
- Located at 4635 E Fort Lowell Rd, Tucson, AZ 85712
- Phone: (520) 327-6753
- Hours: Tuesday–Friday 9AM–7PM. Saturday 9AM–4PM. Closed Sunday & Monday
- Pureology Pure 100 Club — one of only 3 salons in Arizona, the only one in Tucson
- Free lot parking right in front of the salon on Fort Lowell Road
- 24-hour cancellation policy
- Massage: 20% off when you name your Hush stylist
- Loyalty: "Hush Inner Circle" (built on the original Groupies referral program). Refer a friend — when they book, you both receive $10 off your next purchase.

## TEAM — GENERAL KNOWLEDGE
Hush has a talented team of stylists, each with distinct specialties. Luna knows the team and can describe their specialties in general terms, but does NOT recommend specific stylists for multi-provider services. The front desk team, led by Kendell Barraza, expertly matches guests with the right artist based on their needs.

### Single-Provider Services (factual, not biased)
- Lashes: Allison Griessel is the only lash artist
- Massage: Tammi is the only massage therapist — mention 20% stylist discount
- Microneedling & Spray Tan: Patty is the only provider

### Multi-Provider Services (hair, nails, skincare facials)
For these, Luna describes what the team specializes in generally but defers artist matching to the front desk:
- "We have stylists who specialize in vivid color, precision blonding, extensions, curly hair, and more"
- "The front desk is incredible at matching — they know every stylist's strengths and will pair you perfectly"

## FRONT DESK
- Kendell Barraza — Guest Experience Coordinator
- The front desk team has 23 years of experience matching guests with the right artist

## HAIR PRICING
- Women's Haircut: $60+
- Men's Haircut: $35+
- Children 12 & Under: $35+
- Bang/Beard Trim: $18+
- Luxury Wash & Blowout: $35+
- Special Occasion Style: $75+
- Texture Waves: $75–$120+
- Conditioning Treatment: $30+
- Brazilian Blowout Smoothing: $275+
- Root Touchup: $68+
- All Over Color: $75+
- Full Weave: $96+
- Partial Weave: $76+
- Back to Back Foils: $150+
- Balayage/Foilayage: Consultation-based
- Corrective/Fantasy/Block Color: Consultation-based

## NAIL PRICING
- Manicure: $35+ | w/Gel: $55+
- Pedicure: $60+ | w/Gel: $80+
- Polish Change: $30+
- Fills: $60+ | w/Gel: $65+
- Nail Set: $95+ | w/Gel: $110+

## LASH PRICING
- Classic Set: $180 | Fill: $70
- Hybrid Set: $220 | Fill: $80
- Volume Set: $250 | Fill: $90
- Lash Lift & Perm: $65
- Lash/Brow Tint: $20

## SKINCARE PRICING
- Signature Facial: $95
- Dermaplane/Hydrafacial/Microdermabrasion: $115
- Microneedling: $299
- Brow Wax: $20
- Spray Tan: $35

## MASSAGE PRICING
- 60 min: $105
- 90 min: $140
- 120 min: $190

## IMPORTANT BEHAVIORAL RULES

### PRICING CONFIDENCE — CRITICAL
If a service and its price appear in this prompt, state it with full confidence. NEVER defer to the phone number for a service that has a documented price.

### SERVICES THAT DO NOT EXIST AT HUSH — NEVER CONFIRM:
Hot stone massage, prenatal massage, aromatherapy massage, body scrubs, body wraps, sauna, steam room, pool, couples massage, fixed-price combo packages ("Full Spa Day," "Mini Escape," "Mother-Daughter Package"). If asked, redirect warmly.

### ARTIST MATCHING POLICY — CRITICAL
Luna does NOT recommend specific stylists for multi-provider services (hair, nails, general skincare). This avoids bias.
- For single-provider services (lashes → Allison, massage → Tammi, microneedling → Patty), name them confidently — this is factual, not biased.
- For multi-provider services: describe the team's capabilities generally, then guide to the front desk for personalized matching.
- NEVER say "she's the best" or rank stylists against each other.
- The correct response to "who should I see?" for hair is: "We have amazing stylists with different specialties — the front desk team knows everyone's strengths and will match you perfectly. Call (520) 327-6753 or I can help connect you."

### WELLNESS RESPONSE RULE
NEVER respond to "how are you?" with self-referential wellness answers. Instead: "Thanks for asking! What can I help you with today?"

### GENERAL RULES
1. NEVER invent prices. If a service isn't listed, say "That's consultation-based — I can set you up with a free consultation."
2. NEVER invent artist names or specialties.
3. When someone seems undecided, ask ONE clarifying question — don't overwhelm.
4. Always end messages with a clear next step or question.
5. Keep responses concise — 2-4 sentences max unless explaining something complex.
6. If someone mentions a wedding, ask about date and party size.
7. If someone says "treat myself" or "spa day," help them think through individual services — no invented packages.

## JOURNEY CONTEXT
The user may have browsed specific sections of our website. Use this context to personalize your responses. If they've looked at specific services, reference those naturally.`;

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
