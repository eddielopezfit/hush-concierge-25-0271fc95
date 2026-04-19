
User confirmed the normalized secret names and asked to also add SLACK_MENTION_SKIN and SLACK_MENTION_MASSAGE for full symmetry. Code is already wired (booking-rules.ts reads `SLACK_MENTION_${CHANNEL}` and falls back to `SLACK_MENTION_DEFAULT`). Just need to request the secret values from the user.

## Plan: Request all 11 secrets in one batch

I'll request these 11 secrets (5 webhooks + 6 mentions, adding SKIN and MASSAGE per your suggestion):

**Webhook URLs** (paste the full `https://hooks.slack.com/services/...` URL from each channel's Incoming Webhook):
- `SLACK_WEBHOOK_URL_CALLBACKS` → `#hush-callbacks`
- `SLACK_WEBHOOK_URL_NAILS` → `#hush-nails`
- `SLACK_WEBHOOK_URL_LASHES` → `#hush-lashes`
- `SLACK_WEBHOOK_URL_SKIN` → `#hush-skin`
- `SLACK_WEBHOOK_URL_MASSAGE` → `#hush-massage`

**Slack member IDs** (paste raw ID like `U07ABC1234` — code auto-wraps in `<@...>`):
- `SLACK_MENTION_DEFAULT` → Kendell (fallback for any unspecified channel)
- `SLACK_MENTION_CALLBACKS` → Kendell (callback queue owner)
- `SLACK_MENTION_NAILS` → Nail dept lead (or repeat Kendell)
- `SLACK_MENTION_LASHES` → Allison Griessel
- `SLACK_MENTION_SKIN` → Skincare lead
- `SLACK_MENTION_MASSAGE` → Tammi

## Fallback behavior (already coded — no changes needed)
- Missing `SLACK_WEBHOOK_URL_*` → falls back to `SLACK_WEBHOOK_URL` (`#hush-leads`)
- Missing `SLACK_MENTION_*` → falls back to `SLACK_MENTION_DEFAULT` → falls back to plain text `@Kendell`

So you can leave any secret blank and nothing breaks. Safe to ship partial.

## After secrets are added
Quick end-to-end test: trigger one callback per category through the Hub, confirm each lands in the right channel with a working ping.
