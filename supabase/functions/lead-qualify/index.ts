import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// ── Operational Routing Rules ───────────────────────────────────────────────

type BookingPath = "front_desk" | "direct" | "consultation";
type Priority = "P1" | "P2" | "P3" | "P4";

interface RoutingRule {
  booking_path: BookingPath;
  action_owner: string;
  consultation_required?: boolean;
  direct_contacts?: string[];
}

const BOOKING_RULES: Record<string, RoutingRule> = {
  hair: {
    booking_path: "front_desk",
    action_owner: "Kendell / Front Desk",
    consultation_required: false,
  },
  nails: {
    booking_path: "direct",
    action_owner: "Nail Tech (direct)",
    direct_contacts: ["Anita (520) 591-0208", "Kelly (520) 488-7149", "Jackie (520) 501-6861"],
  },
  lashes: {
    booking_path: "direct",
    action_owner: "Allison (520) 250-6606",
    direct_contacts: ["Allison (520) 250-6606"],
  },
  skincare: {
    booking_path: "direct",
    action_owner: "Skincare Specialist (direct)",
    direct_contacts: ["Patty (520) 870-6048"],
  },
  massage: {
    booking_path: "direct",
    action_owner: "Tammi (520) 370-3018",
    direct_contacts: ["Tammi (520) 370-3018"],
  },
};

const CONSULTATION_SERVICES = [
  "balayage", "foilayage", "corrective color", "fantasy color",
  "block color", "extensions", "corrective",
];

function requiresConsultation(service: string | null): boolean {
  if (!service) return false;
  const lower = service.toLowerCase();
  return CONSULTATION_SERVICES.some((s) => lower.includes(s));
}

// ── FIX #3: Priority logic aligned with operational rules ───────────────────
function derivePriority(
  urgency: string | null,
  callbackRequested: boolean,
  consultationRequired: boolean,
  intentScore: number
): Priority {
  // Callbacks are always P1 — they explicitly asked for contact
  if (callbackRequested) return "P1";
  // Same-day urgency = P1
  if (urgency === "today") return "P1";
  // Consultation + this week = P1 (needs scheduling coordination)
  if (consultationRequired && urgency === "week") return "P1";
  // High intent score
  if (intentScore >= 80) return "P1";
  // This week or strong interest
  if (urgency === "week" || intentScore >= 60) return "P2";
  // Planning ahead
  if (urgency === "planning" || intentScore >= 40) return "P3";
  return "P4";
}

function deriveInternalRouting(
  category: string | null,
  service: string | null
): string {
  const cat = category?.toLowerCase() ?? "hair";
  const rule = BOOKING_RULES[cat] ?? BOOKING_RULES.hair;

  if (requiresConsultation(service)) {
    return `Route to Kendell for consultation booking. Service "${service}" requires in-person evaluation before pricing.`;
  }

  if (rule.booking_path === "direct" && rule.direct_contacts?.length) {
    return `Direct booking available: ${rule.direct_contacts.join(", ")}. Action owner: ${rule.action_owner}.`;
  }

  return `Route to Kendell / Front Desk at (520) 327-6753. Action owner: ${rule.action_owner}.`;
}

// ── FIX #1: Booking path display + consultation/urgency notes ───────────────
function formatBookingPathDisplay(rule: RoutingRule): string {
  if (rule.booking_path === "front_desk") {
    return "Call Front Desk: (520) 327-6753";
  }
  return rule.direct_contacts?.join(", ") ?? "Call Front Desk: (520) 327-6753";
}

// ── Slack Alert Formatting ──────────────────────────────────────────────────

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

function formatSlackMessage(lead: LeadPayload, priority: Priority): object {
  const cat = lead.category?.toLowerCase() ?? "unknown";
  const rule = BOOKING_RULES[cat] ?? BOOKING_RULES.hair;
  const routing = deriveInternalRouting(lead.category ?? null, lead.service ?? null);
  const bookingDisplay = formatBookingPathDisplay(rule);

  const priorityEmoji: Record<Priority, string> = {
    P1: "🔴", P2: "🟠", P3: "🟡", P4: "⚪",
  };

  // FIX #2: Urgency-based action instructions with Kendell ownership
  const urgencyAction = priority === "P1"
    ? "🚨 *Action:* @Kendell — Call within 10 minutes"
    : priority === "P2"
    ? "⏰ *Action:* @Kendell — Follow up today"
    : "📋 *Action:* @Kendell — Add to follow-up queue";

  // FIX #1: Consultation + urgency notes block
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
        text: `${priorityEmoji[priority]} ${priority} — New ${lead.callback_requested ? "Callback Request" : "Lead"}`,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Guest:*\n${lead.guest_name || "Unknown"}` },
        { type: "mrkdwn", text: `*Phone:*\n${lead.phone || "Not provided"}` },
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

async function sendSlackAlert(
  lead: LeadPayload,
  priority: Priority,
  channel: "callbacks" | "leads"
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("[lead-qualify] SLACK_WEBHOOK_URL not set, skipping Slack alert");
    return;
  }

  const channelWebhookKey = channel === "callbacks"
    ? "SLACK_WEBHOOK_URL_CALLBACKS"
    : "SLACK_WEBHOOK_URL_LEADS";
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
    // FIX #3: Pass consultationRequired to priority derivation
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

    // 3. Slack notifications — route by type
    const slackChannel = callbackRequested ? "callbacks" : "leads";
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
