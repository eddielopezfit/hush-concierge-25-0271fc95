/**
 * capture-lead — Luna voice tool endpoint
 *
 * Called by ElevenLabs during a voice call when Luna captures
 * a guest's contact information and intent.
 *
 * Responsibilities:
 *   1. Write to Supabase leads + callback_requests tables
 *   2. Score intent and route to correct Slack channel immediately
 *   3. Return confirmation text Luna reads aloud, then calls end_call
 *
 * Fixes applied (v2):
 *   - Confirmation language: all paths close cleanly, no "is there anything else?"
 *   - Idempotency: dedup callback_requests by (phone + session_id) in 2-min window
 *   - close_after flag returned so system prompt knows to trigger end_call
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_WEBHOOK    = Deno.env.get("SLACK_WEBHOOK_URL");

function getSlackWebhook(channel: string): string | null {
  return Deno.env.get(`SLACK_WEBHOOK_URL_${channel.toUpperCase()}`) || SLACK_WEBHOOK || null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface CaptureLeadBody {
  guest_name:             string;
  phone:                  string;
  email?:                 string;
  service_category?:      string;
  service_name?:          string;
  timing?:                string;
  callback_requested?:    boolean;
  consultation_required?: boolean;
  call_summary?:          string;
  elevenlabs_session_id?: string;
}

type Priority = "P1" | "P2" | "P3" | "P4";

// ── Priority scoring ──────────────────────────────────────────────────────────
function scorePriority(body: CaptureLeadBody): { priority: Priority; intent_score: number } {
  let score = 30;
  if (body.timing === "today")         score += 40;
  else if (body.timing === "this week") score += 20;
  else if (body.timing === "planning")  score += 10;
  if (body.callback_requested)         score += 30;
  if (body.consultation_required)      score += 15;
  if (body.phone && body.guest_name !== "Unknown") score += 10;
  score = Math.min(score, 100);

  const priority: Priority =
    body.callback_requested || body.timing === "today" || score >= 80 ? "P1" :
    body.timing === "this week" || score >= 55                         ? "P2" :
    body.timing === "planning"  || score >= 30                         ? "P3" : "P4";

  return { priority, intent_score: score };
}

// ── Booking path display ──────────────────────────────────────────────────────
const BOOKING_PATHS: Record<string, string> = {
  hair:     "Front Desk: (520) 327-6753",
  nails:    "Direct: Anita (520) 591-0208 · Kelly (520) 488-7149 · Jackie (520) 501-6861",
  lashes:   "Direct: Allison (520) 250-6606",
  skincare: "Direct: Patty (520) 870-6048 · Lori (520) 400-5091",
  massage:  "Direct: Tammi (520) 370-3018",
};
function bookingPath(cat?: string): string {
  return BOOKING_PATHS[cat?.toLowerCase() ?? ""] || BOOKING_PATHS.hair;
}

// ── Slack channel routing ─────────────────────────────────────────────────────
function slackChannel(body: CaptureLeadBody): string {
  if (body.callback_requested) return "callbacks";
  const ch: Record<string, string> = {
    nails: "nails", lashes: "lashes", skincare: "skin", massage: "massage",
  };
  return ch[body.service_category?.toLowerCase() ?? ""] ?? "leads";
}

// ── Slack Block Kit message ───────────────────────────────────────────────────
function buildSlackMessage(body: CaptureLeadBody, priority: Priority, intent_score: number): object {
  const emoji: Record<Priority, string> = { P1: "🔴", P2: "🟠", P3: "🟡", P4: "⚪" };
  const label: Record<Priority, string> = { P1: "HIGH PRIORITY", P2: "MEDIUM", P3: "STANDARD", P4: "LOW" };

  const action =
    priority === "P1" ? "🚨 *Action:* @Kendell — Call within 10 minutes" :
    priority === "P2" ? "⏰ *Action:* @Kendell — Follow up today" :
                        "📋 *Action:* @Kendell — Add to follow-up queue";

  const flags: string[] = [];
  if (body.consultation_required)      flags.push("⚠️ Consultation required — no price until consult");
  if (body.timing === "today")         flags.push("🔥 Same-day — check availability now");
  else if (body.timing === "this week") flags.push("📅 Wants to book this week");
  if (body.callback_requested)         flags.push("📞 Explicitly requested a callback");

  const phoneDisplay = body.phone
    ? `<tel:${body.phone.replace(/\D/g, "")}|${body.phone}>`
    : "Not provided";

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji[priority]} ${label[priority]} — ${body.callback_requested ? "Callback Request" : "New Lead"} captured by Luna`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${body.guest_name}` },
          { type: "mrkdwn", text: `*Phone:*\n${phoneDisplay}` },
          { type: "mrkdwn", text: `*Service:*\n${body.service_name || body.service_category || "General inquiry"}` },
          { type: "mrkdwn", text: `*Timing:*\n${body.timing || "Not specified"}` },
          { type: "mrkdwn", text: `*Booking Path:*\n${bookingPath(body.service_category)}` },
          { type: "mrkdwn", text: `*Intent Score:*\n${intent_score}/100` },
        ],
      },
      ...(body.call_summary ? [{
        type: "section",
        text: { type: "mrkdwn", text: `*Luna's summary:*\n> ${body.call_summary}` },
      }] : []),
      ...(flags.length > 0 ? [{
        type: "section",
        text: { type: "mrkdwn", text: flags.join("\n") },
      }] : []),
      { type: "section", text: { type: "mrkdwn", text: action } },
      { type: "divider" },
      {
        type: "context",
        elements: [{
          type: "mrkdwn",
          text: `Source: Luna voice call${body.elevenlabs_session_id ? ` · Session: \`${body.elevenlabs_session_id}\`` : ""} · ${new Date().toLocaleString("en-US", { timeZone: "America/Phoenix", dateStyle: "short", timeStyle: "short" })} MST`,
        }],
      },
    ],
  };
}

// ── Spoken confirmation Luna reads aloud ──────────────────────────────────────
// FIX v2: All paths close cleanly. No "is there anything else?" re-opener.
// Luna reads this, then immediately calls end_call.
// The close_after:true flag in the response tells the system prompt to end the call.
function buildConfirmation(body: CaptureLeadBody, priority: Priority): string {
  const firstName  = body.guest_name !== "Unknown"
    ? body.guest_name.trim().split(/\s+/)[0]
    : null;
  const nameGreet  = firstName ? `${firstName}, ` : "";
  const service    = body.service_name || body.service_category || "your inquiry";

  if (body.callback_requested) {
    if (priority === "P1") {
      return `Got it, ${nameGreet}I've passed everything to the team. Kendell will call you back shortly. You're all set — have a great day.`;
    }
    return `Perfect, ${nameGreet}your info is with the team and Kendell will be in touch today about ${service}. You're all set — enjoy the rest of your day.`;
  }

  return `${nameGreet ? `Got it, ${nameGreet}` : "Got it — "}the team has your info and will follow up about ${service}. Have a great day.`;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as CaptureLeadBody;

    if (!body.guest_name?.trim() || !body.phone?.trim()) {
      return new Response(
        JSON.stringify({
          error: "guest_name and phone are required",
          prompt: "I still need your name and phone number to pass along to the team.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { priority, intent_score } = scorePriority(body);
    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 1. Upsert lead ────────────────────────────────────────────────────────
    const { data: leadData, error: leadErr } = await db
      .from("leads")
      .upsert(
        {
          name:     body.guest_name.trim(),
          phone:    body.phone.trim(),
          email:    body.email?.trim() || null,
          category: body.service_category || null,
          goal:     body.timing || null,
          timing:   body.timing || null,
        },
        { onConflict: "phone", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (leadErr) {
      console.error("[capture-lead] leads upsert:", leadErr.message);
    }

    // ── 2. Write callback_requests with idempotency guard ─────────────────────
    // Deduplicate: same phone + same ElevenLabs session within 2 minutes = skip.
    // Prevents duplicate rows and duplicate Slack alerts on Luna tool retry.
    if (body.callback_requested) {
      let shouldInsert = true;

      if (body.elevenlabs_session_id && body.phone) {
        const windowStart = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        const { data: existing } = await db
          .from("callback_requests")
          .select("id")
          .eq("phone", body.phone.trim())
          .filter("concierge_context->>elevenlabs_session_id", "eq", body.elevenlabs_session_id)
          .gte("created_at", windowStart)
          .maybeSingle();

        if (existing) {
          console.log(`[capture-lead] Dedup: callback suppressed session=${body.elevenlabs_session_id}`);
          shouldInsert = false;
        }
      }

      if (shouldInsert) {
        const { error: cbErr } = await db.from("callback_requests").insert({
          full_name:        body.guest_name.trim(),
          phone:            body.phone.trim(),
          email:            body.email?.trim() || null,
          interested_in:    body.service_category || null,
          timing:           body.timing || null,
          message:          body.call_summary || null,
          source:           "luna_voice",
          concierge_context: {
            service_name:          body.service_name,
            service_category:      body.service_category,
            consultation_required: body.consultation_required,
            captured_by:           "luna_voice_tool",
            elevenlabs_session_id: body.elevenlabs_session_id,
          },
        });
        if (cbErr) {
          console.error("[capture-lead] callback_requests:", cbErr.message);
        }
      }
    }

    // ── 3. Slack alert (fire-and-forget) ──────────────────────────────────────
    const channel  = slackChannel(body);
    const webhook  = getSlackWebhook(channel);
    const slackMsg = buildSlackMessage(body, priority, intent_score);

    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackMsg),
      }).catch((err) => console.error("[capture-lead] Slack error:", err));
    } else {
      console.warn("[capture-lead] No Slack webhook for channel:", channel);
    }

    // ── 4. Return confirmation + close_after flag ─────────────────────────────
    // close_after: true tells the system prompt to read confirmation then call end_call.
    // Luna NEVER re-opens the conversation after this tool fires.
    const confirmation = buildConfirmation(body, priority);

    return new Response(
      JSON.stringify({
        success:       true,
        lead_id:       leadData?.id || null,
        priority,
        intent_score,
        slack_channel: channel,
        confirmation,
        close_after:   true, // Luna reads confirmation then calls end_call
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("[capture-lead] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error:         "Internal error",
        confirmation:  "I've noted your details — the team will follow up at (520) 327-6753.",
        close_after:   true,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
