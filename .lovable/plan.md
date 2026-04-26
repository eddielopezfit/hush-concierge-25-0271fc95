# Wire up the test mention email + verify P1 alerts buzz

## What you asked for
Use `leothedogamigo@gmail.com` as the test email (standing in for Kendell) so the connector resolves it to a real Slack user ID and `@mentions` them on P1 callback alerts.

## What I'll do

### 1. Add the runtime secret
Use the secrets tool to add:
- **`KENDELL_SLACK_EMAIL`** = `leothedogamigo@gmail.com`

This is the env var the new `slack-client.ts` helper already looks up via `resolveMention()` → `users.lookupByEmail` → returns `<@Uxxx>` formatted mention. Already implemented — just needs the value.

### 2. Confirm the email exists in your Slack workspace
Quick sanity check via the connector gateway (`users.lookupByEmail`) to make sure that email is actually a member of the Hush Salon and Spa workspace. If it's not, the mention silently falls back to plain `@Kendell` text (no push). If it fails, I'll flag it before we go further.

### 3. Redeploy the 3 functions that send mentions
- `request-callback` (P1 callback → `#hush-callbacks` with mention)
- `lead-qualify` (P1/P2 enriched leads with mention)
- `capture-lead` (initial alert, no mention but worth refreshing)

So they pick up the new env var immediately.

### 4. Live smoke test
Trigger a real callback request via `supabase--curl_edge_functions` → `POST /request-callback` with a test payload (name: "Smoke Test", phone, category: "callbacks"). Then verify in `#hush-callbacks`:
- Message lands via the connector (not legacy webhook)
- Includes a real `<@Uxxx>` mention that pings the Leo account on mobile
- Threading column `slack_message_ts` gets populated in `callback_requests`

I'll report back what landed and what didn't.

## What stays the same
- All routing logic, priority scoring, channel mapping, message copy — unchanged.
- When you're ready to swap in Kendell's real email later, it's a one-line secret update.

## Out of scope
- Per-category mention overrides (`SLACK_MENTION_EMAIL_NAILS`, etc.) — can layer on later if you want different specialists pinged for their category.
- Hair channel decision (`#hush-hair` vs `#hush-team`) — separate question, unblocked by this.
