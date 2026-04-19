import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const notify = url.searchParams.get("notify") === "true";

  const startedAt = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const result: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, unknown>,
  };
  const checks = result.checks as Record<string, unknown>;

  // 1. DB connectivity — lightweight count query
  try {
    const dbStart = Date.now();
    const { error, count } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    checks.database = {
      ok: true,
      latency_ms: Date.now() - dbStart,
      conversations_total: count ?? 0,
    };
  } catch (e) {
    result.status = "degraded";
    checks.database = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // 2. Recent activity (last 24h) — leads + callbacks + conversations
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  try {
    const [leads, callbacks, convos] = await Promise.all([
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("callback_requests")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .gte("started_at", since),
    ]);
    checks.recent_activity_24h = {
      leads: leads.count ?? 0,
      callbacks: callbacks.count ?? 0,
      conversations: convos.count ?? 0,
    };
  } catch (e) {
    checks.recent_activity_24h = {
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // 3. Recent errors — conversations marked with outcome containing 'error' or status 'error'
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, status, outcome, started_at")
      .or("status.eq.error,outcome.ilike.%error%")
      .gte("started_at", since)
      .limit(20);
    if (error) throw error;
    checks.recent_errors_24h = {
      count: data?.length ?? 0,
      samples: (data ?? []).slice(0, 5),
    };
    if ((data?.length ?? 0) > 10) {
      result.status = result.status === "ok" ? "warning" : result.status;
    }
  } catch (e) {
    checks.recent_errors_24h = {
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // 4. Required secrets present
  const requiredSecrets = [
    "LOVABLE_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SLACK_WEBHOOK_URL",
  ];
  const missing = requiredSecrets.filter((k) => !Deno.env.get(k));
  checks.secrets = {
    ok: missing.length === 0,
    missing,
  };
  if (missing.length > 0 && result.status === "ok") {
    result.status = "warning";
  }

  result.total_latency_ms = Date.now() - startedAt;

  // Optional Slack alert when degraded (used by scheduled cron)
  let slackPosted = false;
  if (notify && result.status === "degraded") {
    const webhook = Deno.env.get("SLACK_WEBHOOK_URL");
    if (webhook) {
      try {
        const text =
          `🚨 *Hush health-check: DEGRADED*\n` +
          `Time: ${result.timestamp}\n` +
          "```" + JSON.stringify(checks, null, 2).slice(0, 2500) + "```";
        const r = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        slackPosted = r.ok;
      } catch (e) {
        console.error("[health-check] Slack post failed:", e);
      }
    }
  }
  result.slack_posted = slackPosted;

  return new Response(JSON.stringify(result, null, 2), {
    status: result.status === "degraded" ? 503 : 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
