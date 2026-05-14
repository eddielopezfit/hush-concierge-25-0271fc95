import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Channel = "chat" | "voice" | "text";

type SessionStartBody = {
  fingerprint?: string;
  concierge_context?: Record<string, unknown>;
  channel?: Channel;
  first_name?: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const allowedOrigins = [
  "https://hush-salon.lovable.app",
  "https://hushsalonandspamvp.life",
  "https://www.hushsalonandspamvp.life",
  "http://localhost:5173",
];

function getCorsHeaders(origin: string | null) {
  const isLovablePreview =
    !!origin &&
    (/^https:\/\/.*\.lovable\.app$/.test(origin) ||
      /^https:\/\/.*\.lovableproject\.com$/.test(origin));
  const allowed =
    !!origin && (allowedOrigins.includes(origin) || isLovablePreview);

  return {
    allowed,
    headers: {
      "Access-Control-Allow-Origin": allowed && origin ? origin : "null",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    },
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const { allowed, headers } = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: allowed ? 204 : 403 });
  }

  if (!allowed) {
    console.warn("[session-start] Blocked origin:", origin);
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  try {
    const body = (await req.json()) as SessionStartBody;
    const fingerprint = body.fingerprint?.trim();
    const channel = body.channel ?? "chat";
    const concierge_context = body.concierge_context ?? {};
    const first_name = body.first_name?.trim() || null;

    if (!fingerprint) {
      return new Response(JSON.stringify({ error: "fingerprint is required" }), {
        status: 400,
        headers,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: existingProfile } = await supabase
      .from("guest_profiles")
      .select("id, visit_count, first_name")
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    let guestProfileId: string;
    let visitCount = 1;
    let isReturning = false;

    if (existingProfile?.id) {
      visitCount = (existingProfile.visit_count ?? 0) + 1;
      isReturning = visitCount > 1;

      const { data: updatedProfile, error: updateErr } = await supabase
        .from("guest_profiles")
        .update({
          first_name: existingProfile.first_name ?? first_name,
          visit_count: visitCount,
          is_returning: isReturning,
          last_seen_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id)
        .select("id")
        .single();

      if (updateErr) throw updateErr;
      guestProfileId = updatedProfile.id;
    } else {
      const { data: newProfile, error: insertErr } = await supabase
        .from("guest_profiles")
        .insert({
          fingerprint,
          first_name,
          visit_count: 1,
          is_returning: false,
          last_seen_at: new Date().toISOString(),
          source: "quiz",
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      guestProfileId = newProfile.id;
    }

    const { data: conversation, error: convoErr } = await supabase
      .from("conversations")
      .insert({
        guest_profile_id: guestProfileId,
        channel,
        status: "active",
        concierge_context,
      })
      .select("id")
      .single();

    if (convoErr) throw convoErr;

    return new Response(
      JSON.stringify({
        conversation_id: conversation.id,
        guest_profile_id: guestProfileId,
        is_returning: isReturning,
        visit_count: visitCount,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[session-start] error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
});
