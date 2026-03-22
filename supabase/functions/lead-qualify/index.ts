/**
 * lead-qualify — Lead scoring, Slack routing, CRM/SMS integration
 *
 * Now imports shared booking rules from _shared/booking-rules.ts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  requiresConsultation,
  derivePriority,
  resolveSlackChannel,
  getRoutingRule,
  getInternalBookingPath,
  deriveInternalRouting,
  PRIORITY_EMOJI,
  PRIORITY_LABEL,
  getUrgencyAction,
  type Priority,
  type SlackChannel,
} from "../_shared/booking-rules.ts";

// ── Environment ─────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
const GHL_WEBHOOK_URL = Deno.env.get("GHL_WEBHOOK_URL");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ── Types ───────────────────────────────────────────────────────────────────

interface LeadPayload {
  conversation_id?: string;
  guest_profile_id?: string;
  guest_name?: string;
  phone?: string;
  email?: string;
  category?: string;
  service?: string;
  urgency?: string;
  timing?: string;
  intent_score?: number;
  callback_requested?: boolean;
  consultation_required?: boolean;
  summary?: string;
  source?: string;
}

// ── Slack Alert Formatting ──────────────────────────────────────────────────

function formatSlackMessage(lead: LeadPayload, priority: Priority): object {
  const routing = deriveInternalRouting(lead.category ?? null, lead.service ?? null);
  const bookingDisplay = getInternalBookingPath(lead.category);
  const rule = getRoutingRule(lead.category);
  const urgencyAction = getUrgencyAction(priority);

  const notesLines: string[] = [];
  if (lead.consultation_required) {
    notesLines.push("⚠️ Consultation required before pricing.");
  } else {
    notesLines.push("✅ Direct booking available.");
  }
  if (lead.urgency === "today") {
    notesLines.push("🔥 Guest wants same-day service — check availability immediately.");
  } else if (lead.urgency === "week") {
    notesLines.push("📅 Guest wants to book this week.");
  }
  if (lead.callback_requested) {
    notesLines.push("📞 Guest explicitly requested a callback.");
  }

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${PRIORITY_EMOJI[priority]} ${PRIORITY_LABEL[priority]} — ${priority} — New ${lead.callback_requested ? "Callback Request" : "Lead"}`,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Guest:*\n${lead.guest_name || "Unknown"}` },
        { type: "mrkdwn", text: `*Phone:*\n${lead.phone || "Not provided"}` },
        { type: "mrkdwn", text: `*Email:*\n${lead.email || "Not provided"}` },
        { type: "mrkdwn", text: `*Category:*\n${lead.category || "Unknown"}` },
        { type: "mrkdwn", text: `*Service:*\n${lead.service || "General inquiry"}` },
        { type: "mrkdwn", text: `*Timing:*\n${lead.timing || "Not specified"}` },
        { type: "mrkdwn", text: `*Booking Path:*\n${bookingDisplay}` },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary:*\n${lead.summary || "No summary available."}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Notes:*\n${notesLines.join("\n")}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Internal Routing:*\n${routing}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: urgencyAction,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Source: ${lead.source || "concierge"} | Intent: ${lead.intent_score ?? "—"} | Action Owner: ${rule.action_owner}`,
        },
      ],
    },
  ];

  return { blocks };
}

// ── Slack Send ──────────────────────────────────────────────────────────────

async function sendSlackAlert(
  lead: LeadPayload,
  priority: Priority,
  channel: SlackChannel,
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("[lead-qualify] SLACK_WEBHOOK_URL not set, skipping Slack alert");
    return;
  }

  const channelWebhookKey = `SLACK_WEBHOOK_URL_${channel.toUpperCase()}`;
  const webhookUrl = Deno.env.get(channelWebhookKey) || SLACK_WEBHOOK_URL;

  const payload = formatSlackMessage(lead, priority);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[lead-qualify] Slack ${channel} error:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[lead-qualify] Slack ${channel} fetch error:`, err);
  }
}

// ── CRM Stub (GoHighLevel) ─────────────────────────────────────────────────

async function pushToCRM(lead: LeadPayload): Promise<void> {
  if (!GHL_API_KEY || !GHL_WEBHOOK_URL) {
    console.log("[lead-qualify] GHL not configured, skipping CRM push");
    return;
  }

  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify({
        name: lead.guest_name,
        phone: lead.phone,
        email: lead.email,
        tags: [lead.category, lead.service, lead.source].filter(Boolean),
        customFields: {
          intent_score: lead.intent_score,
          urgency: lead.urgency,
          service: lead.service,
          category: lead.category,
        },
      }),
    });
    if (!res.ok) {
      console.error("[lead-qualify] GHL push error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[lead-qualify] GHL fetch error:", err);
  }
}

// ── SMS Stub (Twilio) ───────────────────────────────────────────────────────

async function sendSmsFollowup(lead: LeadPayload): Promise<void> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !lead.phone) {
    console.log("[lead-qualify] Twilio not configured or no phone, skipping SMS");
    return;
  }

  const body = `Hi ${lead.guest_name || "there"}! Thanks for your interest in Hush Salon & Day Spa. ` +
    `Our team will be in touch shortly to help with your ${lead.service || lead.category || "beauty"} needs. ` +
    `Questions? Call us at (520) 327-6753. — Luna 💜`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: lead.phone,
          From: TWILIO_FROM_NUMBER,
          Body: body,
        }),
      }
    );
    if (!res.ok) {
      console.error("[lead-qualify] Twilio error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[lead-qualify] Twilio fetch error:", err);
  }
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lead = (await req.json()) as LeadPayload;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const intentScore = lead.intent_score ?? 50;
    const callbackRequested = lead.callback_requested ?? false;
    const consultationRequired = lead.consultation_required ?? requiresConsultation(lead.service ?? null);
    const priority = derivePriority(lead.urgency ?? null, callbackRequested, consultationRequired, intentScore);

    const enrichedLead: LeadPayload = {
      ...lead,
      intent_score: intentScore,
      callback_requested: callbackRequested,
      consultation_required: consultationRequired,
    };

    // 1. Update guest_profiles.intent_score
    if (lead.guest_profile_id) {
      await supabase
        .from("guest_profiles")
        .update({ intent_score: intentScore })
        .eq("id", lead.guest_profile_id)
        .then(({ error }) => {
          if (error) console.error("[lead-qualify] guest_profiles update error:", error.message);
        });
    }

    // 2. Insert into leads with 24h dedup
    if (lead.phone || lead.email) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", lead.phone ?? "")
        .eq("category", lead.category ?? "")
        .gte("created_at", since)
        .limit(1);

      if (!existing?.length) {
        await supabase.from("leads").insert({
          name: lead.guest_name,
          phone: lead.phone,
          email: lead.email,
          category: lead.category,
          goal: lead.service,
          timing: lead.timing,
        });
      } else {
        console.log("[lead-qualify] Duplicate lead suppressed for", lead.phone);
      }
    }

    // 3. Slack notifications — route by category + type
    const slackChannel = resolveSlackChannel(lead.category ?? null, callbackRequested);
    await sendSlackAlert(enrichedLead, priority, slackChannel);

    // 4. CRM push (stub)
    await pushToCRM(enrichedLead);

    // 5. SMS follow-up for P1/P2
    if (priority === "P1" || priority === "P2") {
      await sendSmsFollowup(enrichedLead);
    }

    return new Response(
      JSON.stringify({
        success: true,
        priority,
        callback_requested: callbackRequested,
        consultation_required: consultationRequired,
        crm_pushed: !!GHL_API_KEY,
        sms_sent: !!(TWILIO_ACCOUNT_SID && (priority === "P1" || priority === "P2")),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[lead-qualify] error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
