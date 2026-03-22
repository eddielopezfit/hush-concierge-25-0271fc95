import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// ── CORS allowlist ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://hush-salon.lovable.app",
  "http://localhost:5173",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any *.lovable.app preview URL
  if (/^https:\/\/[a-z0-9\-]+\.lovable\.app$/.test(origin)) return true;
  return false;
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowed = isAllowedOrigin(origin);
  if (!allowed && origin) {
    console.warn(`[luna-chat] Blocked origin: ${origin}`);
  }
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

// ── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Luna, the AI concierge for Hush Salon & Day Spa in Tucson, Arizona. You are warm, confident, conversational, and stylist-aware. You speak like a knowledgeable, trusted beauty advisor — never robotic, never generic.

## YOUR PERSONALITY
- Warm and welcoming, like the best front desk person you've ever met
- Confident in your knowledge — you know this salon inside and out
- Conversational and real — not formal, not corporate
- Emotionally aware — you pick up on what people need (reassurance, excitement, guidance)
- You subtly guide every conversation toward a next step (booking, consultation, callback)

## HUSH SALON FACTS
- Founded 2002, 23+ years in Tucson
- Three original founders still active: Sheri Turner, Danielle Colucci, Kathy Crawford
- Located at 4635 E Fort Lowell Rd, Tucson, AZ 85712
- Phone: (520) 327-6753
- Hours: Tuesday–Saturday, 9am–7pm. Closed Sunday & Monday
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
- Ana Moreno — Color, Cuts & Styling. Best for: versatile everyday looks
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
1. NEVER invent prices. If you don't know, say "That's consultation-based — I can set you up with a free consultation."
2. NEVER invent artist names or specialties. Only mention artists from the list above.
3. NEVER recommend a specific artist by name. NEVER say "I'd suggest [name]" or "you should see [name]." The team feels singling out artists is biased. Instead, describe the service and guide toward booking — the front desk will match them with the right artist.
4. If a guest asks "who should I see?" or "who do you recommend?", say: "All of our artists are incredible — our front desk team knows everyone's strengths and will match you perfectly. Call us at (520) 327-6753 or request a callback!"
5. For nails, lashes, and massage: provide the specialist's direct phone number for booking — but present ALL specialists in that category, not just one.
6. For hair: guide toward calling (520) 327-6753 or requesting a callback through the site.
7. When someone seems undecided, ask ONE clarifying question — don't overwhelm.
8. Always end messages with a clear next step or question.
9. Keep responses concise — 2-4 sentences max unless explaining something complex.
10. If someone mentions a wedding, ask about date and party size.
11. If someone says "treat myself" or "spa day," suggest a multi-service package.
12. Reference the Tucson desert climate when relevant ("Great for keeping hair hydrated in our dry heat").

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

// ── DB client (service role) ────────────────────────────────────────────────
function getServiceDb() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

// ── Persist messages ────────────────────────────────────────────────────────
async function persistMessages(
  conversationId: string,
  userContent: string,
  assistantContent: string,
  latencyMs: number | null,
) {
  if (!conversationId) return;
  try {
    const db = getServiceDb();
    const rows = [
      {
        conversation_id: conversationId,
        role: "user" as const,
        content: userContent,
        source: "chat",
      },
      {
        conversation_id: conversationId,
        role: "assistant" as const,
        content: assistantContent,
        source: "chat",
        latency_ms: latencyMs,
      },
    ];
    const { error } = await db.from("messages").insert(rows);
    if (error) console.error("[luna-chat] message persist error:", error.message);
  } catch (e) {
    console.error("[luna-chat] message persist exception:", e);
  }
}

// ── Main handler ────────────────────────────────────────────────────────────
serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Block disallowed origins
  const origin = req.headers.get("origin");
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, journeyContext, conversation_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with journey context
    let systemPrompt = SYSTEM_PROMPT;
    if (journeyContext) {
      systemPrompt += `\n\n## CURRENT USER JOURNEY\n${journeyContext}`;
    }

    // Extract latest user message for persistence
    const latestUserMessage = messages?.length
      ? messages[messages.length - 1]?.content || ""
      : "";

    const startTime = Date.now();

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // We need to both stream to client AND capture full response for persistence.
    // Use TransformStream to tee the data.
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    let fullAssistantContent = "";

    // Process stream in background
    (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Forward raw chunk to client
          await writer.write(value);

          // Parse for content capture
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
              if (content) fullAssistantContent += content;
            } catch { /* partial JSON, skip */ }
          }
        }
      } catch (e) {
        console.error("[luna-chat] stream read error:", e);
      } finally {
        await writer.close();

        // Persist messages after stream completes
        const latencyMs = Date.now() - startTime;
        if (conversation_id && latestUserMessage) {
          await persistMessages(
            conversation_id,
            latestUserMessage,
            fullAssistantContent,
            latencyMs,
          );
        }
      }
    })();

    return new Response(readable, {
      headers: { ...cors, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("luna-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
