

# Hush Digital Hub — Full UX Audit & Blue Ocean Optimization Plan

## Critical Issues Found

### 1. Chat Widget Auto-Opens (Intrusive — Your #1 Concern)
The `LunaChatWidget` auto-opens after 12 seconds AND shows proactive tooltips every 15 seconds after 30s. This is aggressive and undermines the premium experience. A luxury brand should never interrupt — it should invite.

**Fix:** Remove auto-open timer entirely. Remove proactive tooltip system. Keep the bubble with a subtle badge dot after 15s — no pop-ups, no auto-expansion. Luna is available when the guest is ready, not before.

### 2. Artist Suggestions Create Bias (Your #2 Concern)
The `ExperienceRevealCard` shows "Great fits for your goals" with 2-3 specific stylists hardcoded in `experienceReveal.ts` (e.g., color always shows Michelle, Whitney, Charly). This is AI-driven artist selection that contradicts the brand's neutrality guardrail and could create internal team friction.

**Fix:** Remove the `stylistFits` section from `ExperienceRevealCard` entirely. Replace with a neutral "Meet the team" prompt: "Your artist match depends on your unique needs — the front desk will pair you perfectly." Remove `subtypeStylistOverrides` mapping. The Luna panel Artists tab can still show filterable roster without recommending specific people.

### 3. No Dedicated Menu/Services Page
Currently services are cards that open modals with accordion pricing. This works but violates SEO best practice (research says multi-page architecture captures 10x more search queries). More importantly, a first-time visitor scanning services has no single place to see everything at a glance.

**Fix (Phase 1 — no routing change):** Add a "Full Menu" nav link that scrolls to a new expanded services section OR opens a full-screen overlay with all 5 categories displayed simultaneously (not one-at-a-time modals). This gives the "menu page" feel without adding routes yet. Phase 2 would be actual multi-page routing.

### 4. "Build Your Experience" Section — Redundant & Confusing
Looking at the screenshot you shared: This section shows "Your Experience So Far" with a depth indicator, but it's essentially a *read-back* of what the user already selected in the Experience Finder above. It adds cognitive load without new value. The user already got their reveal card. Seeing "SHAPING" and "Hair" pills again doesn't move them forward.

**Fix:** Transform this from a passive summary into an active conversion point. Replace with a simpler "Your Visit, Designed by Luna" section that only appears when the user has context (hide when empty instead of showing "Start Building Your Experience" placeholder). Make it a compact, elegant summary card — not a full section — integrated closer to the Booking section.

### 5. Too Many Luna Entry Points (Cognitive Overload)
Counting all the ways to reach Luna on this page:
- Hero: "Find Your Experience" + "Speak with Luna"
- Experience Finder: "Speak with Luna" / "Chat with Luna" at end
- Service cards: "Ask Luna About This" on every card
- Service modals: "Speak with Luna" + "Chat with Luna"
- Build Experience: "Let Luna Design Your Experience"
- Booking section: "Talk to Luna" + "Chat with Luna" cards
- Floating voice dock (bottom right)
- Chat widget bubble (bottom right)
- Mobile sticky bar

That's **11+ Luna entry points** on a single page. This dilutes the premium feel and creates decision paralysis.

**Fix:** Consolidate to 4 clear touchpoints:
1. Hero primary CTA → Experience Finder
2. Experience Finder completion → Reveal + Booking Decision
3. Service modals → "Speak with Luna" / "Chat with Luna" (contextual, makes sense here)
4. Floating bubble (passive, user-initiated only)

Remove "Ask Luna About This" from service cards (the card click already opens the menu — that's enough). Remove the 3-card Luna/Chat/Phone grid from booking section (the callback form IS the conversion point).

---

## Section-by-Section Optimization

### Hero ✅ Strong
Video background, trust badge, clear CTA. Minor tweak: the "Find Your Experience" button text could be warmer — "Discover Your Experience" or "Start Your Journey."

### Experience Finder ✅ Strong Core, Minor Polish
The 4-step wizard is the blue ocean differentiator. Needs:
- Remove the "Speak with Luna" / "Chat with Luna" dual CTA at the qualifier step — instead show a single "See My Results" button that goes to the reveal card inline
- The reveal card should be the conversion moment, not a Luna launch

### Services Section ⚠️ Needs Work
- Remove "Ask Luna About This" button from cards (cluttered)
- Keep "View full menu & pricing" as the primary card action
- Add a "View All Services & Pricing" link at the top of the section for users who want the full picture

### Artists Section ✅ Mostly Good
- Remove any implicit artist recommendations from reveal flows
- Keep the filterable grid as browse-only

### Build Experience Section ❌ Rethink
- Current: Passive summary of user selections with redundant pills
- Proposed: Either remove entirely (the Reveal Card in the Finder already serves this purpose) OR convert into a compact "Your Visit Summary" that only renders when context exists, placed just above the Booking section

### Testimonials ✅ Recently Upgraded
10 reviews with carousel — good.

### About ✅ Strong
Founder story, stats, photo — solid trust section.

### Community / Inner Circle ✅ Adequate
Could be stronger with actual loyalty program details but that's Phase 2.

### Booking & Callback ⚠️ Simplify
- Remove the 3-card Luna/Chat/Phone row — it's redundant with the floating widgets and adds a full viewport of content before the actual form
- Lead with the callback form directly after the "First Visit" reassurance block
- Keep phone number as a simple text link below the form

---

## Files Changed Summary

| File | Change |
|------|--------|
| `LunaChatWidget.tsx` | Remove 12s auto-open, remove proactive tooltip system, keep passive bubble only |
| `ExperienceRevealCard.tsx` | Remove stylistFits section, replace with neutral front-desk-pairing message |
| `experienceReveal.ts` | Remove `subtypeStylistOverrides` and `getStylistFits` function |
| `ExperienceFinderSection.tsx` | Replace dual Speak/Chat CTAs at qualifier step with single "See My Results" button |
| `ServicesSection.tsx` | Remove "Ask Luna About This" button, add "View All Services" link |
| `BuildExperienceSection.tsx` | Collapse into compact summary card, hide when no context, remove section-level CTA |
| `BookingCallbackSection.tsx` | Remove 3-card Luna/Chat/Phone grid, lead with reassurance + form directly |
| `Navigation.tsx` | Add "Menu" nav link pointing to services section |

## What This Achieves
- **Zero intrusive pop-ups** — Luna is present but never pushes
- **Zero artist bias** — system guides, humans match
- **Cleaner conversion funnel** — fewer CTAs = less decision fatigue = higher conversion
- **Faster time-to-value** — users reach the callback form 2 scroll-lengths sooner
- **Blue ocean maintained** — Experience Finder + Reveal Card remain the differentiator, but the surrounding noise is stripped away

