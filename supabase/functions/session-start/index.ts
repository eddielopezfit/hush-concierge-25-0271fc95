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
    const { fingerprint, concierge_context, channel, first_name } = await req.json();

    if (!fingerprint || typeof fingerprint !== "string") {
      return new Response(
        JSON.stringify({ error: "fingerprint is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    // Upsert guest profile by fingerprint
    const { data: existing } = await db
      .from("guest_profiles")
      .select("id, visit_count")
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    let guestProfileId: string;
    let visitCount: number;
    let isReturning: boolean;

    if (existing) {
      visitCount = existing.visit_count + 1;
      isReturning = true;
      guestProfileId = existing.id;

      await db
        .from("guest_profiles")
        .update({
          visit_count: visitCount,
          is_returning: true,
          first_name: first_name || undefined,
          last_context: concierge_context || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", guestProfileId);
    } else {
      visitCount = 1;
      isReturning = false;

      const { data: newProfile, error: insertErr } = await db
        .from("guest_profiles")
        .insert({
          fingerprint,
          first_name: first_name || null,
          last_context: concierge_context || null,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      guestProfileId = newProfile.id;
    }

    // Create conversation
    const { data: convo, error: convoErr } = await db
      .from("conversations")
      .insert({
        guest_profile_id: guestProfileId,
        channel: channel || "chat",
        status: "active",
        concierge_context: concierge_context || null,
      })
      .select("id")
      .single();

    if (convoErr) throw convoErr;

    // Also persist to legacy sessions table for backward compat
    if (concierge_context) {
      await db.from("sessions").insert({ context: concierge_context }).catch(() => {});
    }

    return new Response(
      JSON.stringify({
        conversation_id: convo.id,
        guest_profile_id: guestProfileId,
        is_returning: isReturning,
        visit_count: visitCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("session-start error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
