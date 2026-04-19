

The user pasted a comprehensive Comet UI/UX audit report. They want me to plan fixes. I'll group the 15 issues into a tight implementation plan focused on the critical/high items, with mediums bundled and lows noted.

## Fix plan — ranked by leverage

### Phase 1 — Critical (ship first)

**1. Eliminate black-screen FCP delay**
- `index.html`: add inline `<style>html,body{background:#0d0d0d;color:#f5f3ee}</style>` in `<head>` and `style="background:#0d0d0d"` on `<body>`. Set `<meta name="theme-color" content="#0d0d0d">`.
- `HeroSection.tsx`: keep video lazy, but ensure poster loads first — already set; add `fetchpriority="high"` to the desktop poster `<img>` fallback and `preload="metadata"` only.
- Verify `MotionProvider` / `App.tsx` doesn't wrap initial paint in a Suspense fallback that's blank — add a minimal branded fallback (gold "L" mark on charcoal).

**2. Wire exit-intent lead capture on Luna close**
- `LunaChatWidget.tsx` `handleClose`: if chat tab has ≥1 user message AND no lead captured (check `conciergeStore.hasLead`), open `LeadCaptureForm` as an inline overlay inside the panel before dismissing. Cancel actually closes; submit saves then closes.

**3. Fix 4-message lead form trigger**
- `ChatTab.tsx` / `useChatPersistence.ts`: locate the message-counter trigger. Current threshold likely gated on a stale flag. Refactor to derive `userMessageCount` from messages array each render and show `<LeadCaptureForm>` inline when `userMessageCount >= 4 && !leadCaptured`. Add unit test.

### Phase 2 — High

**4. Brand the 404 page** (`src/pages/NotFound.tsx`)
- Add `<Navigation>`, Hush logo, gold gradient headline "Looks like this page stepped out.", body "Let's get you back where the magic happens.", two CTAs: "Find Your Experience" (→ `/#experience-finder`) and "Talk to Luna" (triggers `openChatWidget`). Keep `LunaChatWidget` mounted via App layout.

**5. Footer social icon a11y** (`FooterSection.tsx`)
- Add `aria-label="Follow Hush on Instagram"` / `…on Facebook"` to the anchor wrappers.

**6. Experience Finder fast-lane fork** (`ExperienceFinderSection.tsx`)
- Step 0: under category tiles add a subtle text link "Already know what you want? Skip to booking →" that scrolls to `BookingCallbackSection` and pre-fills nothing (or carries selected categories if any).

**7. Mobile sticky bottom bar**
- `MobileStickyBar.tsx` already exists with Find Experience / Call / Directions. Spec asks for Call / Text / Luna. Replace Directions with "Talk to Luna" (calls `openChatWidget`), keep Call, change primary from "Find Your Experience" to a smaller layout giving all three equal weight, ensure all targets ≥44px. Confirm it's mounted in `App.tsx`/`Index.tsx`.

### Phase 3 — Medium

**8. Skip-link target** (`index.html` / `Index.tsx`): wrap homepage sections in `<main id="main-content">`; update skip link `href="#main-content"`.

**9. Luna neutrality tightening** (`supabase/functions/_shared/luna-brain.ts` + `SYSTEM_PROMPT_v7.md`): for hair color / hair cut / nails (3+ providers), instruct to describe team capability collectively, never enumerate names. Single-provider services (Allison-lashes, Tammi-massage, Patty-microneedling, nails by Kelli/Anita/Jacky factually) may be named. Redeploy `luna-chat`.

**10. Pre-footer CTA copy** — change "BOOK AN APPOINTMENT" → "Reserve My Visit" (locate in `BookingCallbackSection.tsx` or `FooterSection.tsx`).

**11. Hero left-edge artifact** — audit hero video container for `object-fit:cover; width:100%; overflow:hidden` and remove any `clip-path`/transform causing bleed.

**12. Artist card image preloading** — add `loading="lazy"` only to below-fold artist cards (index ≥ 6); ensure first 6 are eager.

### Phase 4 — Low (bundled)

**13. 404 copy** — covered by #4.
**14. Booking form fieldsets** — wrap "Interested In" and "How soon?" button groups in `<fieldset>` with `<legend>` (visually hidden via `sr-only`).
**15. Trust bar live status** — add green/red dot + "Open Now · Closes 7 PM" / "Closed · Opens Tue 9 AM" to `TrustBar.tsx`, reusing the day/hours logic from `HeroSection`.

## Out of scope for this pass
- Full SSR for FCP (architectural; inline body bg + branded suspense fallback is sufficient quick fix).
- Real HTTP 404 status (requires hosting-level rewrite; not actionable in SPA).

## Files touched (~15)
`index.html`, `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/NotFound.tsx`, `src/components/HeroSection.tsx`, `src/components/LunaChatWidget.tsx`, `src/components/luna/ChatTab.tsx`, `src/components/luna/chat/useChatPersistence.ts`, `src/components/MobileStickyBar.tsx`, `src/components/FooterSection.tsx`, `src/components/ExperienceFinderSection.tsx`, `src/components/BookingCallbackSection.tsx`, `src/components/TrustBar.tsx`, `supabase/functions/_shared/luna-brain.ts`, `src/lib/SYSTEM_PROMPT_v7.md`.

## Validation
- Run `bunx vitest run --coverage` after each phase.
- Add new tests: 4-message trigger, exit-intent gate, neutrality prompt regression.
- Manual: cold-load home (expect charcoal frame instantly), close Luna mid-chat (expect capture overlay), 404 route (expect branded page).

