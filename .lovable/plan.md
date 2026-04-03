

# Comprehensive Site Audit: Hush Salon & Day Spa

## Overall Assessment: **8.2/10**
The site is a genuinely impressive single-page luxury salon experience. The guided discovery flow, contextual concierge system, and premium dark aesthetic are standout features. Below are all findings organized by severity.

---

## P0 -- Critical Bugs

### 1. Skincare testimonial misattributed
**File:** `ServicesSection.tsx` line 32-33
The Skincare card shows a testimonial from Alicia Robinson saying "FINALLY! I have found a great stylist in Arizona! Kathy is AMAZING!" -- this is a **hair** review, not skincare. The card is "Skincare & Spray Tan" but the review mentions a hair stylist. This damages credibility.
**Fix:** Replace with a verified skincare-specific review or remove the testimonial from this card.

### 2. Lashes testimonial is about hair
**File:** `ServicesSection.tsx` line 40
The Lashes card shows "Allison G is magical. I've gotten nonstop compliments on my **hair**" by Megan Petersen. This is a hair review on a Lashes card.
**Fix:** Replace with a verified lash-specific review.

### 3. Massage testimonial is about hair
**File:** `ServicesSection.tsx` line 48
The Massage card shows "Absolutely LOVE Hush Salon and my stylist Silviya!!!" -- Silviya is a hair stylist. This review has nothing to do with massage.
**Fix:** Replace with a verified massage-specific review or remove.

### 4. Hero video likely 404s on production
**File:** `HeroSection.tsx` line 25-33
The hero references `/videos/fashion-friday-hero.mp4` from the public directory. If this file doesn't exist, the video silently fails and the hero falls back to a static image with `blur-2xl` and `opacity-35` -- resulting in a very washed-out, unfocused hero on desktop. Need to verify the video file exists, or provide a cleaner static-image fallback.
**Fix:** Check if `/public/videos/fashion-friday-hero.mp4` exists. If not, remove the `<video>` element and use the hero image directly without blur for desktop.

### 5. Mute button is cosmetic-only
**File:** `LunaFloatingVoiceDock.tsx` line 162-166
The mute toggle sets `isMuted` state but **never actually mutes the microphone**. The comment says "ElevenLabs SDK doesn't expose a direct mute" but the state is displayed. Users think they're muted when they're not.
**Fix:** Either remove the mute button entirely, or implement actual muting via the Web Audio API (disconnect the mic MediaStreamTrack).

---

## P1 -- High Priority UX Issues

### 6. Duplicate "24 years" messaging in hero
The hero has three lines that say essentially the same thing:
- "Three founders still behind the chair · 24 years of transformations"
- "Tucson's trusted beauty destination for 24+ years."
- "Real stylists. Real transformations."
This is redundant. The subtitle and the body paragraph compete instead of complementing.
**Fix:** Remove the smaller body paragraph (lines 58-67) or merge into the subtitle. One clear value prop line is stronger than two overlapping ones.

### 7. "Speak with Luna" button hidden on mobile
**File:** `HeroSection.tsx` line 91 -- `hidden sm:flex`
Mobile users (the majority of salon traffic) never see the voice CTA in the hero. The mobile sticky bar only has "Find Your Experience," phone, and directions. Voice Luna is only accessible via the floating dock pill which is also desktop-only (`hidden md:flex` in `LunaFloatingVoiceDock.tsx` line 189).
**Fix:** Add a voice trigger to the mobile sticky bar, or make the floating dock visible on mobile.

### 8. Experience quiz "reveal" card duplicates the Personalized Plan section
After completing the quiz, the user sees an `ExperienceRevealCard` inside the quiz section. Then immediately below it is the `PersonalizedPlanSection` which shows almost identical information (same upsells, same cadence, same artist matching message). The reveal card even has a "See your full personalized plan" link pointing down to it.
**Fix:** Either collapse these into one section (remove the separate PersonalizedPlanSection and make the reveal card the definitive output), or differentiate their content more clearly.

### 9. Mobile sticky bar overlaps Luna chat bubble
The `MobileStickyBar` is `fixed bottom-0` with `z-40`. The `LunaChatWidget` bubble is `fixed bottom-[6.5rem]`. When both are visible, the chat bubble floats above the sticky bar. On shorter screens or with safe-area-inset, these can overlap or create a cluttered bottom zone.
**Fix:** Ensure proper spacing. The `6.5rem` offset may not account for the sticky bar's actual height with safe-area padding.

### 10. No accessibility skip-nav link
No skip navigation link exists for keyboard/screen reader users. With a fixed header and 10+ sections, keyboard users must tab through the entire nav to reach content.
**Fix:** Add a visually hidden skip link at the top of `<main>` that jumps to `#experience-finder` or main content.

### 11. "About" section says "23 years" but hero says "24 years"
**File:** `AboutSection.tsx` line 29 says "In 2002" and line 32 says "23 years later." `HeroSection.tsx` line 53 says "24 years of transformations." Current date is 2026, so it should be 24 years.
**Fix:** Update AboutSection to say "24 years" consistently.

---

## P2 -- Medium Priority Polish

### 12. Service cards grid is 3-column but has 5 cards
The services grid is `lg:grid-cols-3` with 5 items. This creates an asymmetric layout: 3 cards on top, 2 on the bottom row left-aligned. The bottom row looks incomplete.
**Fix:** Either change to `lg:grid-cols-5` (narrow cards) or use a 2-3 split with the last row centered, or add a 6th summary card ("View All Services").

### 13. Inner Circle perks include "Priority Booking" that doesn't exist
**File:** `CommunitySection.tsx` line 13-14 -- "Inner Circle members get early access to new openings and peak-time slots." This implies a feature that isn't built and likely doesn't exist at the salon.
**Fix:** Reword to be honest -- e.g., "Stay in the loop on new services and seasonal specials before anyone else."

### 14. Testimonials carousel dots are tiny on mobile
The dot indicators (1.5px width) are very hard to tap on mobile. 10 dots in a row creates a wide, hard-to-interact-with strip.
**Fix:** Use larger dots (8-10px), or reduce to 5-6 visible testimonials on mobile carousel, or replace dots with a simple "3/10" counter.

### 15. No loading/error state for hero image
If `hero-salon.jpg` fails to load, the entire hero shows as an empty dark background with text. No fallback or skeleton.
**Fix:** Add a CSS background-color fallback that approximates the image mood.

### 16. Form validation on callback section is minimal
Phone field accepts any text (no format validation). Email is `type="email"` but no regex. No real-time feedback on phone format.
**Fix:** Add basic phone format validation (10+ digits) and visual feedback.

### 17. Privacy policy is a minimal paragraph in a modal
The privacy policy is ~3 sentences. For TCPA compliance (mentioned in the copy), this may not be legally sufficient. No mention of cookies, data retention, or third-party services (Supabase, ElevenLabs, etc.).
**Fix:** Expand the privacy policy or link to a proper hosted policy page.

### 18. "Powered by Luna" in footer is confusing to end users
Regular salon customers won't know what "Luna" is as a technology brand. This reads as an ad.
**Fix:** Remove or change to "Powered by AI" or remove entirely.

---

## P3 -- Low Priority Enhancements

### 19. No meta description or OG tags
`index.html` likely lacks proper SEO meta tags for social sharing and search results.

### 20. Font loading causes FOUT
Google Fonts loaded via `@import` in CSS can cause a flash of unstyled text. Consider using `font-display: swap` (already in the Google Fonts URL) but also preloading critical fonts.

### 21. No 404 page content for deep routes
The `NotFound` page exists but is generic. Salon visitors who land on `/services` get redirected to `/#services` which works, but other typo'd URLs get a bare 404.

### 22. Team section "View Full Team" shows count but no search
With 20+ team members, a simple search/name filter would help returning clients find their stylist quickly.

### 23. Mobile menu doesn't trap focus
The mobile hamburger menu opens but doesn't trap keyboard focus. Users can tab behind the overlay.

### 24. Carousel auto-scroll doesn't pause on hover (desktop)
The testimonials carousel auto-scrolls but only pauses on button click (10s cooldown). Hovering over a review to read it doesn't pause auto-scroll.

---

## Summary Table

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| 1 | Skincare card has hair testimonial | P0 | Content accuracy |
| 2 | Lashes card has hair testimonial | P0 | Content accuracy |
| 3 | Massage card has hair testimonial | P0 | Content accuracy |
| 4 | Hero video may 404 on production | P0 | Visual bug |
| 5 | Mute button does nothing | P0 | Functional bug |
| 6 | Duplicate "24 years" copy in hero | P1 | Copy redundancy |
| 7 | Voice CTA inaccessible on mobile | P1 | Mobile UX |
| 8 | Quiz reveal duplicates Plan section | P1 | Content redundancy |
| 9 | Sticky bar + chat bubble overlap | P1 | Mobile layout |
| 10 | No skip-nav for accessibility | P1 | Accessibility |
| 11 | "23 years" vs "24 years" inconsistency | P1 | Content accuracy |
| 12 | 5 cards in 3-col grid = uneven layout | P2 | Visual polish |
| 13 | "Priority Booking" perk is fabricated | P2 | Content accuracy |
| 14 | Tiny carousel dots on mobile | P2 | Mobile UX |
| 15 | No hero image fallback | P2 | Resilience |
| 16 | No phone format validation | P2 | Form UX |
| 17 | Privacy policy legally thin | P2 | Legal |
| 18 | "Powered by Luna" confusing | P2 | Branding |
| 19 | Missing OG/meta tags | P3 | SEO |
| 20 | Font loading FOUT | P3 | Performance |
| 21 | Generic 404 page | P3 | Polish |
| 22 | No team search filter | P3 | Feature |
| 23 | Mobile menu no focus trap | P3 | Accessibility |
| 24 | Carousel no hover-pause | P3 | Desktop UX |

---

## Recommended Fix Order

**Phase 1 (P0 -- do now):**
- Fix 3 misattributed service card testimonials (#1, #2, #3)
- Verify hero video exists or clean up fallback (#4)
- Remove or fix mute button (#5)

**Phase 2 (P1 -- next sprint):**
- Consolidate hero copy (#6)
- Add mobile voice access (#7)
- Merge or differentiate reveal/plan sections (#8)
- Fix year inconsistency (#11)
- Add skip-nav (#10)

**Phase 3 (P2 -- polish):**
- Fix service grid layout (#12)
- Correct Inner Circle copy (#13)
- Improve mobile carousel UX (#14)
- Add form validation (#16)
- Expand privacy policy (#17)

