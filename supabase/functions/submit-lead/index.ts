import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

      // Insert into callback_requests
      const { error: cbErr } = await db.from("callback_requests").insert({
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

      // Also insert into leads for backward compat
      try {
        await db.from("leads").insert({
          name: full_name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          category: interested_in || null,
          timing: timing || null,
        });
      } catch { /* ignore */ }

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

      const { error } = await db.from("leads").insert({
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
