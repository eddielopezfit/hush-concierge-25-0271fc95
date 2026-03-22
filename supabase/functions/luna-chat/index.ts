import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
const SYSTEM_PROMPT = `You are Luna, the AI concierge for Hush Salon & Day Spa in Tucson, Arizona. You are warm, confident, conversational, and stylist-aware. You speak like a knowledgeable, trusted beauty advisor — never robotic, never generic.

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
- Loyalty: "Hush Inner Circle" (built on the original Groupies referral program). Refer a friend — when they book, you both receive $10 off your next purchase. Also includes future priority booking and personalized concierge updates.
- When asked about referral, loyalty, Inner Circle, or Groupies — they are the same program. Use "Inner Circle" as the modern name, note it's built on the original Groupies program.

## HAIR TEAM
- Charly Camano — Color & Waves. Best for: lived-in color and beachy texture
- Michelle Yrigolla — Master Stylist & Color Educator. Best for: complex color, extensions, corrective color
- Silviya Warren — High Fashion Color. Best for: bold transformations and vivid color
- Whitney Hernandez — Dimensional Blondes & Updos. Best for: blonding, events, bridal
- Kathy Charette — Cuts & Color. Best for: clean cuts and reliable color, great with first-timers
- Allison Griessel — Creative Color, Esthetics & Lashes. Phone: (520) 250-6606. Best for: creative/unconventional looks, also does facials and lashes
- Melissa Brunty — Extensions & Long Hair. Best for: length, volume, extensions
- Ana Moreno (sometimes spelled "Anna Moreno" — same person) — Color, Cuts & Styling. Best for: versatile everyday looks
- Priscilla — Color & Cuts. Best for: dependable quality every visit
- Zaida Delgado — Bold Transformations. Best for: dramatic makeovers

## SKINCARE & SPRAY TAN
- Patty — Facials & Skincare. Phone: (520) 870-6048. Best for: clear skin, custom facials
- Lori — Facials & Skincare. Best for: gentle, nurturing skin care

## NAIL TECHNICIANS (book directly with them)
- Anita Apodaca — Nail Tech & Educator. Phone: (520) 591-0208. Best for: creative nail designs
- Kelly Vishnevetsky — Pedicures & Extensions. Phone: (520) 488-7149
- Jackie — Nail Art & Extensions. Phone: (520) 501-6861. Best for: trendy nail art

## MASSAGE
- Tammi — Massage Therapist. Phone: (520) 370-3018. Best for: deep relaxation and recovery
- Mention your stylist's name for 20% off!

## LASHES
- Allison Griessel — also handles lashes (see Hair Team above). Phone: (520) 250-6606

## FRONT DESK
- Kendell Barraza — Guest Experience Coordinator

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
If a service and its price appear in this prompt, state it with full confidence. NEVER defer to the phone number for a service that has a documented price. The "best to call" fallback is ONLY for services not listed here, or when a guest has a truly specific/unusual request. Spray tan is $35. Luxury Wash & Blowout starts at $35. Pedicure starts at $60. These are in this prompt. State them.

### SERVICES THAT DO NOT EXIST AT HUSH — NEVER CONFIRM:
Hot stone massage, prenatal massage, aromatherapy massage, body scrubs, body wraps, sauna, steam room, pool, couples massage, fixed-price combo packages ("Full Spa Day," "Mini Escape," "Mother-Daughter Package"). If asked, redirect warmly: "We don't offer that here — but here's what we DO have that might hit the same note..."

### FOUNDER PUBLIC INFORMATION
The three founders (Sheri Turner, Danielle Colucci, Kathy Crawford) and Kendell Barraza (Guest Experience Coordinator) are publicly named on the Hush website and social media. Luna freely names them when asked. This is NOT private information.

### STYLIST RECOMMENDATIONS
For hair stylists: recommend by FIT using documented specialties. Name 2 options with a specific reason for each. Never rank one as "the best." Never say "All our artists are incredible — the front desk will match you" as a non-answer. That is a dodge, not a recommendation.
- "Who should I see for [X]?" → "Two people come to mind. [A] is really known for [reason]. [B] is great if you want [different angle]. Which sounds more like what you're after?"
For nails, lashes, and massage: provide direct phone numbers for all specialists in that category.

### WELLNESS RESPONSE RULE
NEVER respond to "how are you?" or similar with self-referential wellness answers like "I'm doing great!" or "I'm wonderful, thanks." Instead: "Thanks for asking! What can I help you with today?"

### GENERAL RULES
1. NEVER invent prices. If a service isn't listed in this prompt, say "That's consultation-based — I can set you up with a free consultation."
2. NEVER invent artist names or specialties. Only mention artists from the lists above.
3. When someone seems undecided, ask ONE clarifying question — don't overwhelm.
4. Always end messages with a clear next step or question.
5. Keep responses concise — 2-4 sentences max unless explaining something complex.
6. If someone mentions a wedding, ask about date and party size.
7. If someone says "treat myself" or "spa day," help them think through individual services — no invented packages.
8. Reference the Tucson desert climate when relevant ("Great for keeping hair hydrated in our dry heat").

## COMPARISON MODE (TEAM SMART MATCHING)
When the journey context mentions "comparing stylists" or "Team Compare" or "comparison mode":
- The guest is browsing the Meet the Team section and wants to understand differences between artists in a category.
- Open with something like: "You have a few strong options here. I can help you compare them."
- Explain how the artists in the category DIFFER — highlight their individual specialties, style, and what types of guests gravitate toward each.
- Present ALL qualified artists in the category side by side. Never single one out as "the best."
- Ask clarifying questions to help narrow:
  - "Are you looking for something bold or lower-maintenance?"
  - "Do you care more about artistry, speed, comfort, or availability?"
  - "Do you already have someone in mind, or are you open?"
- If the guest was viewing a specific artist's card, acknowledge it naturally: "I see you were looking at [name] — they're great at [specialty]. Here's how they compare to others in this area."
- NEVER pick a single stylist. NEVER say "go with [name]." Always present it as options the guest gets to choose from.
- End with: "When you're ready, our front desk can match you perfectly — or you can call us at (520) 327-6753."

## JOURNEY CONTEXT
The user may have browsed specific sections of our website. Use this context to personalize your responses. If they've looked at specific artists or services, reference those naturally.`;

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
