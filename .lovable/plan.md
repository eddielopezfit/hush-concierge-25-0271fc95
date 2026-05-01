
# Hush Hub — Production-Readiness UI/UX Audit

I walked the live preview at desktop (1280) and mobile (375), inspected hero / Experience Finder / Services / Artists / About / Contact / Footer / Luna 5-tab panel / mobile sticky bar, and cross-checked the code. The Hub is in strong shape — narrative, Luna concierge, and CTA hierarchy are all working. Below are the issues I'd fix before calling this production-ready, in priority order.

---

## P0 — Visible bugs (fix first)

### 1. Mobile hero is unreadable — text overlaps the human in the video
On 375px width the hero subtitle line *"Five departments · Three founders still behind the chair · 24 years of transformations"* sits directly on top of the model's body, and the *"4.7★ · 315+ reviews"* line is half-blended into her shirt. The vertical gradient overlay is too weak in the mid-band where text lives.

Fix in `src/components/HeroSection.tsx` + `src/index.css`:
- Strengthen the mid-band of the gradient overlay on mobile only: e.g. `from-background/65 via-background/55 to-background/95` under `md:` keep current.
- Add a localized text scrim behind the headline + subtitle (radial or soft black backdrop with `backdrop-blur-[2px]`) sized to the text bounds.
- Optionally swap the mobile master to a tighter-cropped variant so the subject sits behind text rather than in front of it.

### 2. Mobile sticky bar collides with the Luna floating bubble label
On every mobile screen "Your Hush Guide" caption under the bubble overlaps the top edge of the **Book a Visit / Call / Luna** sticky bar. Looks broken.

Fix:
- Hide the floating Luna bubble on mobile (the sticky bar already has a Luna entry point).
- Or raise `bottom` of `.luna-floating` above the sticky-bar height (`bottom: calc(76px + env(safe-area-inset-bottom))`) and drop the "Your Hush Guide" caption on mobile.

### 3. Founder cards have three competing labels
`ArtistsSection.tsx` puts a code-rendered "FOUNDING" pill top-left **and** the artist's name + "CO-OWNER" are baked into the photograph itself, **and** the name appears again at the bottom. "CHRIS" reads as cut off because the photo was shot for a different aspect ratio.

Fix in `src/components/ArtistsSection.tsx` (founders row + `SmartCard`):
- Drop the "FOUNDING" pill for founders whose photos already carry the title; rely on the photo + bottom name.
- OR replace the in-photo titles with clean portraits (cleanest long-term).
- Re-frame founder photos with `object-position: center 20%` so the baked-in headline isn't clipped.

### 4. Console warnings: `forwardRef` missing on motion children
Two dev-mode warnings firing on every render:
- `ArtistAvatar` (src/components/ArtistsSection.tsx) used inside `m.div` motion children path
- `ChatActionButtons` (src/components/luna/ChatTab.tsx) inside `AnimatePresence`

Fix: wrap both component definitions in `React.forwardRef<HTMLDivElement, Props>` and forward the ref onto the root element. Silences warnings and prevents future motion-layout bugs.

---

## P1 — Polish (do in same pass)

### 5. Hash anchors don't always scroll on first load after lazy hydration
`/#artists` and `/#about` sometimes leave the user near the top of the page. The retry loop in `src/pages/Index.tsx` runs 30× × 100ms but the lazy chunk + image decode can exceed 3s.

Fix: extend the retry budget (60 × 100ms), and once the element is found, schedule a second `scrollIntoView` after `requestIdleCallback` fires to correct for late-shifting Suspense fallbacks.

### 6. `PersonalizedPlanSection` reserves 520px even when it returns null
For first-time visitors the section renders nothing but the Suspense fallback held vertical space. Net result: a brief invisible gap on first paint.

Fix: short-circuit the lazy import or render an empty placeholder of `min-h-0` until `conciergeContext.categories.length > 0` is known. Tiny CLS win.

### 7. TrustBar live status — "Open Today · 9 AM – 5 PM" appears twice
The hero badge ("Open Today · 9 AM – 5 PM") and the TrustBar ("Open Now · Closes 5 PM") repeat the same info one section apart.

Fix: drop the hero badge on mobile (where vertical real estate matters) and keep TrustBar as the single source of truth, OR vary the language so they read as complementary (hero = "Open today", TrustBar = "Closes at 5 PM").

### 8. "Your Hush Guide" label adds no value
The floating bubble label says "Your Hush Guide" — invisible-on-dark, often clipped by the sticky bar, and the icon is already universally recognized. Either remove or move to a tooltip on hover only (desktop).

---

## P2 — Nice-to-haves (skip if time-boxed)

- TrustBar testimonial carousel auto-rotates every 5s with no pause-on-hover; users mid-read get yanked. Add `aria-live="polite"` and pause-on-hover.
- Footer keyboard focus ring on the small social links is barely visible against dark bg — bump to gold/60.
- Skip-link "Skip to main content" works but `focus:top-4` lands behind the sticky nav on small viewports; add `focus:top-20`.

---

## Technical Summary

| File | Change |
|---|---|
| `src/components/HeroSection.tsx` | Mobile overlay + scrim, drop duplicate hours badge on mobile |
| `src/index.css` | Stronger mid-band gradient utility for mobile hero |
| `src/components/MobileStickyBar.tsx` + `LunaChatWidget.tsx` (.luna-floating) | Hide floating bubble or raise above sticky bar; drop label on mobile |
| `src/components/ArtistsSection.tsx` | Remove redundant "FOUNDING" pill on founders, adjust `object-position`, wrap `ArtistAvatar` in `forwardRef` |
| `src/components/luna/ChatTab.tsx` | Wrap `ChatActionButtons` in `forwardRef` |
| `src/pages/Index.tsx` | Extend hash-resolve retry budget + post-idle correction |
| `src/components/PersonalizedPlanSection.tsx` (or `Index.tsx` Suspense fallback) | Avoid reserving 520px when section is empty |
| `src/components/TrustBar.tsx` | Pause-on-hover, `aria-live`, deduplicate hours copy with hero |

No data-model, schema, or backend changes. No new dependencies. Everything is presentation-layer.

---

## What's working — leave alone

- Narrative flow (Hero → TrustBar → Experience Finder → Plan → Services → Artists → Testimonials → About → Join → Booking → Footer)
- Luna 5-tab concierge architecture and the chat quick-reply chips
- 4-step Experience Finder pacing and the consultation/direct/callback decision branching
- Brand palette + Playfair/DM Sans typography contrast (AA)
- The `/#anchor` redirect SPA pattern itself

After this pass the Hub is production-shippable.
