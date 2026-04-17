
User wants a second deep-dive audit document — this time a behavioral/conversion analysis (10 sections) complementing yesterday's system export. Same format: structured Markdown artifact written to `/mnt/documents/`.

This is documentation generation, not a code change. Approach mirrors the previous export:

## Plan

1. **Read targeted source** to ground the audit in real behavior (not generic UX advice):
   - `ExperienceFinderSection.tsx` — quiz step count, friction points, drop-off surfaces
   - `LunaChatWidget.tsx` + `ChatTab.tsx` — quick replies, typing delay, message persistence
   - `lunaBrain.ts` (client) + `luna-brain.ts` (edge) + `SYSTEM_PROMPT_v7.md` — actual response patterns for the 5 example queries
   - `BookingDecisionCard.tsx`, `BookingCallbackSection.tsx`, `InlineCallbackCTA.tsx` — conversion surfaces
   - `MobileStickyBar.tsx`, `LunaModal.tsx` (exit-intent), `ReturningClientBanner` logic — entry/exit triggers
   - `journeyTracker.ts`, `cadenceEngine.ts`, `upsellEngine.ts` — behavioral signals
   - `servicesMenuData.ts` — pricing for the "How much is color?" simulation
   - Slack routing in `lead-qualify` edge function — conversion endpoints
   - Memory files for the 3 user modes (New/Returning/Browsing) and Zero Dead Ends principle

2. **Generate `Hush_Behavioral_Audit.md`** with all 10 sections, source-accurate:
   - **§1 Five user simulations** — step-by-step (landing → click-by-click) with specific copy Luna would actually say (pulled from `lunaBrain.generateChatResponse` + system prompt), specific friction points (e.g. quiz Step 3 multi-category fork, exit-intent modal trigger, callback form 4 required fields)
   - **§2 Conversion paths** — enumerate the 6 real paths (Quiz→Recommendation→Callback, Chat→Lead-after-4-msgs, Exit-Intent→Phone, Mobile Sticky→Call, Direct CTA→Callback, Service Menu→Inline CTA→Callback) with entry trigger, step count, drop-off risk, likelihood rating
   - **§3 Luna response analysis** — 10 real responses (2 per query type) using actual template strings from `generateChatResponse` and system prompt rules; tone/strength/weakness/loss-risk for each
   - **§4 Chat UX** — typing delay (from code), message persistence (sessionStorage / none), chip effectiveness from `LunaContext` quick replies
   - **§5 Decision fatigue** — quiz step burden, 5 categories × 4 goals × 4 timing = 80 combos, multi-service priority picker, 5-tab Luna panel
   - **§6 Trust & authority** — TrustBar (4.7★/315 reviews), founder portrait, Pureology Pure 100, testimonial grid, weak spots (no real-time availability, no booking calendar)
   - **§7 Top 10 conversion leaks** — quiz Step 3 abandonment, no-price-on-cards, callback form length, missing booking confirmation, exit-intent only fires once, etc.
   - **§8 Chat vs UI conflicts** — Luna recommends services that ServicesSection already shows; PersonalizedPlanSection vs Luna MyPlanTab duplication; ExperienceFinder recommendation card vs Luna chat suggestion
   - **§9 Speed & flow** — lazy-loaded sections delay scroll-driven CTAs; quiz is well-paced; chat 800ms typing delay; callback form has no inline validation feedback
   - **§10 Gold path** — landing → TrustBar glance → Quiz (4 steps) → Recommendation card → BookingDecisionCard "guided_front_desk" → Inline callback (3 fields) → Slack alert → done

3. **Output**: write the file then emit a `<lov-artifact>` tag.

## Out of scope
- No code changes
- No UI mockups
- No re-running the previous system export

## Deliverable
`Hush_Behavioral_Audit.md` (~25–40KB) downloadable artifact, complementing yesterday's `Hush_System_Export.md`.
