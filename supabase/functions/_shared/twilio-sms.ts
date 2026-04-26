/**
 * Shared Twilio SMS helper — guest confirmations
 *
 * - E.164 normalization (US default +1)
 * - 5-minute idempotency check via sms_send_log
 * - Calls Twilio via Lovable connector gateway
 * - Logs every attempt to sms_send_log
 *
 * Non-blocking by design — callers should wrap in EdgeRuntime.waitUntil
 * so SMS sends never delay the user-facing response.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

export interface SendGuestSmsParams {
  to: string;
  body: string;
  idempotencyKey: string;
  relatedTable?: string;
  relatedId?: string;
}

export interface SendGuestSmsResult {
  ok: boolean;
  status: "sent" | "failed" | "suppressed";
  twilioSid?: string;
  error?: string;
}

/**
 * Normalize a phone number to E.164.
 * - Strips non-digits
 * - 10-digit numbers → +1XXXXXXXXXX (US default)
 * - 11-digit starting with 1 → +1XXXXXXXXXX
 * - Already-prefixed (+...) numbers passed through after digit cleanup
 */
export function normalizeE164(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  // Fallback: assume already includes country code
  if (digits.length >= 11) return `+${digits}`;
  return null;
}

export async function sendGuestSms(
  params: SendGuestSmsParams
): Promise<SendGuestSmsResult> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { ok: false, status: "failed", error: "Supabase env not configured" };
  }
  if (!LOVABLE_API_KEY) {
    return { ok: false, status: "failed", error: "LOVABLE_API_KEY missing" };
  }
  if (!TWILIO_API_KEY) {
    return { ok: false, status: "failed", error: "TWILIO_API_KEY missing (connector not linked)" };
  }
  if (!TWILIO_FROM_NUMBER) {
    return { ok: false, status: "failed", error: "TWILIO_FROM_NUMBER missing" };
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const to = normalizeE164(params.to);
  if (!to) {
    return { ok: false, status: "failed", error: `Invalid phone: ${params.to}` };
  }

  // 5-minute idempotency check
  const windowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: existing } = await db
    .from("sms_send_log")
    .select("id, twilio_sid, status")
    .eq("idempotency_key", params.idempotencyKey)
    .gte("created_at", windowStart)
    .in("status", ["sent", "queued"])
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[twilio-sms] Idempotent skip: ${params.idempotencyKey}`);
    return {
      ok: true,
      status: "sent",
      twilioSid: existing[0].twilio_sid ?? undefined,
    };
  }

  // Insert queued row
  await db.from("sms_send_log").insert({
    phone: to,
    body: params.body,
    idempotency_key: params.idempotencyKey,
    status: "queued",
    related_table: params.relatedTable ?? null,
    related_id: params.relatedId ?? null,
  });

  try {
    const formBody = new URLSearchParams({
      To: to,
      From: TWILIO_FROM_NUMBER,
      Body: params.body,
    });

    const resp = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const errMsg = `Twilio ${resp.status}: ${JSON.stringify(data)}`;
      console.error("[twilio-sms] send failed:", errMsg);
      await db.from("sms_send_log").insert({
        phone: to,
        body: params.body,
        idempotency_key: `${params.idempotencyKey}-err-${Date.now()}`,
        status: "failed",
        error_message: errMsg.slice(0, 500),
        related_table: params.relatedTable ?? null,
        related_id: params.relatedId ?? null,
      });
      return { ok: false, status: "failed", error: errMsg };
    }

    const sid = (data as { sid?: string }).sid;
    await db.from("sms_send_log").insert({
      phone: to,
      body: params.body,
      idempotency_key: `${params.idempotencyKey}-ok`,
      status: "sent",
      twilio_sid: sid ?? null,
      related_table: params.relatedTable ?? null,
      related_id: params.relatedId ?? null,
    });

    console.log(`[twilio-sms] sent sid=${sid} to=${to}`);
    return { ok: true, status: "sent", twilioSid: sid };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[twilio-sms] exception:", errMsg);
    await db.from("sms_send_log").insert({
      phone: to,
      body: params.body,
      idempotency_key: `${params.idempotencyKey}-exc-${Date.now()}`,
      status: "failed",
      error_message: errMsg.slice(0, 500),
      related_table: params.relatedTable ?? null,
      related_id: params.relatedId ?? null,
    });
    return { ok: false, status: "failed", error: errMsg };
  }
}
