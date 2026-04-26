# Hush Build DNA — Complete Technical & Strategic Dossier

Generate a single comprehensive document (`Hush_Build_DNA_v1.md` + matching `Hush_Build_DNA_v1.pdf` in `/mnt/documents/`) that captures **every layer** of the Hush build for founder review. This is the "whitepaper" that sits behind the audio + video overviews — the artifact the founders can flip through to verify the substance.

## Document Structure (12 chapters, ~40–50 pages)

### 1. Executive Summary (1 page)
- What Hush received: full website + AI concierge + lead pipeline
- 24-year legacy meets 24/7 digital front desk
- Pricing model: $1,500 build + $297/mo maintenance
- 90-day exit clause, founders pricing in exchange for case study rights

### 2. The Strategic DNA (2 pages)
- **The Chair-First narrative** — why the build leads with legacy, not tech
- **Zero Dead Ends** UX principle — every screen presents a clear next action
- **Neutral Guidance Policy** — Luna never plays favorites between artists
- **No Continue copy rule** — intent-driven labels only ("Let Luna Guide You", "See My Plan")
- **Three engagement modes** — New Client, Returning Client, Browsing Client

### 3. Visual Design System (3 pages)
- **Palette** (charcoal `#0d0d0d`, cream, warm gold `hsl(38 50% 55%)`, deep rose, with full HSL token table)
- **Typography** — Playfair Display (display) + DM Sans (body), AA contrast verified
- **Gradients, shadows, glows** — gold-glow, elegant, card shadows
- **Animation grammar** — fade-up, ken-burns, glow-pulse, framer-motion via LazyMotion
- **Real photography mandate** — no stock or AI placeholders
- **Cinematic video backgrounds** — muted autoplay loops with 50% tint + gradient overlay

### 4. Information Architecture (2 pages)
- **10-section homepage narrative flow** in mandated order:
  1. Hero → 2. TrustBar → 3. ExperienceFinder → 4. StepInside → 5. PersonalizedPlan → 6. Services → 7. Artists → 8. Testimonials → 9. About → 10. JoinHush → BookingCallback → Footer
- **Routing architecture** — SPA with hash-anchor redirects (`/services` → `/#services`)
- **Code splitting strategy** — eager hero, lazy below-the-fold, deferred LunaChatWidget

### 5. Component Map (4 pages)
Catalog of all 30+ top-level components with purpose, file path, line count, and key props:
- Marketing surface (Hero, TrustBar, Services, Artists, Testimonials, About, JoinHush)
- Conversion surface (ExperienceFinder, PersonalizedPlan, BookingCallback, InlineCallbackCTA, MobileStickyBar)
- Concierge surface (LunaChatWidget, LunaModal, 5 tabs: FindMyLook, Explore, Artists, MyPlan, Chat)
- Utility (Navigation, Footer, ServiceMenuModal, PriceConfidenceAccordion)

### 6. Luna AI — The Concierge Brain (4 pages)
- **System prompt evolution** — v4 → v7 (currently active)
- **luna-brain.ts deterministic logic engine** — when to require consultations, neutral guidance enforcement
- **Knowledge base** — KB10 (services), KB11 (team), KB12 (recommendation engine)
- **Chat flow** — persistent quick replies, lead capture after 4th message, exit-intent capture
- **Proactive nudges** — dwell + inactivity engines with session-scoped tooltips
- **Token budget & model** — Lovable AI Gateway, Gemini 2.5 Flash default
- **Cadence & upsell engines** — revenue/retention logic baked into MyPlan tab

### 7. Conversion Funnel (3 pages)
- **Experience Finder** — multi-step quiz with identity capture, multi-service priority fork, recommendation cards
- **Booking Decision modes** — consultation / guided_front_desk / direct_or_callback
- **Inline lead capture** — every callback CTA opens a sub-form, no dead ends
- **Returning client fast-path** — fingerprint + localStorage skip the quiz
- **Triple-net lead routing** — Slack (categorized channels with priority badges) + SMS (Twilio) + Email (Resend)

### 8. Database Schema (3 pages)
All 13 public tables with columns, RLS posture, and purpose:
- `leads`, `callback_requests`, `conversations`, `messages`, `guest_profiles`
- `artists`, `services`, `knowledge_items`
- `email_send_log`, `email_send_state`, `email_unsubscribe_tokens`, `suppressed_emails`, `sms_send_log`
- 24-hour TTL on ConciergeContext
- Lead deduplication windows (2m/5m/24h)

### 9. Edge Functions (3 pages)
All 16 functions with purpose, trigger, and downstream effects:
- `luna-chat` — streaming chat with brain logic
- `capture-lead`, `submit-lead`, `lead-qualify` — three-stage lead pipeline
- `request-callback` — booking callback handler
- `session-start`, `session-summarize` — intelligence loop
- `send-transactional-email`, `process-email-queue`, `daily-digest` — email infra
- `handle-email-suppression`, `handle-email-unsubscribe` — compliance
- `health-check` — uptime monitoring

### 10. Operational Intelligence (2 pages)
- **Slack ops routing** — #hush-leads (🔴 HIGH / 🟡 MEDIUM badges), per-category channels
- **Daily digest** — automated summary of conversations, leads, callbacks
- **Session intelligence loop** — chat → summarize → guest_profile enrichment
- **Journey tracker** — IntersectionObserver-based behavioral telemetry
- **Email infra** — Resend transactional templates (welcome, first-visit-guide, what-happens-next)

### 11. Performance & Compliance (2 pages)
- Lazy loading + LazyMotion (framer-motion off the eager bundle)
- Skip-to-content link, AA contrast, focus rings, semantic HTML
- TCPA compliance + privacy modal in footer
- External link hardening (`rel="noopener noreferrer"`)
- CORS allowlist on every edge function
- No CHECK constraints with non-immutable functions (validation triggers used instead)

### 12. The Pricing & Partnership (2 pages)
- **Build fee**: $1,500 one-time (contractor analogy)
- **Maintenance**: $297/mo, itemized into 4 buckets:
  - Hosting + infrastructure (~$60–80 value)
  - Luna AI runtime / SMS / email (~$80–120 value)
  - Maintenance + updates (~$80–100 value)
  - Pipeline health monitoring (~$40–60 value)
- **Market comparison table** — vs Wix, local agency, Phoenix boutique, Boulevard SaaS, Intercom Fin
- **90-day exit clause** — verbatim script
- **Windex analogy** — verbatim script
- **Case-study close** — legacy framing

## Generation Approach

1. Use `code--exec` to script-generate the markdown by reading actual source files, schema, and tailwind tokens — so every number/path is verified, not invented.
2. Build the PDF from the markdown using a Node script with `markdown-pdf` or `puppeteer` rendering against a Hush-branded HTML template (charcoal bg, cream text, gold accents, Playfair headings).
3. QA: convert each PDF page to PNG via `pdftoppm` and visually inspect — check for clipped text, layout breaks, missing chapters, brand fidelity.
4. Output both files to `/mnt/documents/` and emit `<lov-artifact>` tags so you can preview/download immediately.

## Deliverables

- `/mnt/documents/Hush_Build_DNA_v1.md` — full markdown source (~40–50 pages)
- `/mnt/documents/Hush_Build_DNA_v1.pdf` — branded PDF render

Both presented as artifacts in the chat reply, with a 1-paragraph summary of what's inside and how to use it alongside the audio + video overviews when meeting with the founders.