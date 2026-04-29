import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Lightweight, fire-and-forget funnel event logger.
 * Writes a single row to public.funnel_events. Designed for high volume,
 * low value-per-event traffic — never blocks the client UX.
 *
 * Body: { funnel: string, step: string, session_id: string, source?: string, metadata?: object }
 *
 * NOTE: We intentionally accept anonymous traffic and store NO PII (no IP,
 * no user agent string, no auth context). The session_id is a client-generated
 * UUID stored only in sessionStorage so it dies with the tab.
 */

type TrackEventBody = {
  funnel?: string;
  step?: string;
  session_id?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

// Allowed funnels — keep this list tight so the table doesn't fill up with
// junk if a client typo happens. Add new funnels here intentionally.
const ALLOWED_FUNNELS = new Set(["hairstyle_preview"]);

// Per-funnel allowed step names. Same reasoning.
const ALLOWED_STEPS: Record<string, Set<string>> = {
  hairstyle_preview: new Set([
    "started",          // modal opened
    "upload_success",   // photo loaded successfully
    "upload_failed",    // photo failed (HEIC, too large, read error...)
    "style_selected",   // guest tapped a style tile
    "preview_shown",    // AI render delivered to the screen
    "preview_failed",   // generation errored
    "color_iterated",   // guest tried a different color on the preview
    "saved_look",       // guest saved a look
    "downloaded_look",  // guest downloaded the rendered look as PNG
    "converted",        // guest tapped "I love it" / "Book this look"
    "abandoned",        // modal closed before preview
  ]),
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const allowedOrigins = [
  "https://hush-salon.lovable.app",
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

  let body: TrackEventBody;
  try {
    body = (await req.json()) as TrackEventBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers,
    });
  }

  const funnel = String(body.funnel ?? "").trim();
  const step = String(body.step ?? "").trim();
  const sessionId = String(body.session_id ?? "").trim();

  if (!funnel || !step || !sessionId) {
    return new Response(
      JSON.stringify({ error: "funnel, step, and session_id are required" }),
      { status: 400, headers },
    );
  }
  if (!ALLOWED_FUNNELS.has(funnel)) {
    return new Response(JSON.stringify({ error: "Unknown funnel" }), {
      status: 400,
      headers,
    });
  }
  if (!ALLOWED_STEPS[funnel]?.has(step)) {
    return new Response(JSON.stringify({ error: "Unknown step for funnel" }), {
      status: 400,
      headers,
    });
  }

  // Defensive metadata size cap — never trust the client.
  let metadata: Record<string, unknown> = {};
  if (body.metadata && typeof body.metadata === "object") {
    try {
      const serialized = JSON.stringify(body.metadata);
      if (serialized.length <= 4096) {
        metadata = body.metadata;
      }
    } catch {
      /* ignore — metadata stays empty */
    }
  }

  const source = body.source ? String(body.source).slice(0, 32) : null;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await supabase.from("funnel_events").insert({
    funnel,
    step,
    session_id: sessionId.slice(0, 64),
    source,
    metadata,
  });

  if (error) {
    console.error("[track-event] insert failed:", error);
    // Still return 200 so the client doesn't retry — analytics shouldn't
    // block or noisy-up the user experience.
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});