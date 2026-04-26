/**
 * request-callback — Luna voice tool endpoint
 *
 * Now imports shared booking rules from _shared/booking-rules.ts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  derivePriority,
  getInternalBookingPath,
  getNextOpenWindow,
  PRIORITY_EMOJI,
  PRIORITY_LABEL,
  type Priority,
} from "../_shared/booking-rules.ts";
import { postMessage, resolveMention } from "../_shared/slack-client.ts";
import { sendGuestSms } from "../_shared/twilio-sms.ts";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface RequestCallbackBody {
  guest_name:             string;
  phone:                  string;
  email?:                 string;
  service_category?:      string;
  service_name?:          string;
  timing?:                string;
  urgency?:               string;
  consultation_required?: boolean;
  preferred_fit?:         string;
  call_summary?:          string;
  elevenlabs_session_id?: string;
}

// ── Priority (using shared derivePriority) ────────────────────────────────────
function deriveLocalPriority(body: RequestCallbackBody): Priority {
  // Map urgency string to timing format expected by shared function
  const timing = body.timing ?? (body.urgency === "high" ? "today" : body.urgency === "medium" ? "week" : null);
  return derivePriority(
    timing,
    true, // always callback_requested for this function
    body.consultation_required ?? false,
    70 // baseline intent for explicit callback requests
  );
}

// ── Slack Block Kit ───────────────────────────────────────────────────────────
async function buildSlackMessage(body: RequestCallbackBody, priority: Priority): Promise<{ text: string; blocks: unknown[] }> {
  const bookingPathDisplay = getInternalBookingPath(body.service_category);
  const mention = await resolveMention("callbacks");
  const action = priority === "P1"
    ? `🚨 *Action:* ${mention} — Call within 10 minutes`
    : `⏰ *Action:* ${mention} — Follow up today`;

  const flags: string[] = ["📞 Guest requested a callback — Luna made the commitment"];
  if (body.consultation_required) flags.push("⚠️ Consultation required — no pricing until consult");
  if (body.timing === "today")     flags.push("🔥 Same-day urgency — check availability now");
  if (body.preferred_fit)         flags.push(`👤 Stylist preference expressed: ${body.preferred_fit}`);

  const phoneDisplay = body.phone
    ? `<tel:${body.phone.replace(/\D/g, "")}|${body.phone}>`
    : "Not provided";

  return {
    text: `${PRIORITY_EMOJI[priority]} ${PRIORITY_LABEL[priority]} callback — ${body.guest_name} · ${body.phone} · ${body.service_name || body.service_category || "general"}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${PRIORITY_EMOJI[priority]} ${PRIORITY_LABEL[priority]} — Callback Requested via Luna`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${body.guest_name}` },
          { type: "mrkdwn", text: `*Phone:*\n${phoneDisplay}` },
          { type: "mrkdwn", text: `*Service:*\n${body.service_name || body.service_category || "General inquiry"}` },
          { type: "mrkdwn", text: `*Timing:*\n${body.timing || "Not specified"}` },
          { type: "mrkdwn", text: `*Booking Path:*\n${bookingPathDisplay}` },
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
function buildConfirmation(body: RequestCallbackBody, priority: Priority): string {
  const firstName = body.guest_name !== "Unknown"
    ? body.guest_name.trim().split(/\s+/)[0]
    : null;
  const nameGreet = firstName ? `${firstName}, ` : "";
  const service   = body.service_name || body.service_category || "what you're looking for";

  const timingCommitment =
    priority === "P1" || body.timing === "today"
      ? "within the next few minutes"
      : body.timing === "this week"
      ? "today or tomorrow"
      : "soon";

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

    const priority = deriveLocalPriority(body);
    const db       = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // ── 1. Idempotency check — 5-minute window ────────────────────────────────
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
    let cbId: string | null = null;
    if (!alreadyCommitted) {
      const newId = crypto.randomUUID();
      const { error: cbErr } = await db.from("callback_requests").insert({
        id:               newId,
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
      } else {
        cbId = newId;
      }

      // Also insert into leads for CRM completeness (manual dedup, no upsert)
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existingLead } = await db
        .from("leads")
        .select("id")
        .eq("phone", body.phone.trim())
        .gte("created_at", since24h)
        .limit(1);

      if (!existingLead?.length) {
        try {
          await db.from("leads").insert({
            name:     body.guest_name.trim(),
            phone:    body.phone.trim(),
            email:    body.email?.trim() || null,
            category: body.service_category || null,
            timing:   body.timing || null,
          });
        } catch (e) {
          console.error("[request-callback] leads insert:", (e as Error).message);
        }
      }
    }

    // ── 3. Slack alert to #hush-callbacks ──────────────────────────────────────
    if (!alreadyCommitted) {
      const { text, blocks } = await buildSlackMessage(body, priority);
      const result = await postMessage({ channelKey: "callbacks", text, blocks });
      if (!result.ok) {
        console.error("[request-callback] Slack send failed:", result.error, "via", result.via);
      } else if (result.ts && body.phone) {
        // Best-effort: stamp the freshly inserted callback row with the ts
        await db
          .from("callback_requests")
          .update({ slack_message_ts: result.ts })
          .eq("phone", body.phone.trim())
          .is("slack_message_ts", null);
      }

      // ── 3b. SMS confirmation to guest (non-blocking) ──────────────────────
      if (cbId && body.phone) {
        const firstName = body.guest_name !== "Unknown"
          ? body.guest_name.trim().split(/\s+/)[0]
          : null;
        const nextOpenWindow = getNextOpenWindow();
        const greet = firstName ? `Hi ${firstName} — ` : "Hi — ";
        const smsBody = `${greet}Hush Salon got your callback request. Kendell will reach out ${nextOpenWindow}. Reply STOP to opt out.`;
        // @ts-ignore EdgeRuntime is available in Deno Deploy
        EdgeRuntime.waitUntil(
          sendGuestSms({
            to: body.phone.trim(),
            body: smsBody,
            idempotencyKey: `callback-sms-${cbId}`,
            relatedTable: "callback_requests",
            relatedId: cbId,
          }).catch((e) => console.warn("[request-callback] SMS failed:", e))
        );
      }
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
