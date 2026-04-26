# Migrate Slack Ops to Lovable Slack Connector

You connected the official **Hush Salon and Spa** Slack workspace (bot mode). Right now all 5 edge functions still post through raw `SLACK_WEBHOOK_URL_*` incoming webhooks. Migrating to the connector unlocks real `@mention` pings, channel auto-discovery, and threading — the gaps flagged earlier.

## What changes

### 1. New shared helper: `supabase/functions/_shared/slack-client.ts`
- `postMessage({ channel, text, blocks?, thread_ts? })` → calls `https://connector-gateway.lovable.dev/slack/api/chat.postMessage` with `Authorization: Bearer ${LOVABLE_API_KEY}` + `X-Connection-Api-Key: ${SLACK_API_KEY}`.
- `resolveChannelId(name)` → paginated `conversations.list` lookup, cached in-memory per cold start (maps `hush-leads` → `C0XXXX`).
- `lookupUserIdByEmail(email)` → `users.lookupByEmail` for true `<@Uxxx>` mentions on P1 alerts.
- Graceful fallback: if `SLACK_API_KEY` is missing, fall back to the existing `SLACK_WEBHOOK_URL_*` path so nothing breaks mid-rollout.

### 2. Update `_shared/booking-rules.ts`
- Add a `SLACK_CHANNEL_NAMES` map: `callbacks → hush-callbacks`, `leads → hush-leads`, `nails → hush-nails`, `lashes → hush-lashes`, `skin → hush-skin`, `massage → hush-massage`, `hair → hush-hair` (new dedicated channel — closes the hair-fallback gap).
- Keep `getSlackMention()` but add an env-driven `SLACK_MENTION_EMAIL_<CHANNEL>` lookup so you can paste Kendell's email instead of hunting Slack user IDs. Helper resolves email → user ID once and caches.

### 3. Migrate the 5 callers to `slack-client.postMessage`
- `request-callback/index.ts` — P1 callback alerts → `hush-callbacks` with `<@Kendell>` mention.
- `capture-lead/index.ts` — category-routed lead alerts.
- `lead-qualify/index.ts` — enriched/scored alerts with priority emoji.
- `daily-digest/index.ts` — morning digest to `hush-leads`.
- `health-check/index.ts` — heartbeat ping; also add a "connector reachable" check that hits `/api/v1/verify_credentials`.

### 4. Optimization upgrades enabled by the connector
- **Real mobile pings**: P1 messages include `<@Uxxx>` (resolved from `KENDELL_SLACK_EMAIL` env var) so Kendell's phone actually buzzes.
- **Threaded follow-ups**: When `lead-qualify` enriches a lead that `capture-lead` already posted, reply in-thread (store `ts` in the `leads` row → new column `slack_message_ts text`) instead of double-posting.
- **Hair channel**: stop falling back to `#hush-leads`; route to `#hush-hair`.
- **Bot identity**: set `username: "Luna Concierge"` and `icon_emoji: ":sparkles:"` on every post for instant visual recognition.

### 5. Tests
- Extend `supabase/functions/_shared/` with a `slack-client.test.ts` covering: channel-name → ID resolution, mention email fallback chain, and webhook fallback when `SLACK_API_KEY` is unset.

### 6. DB migration
- Add `slack_message_ts text` to `public.leads` and `public.callbacks` for threading. Nullable, no backfill needed.

### 7. Env vars to add (I'll prompt you)
- `KENDELL_SLACK_EMAIL` — for P1 mention resolution.
- Optional per-category overrides: `SLACK_MENTION_EMAIL_NAILS`, `_LASHES`, etc.

## What stays the same
- Existing `SLACK_WEBHOOK_URL_*` env vars remain as a safety net — the helper prefers the connector but falls back automatically. You can delete them later.
- All routing rules, priority scoring, and message copy in `booking-rules.ts` are unchanged.
- No frontend changes.

## Out of scope (ask separately if you want them)
- Two-way Slack interactions (buttons like "Mark contacted", slash commands) — those require a custom Slack app, not the connector.
- Slack Socket Mode / event subscriptions for replies back into the CRM.