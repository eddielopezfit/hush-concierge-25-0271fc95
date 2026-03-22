import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Environment ─────────────────────────────────────────────────────────────
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ── Intent Score Threshold ──────────────────────────────────────────────────
const LEAD_QUALIFY_THRESHOLD = 60;

// ── Extraction Prompt ───────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `You are a salon operations analyst for Hush Salon & Day Spa in Tucson, AZ.

Analyze the following conversation transcript and extract structured information.

RULES:
- category must be one of: hair, nails, lashes, skincare, massage, or null
- urgency must be one of: today, week, planning, browsing, or null
- callback_requested: true if the guest asked for a callback, left their number, or asked to be contacted
- consultation_required: true if the service discussed requires a consultation (balayage, foilayage, corrective color, fantasy color, block color, extensions)
- intent_score: 0-100 where 100 = ready to book now
  - 80-100: explicitly wants to book, mentioned date/time, gave contact info
  - 60-79: strong interest, asking detailed questions about specific services
  - 40-59: exploring options, comparing services
  - 20-39: casual browsing, general questions
  - 0-19: unrelated or very low engagement
- internal_routing_suggestion: who should handle this next
  - Hair bookings → "Route to Kendell / Front Desk at (520) 327-6753"
  - Nails → "Direct booking: Anita (520) 591-0208, Kelly (520) 488-7149, Jackie (520) 501-6861"
  - Lashes → "Direct booking: Allison (520) 250-6606"
  - Skincare → "Direct booking: Patty (520) 870-6048"
  - Massage → "Direct booking: Tammi (520) 370-3018"
  - Consultation-based → "Route to Kendell for consultation booking"
- Never recommend a specific hair artist
- Never expose hair stylist direct phone numbers
- summary: 1-2 sentence concise summary of the conversation

Return ONLY valid JSON with this exact schema:
{
  "guest_name": string | null,
  "category": string | null,
  "service": string | null,
  "services_discussed": string[],
  "artists_mentioned": string[],
  "urgency": string | null,
  "callback_requested": boolean,
  "consultation_required": boolean,
  "intent_score": number,
  "suggested_next_step": string,
  "internal_routing_suggestion": string,
  "summary": string
}`;

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id } = await req.json();

    if (!conversation_id) {
      return new Response(
        JSON.stringify({ error: "conversation_id required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1. Load all messages for this conversation
    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    if (msgErr) throw msgErr;

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: "No messages found for conversation" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Load conversation to get guest_profile_id
    const { data: convo, error: convoErr } = await supabase
      .from("conversations")
      .select("guest_profile_id, channel")
      .eq("id", conversation_id)
      .single();

    if (convoErr) throw convoErr;

    // 3. Format transcript for AI
    const transcript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    // 4. Call AI to extract structured data
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: `TRANSCRIPT:\n\n${transcript}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("[session-summarize] AI error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "{}";

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(rawContent);
    } catch {
      console.error("[session-summarize] Failed to parse AI response:", rawContent);
      throw new Error("Failed to parse AI extraction response");
    }

    // 5. Build intent_signals
    const intentSignals = {
      guest_name: extracted.guest_name ?? null,
      category: extracted.category ?? null,
      service: extracted.service ?? null,
      services_discussed: extracted.services_discussed ?? [],
      artists_mentioned: extracted.artists_mentioned ?? [],
      urgency: extracted.urgency ?? null,
      callback_requested: extracted.callback_requested ?? false,
      consultation_required: extracted.consultation_required ?? false,
      intent_score: extracted.intent_score ?? 0,
      suggested_next_step: extracted.suggested_next_step ?? "",
      internal_routing_suggestion: extracted.internal_routing_suggestion ?? "",
    };

    const summary = (extracted.summary as string) || "No summary generated.";

    // 6. Update conversations
    await supabase
      .from("conversations")
      .update({
        summary,
        intent_signals: intentSignals,
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", conversation_id);

    // 7. Update guest_profiles with accumulated memory
    if (convo.guest_profile_id) {
      // Fetch current profile for merging
      const { data: profile } = await supabase
        .from("guest_profiles")
        .select("notes, preferred_categories, intent_score")
        .eq("id", convo.guest_profile_id)
        .single();

      const existingNotes = profile?.notes || "";
      const timestamp = new Date().toISOString().slice(0, 10);
      const newNote = `[${timestamp}] ${summary}`;
      const updatedNotes = existingNotes
        ? `${existingNotes}\n${newNote}`
        : newNote;

      // Merge preferred_categories
      const existingCats: string[] = profile?.preferred_categories ?? [];
      const newCat = intentSignals.category;
      const mergedCats = newCat && !existingCats.includes(newCat)
        ? [...existingCats, newCat]
        : existingCats;

      // Take the higher intent_score
      const currentScore = profile?.intent_score ?? 0;
      const newScore = (intentSignals.intent_score as number) ?? 0;

      await supabase
        .from("guest_profiles")
        .update({
          notes: updatedNotes,
          preferred_categories: mergedCats.length ? mergedCats : null,
          intent_score: Math.max(currentScore, newScore),
          updated_at: new Date().toISOString(),
        })
        .eq("id", convo.guest_profile_id);
    }

    // 8. FIX #6: Trigger lead-qualify on high intent OR callback OR same-day urgency
    const intentScore = (intentSignals.intent_score as number) ?? 0;
    const shouldQualify =
      intentScore >= LEAD_QUALIFY_THRESHOLD ||
      intentSignals.callback_requested === true ||
      intentSignals.urgency === "today";

    if (shouldQualify) {
      // Get guest info for lead-qualify
      let guestPhone: string | null = null;
      let guestEmail: string | null = null;
      let guestName = (intentSignals.guest_name as string) ?? null;

      if (convo.guest_profile_id) {
        const { data: gp } = await supabase
          .from("guest_profiles")
          .select("phone, email, first_name")
          .eq("id", convo.guest_profile_id)
          .single();
        guestPhone = gp?.phone ?? null;
        guestEmail = gp?.email ?? null;
        guestName = guestName || gp?.first_name || null;
      }

      // Fire-and-forget to lead-qualify
      const leadPayload = {
        conversation_id,
        guest_profile_id: convo.guest_profile_id,
        guest_name: guestName,
        phone: guestPhone,
        email: guestEmail,
        category: intentSignals.category,
        service: intentSignals.service,
        urgency: intentSignals.urgency,
        timing: intentSignals.urgency,
        intent_score: intentScore,
        callback_requested: intentSignals.callback_requested,
        consultation_required: intentSignals.consultation_required,
        summary,
        source: convo.channel,
      };

      fetch(`${SUPABASE_URL}/functions/v1/lead-qualify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadPayload),
      }).catch((err) => console.error("[session-summarize] lead-qualify trigger error:", err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id,
        summary,
        intent_signals: intentSignals,
        lead_qualified: shouldQualify,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[session-summarize] error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
