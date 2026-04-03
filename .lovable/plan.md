

# Hush Hub UX Optimization — Implementation Plan

Based on the senior UX strategy analysis, here are the prioritized changes organized by impact and effort.

---

## Phase 1: HIGH Impact, LOW-MEDIUM Effort (Do First)

### 1A. Add Differentiator Line Below Hero Tagline
Add a concrete one-liner below "Where Tucson Comes to Feel Legendary" so first-time visitors immediately understand what Hush is.
- Example: "Five departments. Three founders still behind the chair. 24 years of transformations."
- File: `HeroSection.tsx` — add below the italic tagline

### 1B. Add Mini Trust Bar Between Hero and Experience Finder
Move a compact social proof moment (one-line testimonial + star count) directly below the hero and above the Experience Finder. Users need trust before investing effort in a quiz.
- New lightweight component rendered in `Index.tsx` between Hero and Experience Finder
- Content: a rotating one-liner from a real review + "4.7★ · 315+ reviews"

### 1C. Truncate Team Section — Show 6 Featured, Expandable
The team section currently shows all 13+ members in one grid, causing scroll fatigue and a likely drop-off dead zone. Show 6 featured artists by default with a "View Full Team" expand button.
- File: `ArtistsSection.tsx` — add `showAll` state, slice `filteredTeam` to 6 when collapsed

### 1D. Remove "Compare with Luna" from Artist Cards
Since Luna no longer recommends specific stylists, the "Compare with Luna" button on each SmartCard is now contradictory. Remove it.
- File: `ArtistsSection.tsx` — remove `onCompare` prop and the button from `SmartCard`, remove `handleCompareWithLuna`
- Update helper strips to say "Not sure who's right? Our front desk can help match you." instead of referencing Luna

### 1E. Add Multiple Conversion Touchpoints
The callback form is buried at section 9 of 10. Add lightweight "Request Callback" buttons after Services section and after Team section.
- Create a reusable `InlineCallbackCTA` component (a simple gold-outlined button that scrolls to `#callback`)
- Insert after `ServicesSection` and `ArtistsSection` in `Index.tsx`

### 1F. Mobile Sticky Bar — Add Directions Button
Add a one-tap Google Maps directions link alongside the phone icon.
- File: `MobileStickyBar.tsx` — add a MapPin icon button linking to Google Maps directions for Hush Salon Tucson

### 1G. Add "Open Now" / Hours Badge on Mobile
Show salon hours status in the first mobile viewport. Add a small "Open Today: 9am–7pm" badge below the hero trust strip, visible on mobile only.
- File: `HeroSection.tsx` — add a simple hours display with `md:hidden` class

---

## Phase 2: HIGH Impact, MEDIUM Effort

### 2A. Experience Finder — Clean Up Step 1
The name input appearing on Step 1 alongside service selection is confusing. However, reviewing the code, the name field is NOT on Step 1 — it's handled separately via `guestName`. The actual improvement: add a "Most popular" badge to the Hair category option.
- File: `ExperienceFinderSection.tsx` — add a small "Most popular" tag to the Hair category button

### 2B. Contextual Testimonial Snippets Near Service Cards
Place 1 relevant testimonial quote near each service category card (e.g., Whitney's blonde review near Hair card).
- File: `ServicesSection.tsx` — add a small italic quote + author below each service card, sourced from the existing testimonials data

### 2C. Add `prefers-reduced-motion` Support
Respect accessibility preferences by disabling Framer Motion animations when the user has reduced motion enabled.
- Create a `useReducedMotion` hook (Framer Motion has `useReducedMotion()` built in)
- Apply to key animation-heavy sections: Hero, Experience Finder, Testimonials carousel auto-advance

### 2D. Luna Mobile Visibility
Luna's voice/chat CTA is desktop-only in the hero. Add a subtle "Ask Luna" label next to the chat widget icon on mobile so 60%+ of users can discover the AI differentiator.
- File: `LunaChatWidget.tsx` — on mobile, show a small "Ask Luna" text label next to the floating icon (not a tooltip/popup — just static text)

---

## Phase 3: MEDIUM Impact, LOW Effort (Quick Wins)

### 3A. Improve Body Text Contrast (WCAG)
The muted gray body text (`text-muted-foreground`, `text-cream/70`) may fail WCAG AA 4.5:1 on the dark background. Bump opacity values.
- File: `tailwind.config.ts` / `index.css` — increase `muted-foreground` lightness or adjust `cream` opacity classes from `/70` to `/80` where used for body copy

### 3B. Hide Video on Mobile, Show Poster
Save bandwidth and battery. The portrait video already works with a poster fallback.
- File: `HeroSection.tsx` — add `hidden md:block` to the `<video>` element, ensure the blurred background image fills on mobile

### 3C. Testimonials — Show 6 at Once on Desktop
Replace the 3-at-a-time paginated carousel with a 2x3 grid showing 6 reviews simultaneously. Users can scan faster.
- File: `TestimonialsSection.tsx` — change desktop layout from paginated 3-column to a static 6-review grid with a "See all reviews" link

---

## Phase 4: HIGH Impact, HIGH Effort (Future Roadmap — Not This Sprint)
These are noted for planning but NOT implemented now:
- Replace all Unsplash stock photos with real Hush photography
- Break services out of modals into SEO-crawlable pages (requires routing)
- Integrate real-time online booking (Vagaro/Boulevard/GHL)
- Video testimonials collection
- AR color try-on

---

## Technical Details

### Files Modified
| File | Changes |
|------|---------|
| `HeroSection.tsx` | Add differentiator line, hours badge (mobile), hide video on mobile |
| `Index.tsx` | Insert TrustBar component, InlineCallbackCTA x2 |
| `ArtistsSection.tsx` | Truncate to 6, remove Compare with Luna, update helper text |
| `ServicesSection.tsx` | Add contextual testimonial snippets |
| `TestimonialsSection.tsx` | 6-review grid on desktop |
| `MobileStickyBar.tsx` | Add directions button |
| `LunaChatWidget.tsx` | Add "Ask Luna" label on mobile |
| `ExperienceFinderSection.tsx` | "Most popular" badge on Hair |
| `tailwind.config.ts` or `index.css` | Contrast adjustments |

### New Files
| File | Purpose |
|------|---------|
| `src/components/TrustBar.tsx` | Mini social proof strip between Hero and Finder |
| `src/components/InlineCallbackCTA.tsx` | Reusable mid-page conversion touchpoint |

### No Database Changes Required

