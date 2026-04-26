# Set up Lovable Email + finish wiring instant guest confirmations

Twilio is connected. Now setting up the email half of the loop and wiring everything together end-to-end.

## Step 1: Open the email domain setup dialog
Trigger the `<lov-open-email-setup>` dialog so you can pick a sender domain.

**Recommendation for the demo:** use a domain you personally own or a Lovable-provided subdomain — NOT `hushsalontucson.com`. Reason: setting up `notify.hushsalontucson.com` requires NS record changes at the founders' registrar, which means asking them for DNS access *before* you've sold them. We'll swap to their real domain post-signing in 5 minutes.

The email will still display "Hush Salon Tucson" as the sender name and be fully Hush-branded — only the technical sender domain (in email headers, not visible during a sales conversation) changes.

## Step 2: Auto-run email infrastructure setup
Once the domain is selected, automatically call `email_domain--setup_email_infra` to provision the queue, tables, cron job, and `process-email-queue` function.

## Step 3: Auto-scaffold transactional email
Call `email_domain--scaffold_transactional_email` to create:
- `send-transactional-email` edge function
- `handle-email-unsubscribe` edge function
- `handle-email-suppression` edge function
- Sample template + registry

## Step 4: Build the two Hush-branded email templates
In `supabase/functions/_shared/transactional-email-templates/`:

**`callback-confirmation.tsx`** — for callback form + Luna voice callback:
- White body (#ffffff), gold accent (#C9A84C) header bar
- Playfair Display heading: "We've got your callback request"
- Body: "{name}, Kendell will reach out {nextOpenWindow}."
- "What happens next" section: 3 numbered steps
- Salon address: 4326 N Campbell Ave, Tucson AZ 85718
- Direct phone CTA: (520) 327-6753
- Hours table (verified hours from memory)
- `templateData`: `{ name, nextOpenWindow, category?, timing? }`

**`lead-capture-confirmation.tsx`** — for general leads from forms + Luna chat:
- Same brand styling
- Heading: "Thanks for reaching out, {name}"
- Body explains category-specific next step + timing
- Same address, phone, hours blocks
- `templateData`: `{ name, nextOpenWindow, category?, goal?, timing? }`

Register both in `registry.ts`.

## Step 5: Build the unsubscribe page in React
Create `src/pages/Unsubscribe.tsx` matching Hush dark warm-premium aesthetic:
- Reads `?token=` from URL
- Validates via GET to `handle-email-unsubscribe`
- Shows "Confirm Unsubscribe" button styled with gold accent
- Success/error states styled consistently with the rest of the site
- Add route to `App.tsx` at the path the scaffold tool returns

## Step 6: Build SMS infrastructure

### Migration: `sms_send_log` table
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

### Shared helper: `_shared/twilio-sms.ts`
- `sendGuestSms({ to, body, idempotencyKey, relatedTable?, relatedId? })`
- E.164 normalization (auto-prefix +1 for US numbers)
- 5-minute idempotency check against `sms_send_log`
- Calls Twilio gateway: `https://connector-gateway.lovable.dev/twilio/Messages.json`
- Logs every attempt (queued → sent/failed) to `sms_send_log`
- Reads `TWILIO_FROM_NUMBER` from env (you'll provide after this build)

### Shared helper: `_shared/booking-rules.ts` — add `getNextOpenWindow()`
Returns Tucson-local human strings for both SMS body and email template data:
- Sunday/Monday → `"Tuesday morning"`
- Tue/Thu before 7pm → `"within the hour"`
- Wed/Fri before 5pm → `"within the hour"`
- Sat before 4pm → `"within the hour"`
- After close on Tue–Fri → `"tomorrow morning"`
- Sat after close → `"Tuesday morning"`

## Step 7: Wire SMS + email into existing edge functions

### `request-callback/index.ts` (Luna voice + form callbacks)
After successful insert, fire both in parallel via `EdgeRuntime.waitUntil`:
- SMS: *"Hi {name} — Hush Salon got your callback request. Kendell will reach out {nextOpenWindow}. Reply STOP to opt out."*
- Email: `callback-confirmation` template
- Idempotency keys: `callback-sms-{row.id}`, `callback-email-{row.id}`

### `submit-lead/index.ts` (website forms)
- For `type: "callback"` → SMS + `callback-confirmation` email (same as above)
- For `type: "lead"` with phone → SMS + `lead-capture-confirmation` email
- For `type: "lead"` with email only → email only

### `capture-lead/index.ts` (Luna chat)
Same dual-trigger as `submit-lead`'s lead path.

All sends are non-blocking (`EdgeRuntime.waitUntil`) so the form response stays instant.

## Step 8: Deploy everything
- `request-callback`, `submit-lead`, `capture-lead` (modified)
- `send-transactional-email`, `process-email-queue`, `handle-email-unsubscribe`, `handle-email-suppression` (auto-deployed by scaffold)

## What I need from you during the build
1. **Email domain dialog** — pick a Lovable subdomain or your own personal domain (NOT `hushsalontucson.com`)
2. **`TWILIO_FROM_NUMBER` secret** — the verified Twilio sending number in E.164 format (e.g., `+15205551234`) — I'll request it after templates are built

## What happens after the build
- Test by submitting a callback yourself — your phone should buzz within ~5 seconds and a branded Hush email should arrive within ~10 seconds
- Post-signing: 5-min task to swap to `notify.hushsalontucson.com` once the founders give DNS access
- Recommendation: enable SMS Pumping Protection + US-only Geo Permissions in Twilio Console (I'll show you where after the build)

## Out of scope (intentionally)
- No marketing emails, drip sequences, or "we miss you" campaigns
- No GoHighLevel
- No changes to Slack routing (works as-is)
- No changes to Luna chat copy