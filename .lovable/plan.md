

# Audit Reconciliation & Next-Build Plan

## Context
The Perplexity forensic audit scored the build at 5.4/10. That score reflects the state **before** Steps 1–5 of our recent work. Many critical findings have already been resolved. This plan reconciles what's fixed vs. what remains, then defines the next implementation pass.

---

## Already Fixed (Post-Audit Work We Did)

| Audit Finding | Status |
|---|---|
| Brain split (luna-chat vs voice) | ✅ Shared brain created (`_shared/luna-brain.ts`) |
| CommunitySection leads going nowhere | ✅ Routes through `saveLead` → `submit-lead` edge function |
| BookingCallbackSection no prefill | ✅ Prefills from unified concierge context via `useEffect` |
| No booking decision intelligence | ✅ `BookingDecisionCard` with 3 modes (consultation/guided/direct) |
| No inline lead capture | ✅ Inline capture in `BookingDecisionCard` with instant confirmation |
| No Slack routing by category | ✅ `resolveSlackChannel()` in shared `booking-rules.ts` |
| Chat hours wrong (Sat 7PM) | ✅ Fixed in shared brain |
| Stylist naming contradiction in chat | ✅ Chat now uses shared brain with fit-based recommendations |
| No dedup on submit-lead | ✅ 24hr dedup added |
| Founder privacy bug (voice refusing names) | ✅ Exception added to shared brain |
| System unification / state drift | ✅ `LunaProvider` unifies all 8 surfaces |

**Realistic current score: ~7.5/10** (up from 5.4)

---

## What Still Needs Fixing

### Tier 1 — Quick Wins (< 30 min each)

1. **"23+ years" → "24+ years"** in `HeroSection.tsx` line 50
2. **Delete dead components:** `GuidesSection.tsx`, `CallbackSection.tsx`, `BookingSection.tsx` — none are rendered
3. **Artist card CTAs** — currently open a profile modal with "Book with [Name]" which routes through `LunaModal`. The audit flagged "Book" and "Full Profile" as dead ends, but our current implementation already routes to the modal. Confirm and close.

### Tier 2 — Route Architecture (HIGH impact, 2-3 hours)

4. **Add redirect routes** for `/services`, `/team`, `/about`, `/contact`
   - Not full pages yet — just redirect to `/#services`, `/#artists`, `/#about`, `/#contact`
   - Prevents 404s on shared links and improves basic SEO signals
   - Add proper `<title>` and meta description to Index

### Tier 3 — Analytics Persistence (HIGH impact, 2-3 hours)

5. **Persist journeyTracker data**
   - Currently collects section views, artist clicks, service views in memory — all lost on page close
   - Options: (a) batch-write to a `journey_events` table via edge function, or (b) fire to an analytics endpoint
   - Recommendation: lightweight edge function that accepts batched events, writes to a `journey_events` table

### Tier 4 — Operational Cleanup

6. **Remove dormant GHL/Twilio code blocks** from `lead-qualify` — or keep as-is since they gracefully skip when env vars aren't set. Given your Slack-first → GHL-later strategy, **keep them dormant but document clearly**. No action needed now.

7. **Delete `sessions` table backward-compat writes** from `submit-lead` — the `sessions` table is dead weight

### Tier 5 — Voice Webhook (External, not Lovable)

8. **Register `voice-session-log` as ElevenLabs post-call webhook** — must be done in the ElevenLabs dashboard, not in code

---

## Recommended Implementation Order

**Pass 1 — Cleanup & Routes (this session):**
- Fix "24+ years" copy
- Delete 3 dead components
- Add `/services`, `/team`, `/about`, `/contact` redirect routes
- Remove `sessions` table writes from `submit-lead`

**Pass 2 — Analytics (next session):**
- Create `journey_events` table
- Create `log-journey` edge function
- Wire `journeyTracker.ts` to persist events before page unload

**Pass 3 — After Hush Buy-In:**
- Activate GHL CRM integration (set API keys)
- Activate Twilio SMS confirmations
- Build stylist profile pages (`/team/[name]`)
- Portfolio/gallery system
- Admin dashboard for Kendell

---

## Technical Details

### Route Redirects (Pass 1)
In `App.tsx`, add `Navigate` redirects:
```
/services → /#services
/team → /#artists  
/about → /#about
/contact → /#contact
```

### Dead Component Deletion
- `src/components/GuidesSection.tsx` — never imported in Index
- `src/components/CallbackSection.tsx` — duplicate of BookingCallbackSection
- `src/components/BookingSection.tsx` — never imported in Index

### submit-lead Cleanup
Remove the backward-compat `sessions` table insert path, keeping only `leads` and `callback_requests` writes.

---

## GHL Strategy Note
The dormant GoHighLevel and Twilio stubs in `lead-qualify` are correctly architected — they check for env vars and gracefully skip. When Hush buys in:
1. Set `GHL_API_KEY` and `GHL_WEBHOOK_URL` as secrets
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
3. Both pipelines activate immediately with zero code changes

Slack remains the active ops channel until then.

