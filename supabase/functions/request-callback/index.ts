/**
 * request-callback — Luna voice tool endpoint
 *
 * Purpose: Dedicated tool for when a guest explicitly requests a callback,
 * wants a consultation booked, or has confirmed their contact information
 * and is ready to be connected with the team.
 *
 * Why separate from capture_lead:
 *   - capture_lead = "I have your info" — general lead capture, any stage
 *   - request_callback = "Someone will call you back" — explicit handoff commitment
 *
 * A request_callback always:
 *   - Creates a callback_requests record (never skipped)
 *   - Routes to #hush-callbacks Slack channel (always)
 *   - Fires P1 if same-day or urgency is high
 *   - Returns a specific spoken commitment Luna makes to the caller
 *   - Sets close_after: true — Luna closes the call immediately after
 *
 * Idempotency: same (phone + session_id) within 5 minutes = suppressed.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_WEBHOOK    = Deno.env.get("SLACK_WEBHOOK_URL");
const CALLBACKS_HOOK   = Deno.env.get("SLACK_WEBHOOK_URL_CALLBACKS") || SLACK_WEBHOOK;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface RequestCallbackBody {
  guest_name:             string;   // required
  phone:                  string;   // required
  email?:                 string;
  service_category?:      string;   // hair | nails | lashes | skincare | massage
  service_name?:          string;   // specific service e.g. "balayage consultation"
  timing?:                string;   // today | this week | planning
  urgency?:               string;   // high | medium | low
  consultation_required?: boolean;
  preferred_fit?:         string;   // any stylist preference expressed by guest
  call_summary?:          string;   // 1-2 sentence briefing for the front desk
  elevenlabs_session_id?: string;
}

type Priority = "P1" | "P2" | "P3";

// ── Priority ──────────────────────────────────────────────────────────────────
function derivePriority(body: RequestCallbackBody): Priority {
  if (body.timing === "today" || body.urgency === "high") return "P1";
  if (body.timing === "this week" || body.urgency === "medium") return "P2";
  return "P3";
}

// ── Booking path by category ──────────────────────────────────────────────────
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

// ── Slack Block Kit ───────────────────────────────────────────────────────────
function buildSlackMessage(body: RequestCallbackBody, priority: Priority): object {
  const emoji: Record<Priority, string> = { P1: "🔴", P2: "🟠", P3: "🟡" };
  const label: Record<Priority, string> = { P1: "HIGH PRIORITY", P2: "MEDIUM", P3: "STANDARD" };

  const action =
    priority === "P1"
      ? "🚨 *Action:* @Kendell — Call within 10 minutes"
      : priority === "P2"
      ? "⏰ *Action:* @Kendell — Call back today"
      : "📋 *Action:* @Kendell — Schedule callback";

  const flags: string[] = ["📞 Guest requested a callback — Luna made the commitment"];
  if (body.consultation_required) flags.push("⚠️ Consultation required — no pricing until consult");
  if (body.timing === "today")     flags.push("🔥 Same-day urgency — check availability now");
  if (body.preferred_fit)         flags.push(`👤 Stylist preference expressed: ${body.preferred_fit}`);

  const phoneDisplay = body.phone
    ? `<tel:${body.phone.replace(/\D/g, "")}|${body.phone}>`
    : "Not provided";

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji[priority]} ${label[priority]} — Callback Requested via Luna`,
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
          { type: "mrkdwn", text: `*Urgency:*\n${body.urgency || "standard"}` },
        ],
      },
      ...(body.call_summary ? [{
        type: "section",
        text: { type: "mrkdwn", text: `*Luna's briefing:*\n> ${body.call_summary}` },
      }] : []),
      {
        type: "section",
        text: { type: "mrkdwn", text: flags.join("\n") },
      },
      { type: "section", text: { type: "mrkdwn", text: action } },
      { type: "divider" },
      {
        type: "context",
        elements: [{
          type: "mrkdwn",
          text: `Luna callback commitment · ${new Date().toLocaleString("en-US", {
            timeZone: "America/Phoenix", dateStyle: "short", timeStyle: "short",
          })} MST${body.elevenlabs_session_id ? ` · Session: \`${body.elevenlabs_session_id}\`` : ""}`,
        }],
      },
    ],
  };
}

// ── Confirmation Luna speaks aloud ────────────────────────────────────────────
// Always closes cleanly. This is a commitment, not a question.
// Luna reads this, then calls end_call immediately.
function buildConfirmation(body: RequestCallbackBody, priority: Priority): string {
  const firstName = body.guest_name !== "Unknown"
    ? body.guest_name.trim().split(/\s+/)[0]
    : null;
  const nameGreet = firstName ? `${firstName}, ` : "";
  const service   = body.service_name || body.service_category || "what you're looking for";

  // Build timing commitment
  const timingCommitment =
    priority === "P1" || body.timing === "today"
      ? "within the next few minutes"
      : body.timing === "this week"
      ? "today or tomorrow"
      : "soon";

  // Consultation-specific close
  if (body.consultation_required) {
    return `${nameGreet}you're all set. Kendell will call you back ${timingCommitment} to set up your consultation for ${service}. They'll walk you through everything. Have a great day.`;
  }

  return `${nameGreet}you're all set. The team will call you back ${timingCommitment} about ${service}. Looking forward to seeing you at Hush — have a great day.`;
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
    const body = (await req.json()) as RequestCallbackBody;

    if (!body.guest_name?.trim() || !body.phone?.trim()) {
      return new Response(
        JSON.stringify({
          error:  "guest_name and phone are required",
          prompt: "I still need your name and phone number to confirm the callback.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const priority = derivePriority(body);
    const db       = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 1. Idempotency check — 5-minute window ────────────────────────────────
    // A callback commitment made within the same session should never fire twice.
    let alreadyCommitted = false;
    if (body.elevenlabs_session_id && body.phone) {
      const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: existing } = await db
        .from("callback_requests")
        .select("id")
        .eq("phone", body.phone.trim())
        .filter("concierge_context->>elevenlabs_session_id", "eq", body.elevenlabs_session_id)
        .gte("created_at", windowStart)
        .maybeSingle();

      if (existing) {
        console.log(`[request-callback] Dedup: already committed session=${body.elevenlabs_session_id}`);
        alreadyCommitted = true;
      }
    }

    // ── 2. Write callback_requests ────────────────────────────────────────────
    if (!alreadyCommitted) {
      const { error: cbErr } = await db.from("callback_requests").insert({
        full_name:        body.guest_name.trim(),
        phone:            body.phone.trim(),
        email:            body.email?.trim() || null,
        interested_in:    body.service_category || null,
        timing:           body.timing || null,
        message:          body.call_summary || body.preferred_fit
                            ? `${body.call_summary || ""}${body.preferred_fit ? ` Stylist preference: ${body.preferred_fit}` : ""}`
                            : null,
        source:           "luna_voice_callback",
        status:           "new",
        concierge_context: {
          service_name:          body.service_name,
          service_category:      body.service_category,
          consultation_required: body.consultation_required,
          preferred_fit:         body.preferred_fit,
          urgency:               body.urgency,
          captured_by:           "request_callback_tool",
          elevenlabs_session_id: body.elevenlabs_session_id,
        },
      });
      if (cbErr) {
        console.error("[request-callback] callback_requests:", cbErr.message);
      }

      // Also upsert leads for CRM completeness
      await db.from("leads").upsert(
        {
          name:     body.guest_name.trim(),
          phone:    body.phone.trim(),
          email:    body.email?.trim() || null,
          category: body.service_category || null,
          timing:   body.timing || null,
        },
        { onConflict: "phone", ignoreDuplicates: false }
      ).catch((e: Error) => console.error("[request-callback] leads upsert:", e.message));
    }

    // ── 3. Slack alert to #hush-callbacks (always this channel) ──────────────
    const slackMsg = buildSlackMessage(body, priority);
    if (!alreadyCommitted && CALLBACKS_HOOK) {
      fetch(CALLBACKS_HOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackMsg),
      }).catch((err) => console.error("[request-callback] Slack error:", err));
    }

    // ── 4. Return spoken commitment + close_after ─────────────────────────────
    const confirmation = buildConfirmation(body, priority);

    return new Response(
      JSON.stringify({
        success:       true,
        priority,
        slack_channel: "callbacks",
        already_committed: alreadyCommitted,
        confirmation,
        close_after:   true,
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error("[request-callback] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error:        "Internal error",
        confirmation: "I've made a note to have the team call you back — you can also reach us directly at (520) 327-6753.",
        close_after:  true,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
