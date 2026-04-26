
# Pre-Demo Polish: Confirmation Copy + Conversion UX

Tightens the lead → callback → booking story so every guest touchpoint (SMS, email, success states, recommendation card) consistently sets the expectation that **the front desk reaches out to discuss and book** — never that an appointment is already scheduled. Also ships the highest-leverage UX fixes from the Comet audit.

---

## A. Confirmation copy alignment (the model fix)

### A1. Replace `first-visit-guide` email with a "What happens next" lead-nurture email
Current `first-visit-guide` says *"before you arrive"* and gives parking/cancellation tips — but it fires on lead capture, **before any booking exists**. Confusing for guests who haven't booked yet.

- New template: `supabase/functions/_shared/transactional-email-templates/what-happens-next.tsx`
  - Sets callback expectation explicitly: *"Kendell will reach out to discuss your goals, match you with the right artist, and find a time that works for you."*
  - Keeps the warmth and Luna voice
  - Removes parking/cancellation/early-arrival content (those belong in a true post-booking confirmation we don't have yet)
- Update `registry.ts` to swap `first-visit-guide` → `what-happens-next`
- Update `submit-lead/index.ts` to invoke the new template name (and use `what-happens-{leadId}` idempotency key)
- Redeploy `send-transactional-email` and `submit-lead`
- Leave the old `first-visit-guide.tsx` file in place but unregistered (could be repurposed later for true post-booking confirmation)

### A2. Tighten welcome email
Add one sentence after the "Rockstars are ready" paragraph:
> *"Our front desk will reach out personally to set up your first visit — no rushed booking, no pressure."*

Sets the expectation cleanly while preserving brand warmth.

### A3. Normalize `request-callback` confirmation copy
Currently splits into "set up your consultation" vs plain "about [service]." Unify both branches to:
> *"Kendell will call you back [window] to discuss [service] and set up the right time. Looking forward to seeing you at Hush."*

Consistently frames as discussion + booking.

### A4. SMS copy — already correct, no change
*"Kendell will reach out [window]"* is the right framing. Confirmed nothing implies an appointment is booked.

---

## B. Highest-impact Comet audit fixes

### B1. Recommendation card CTA hierarchy (P1 #3 — highest conversion lift)
In `ExperienceFinderSection` recommendation card, the 4 equal-weight CTAs (REQUEST CONSULTATION / CALL / TEXT US / CHAT WITH LUNA) dilute the primary action.
- Promote **REQUEST CONSULTATION** to the only full-width gold button.
- Collapse CALL / TEXT US / CHAT WITH LUNA into a single muted row of icon-style links beneath the primary CTA (or "Other ways to connect ▾" disclosure).

### B2. Email field copy upgrade (P1 #1 + #2 combined)
In `BookingCallbackSection`:
- Change email field label/help text from "(optional)" to: **"Add your email and we'll send a summary of your visit plan"** — frames as value exchange, not throwaway.
- Add one-line confirmation in success state when email was provided: *"We just sent a summary to {email}."* So guests know the email arrived.

### B3. Remove "Planning ahead" pre-selection on Finder Step 3 (P2 #6)
Currently auto-highlighted before user clicks. Start with no option selected, require explicit choice. Small correctness fix.

### B4. Verify cold-load shell (P0 #1 from audit)
Audit reported ~4s blank screen on cold load. We have `#hush-shell` in `index.html` — verify it renders the brand wordmark + gold gradient before JS hydrates. If invisible/timing-off, tune CSS so it paints immediately and fades out only once React mounts. (Quick investigation — may already be working; auditor may have hit a throttled connection.)

---

## C. Explicitly NOT doing (out of scope)

- **"Kendell will call you about your hair"** copy — confirmed correct (Kendell = Front Desk). Audit flag moot.
- **Site address, hours, trust bar** — verified accurate, no changes.
- **Luna behavioral compliance** — passed all 3 checks.
- **Instagram bio hours mismatch** — founder fix outside the codebase.
- **SEO H1 rewrite, focus rings, hero pause, urgency ticker, A/B tests** — valid but post-demo polish.
- **Exit-intent on Luna minimize, name-before-phone in Luna lead form** — pre-demo risk too high.

---

## Test checklist

1. Submit callback with phone + email → SMS arrives, **welcome** + new **what-happens-next** emails arrive, copy consistently frames "callback to discuss & book."
2. Submit callback without email → SMS only, no orphaned email error.
3. Complete Experience Finder → recommendation card shows ONE dominant gold CTA.
4. Reload during Finder Step 3 → no pre-selection on timing.
5. Hard-refresh homepage → shell paints immediately, no extended black screen.

## Scope
~45 min of focused work. Pure copy + UX. No new infrastructure, no DB migrations, no new edge functions (one template swap + redeploys).
