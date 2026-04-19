
The user is delegating: I'll pick what gives them the most operational lift for the Hush team right now.

**Recommendation: Wire up real per-department Slack routing + a real @Kendell mention.**

Why this over the alternatives:
- Two-way Slack control is cool but heavy (custom Slack app, signing secret, event subscriptions, status sync) — not worth it until volume justifies it.
- End-to-end testing is valuable but only meaningful AFTER routing is fixed.
- Right now every lead dumps into one channel and "@Kendell" is plain text that pings nothing. That's the actual operational pain.

## What gets built

**1. Per-category Slack channels (5 new webhooks)**
Add 5 new runtime secrets, each pointing at a dedicated Slack channel:
- `SLACK_WEBHOOK_URL_CALLBACKS` → `#hush-callbacks` (P1 callbacks, all categories)
- `SLACK_WEBHOOK_URL_NAILS` → `#hush-nails`
- `SLACK_WEBHOOK_URL_LASHES` → `#hush-lashes`
- `SLACK_WEBHOOK_URL_SKIN` → `#hush-skin`
- `SLACK_WEBHOOK_URL_MASSAGE` → `#hush-massage`

Existing `SLACK_WEBHOOK_URL` stays as the fallback for `#hush-leads` (hair + uncategorized).

**2. Real Slack mentions**
Replace plain-text `@Kendell` with proper `<@USERID>` syntax that actually pings her phone. Need her Slack member ID (and optionally the nail/lash/skin/massage leads' IDs for their channels).

**3. Edge function update**
Update `supabase/functions/_shared/booking-rules.ts` + the lead-qualify / request-callback / capture-lead functions to:
- Pick the right webhook URL based on `resolveSlackChannel()` output
- Inject the correct user mention into the action line
- Fall back gracefully to `SLACK_WEBHOOK_URL` if a department webhook isn't set yet (no broken deploys)

## What I need from you (in chat, after approval)

Before I add the secrets, you'll need to:

**A. Create 5 Slack channels** in your workspace: `#hush-callbacks`, `#hush-nails`, `#hush-lashes`, `#hush-skin`, `#hush-massage`. (`#hush-leads` already exists as fallback.)

**B. Generate 5 incoming webhook URLs** — one per channel. In Slack: *Apps → Incoming Webhooks → Add to Slack → pick channel → copy URL.* Repeat 5x.

**C. Get Kendell's Slack member ID** (and optionally one lead per department). In Slack: click her profile → ⋯ More → *Copy member ID* (looks like `U07ABC1234`).

Once you paste those 6 values into chat, I'll add the secrets and ship the routing update in one pass.

## After it's live
One quick end-to-end test: submit a callback request through the Hub for each category, confirm each lands in the right channel with a working @Kendell ping.
