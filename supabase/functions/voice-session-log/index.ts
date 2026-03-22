import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  detectCategory,
  detectUrgency,
  isHighIntent,
  getInternalBookingPath,
  getUrgencyAction,
} from "../_shared/booking-rules.ts";

// ── Environment ─────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-elevenlabs-signature",
  "Content-Type": "application/json",
};

// ── HMAC Verification ───────────────────────────────────────────────────────

async function verifyHMAC(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === signature.replace(/^sha256=/, "");
}

// ── Slack Voice Alert ───────────────────────────────────────────────────────

async function sendVoiceSlackAlert(
  conversationId: string,
  durationSecs: number,
  category: string | null,
  urgency: string,
  bookingPath: string,
  highIntent: boolean,
  messageCount: number
): Promise<void> {
  const voiceWebhook = Deno.env.get("SLACK_WEBHOOK_URL_VOICE") || SLACK_WEBHOOK_URL;
  if (!voiceWebhook) {
    console.warn("[voice-session-log] No Slack webhook configured, skipping alert");
    return;
  }

  const urgencyEmoji: Record<string, string> = {
    today: "🔴", week: "🟠", planning: "🟡", browsing: "⚪",
  };

  const actionText = getUrgencyAction(
    urgency === "today" ? "P1" : urgency === "week" ? "P2" : "P3"
  );

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🎙️ Voice Session Complete — ${category || "General"}`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Duration:*\n${Math.round(durationSecs / 60)}m ${durationSecs % 60}s` },
          { type: "mrkdwn", text: `*Messages:*\n${messageCount} turns` },
          { type: "mrkdwn", text: `*Urgency:*\n${urgencyEmoji[urgency] || "⚪"} ${urgency}` },
          { type: "mrkdwn", text: `*Category:*\n${category || "Unknown"}` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Booking Path:*\n${bookingPath}`,
        },
      },
      ...(highIntent ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: "⚡ *High intent detected* — lead-qualify triggered automatically.",
        },
      }] : []),
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: actionText,
        },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Conversation: \`${conversationId}\`` },
        ],
      },
    ],
  };

  try {
    const res = await fetch(voiceWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[voice-session-log] Slack error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[voice-session-log] Slack fetch error:", err);
  }
}

// ── Main Handler ────────────────────────────────────────────────────────────

interface ElevenLabsWebhookPayload {
  event_type?: string;
  conversation_id?: string;
  agent_id?: string;
  duration_seconds?: number;
  cost_credits?: number;
  transcript?: Array<{ role: string; message: string; timestamp?: number }>;
  metadata?: Record<string, unknown>;
  hush_conversation_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const rawBody = await req.text();

    if (WEBHOOK_SECRET) {
      const signature = req.headers.get("x-elevenlabs-signature");
      const valid = await verifyHMAC(rawBody, signature, WEBHOOK_SECRET);
      if (!valid) {
        console.warn("[voice-session-log] HMAC verification failed");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
    }

    const body = JSON.parse(rawBody) as ElevenLabsWebhookPayload;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const elSessionId = body.conversation_id;
    const durationSecs = body.duration_seconds ?? 0;
    const costCredits = body.cost_credits ?? 0;
    const transcript = body.transcript ?? [];

    let conversationId = body.hush_conversation_id ||
      (body.metadata?.hush_conversation_id as string) || null;

    if (!conversationId && elSessionId) {
      const { data: match } = await supabase
        .from("conversations")
        .select("id")
        .eq("elevenlabs_session_id", elSessionId)
        .limit(1)
        .maybeSingle();
      conversationId = match?.id ?? null;
    }

    if (!conversationId) {
      const { data: newConvo, error: createErr } = await supabase
        .from("conversations")
        .insert({
          channel: "voice",
          status: "completed",
          elevenlabs_session_id: elSessionId,
          el_duration_secs: durationSecs,
          el_cost_credits: costCredits,
          ended_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (createErr) throw createErr;
      conversationId = newConvo.id;
    } else {
      await supabase
        .from("conversations")
        .update({
          elevenlabs_session_id: elSessionId,
          el_duration_secs: durationSecs,
          el_cost_credits: costCredits,
        })
        .eq("id", conversationId);
    }

    if (transcript.length > 0) {
      const messageRows = transcript.map((line) => ({
        conversation_id: conversationId!,
        role: line.role === "agent" ? "assistant" : line.role === "user" ? "user" : "system",
        content: line.message,
        source: "voice",
      }));
      const { error: insertErr } = await supabase.from("messages").insert(messageRows);
      if (insertErr) console.error("[voice-session-log] message insert error:", insertErr.message);
    }

    // Use shared detection functions
    const fullTranscript = transcript.map((l) => `${l.role}: ${l.message}`).join("\n");
    const category = detectCategory(fullTranscript);
    const urgency = detectUrgency(fullTranscript);
    const bookingPath = getInternalBookingPath(category);
    const highIntent = isHighIntent(fullTranscript);

    await sendVoiceSlackAlert(
      conversationId!,
      durationSecs,
      category,
      urgency,
      bookingPath,
      highIntent,
      transcript.length
    );

    // Trigger session-summarize
    fetch(`${SUPABASE_URL}/functions/v1/session-summarize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation_id: conversationId }),
    }).catch((err) => console.error("[voice-session-log] session-summarize trigger error:", err));

    // If high intent, also trigger lead-qualify
    if (highIntent && conversationId) {
      fetch(`${SUPABASE_URL}/functions/v1/lead-qualify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          category,
          urgency,
          intent_score: 75,
          callback_requested: fullTranscript.toLowerCase().includes("call me") ||
            fullTranscript.toLowerCase().includes("callback"),
          source: "voice",
          summary: `Voice session (${Math.round(durationSecs / 60)}m) — ${category || "general"} inquiry`,
        }),
      }).catch((err) => console.error("[voice-session-log] lead-qualify trigger error:", err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversationId,
        messages_persisted: transcript.length,
        high_intent: highIntent,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[voice-session-log] error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
