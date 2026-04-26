
# Full Build: Instant Guest Confirmations (SMS + Email)

Closes the "what happens after I submit?" trust gap by sending an instant SMS and a branded email to every guest who submits a callback request or lead. Both channels respect Tucson hours and tell guests exactly when to expect Kendell to reach back out.

## What guests will experience

**Sunday 9pm — guest fills out callback form:**
1. Form confirms instantly on screen (already works)
2. **~3 seconds later:** SMS arrives — *"Hi Sarah — Hush Salon got your callback request. We're closed Sun/Mon, so Kendell will reach out Tuesday morning. Reply STOP to opt out."*
3. **~10 seconds later:** Branded Hush email lands — header in Playfair gold, body explaining what to expect, salon address, hours, and direct phone fallback.

**Tuesday 2pm — guest fills out form:**
1. SMS: *"Hi Sarah — Hush Salon got your request. Kendell will call you within the hour."*
2. Branded email confirming the same.

## Architecture

### 1. Connect Twilio (gateway)
- Use `standard_connectors--connect` with `connector_id: "twilio"` to link a Twilio connection. User picks the from-number during the connect dialog.
- Removes need for manual `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` secrets — gateway handles auth.
- Add new project secret: `TWILIO_FROM_NUMBER` (the verified Hush sending number, E.164 format).

### 2. Set up Lovable Email infrastructure
- Show email domain setup dialog (suggest `notify.hushsalontucson.com` as the subdomain — user can change).
- Once user completes domain setup → automatically run `email_domain--setup_email_infra` → automatically scaffold transactional emails via `email_domain--scaffold_transactional_email`.
- Build the `/unsubscribe` page in the React app at the path the scaffold tool returns (matched to Hush's dark warm-premium design).

### 3. Shared helper: `_shared/booking-rules.ts`
Add `getNextOpenWindow()` that returns Tucson-local human-readable strings:
- Sunday → `"Tuesday morning"`
- Monday → `"Tuesday morning"`
- Tue–Fri before close → `"within the hour"`
- Tue–Fri after close → `"tomorrow morning"`
- Saturday after close → `"Tuesday morning"`

Used by both SMS body and email template data.

### 4. New shared helper: `_shared/twilio-sms.ts`
Single `sendGuestSms({ to, body })` function:
- Validates E.164 format, normalizes US numbers (+1 prefix)
- Calls Twilio gateway (`https://connector-gateway.lovable.dev/twilio/Messages.json`)
- Handles SMS Pumping fraud protection (recommends user enable in Twilio Console after build)
- Logs send attempts to a new `sms_send_log` table for audit/debugging
- Idempotency: skip if a successful SMS to the same phone for the same `idempotency_key` was sent within 5 minutes

### 5. New transactional email templates
Located in `supabase/functions/_shared/transactional-email-templates/`:
- `callback-confirmation.tsx` — for `request-callback` and the website callback form
- `lead-capture-confirmation.tsx` — for general lead submissions from `submit-lead` and `capture-lead`

Both styled to match Hush brand:
- White email body (required)
- Gold accent (`#C9A84C`) for headers and CTA bar
- Playfair Display headings, system fallback for body
- Salon address, "What happens next" section, direct phone `(520) 327-6753`
- `templateData` props: `{ name, nextOpenWindow, category?, timing? }`

### 6. Trigger SMS + email from edge functions

**`request-callback/index.ts`** (called by Luna voice + form):
- After successful DB insert → fire SMS + email in parallel (non-blocking — wrap in `EdgeRuntime.waitUntil`)
- Idempotency keys: `callback-sms-{row.id}`, `callback-email-{row.id}`

**`submit-lead/index.ts`** (called by website forms — handles both `type: "callback"` and `type: "lead"`):
- For `callback` type → same SMS + callback-confirmation email as above
- For `lead` type with phone → SMS + lead-capture-confirmation email
- For `lead` type with email only → email only (no SMS)

**`capture-lead/index.ts`** (called by Luna chat):
- Same dual-trigger as `submit-lead`'s lead path

### 7. New database table: `sms_send_log`
```sql
create table public.sms_send_log (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  body text not null,
  idempotency_key text not null,
  twilio_sid text,
  status text not null check (status in ('queued','sent','failed','suppressed')),
  error_message text,
  related_table text,
  related_id uuid,
  created_at timestamptz not null default now()
);
create index sms_send_log_idem_idx on public.sms_send_log (idempotency_key, created_at desc);
create index sms_send_log_phone_idx on public.sms_send_log (phone, created_at desc);
alter table public.sms_send_log enable row level security;
-- No client policies — service role only.
```

### 8. Deploy
- `lead-qualify`, `request-callback`, `submit-lead`, `capture-lead`
- `send-transactional-email`, `process-email-queue`, `handle-email-unsubscribe`, `handle-email-suppression` (auto-deployed by scaffold)

## What I will need from you during the build

1. **Twilio connection** — pick or create one in the connector dialog when prompted, including a verified sending phone number.
2. **Email subdomain** — confirm `notify.hushsalontucson.com` (or pick another) when the email setup dialog appears, then add the NS records at your domain registrar.
3. **`TWILIO_FROM_NUMBER`** secret — the E.164 sending number after Twilio is connected.

Everything else is automated.

## What I will explicitly NOT do
- No marketing emails, no drip sequences, no "we miss you" campaigns
- No GoHighLevel integration
- No changes to Slack routing (keeps working as-is)
- No changes to Luna chat copy (already fixed in last build)
- No mass send loops — every confirmation is 1:1, triggered by a specific guest action

## Post-build recommendations
- Enable **SMS Pumping Protection** + restrict **SMS Geo Permissions** to US-only in your Twilio Console (I'll show you where after the build is live).
- Test by submitting a real callback yourself — phone should buzz within ~5 seconds.
