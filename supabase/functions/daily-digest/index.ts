// Daily Slack digest — summarizes yesterday's leads + callbacks by category and status.
// Posts to SLACK_WEBHOOK_URL (#hush-leads). Triggered by pg_cron daily at 15:00 UTC (8am AZ).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Hair: ["hair", "color", "balayage", "highlight", "cut", "blowout", "extension", "keratin"],
  Nails: ["nail", "manicure", "pedicure", "gel", "dip"],
  Lashes: ["lash", "brow", "tint", "lamination"],
  Skin: ["skin", "facial", "peel", "esthetic", "wax"],
  Massage: ["massage", "bodywork", "deep tissue", "swedish"],
};

function categorize(text: string | null | undefined): string {
  if (!text) return "Other";
  const t = text.toLowerCase();
  for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keys.some((k) => t.includes(k))) return cat;
  }
  return "Other";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Phoenix",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const dryRun = url.searchParams.get("dryRun") === "true";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SLACK_URL = Deno.env.get("SLACK_WEBHOOK_URL");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Yesterday window (UTC for query simplicity)
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const labelDate = new Date(start.getTime());

    const [callbacksRes, leadsRes] = await Promise.all([
      supabase
        .from("callback_requests")
        .select("interested_in, message, status, created_at")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString()),
      supabase
        .from("leads")
        .select("category, goal, created_at")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString()),
    ]);

    if (callbacksRes.error) throw callbacksRes.error;
    if (leadsRes.error) throw leadsRes.error;

    const callbacks = callbacksRes.data ?? [];
    const leads = leadsRes.data ?? [];

    // Aggregate by category
    const byCategory: Record<string, { total: number; callbacks: number }> = {};
    const ensure = (c: string) => (byCategory[c] ??= { total: 0, callbacks: 0 });

    for (const cb of callbacks) {
      const cat = categorize(cb.interested_in || cb.message);
      ensure(cat).total++;
      ensure(cat).callbacks++;
    }
    for (const l of leads) {
      const cat = categorize(l.category || l.goal);
      ensure(cat).total++;
    }

    // Status counts (callbacks only)
    const statusCounts: Record<string, number> = {};
    for (const cb of callbacks) {
      const s = cb.status || "new";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    const totalLeads = callbacks.length + leads.length;
    const totalCallbacks = callbacks.length;
    const totalConverted = statusCounts["converted"] || 0;

    // Build Slack message
    const lines: string[] = [];
    lines.push(`📊 *Hush Daily Digest — ${formatDate(labelDate)}*`);
    lines.push(`_Yesterday's lead activity_`);
    lines.push("");
    lines.push(`*Total:* ${totalLeads} leads · ${totalCallbacks} callbacks · ${totalConverted} converted`);
    lines.push("");

    if (totalLeads === 0) {
      lines.push("_No new leads yesterday._");
    } else {
      lines.push("*By Category*");
      const order = ["Hair", "Nails", "Lashes", "Skin", "Massage", "Other"];
      for (const cat of order) {
        const v = byCategory[cat];
        if (!v || v.total === 0) continue;
        const cb = v.callbacks > 0 ? ` (${v.callbacks} callback${v.callbacks > 1 ? "s" : ""})` : "";
        lines.push(`• ${cat} — ${v.total}${cb}`);
      }

      if (totalCallbacks > 0) {
        lines.push("");
        lines.push("*Status*");
        const parts: string[] = [];
        if (statusCounts["new"]) parts.push(`🆕 New: ${statusCounts["new"]}`);
        if (statusCounts["contacted"]) parts.push(`📞 Contacted: ${statusCounts["contacted"]}`);
        if (statusCounts["converted"]) parts.push(`✅ Converted: ${statusCounts["converted"]}`);
        for (const [k, v] of Object.entries(statusCounts)) {
          if (!["new", "contacted", "converted"].includes(k)) parts.push(`${k}: ${v}`);
        }
        lines.push(parts.join(" · "));
      }

      lines.push("");
      lines.push("🔗 Full details in #hush-callbacks + dept channels");
    }

    const slackText = lines.join("\n");

    let slackPosted = false;
    if (SLACK_URL) {
      const r = await fetch(SLACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: slackText }),
      });
      slackPosted = r.ok;
      if (!r.ok) console.error("Slack post failed:", r.status, await r.text());
    } else {
      console.warn("SLACK_WEBHOOK_URL not set — skipping post");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        slackPosted,
        window: { start: start.toISOString(), end: end.toISOString() },
        totals: { leads: totalLeads, callbacks: totalCallbacks, converted: totalConverted },
        byCategory,
        statusCounts,
        preview: slackText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("daily-digest error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
