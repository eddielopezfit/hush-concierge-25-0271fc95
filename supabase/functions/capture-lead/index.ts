/**
 * capture-lead — Luna voice tool endpoint
 *
 * Called by ElevenLabs during a voice call when Luna captures
 * a guest's contact information and intent.
 *
 * Responsibilities:
 *   1. Write to Supabase leads + callback_requests tables
 *   2. Score intent and route to correct Slack channel immediately
 *   3. Return confirmation text Luna can speak aloud
 *
 * This is the bridge that makes Luna operational — not just informational.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Environment ───────────────────────────────────────────────────────────────
const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_WEBHOOK_URL  = Deno.env.get("SLACK_WEBHOOK_URL");

// Channel-specific webhooks (fall back to default)
function getSlackWebhook(channel: string): string | null {
  return Deno.env.get(`SLACK_WEBHOOK_URL_${channel.toUpperCase()}`) || SLACK_WEBHOOK_URL || null;
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface CaptureLeadBody {
  guest_name:            string;           // required
  phone:                 string;           // required
  email?:                string;
  service_category?:     string;           // hair | nails | lashes | skincare | massage
  service_name?:         string;           // "balayage", "facial", "massage 90 min", etc.
  timing?:               string;           // today | this week | planning | browsing
  callback_requested?:   boolean;
  consultation_required?: boolean;
  call_summary?:         string;           // 1-2 sentences Luna writes mid-call
  elevenlabs_session_id?: string;
}

// ── Priority scoring ──────────────────────────────────────────────────────────
type Priority = "P1" | "P2" | "P3" | "P4";

function scorePriority(body: CaptureLeadBody): { priority: Priority; intent_score: number } {
  let score = 30; // baseline

  // Timing signals
  if (body.timing === "today")        score += 40;
  else if (body.timing === "this week") score += 20;
  else if (body.timing === "planning")  score += 10;

  // Explicit callback = highest intent
  if (body.callback_requested) score += 30;

  // Consultation-required services = high value
  if (body.consultation_required) score += 15;

  // Has complete contact info
  if (body.phone && body.guest_name !== "Unknown") score += 10;

  score = Math.min(score, 100);

  let priority: Priority;
  if (body.callback_requested || body.timing === "today" || score >= 80)         priority = "P1";
  else if (body.timing === "this week" || score >= 55)                            priority = "P2";
  else if (body.timing === "planning" || score >= 30)                             priority = "P3";
  else                                                                            priority = "P4";

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

function bookingPath(category: string | undefined): string {
  return BOOKING_PATHS[category?.toLowerCase() ?? ""] || BOOKING_PATHS.hair;
}

// ── Slack channel routing ─────────────────────────────────────────────────────
function slackChannel(body: CaptureLeadBody): string {
  if (body.callback_requested) return "callbacks";
  const cat = body.service_category?.toLowerCase();
  const channelMap: Record<string, string> = {
    nails:    "nails",
    lashes:   "lashes",
    skincare: "skin",
    massage:  "massage",
  };
  return channelMap[cat ?? ""] ?? "leads";
}

// ── Slack Block Kit message ───────────────────────────────────────────────────
function buildSlackMessage(body: CaptureLeadBody, priority: Priority, intent_score: number): object {
  const emoji: Record<Priority, string>  = { P1: "🔴", P2: "🟠", P3: "🟡", P4: "⚪" };
  const label: Record<Priority, string>  = { P1: "HIGH PRIORITY", P2: "MEDIUM", P3: "STANDARD", P4: "LOW" };

  const action = priority === "P1"
    ? "🚨 *Action:* @Kendell — Call within 10 minutes"
    : priority === "P2"
    ? "⏰ *Action:* @Kendell — Follow up today"
    : "📋 *Action:* @Kendell — Add to follow-up queue";

  const flags: string[] = [];
  if (body.consultation_required) flags.push("⚠️ Consultation required — no price until consult");
  if (body.timing === "today")     flags.push("🔥 Same-day — check availability now");
  else if (body.timing === "this week") flags.push("📅 Wants to book this week");
  if (body.callback_requested)    flags.push("📞 Explicitly requested a callback");

  // Format phone as tap-to-call
  const phoneDisplay = body.phone
    ? `<tel:${body.phone.replace(/\D/g,"")}|${body.phone}>` 
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
        text: {
          type: "mrkdwn",
          text: `*Luna's summary:*\n> ${body.call_summary}`,
        },
      }] : []),
      ...(flags.length > 0 ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: flags.join("\n"),
        },
      }] : []),
      {
        type: "section",
        text: { type: "mrkdwn", text: action },
      },
      {
        type: "divider",
      },
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
function buildConfirmation(body: CaptureLeadBody, priority: Priority): string {
  const name = body.guest_name !== "Unknown" ? ` for ${body.guest_name.split(" ")[0]}` : "";
  const service = body.service_name || body.service_category || "your inquiry";

  if (body.callback_requested) {
    if (priority === "P1") {
      return `Got it — I've passed everything along${name}. Kendell will call you back within the next few minutes. You're all set.`;
    }
    return `Perfect — I've got your info${name} and the team has been notified about ${service}. Kendell will be in touch today. Is there anything else I can help you with before we hang up?`;
  }

  return `I've captured everything${name} — the team has been notified about your interest in ${service}. Someone will follow up with you. Is there anything else I can answer for you?`;
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

    // Validate required fields
    if (!body.guest_name?.trim() || !body.phone?.trim()) {
      return new Response(
        JSON.stringify({
          error: "guest_name and phone are required",
          // Luna-readable: helps Luna understand what to collect first
          prompt: "I still need your name and phone number to pass along to the team."
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { priority, intent_score } = scorePriority(body);
    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 1. Write lead to DB ──────────────────────────────────────────────────
    const leadInsert = {
      name:     body.guest_name.trim(),
      phone:    body.phone.trim(),
      email:    body.email?.trim() || null,
      category: body.service_category || null,
      goal:     body.timing || null,
      timing:   body.timing || null,
    };

    const { data: leadData, error: leadErr } = await db
      .from("leads")
      .upsert(leadInsert, { onConflict: "phone", ignoreDuplicates: false })
      .select("id")
      .single();

    if (leadErr) {
      console.error("[capture-lead] leads upsert error:", leadErr.message);
      // Don't fail — continue to Slack
    }

    // ── 2. Write callback_request if explicitly requested ────────────────────
    if (body.callback_requested) {
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
        console.error("[capture-lead] callback_requests error:", cbErr.message);
      }
    }

    // ── 3. Send Slack alert immediately ──────────────────────────────────────
    const channel  = slackChannel(body);
    const webhook  = getSlackWebhook(channel);
    const slackMsg = buildSlackMessage(body, priority, intent_score);

    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackMsg),
      }).catch((err) => {
        console.error("[capture-lead] Slack error:", err);
      });
    } else {
      console.warn("[capture-lead] No Slack webhook configured for channel:", channel);
    }

    // ── 4. Return Luna-readable confirmation ─────────────────────────────────
    const confirmation = buildConfirmation(body, priority);

    return new Response(
      JSON.stringify({
        success:      true,
        lead_id:      leadData?.id || null,
        priority,
        intent_score,
        slack_channel: channel,
        // This is what Luna reads aloud:
        confirmation,
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("[capture-lead] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        // Graceful fallback — Luna can say this if the tool fails
        confirmation: "I've noted your details — the team will follow up with you shortly at (520) 327-6753.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
