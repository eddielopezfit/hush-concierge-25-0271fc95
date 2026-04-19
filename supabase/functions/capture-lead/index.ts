/**
 * capture-lead — Luna voice tool endpoint
 *
 * Now imports shared booking rules from _shared/booking-rules.ts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  derivePriority,
  resolveSlackChannel,
  getInternalBookingPath,
  PRIORITY_EMOJI,
  PRIORITY_LABEL,
  getUrgencyAction,
  type Priority,
} from "../_shared/booking-rules.ts";

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

// ── Priority scoring (uses shared derivePriority + local intent calc) ────────
function scorePriority(body: CaptureLeadBody): { priority: Priority; intent_score: number } {
  let score = 30;
  if (body.timing === "today")         score += 40;
  else if (body.timing === "this week") score += 20;
  else if (body.timing === "planning")  score += 10;
  if (body.callback_requested)         score += 30;
  if (body.consultation_required)      score += 15;
  if (body.phone && body.guest_name !== "Unknown") score += 10;
  score = Math.min(score, 100);

  const priority = derivePriority(
    body.timing ?? null,
    body.callback_requested ?? false,
    body.consultation_required ?? false,
    score
  );

  return { priority, intent_score: score };
}

// ── Slack Block Kit message ───────────────────────────────────────────────────
function buildSlackMessage(body: CaptureLeadBody, priority: Priority, intent_score: number, channel: string): object {
  const bookingPathDisplay = getInternalBookingPath(body.service_category);
  const action = getUrgencyAction(priority, channel);

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
          text: `${PRIORITY_EMOJI[priority]} ${PRIORITY_LABEL[priority]} — ${body.callback_requested ? "Callback Request" : "New Lead"} captured by Luna`,
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

// ── Spoken confirmation ──────────────────────────────────────────────────────
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
    // Note: leads.phone lacks a unique index — using manual dedup instead of upsert
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingLead } = await db
      .from("leads")
      .select("id")
      .eq("phone", body.phone.trim())
      .gte("created_at", since24h)
      .limit(1);

    if (!existingLead?.length) {
      const { error: leadErr } = await db.from("leads").insert({
        name:     body.guest_name.trim(),
        phone:    body.phone.trim(),
        email:    body.email?.trim() || null,
        category: body.service_category || null,
        goal:     body.timing || null,
        timing:   body.timing || null,
      });
      if (leadErr) console.error("[capture-lead] leads insert:", leadErr.message);
    }

    // ── 2. Write callback_requests with idempotency guard ─────────────────────
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
    const channel = resolveSlackChannel(body.service_category ?? null, body.callback_requested ?? false);
    const channelName = channel === "callbacks" ? "CALLBACKS" : channel.toUpperCase();
    const webhook = getSlackWebhook(channelName) || getSlackWebhook(channel);
    const slackMsg = buildSlackMessage(body, priority, intent_score, channel);

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
    const confirmation = buildConfirmation(body, priority);

    return new Response(
      JSON.stringify({
        success:       true,
        priority,
        intent_score,
        slack_channel: channel,
        confirmation,
        close_after:   true,
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
