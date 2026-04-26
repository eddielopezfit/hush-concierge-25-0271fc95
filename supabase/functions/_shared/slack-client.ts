/**
 * Shared Slack client — Lovable Slack Connector (preferred) with webhook fallback.
 *
 * Connector route:
 *   POST https://connector-gateway.lovable.dev/slack/api/chat.postMessage
 *   Headers:
 *     Authorization:        Bearer ${LOVABLE_API_KEY}
 *     X-Connection-Api-Key: ${SLACK_API_KEY}
 *
 * If SLACK_API_KEY is not present, falls back to the legacy
 * SLACK_WEBHOOK_URL_<CHANNEL> / SLACK_WEBHOOK_URL incoming webhooks so
 * nothing breaks during rollout.
 *
 * Channel name → ID resolution and email → user ID lookup are cached in
 * memory for the lifetime of an edge function instance (cold-start scoped).
 */

const GATEWAY = "https://connector-gateway.lovable.dev/slack/api";
const BOT_USERNAME = "Luna Concierge";
const BOT_ICON = ":sparkles:";

/** Logical channel key → real Slack channel name. */
export const SLACK_CHANNEL_NAMES: Record<string, string> = {
  callbacks: "hush-callbacks",
  leads:     "hush-leads",
  nails:     "hush-nails",
  lashes:    "hush-lashes",
  skin:      "hush-skin",
  massage:   "hush-massage",
  hair:      "hush-hair",
  voice:     "hush-leads",
  health:    "hush-leads",
};

/** Allow per-channel name override via env: SLACK_CHANNEL_NAILS=#my-nails */
function resolveChannelName(channelKey: string): string {
  const envName = Deno.env.get(`SLACK_CHANNEL_${channelKey.toUpperCase()}`);
  if (envName) return envName.replace(/^#/, "");
  return SLACK_CHANNEL_NAMES[channelKey] || SLACK_CHANNEL_NAMES.leads;
}

// ── In-memory caches ────────────────────────────────────────────────────────
const channelIdCache = new Map<string, string>();        // name → C0XXXX
const userIdByEmailCache = new Map<string, string>();    // email → U0XXXX

function gatewayHeaders(): Record<string, string> | null {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const slack   = Deno.env.get("SLACK_API_KEY");
  if (!lovable || !slack) return null;
  return {
    "Authorization":        `Bearer ${lovable}`,
    "X-Connection-Api-Key": slack,
    "Content-Type":         "application/json",
  };
}

/** Resolve a channel name like "hush-leads" → "C0XXXX". Cached. */
export async function resolveChannelId(name: string): Promise<string | null> {
  const clean = name.replace(/^#/, "");
  if (clean.startsWith("C") && /^[A-Z0-9]{8,}$/.test(clean)) return clean; // already an ID
  if (channelIdCache.has(clean)) return channelIdCache.get(clean)!;

  const headers = gatewayHeaders();
  if (!headers) return null;

  let cursor = "";
  for (let page = 0; page < 20; page++) {
    const url = `${GATEWAY}/conversations.list?limit=200&types=public_channel,private_channel${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { method: "POST", headers });
    const json: any = await res.json().catch(() => ({}));
    if (!json.ok) {
      console.warn("[slack-client] conversations.list error:", json.error);
      return null;
    }
    for (const ch of json.channels ?? []) {
      if (ch.name && ch.id) channelIdCache.set(ch.name, ch.id);
    }
    if (channelIdCache.has(clean)) return channelIdCache.get(clean)!;
    cursor = json.response_metadata?.next_cursor || "";
    if (!cursor) break;
  }
  return null;
}

/** Look up a Slack user ID from email. Cached. Returns null if not found. */
export async function lookupUserIdByEmail(email: string): Promise<string | null> {
  const key = email.trim().toLowerCase();
  if (!key) return null;
  if (userIdByEmailCache.has(key)) return userIdByEmailCache.get(key)!;

  const headers = gatewayHeaders();
  if (!headers) return null;

  const res = await fetch(`${GATEWAY}/users.lookupByEmail?email=${encodeURIComponent(key)}`, {
    method: "POST",
    headers,
  });
  const json: any = await res.json().catch(() => ({}));
  if (!json.ok || !json.user?.id) {
    console.warn("[slack-client] users.lookupByEmail miss:", key, json.error);
    return null;
  }
  userIdByEmailCache.set(key, json.user.id);
  return json.user.id;
}

/**
 * Resolve a `<@Uxxx>` mention string for a channel.
 * Looks up SLACK_MENTION_EMAIL_<CHANNEL> → users.lookupByEmail.
 * Falls back to SLACK_MENTION_EMAIL_DEFAULT, then to plain "@Kendell".
 */
export async function resolveMention(channelKey: string): Promise<string> {
  const upper = channelKey.toUpperCase();
  const email =
    Deno.env.get(`SLACK_MENTION_EMAIL_${upper}`) ||
    Deno.env.get("SLACK_MENTION_EMAIL_DEFAULT") ||
    Deno.env.get("KENDELL_SLACK_EMAIL") ||
    "";
  if (email) {
    const uid = await lookupUserIdByEmail(email);
    if (uid) return `<@${uid}>`;
  }
  // Legacy raw-ID env (SLACK_MENTION_NAILS=U07ABC...)
  const raw = Deno.env.get(`SLACK_MENTION_${upper}`) || Deno.env.get("SLACK_MENTION_DEFAULT") || "";
  if (raw) {
    if (raw.startsWith("<")) return raw;
    if (/^[UWST][A-Z0-9]{6,}$/i.test(raw)) return `<@${raw}>`;
    return raw;
  }
  return "@Kendell";
}

// ── postMessage ─────────────────────────────────────────────────────────────

export interface PostMessageInput {
  /** Logical channel key — e.g. "callbacks", "nails". Mapped via SLACK_CHANNEL_NAMES. */
  channelKey: string;
  /** Optional plain-text fallback (used by mobile notifications & webhook fallback). */
  text?: string;
  /** Optional Block Kit blocks. */
  blocks?: unknown[];
  /** Optional thread_ts to reply in-thread. */
  thread_ts?: string;
}

export interface PostMessageResult {
  ok: boolean;
  ts?: string;
  channel?: string;
  error?: string;
  via: "connector" | "webhook" | "none";
}

export async function postMessage(input: PostMessageInput): Promise<PostMessageResult> {
  const channelName = resolveChannelName(input.channelKey);
  const headers = gatewayHeaders();

  // Preferred path: connector gateway
  if (headers) {
    const channelId = await resolveChannelId(channelName);
    if (!channelId) {
      console.warn("[slack-client] channel not found:", channelName, "— falling back to webhook");
    } else {
      const body: Record<string, unknown> = {
        channel: channelId,
        username: BOT_USERNAME,
        icon_emoji: BOT_ICON,
      };
      if (input.text) body.text = input.text;
      if (input.blocks) body.blocks = input.blocks;
      if (input.thread_ts) body.thread_ts = input.thread_ts;

      const res = await fetch(`${GATEWAY}/chat.postMessage`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const json: any = await res.json().catch(() => ({}));
      if (json.ok) {
        return { ok: true, ts: json.ts, channel: json.channel, via: "connector" };
      }
      console.error("[slack-client] chat.postMessage error:", json.error, "— falling back to webhook");
    }
  }

  // Fallback: legacy incoming webhook
  const webhookKey = `SLACK_WEBHOOK_URL_${input.channelKey.toUpperCase()}`;
  const webhook = Deno.env.get(webhookKey) || Deno.env.get("SLACK_WEBHOOK_URL");
  if (!webhook) {
    return { ok: false, error: "no SLACK_API_KEY and no webhook configured", via: "none" };
  }

  const payload: Record<string, unknown> = {
    username: BOT_USERNAME,
    icon_emoji: BOT_ICON,
  };
  if (input.text)   payload.text   = input.text;
  if (input.blocks) payload.blocks = input.blocks;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `webhook ${res.status}`, via: "webhook" };
    }
    return { ok: true, via: "webhook" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), via: "webhook" };
  }
}

/** Returns true if the connector is reachable and credentials valid. */
export async function verifyConnector(): Promise<{ ok: boolean; outcome?: string; error?: string }> {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const slack   = Deno.env.get("SLACK_API_KEY");
  if (!lovable || !slack) return { ok: false, error: "SLACK_API_KEY or LOVABLE_API_KEY missing" };
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/api/v1/verify_credentials", {
      method: "POST",
      headers: {
        "Authorization":        `Bearer ${lovable}`,
        "X-Connection-Api-Key": slack,
      },
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.message || `HTTP ${res.status}` };
    return { ok: json.outcome !== "failed", outcome: json.outcome, error: json.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Test-only export to reset caches between tests.
export const __testing__ = {
  resetCaches() {
    channelIdCache.clear();
    userIdByEmailCache.clear();
  },
};