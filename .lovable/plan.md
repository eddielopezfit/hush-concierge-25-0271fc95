# Research-Driven Hub Optimization — Phase 1

Based on the Perplexity deep research, here are the highest-ROI changes we can ship now — no external assets or integrations needed.

---

## 1. Expand Testimonials to 10 + Carousel

**Research says:** "Displaying just 5 reviews increases purchase likelihood by 270%. Businesses with 11-30 reviews see the effect amplify twofold."

Currently showing 3 static cards. Expand to 10 real reviews with an auto-scrolling carousel on mobile (3-column grid on desktop). Add service tags to each review so visitors see proof for the specific service they're considering.

**File:** `TestimonialsSection.tsx`

---

## 2. Hero Trust Badge (Above the Fold)

**Research says:** "Google review count + rating is the fastest trust signal. Visitors evaluate star rating and volume before reading a single word."

Add a compact trust strip below the hero subtitle: `★ 4.7 on Google · 315+ Reviews · Est. 2002`. Small, understated, but visible within the first 2 seconds of landing.

**File:** `HeroSection.tsx`

---

## 3. Rockstar Brand Voice Restoration

**Research says:** Zero Tucson competitors have distinctive brand voice. Hush's rockstar identity is a differentiation asset that was sanitized.

Specific copy changes:
- Hero subtitle: "Salon & Day Spa" → "Where Tucson Comes to Feel Legendary"
- Artists section header: "Meet the Artists" → "Meet the Rockstars"
- Inner Circle: reference "Groupies" heritage in subtitle copy
- Luna concierge labels: warmer, more personality

**Files:** `HeroSection.tsx`, `ArtistsSection.tsx`, `CommunitySection.tsx`

---

## 4. Mobile Sticky Bar Upgrade (Dual CTA)

**Research says:** "72% of salon bookings begin on mobile. Bottom-of-screen sticky bar in the thumb zone with action-oriented copy outperforms single CTA."

Current bar has only a phone call button. Upgrade to dual layout:
- Left: "Find Your Experience" (gold, primary) — scrolls to quiz
- Right: Phone icon (secondary, compact)

This matches the research recommendation exactly.

**File:** `MobileStickyBar.tsx`

---

## 5. First-Visit Reassurance Block

**Research says:** "Policy clarity (cancellation, deposits, consultations) signals professionalism and reduces a common booking hesitation."

Add a compact "Your First Visit" block near the booking section with: what to expect, free consultation mention, cancellation policy, parking/location tip. Reduces first-timer anxiety — the #1 conversion blocker for new salon visitors.

**File:** `BookingCallbackSection.tsx`

---

## Files Changed Summary

| File | Change |
|------|--------|
| `TestimonialsSection.tsx` | 3→10 reviews, carousel on mobile, service tags |
| `HeroSection.tsx` | Trust badge strip + rockstar subtitle |
| `ArtistsSection.tsx` | "Meet the Rockstars" header |
| `CommunitySection.tsx` | Groupies heritage reference |
| `MobileStickyBar.tsx` | Dual CTA (Find Experience + Phone) |
| `BookingCallbackSection.tsx` | First-visit reassurance block |

---

## What This Does NOT Include (Needs External Dependencies)

- Before/after gallery → needs transformation photos from Hush
- Online booking engine → needs GHL/Vagaro integration
- Video testimonials → needs filming
- Stylist video intros → needs filming
- Multi-page SEO architecture → larger structural project