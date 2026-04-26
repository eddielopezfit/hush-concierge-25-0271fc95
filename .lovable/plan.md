# Plan — Hush Build Audit Dossier v1

Generate a single deliverable: **`Hush_Build_Audit_v1.md`** (and a branded PDF copy) in `/mnt/documents/`. Written in plain English as a strategic dossier for ChatGPT to use for sales positioning, pricing defense, and pitch development. Brutally honest — no marketing fluff.

---

## Source-of-truth verified before writing

- **Code**: 22 marketing components (~6,800 LOC) + 7 Luna concierge surfaces (~2,200 LOC) + 14 edge functions (~3,700 LOC) + 16 lib modules (~2,700 LOC). Total ~14,800 lines of real code.
- **Live data in production DB**: 162 conversations, 804 chat messages, 38 leads, 25 callback requests, 28 guest profiles, 18 SMS sends, 4 transactional emails, 20 artists, 55 service rows, 12 knowledge items.
- **Edge functions deployed**: luna-chat, lead-qualify, capture-lead, request-callback, submit-lead, session-start, session-summarize, daily-digest, health-check, send-transactional-email, process-email-queue, handle-email-suppression, handle-email-unsubscribe, preview-transactional-email, auth-email-hook.
- **Secrets configured**: Slack webhooks (general + nails/lashes/skin/massage/callbacks), Twilio SMS, Lovable AI key, Firecrawl, Perplexity, internal function secret.

---

## Document structure (15 sections, ~30 pages)

### 1. Executive Summary
One-page TL;DR: what this build is, who it serves, what stage it's at (production-deployed and capturing real leads), headline metrics from live DB.

### 2. Page-by-Page UX Walkthrough
Single-page React app with hash routing. Walk through the 10-section narrative flow as three personas:
- **First-time visitor**: lands on Hero → reads Trust Bar (4.7★, 315+ reviews, dynamic Open Today badge) → meets the chair-first story → enters Experience Finder
- **Returning client**: detected via fingerprint + localStorage → ReturningClientBanner offers fast-path skip
- **Salon owner**: sees the brand they spent 24 years building, finally rendered with editorial weight

### 3. Every Major Section & Its Job
For each of the 22 components, one paragraph: what it shows, what it's designed to convert, and where it sits in the funnel.
- Hero, TrustBar, ExperienceFinder, StepInside, PersonalizedPlan, Services, InlineCallbackCTA, Artists, Testimonials, About, JoinHush, BookingCallback, Footer, MobileStickyBar, Navigation, ServiceMenuModal, BookingDecisionCard, etc.

### 4. Conversion Paths & CTAs
Map every CTA and where it routes:
- "Let Luna Guide You" → opens LunaModal with context
- "Request a Callback" → BookingCallbackSection inline form → `request-callback` edge function → Slack + SMS to Kendell
- "Check Availability" → BookingDecisionCard (3 modes: consultation / guided_front_desk / direct_or_callback)
- "Call (520) 327-6753" → tel: link (mobile-first)
- Mobile sticky bar always-visible call/chat
- Exit-intent phone capture on LunaModal dismiss

### 5. Luna AI Concierge — Full Behavior Spec
- 4 tabs: Chat, Find My Look, Explore, Artists, My Plan
- System prompt v7 (current) + KB10 (services) + KB11 (team) + KB12 (recommendation engine)
- Quick reply persistence after every assistant turn
- Proactive nudges: dwell-based + inactivity-based
- Lead capture form triggers after 4th message
- Guardrails: neutral guidance policy (names artists, never recommends booking choice), denies nonexistent services (no hot stone, no prenatal, no LED), defers booking to (520) 327-6753
- Persistence: chat history in localStorage + Supabase `conversations` + `messages` tables
- Streaming: SSE from `luna-chat` edge function via Lovable AI Gateway (gemini-2.5-flash default)

### 6. Experience Finder Flow — How Quiz Answers Affect the Site
- Step 0 fork: "I know what I want" (jumps to Services) vs "Help me decide"
- Step 1: name capture (personalization seed)
- Step 2: category selection (multi-select: hair/nails/lashes/skincare/massage)
- Step 3: priority picker (only if multi-select)
- Step 4: subtype qualifier (e.g., color vs cut vs both)
- Step 5: goal + timing
- Reveal: ExperienceRevealCard with soft-language recommendation
- Persists to `ConciergeContext` (24-hr TTL) → drives Luna's first message, PersonalizedPlan reveal, and BookingDecisionCard mode

### 7. Booking & Callback Flow
- Three booking modes determined by intent score
- `request-callback` edge function: dedup window (2m/5m/24h tiers), Slack alert with priority badge, SMS to front desk
- `submit-lead` and `capture-lead` for soft and hard captures
- `lead-qualify` engine routes to category-specific Slack channels with 🔴/🟡 priority
- First-visit reassurance block (cancellation policy, parking, what to expect)

### 8. Mobile Experience & Sticky Actions
- Mobile-first design throughout
- MobileStickyBar: Call + Chat with Luna, always visible, hides on desktop
- 24-hr `pb-24` padding to prevent overlap
- Hash anchor scroll fix for lazy-loaded sections (rAF + retry pattern)

### 9. Returning Visitor Behavior
- Browser fingerprint + localStorage detects returns
- ConciergeContext rehydrated from storage (24-hr TTL)
- Cross-tab sync via `storage` event listener
- Last category remembered for one-tap "Start Luna"

### 10. Backend Systems (Complete Map)
- **13 tables**: artists, services, knowledge_items, conversations, messages, guest_profiles, leads, callback_requests, sms_send_log, email_send_log, email_send_state, email_unsubscribe_tokens, suppressed_emails
- **15 edge functions** (each documented with purpose, inputs, side effects)
- **Storage**: `site-assets` public bucket for editorial photography
- **Integrations**: Slack (5 routed webhooks + Slack API connector), Twilio SMS, Lovable AI Gateway, Lovable Email queue, Firecrawl, Perplexity
- **Realtime**: not in use (could be added for live chat handoff)
- **RLS**: service-role-only on all sensitive tables, anon SELECT on `services` only

### 11. Live vs Mocked vs Incomplete (Brutally Honest)
- **Live and proven by production data**: Luna chat (804 msgs across 162 sessions), lead capture (38 leads), callback flow (25 requests), SMS to Kendell (18 sent), Slack routing, journey tracking
- **Live but lightly used**: transactional email queue (only 4 sends — infrastructure ready, scenarios not yet wired)
- **Working but unverified at scale**: session-summarize loop, cadence/upsell engines (Hush Plan not yet user-facing)
- **Disabled / removed**: ElevenLabs voice (memory: no-voice-integration constraint)
- **Mocked / placeholder**: none of significance — the site runs on real data

### 12. Performance, Accessibility, Security, Compliance
- **Perf**: lazy-loaded below-fold sections with skeleton placeholders sized to prevent CLS, image optimization in place
- **A11y**: skip-to-main link, semantic landmarks, aria-hidden skeletons, AA-contrast typography (Playfair Display + DM Sans tested)
- **Security**: RLS on all tables, secrets in Supabase vault, CORS allowlist on edge functions, dedup windows prevent flood attacks
- **Compliance**: TCPA-compliant lead capture with explicit consent copy, Privacy Policy modal in footer, one-click unsubscribe tokens, suppression table for bounces/complaints

### 13. Known Bugs, Risks, Weak Points
- **Risk: single-instance Supabase** — no read replicas, fine for current load but a scale ceiling
- **Risk: Lovable AI Gateway dependency** — Luna goes down if gateway has an outage
- **Weak point: no admin dashboard** — owner relies on Slack feed and DB queries
- **Weak point: knowledge_items has only 12 rows** — KB is partly hardcoded in TS files (KB10/11/12), partly in DB; not a single source of truth
- **Bug surface: hash anchor scroll relies on retry loop** — works but fragile if section IDs change
- **Untested: process-email-queue at volume** — TTL and DLQ logic exists but only 4 sends to date
- **Daily-digest edge function exists but no evidence of cron schedule** — needs verification

### 14. What a Salon Owner Actually Cares About
- "Will my phone ring more?" → Yes, 25 callback requests + 38 leads in production already
- "Can I edit this myself?" → Partially — content edits require a developer, but Slack feed and DB are visible
- "What if Luna says something dumb?" → Guardrails enforce factual denial of nonexistent services, neutral artist policy, defer-to-front-desk on bookings
- "What happens if you disappear?" → Code is in their Lovable workspace, all data in Supabase, exportable
- "Will it embarrass us?" → Editorial photography, real testimonials, accurate hours, real artist bios

### 15. Case Study Value & Brutally Honest Commercial Assessment
- **What makes it a case study**: 24-year legacy salon × modern AI concierge × measurable lead lift, all in one project
- **Replicable across salon, spa, med-spa, wellness, boutique fitness verticals** with category swaps
- **Honest pricing defense**:
  - Comparable agency build: $20k–$50k + $500–$2k/mo retainer
  - Comparable AI concierge alone: $300–$1,500/mo (Intercom Fin, Ada)
  - This delivers both for $1,500 + $297/mo
  - The math defends itself if even 2 first-time guests/mo convert ($1,800/yr lift)
- **Honest weaknesses**:
  - No proven ROI data yet at the destination salon (need 90 days)
  - No admin UI — owner-edit story is a future phase
  - One developer dependency
- **Commercial verdict**: **Real, defensible, sellable.** Not vapor. The production data proves the system works. The pricing model leaves room for upside without insulting the work.

---

## QA checklist before delivery

- [ ] Every component count, line count, and DB row count matches verified source-of-truth above
- [ ] No marketing fluff — owner-facing language, salon-shop vocabulary
- [ ] Each section ends with one concrete takeaway
- [ ] "Live vs mocked" section is unsparing
- [ ] Pricing section uses the $1,500 / $297 / 90-day numbers consistently
- [ ] PDF is branded with charcoal `#0d0d0d`, cream `#f5f3ee`, gold `#d8b063`, Playfair Display headings, DM Sans body
- [ ] Render every PDF page to image and visually inspect for clipping/overflow before delivery

## Deliverables to `/mnt/documents/`

1. `Hush_Build_Audit_v1.md` — the markdown dossier
2. `Hush_Build_Audit_v1.pdf` — branded PDF version

Both surfaced as `<lov-artifact>` tags so the user can hand them to ChatGPT immediately.
