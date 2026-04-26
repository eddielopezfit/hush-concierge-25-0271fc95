import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { sendGuestSms } from "../_shared/twilio-sms.ts";
import { getNextOpenWindow } from "../_shared/booking-rules.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Build the guest-facing SMS body. Kept short (<160 chars) and TCPA-friendly.
 */
function buildGuestSmsBody(params: {
  name: string | null;
  type: "callback" | "lead";
  nextOpenWindow: string;
}): string {
  const firstName = params.name?.trim().split(/\s+/)[0];
  const greet = firstName ? `Hi ${firstName} — ` : "Hi — ";
  if (params.type === "callback") {
    return `${greet}Hush Salon got your callback request. Kendell will reach out ${params.nextOpenWindow}. Reply STOP to opt out.`;
  }
  return `${greet}thanks for reaching out to Hush Salon. The team will follow up ${params.nextOpenWindow}. Reply STOP to opt out.`;
}

/**
 * Fire-and-forget welcome sequence: an immediate luxury welcome plus a
 * "Prepare for Your First Visit" guide from Luna. Both go through the
 * shared transactional email queue, so they're delivered serially within
 * a few moments of each other — a soft, two-touch sequence rather than a
 * single bulk send. Failures are swallowed: we never want email issues to
 * block lead/callback capture.
 */
async function sendWelcomeSequence(
  db: ReturnType<typeof createClient>,
  params: { email: string; name: string | null; leadId: string }
) {
  const { email, name, leadId } = params;
  const recipientEmail = email.trim().toLowerCase();
  if (!recipientEmail) return;

  const firstName = name?.trim().split(/\s+/)[0] || undefined;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sendUrl = `${supabaseUrl}/functions/v1/send-transactional-email`;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
  };

  try {
    // 1. Immediate welcome
    const welcomeRes = await fetch(sendUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        templateName: "welcome",
        recipientEmail,
        idempotencyKey: `welcome-${leadId}`,
        templateData: firstName ? { name: firstName } : {},
      }),
    });
    if (!welcomeRes.ok) {
      const txt = await welcomeRes.text();
      console.error("[submit-lead] welcome failed:", welcomeRes.status, txt);
    } else {
      console.log("[submit-lead] welcome OK");
    }

    // 2. Follow-up: prepare for first visit (queued right after — arrives
    // moments later in the same inbox)
    const nextRes = await fetch(sendUrl, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        templateName: "what-happens-next",
        recipientEmail,
        idempotencyKey: `what-happens-next-${leadId}`,
        templateData: firstName ? { name: firstName } : {},
      }),
    });
    if (!nextRes.ok) {
      const txt = await nextRes.text();
      console.error("[submit-lead] what-happens-next failed:", nextRes.status, txt);
    } else {
      console.log("[submit-lead] what-happens-next OK");
    }
  } catch (err) {
    console.warn("[submit-lead] welcome sequence failed:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type } = body; // "lead" | "callback"

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    if (type === "callback") {
      const { full_name, phone, email, interested_in, timing, message, source, concierge_context } = body;
      if (!full_name?.trim() || !phone?.trim()) {
        return new Response(
          JSON.stringify({ error: "full_name and phone are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Dedup: check for existing callback from this phone in the last 24 hours
      const windowStart24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existingCb } = await db
        .from("callback_requests")
        .select("id")
        .eq("phone", phone.trim())
        .gte("created_at", windowStart24h)
        .limit(1);

      if (existingCb && existingCb.length > 0) {
        console.log("[submit-lead] Duplicate callback suppressed for phone:", phone.trim());
        return new Response(
          JSON.stringify({ success: true, deduplicated: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert into callback_requests
      const cbId = crypto.randomUUID();
      const { error: cbErr } = await db.from("callback_requests").insert({
        id: cbId,
        full_name: full_name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        interested_in: interested_in || null,
        timing: timing || null,
        message: message?.trim() || null,
        source: source || "callback_form",
        concierge_context: concierge_context || {},
      });

      if (cbErr) {
        console.error("[submit-lead] callback_requests error:", cbErr.message);
        throw cbErr;
      }

      // Also insert into leads for unified tracking
      const { error: leadErr } = await db.from("leads").insert({
        name: full_name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        category: interested_in || null,
        timing: timing || null,
      });
      if (leadErr) {
        console.warn("[submit-lead] leads cross-write failed:", leadErr.message);
      }

      // Fire welcome sequence if we have an email
      if (email?.trim()) {
        await sendWelcomeSequence(db, {
          email: email.trim(),
          name: full_name,
          leadId: cbId,
        });
      }

      // Fire SMS confirmation (non-blocking)
      const nextOpenWindow = getNextOpenWindow();
      const smsBody = buildGuestSmsBody({
        name: full_name,
        type: "callback",
        nextOpenWindow,
      });
      // @ts-ignore EdgeRuntime is available in Deno Deploy
      EdgeRuntime.waitUntil(
        sendGuestSms({
          to: phone.trim(),
          body: smsBody,
          idempotencyKey: `callback-sms-${cbId}`,
          relatedTable: "callback_requests",
          relatedId: cbId,
        }).catch((e) => console.warn("[submit-lead] callback SMS failed:", e))
      );

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "lead") {
      const { name, phone, email, category, goal, timing } = body;
      // Require at least one contact method (phone or email)
      const hasPhone = phone?.trim();
      const hasEmail = email?.trim();
      if (!name?.trim() || (!hasPhone && !hasEmail)) {
        return new Response(
          JSON.stringify({ error: "name and at least one contact method (phone or email) are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Dedup: check for existing lead from this phone in the last 24 hours
      if (hasPhone) {
        const windowStart24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: existingLead } = await db
          .from("leads")
          .select("id")
          .eq("phone", hasPhone)
          .gte("created_at", windowStart24h)
          .limit(1);

        if (existingLead && existingLead.length > 0) {
          console.log("[submit-lead] Duplicate lead suppressed for phone:", hasPhone);
          return new Response(
            JSON.stringify({ success: true, deduplicated: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const leadId = crypto.randomUUID();
      const { error } = await db.from("leads").insert({
        id: leadId,
        name: name.trim(),
        phone: hasPhone || null,
        email: hasEmail || null,
        category: category || null,
        goal: goal || null,
        timing: timing || null,
      });

      if (error) {
        console.error("[submit-lead] leads error:", error.message);
        throw error;
      }

      // Fire welcome sequence if we have an email
      if (hasEmail) {
        await sendWelcomeSequence(db, {
          email: hasEmail,
          name: name,
          leadId,
        });
      }

      // Fire SMS confirmation if we have a phone (non-blocking)
      if (hasPhone) {
        const nextOpenWindow = getNextOpenWindow();
        const smsBody = buildGuestSmsBody({
          name,
          type: "lead",
          nextOpenWindow,
        });
        // @ts-ignore EdgeRuntime is available in Deno Deploy
        EdgeRuntime.waitUntil(
          sendGuestSms({
            to: hasPhone,
            body: smsBody,
            idempotencyKey: `lead-sms-${leadId}`,
            relatedTable: "leads",
            relatedId: leadId,
          }).catch((e) => console.warn("[submit-lead] lead SMS failed:", e))
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid type. Use 'lead' or 'callback'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("submit-lead error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
