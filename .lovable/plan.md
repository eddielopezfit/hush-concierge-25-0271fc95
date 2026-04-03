

# Perplexity Audit v2 — Triage & Fix Plan

## Already Fixed (No Action Needed)

| Issue | Status |
|---|---|
| Misattributed testimonials on service cards | Fixed — Skincare/Lashes/Massage set to `null` |
| "23 years" vs "24 years" inconsistency | Fixed in AboutSection |
| "Priority Booking" fabricated perk | Fixed → "Insider Access" |
| "Powered by Luna" in footer | Fixed → "Powered by AI" |
| Missing OG/meta tags | Already present in index.html |
| Mute button cosmetic-only | Fixed with MediaStreamTrack toggle |
| Duplicate hero copy | Already removed |
| Skip-nav link | Already added |
| Service grid 3+2 uneven layout | Already fixed with centered bottom row |
| Phone validation | Already added |
| Founder photos | `Founders_Hush.jpg` exists — founders show initials because `photo: null` in teamData but the About section already uses the real group photo |

## Remaining Actionable Fixes

### Phase 1 — Quick Wins

**1. "1.00" Debug Text (P0)**
No matching code exists in the codebase. This is almost certainly a browser-cached artifact or a Framer Motion opacity interpolation rendering. Cannot fix what doesn't exist in code. **Monitor only — no action.**

**2. Hero Video Fallback Cleanup**
The `<video>` references `/videos/fashion-friday-hero.mp4` which likely doesn't exist. When it fails, the hero falls back to a blurred `opacity-35` background image — washed out on desktop.
- **Fix**: Remove the `<video>` element entirely. Use `heroImage` directly as the background with proper opacity (no blur) on desktop. Keep the overlay gradient.

**3. Auto-Scroll to Reveal Card After Quiz**
When the quiz completes, the reveal card appears but may be below the fold. User has to scroll to see their results.
- **Fix**: In `ExperienceFinderSection.tsx`, after `setCurrentStep("reveal")`, add a `setTimeout` that scrolls the reveal card into view using `scrollIntoView({ behavior: "smooth", block: "center" })`.

**4. "Speak with Luna" Label Clarity**
First-time visitors don't know what Luna is.
- **Fix**: Change button text from "Speak with Luna" to "Talk to Our AI Concierge" in the hero. Update the floating voice dock pill label similarly: "AI Concierge" subtitle beneath. Keep "Luna" in the chat widget since it's already labeled "Hush Concierge."

### Phase 2 — UX Improvements

**5. Voice Access on Mobile**
The voice pill is `hidden md:flex` — completely invisible on mobile. Mobile users (majority of salon traffic) have no voice access.
- **Fix**: Show the voice pill on mobile too. Change from `hidden md:flex` to `flex`. Adjust bottom offset to account for MobileStickyBar (increase from `bottom-24` to `bottom-[7.5rem]` on mobile).

**6. Visual Clutter — Two Floating Elements**
Voice pill + chat bubble both sit in bottom-right, creating clutter.
- **Fix**: Reposition the voice pill to bottom-left on mobile, keeping chat bubble bottom-right. On desktop, stack them vertically on the right with clear spacing (voice pill at `bottom-24`, chat at `bottom-6` — already in place).

**7. "View All Services & Pricing" Opens Hair Without Indication**
The link defaults to Hair modal with no warning.
- **Fix**: Change label to "View All Services & Pricing →" and open the modal with a new "all" mode that shows a department picker first, or simply change the text to "Browse Hair Menu & More" to set expectations. Simplest: change to show the first available service with tab navigation visible.

**8. Skincare/Lashes/Massage Missing Testimonials**
These were removed because they had misattributed hair reviews. They should have department-specific reviews.
- **Fix**: Source verified reviews from the legacy site. Use Patty's facial review for Skincare, a lash-specific review for Lashes, and Tammi's massage review for Massage. If no verified reviews exist, leave `null` (current state is acceptable).

### Phase 3 — Polish

**9. Carousel Hover-Pause on Desktop**
Already implemented in a previous fix. **No action.**

**10. Mobile Menu Focus Trap**
The hamburger menu doesn't trap keyboard focus.
- **Fix**: Add `useEffect` in Navigation that, when `isMobileMenuOpen`, traps focus within the menu container using `focusTrap` pattern (first/last element tab cycling).

**11. "Powered by AI" Still Potentially Confusing**
- **Fix**: Remove the line entirely. It adds no value to salon customers.

---

## Files Changed

| File | Changes |
|---|---|
| `src/components/HeroSection.tsx` | Remove `<video>` element, use hero image directly without blur on desktop, update "Speak with Luna" label |
| `src/components/ExperienceFinderSection.tsx` | Auto-scroll to reveal card after quiz completion |
| `src/components/LunaFloatingVoiceDock.tsx` | Show on mobile, adjust positioning, update label |
| `src/components/LunaChatWidget.tsx` | Adjust mobile positioning to avoid voice pill overlap |
| `src/components/Navigation.tsx` | Add focus trap for mobile menu |
| `src/components/FooterSection.tsx` | Remove "Powered by AI" line |

No database, edge function, or backend changes.

