## Goal

Address the audit's #1 finding: the hairstyle preview is the salon's most differentiated feature but is functionally invisible. Surface it across the three flagship surfaces (Hero → Intake results → Luna chat) and strengthen its in-card placement — without violating the Hero's "single primary decision" rule.

## Changes

### 1. Hero — persistent secondary "Preview a New Hairstyle" link
File: `src/components/HeroSection.tsx`

Add a single ghost-style entry point under "or talk to our AI concierge", using the existing reusable `TryOnEntryButton` (variant `ghost`). This replaces the audit's "appears on first video frame only" perception — it will now be permanently visible, not tied to any video cycle.

Final hero CTA stack (still respects the single-primary rule):
```
[ FIND YOUR EXPERIENCE ]            ← primary gold (unchanged)
or talk to our AI concierge          ← existing secondary link
✨ Preview a New Hairstyle           ← NEW — ghost link, always visible
Resume my plan                       ← existing, only if hasPlan
[ Open Today badge ]
```

The ghost variant is visually quieter than the gold primary, so "Find Your Experience" remains dominant.

### 2. Intake results — bridge into Try-On for hair guests
File: `src/components/ExperienceRevealCard.tsx`

When `conciergeContext.categories` includes `"hair"`, render a soft bridge row above the "See your full personalized plan" link:

> Curious how it would look? **Preview a New Hairstyle →**

Uses `TryOnEntryButton variant="ghost" source="Experience Reveal"`. Only renders for hair-relevant reveals so non-hair guests aren't confused.

### 3. Luna chat — proactive Try-On chip when hair is the category
File: `src/components/luna/chat/types.ts` (and the chat component that renders quick replies — locate during implementation, likely `ChatTab.tsx` or a quick-reply config)

Add a contextual quick-reply chip "🪄 Preview a New Hairstyle" that appears in Luna's chat when `conciergeContext.primary_category === "hair"` (or `categories.includes("hair")`). Tapping it closes Luna's panel and opens the Try-On modal (`source: "Luna Chat"`), so the two flagship features finally connect.

This is the audit's most strategic fix: "Luna never proactively surfaces the hairstyle preview."

### 4. Services hair card — promote the entry button
File: `src/components/ServicesSection.tsx`

Change the hair card's `<TryOnEntryButton>` from `variant="chip"` to `variant="primary"` (gold button) and move it into the action row alongside "Let Luna guide you" / "View full menu & pricing". This makes it scan as a real CTA, not an afterthought tag — the audit specifically called this out: "should be a PRIMARY CTA."

Action row becomes a 3-button stack on mobile, 3-column on desktop:
```
[ ✨ Preview Hairstyle ]  [ 💬 Let Luna guide ]  [ View menu ]
```

### 5. Funnel tracking touch-up
The `source` prop is already wired through `TryOnEntryButton` → `TryOnExperience` → `trackFunnelEvent("hairstyle_preview", "started", { source })`. New entry points use distinct `source` strings (`"Hero"`, `"Experience Reveal"`, `"Luna Chat"`) so we can measure which surface drives the most preview starts after this ships.

## Out of scope (intentional)

- **Sticky "Book Now" in nav** — the mobile sticky bar already has a primary "Book a Visit" button; adding it to the desktop nav would compete with "Find Your Experience" and "Start Luna." Revisit only if analytics show desktop drop-off.
- **Face shape / undertone questions in the intake quiz** — already supported as optional refine chips inside the Try-On modal itself; adding them to the upstream quiz would lengthen it and was previously simplified for a reason. Defer until we have data showing the modal chips are under-used.
- **Replacing video-cycle CTA logic** — once the hero shows the persistent ghost link, the rotating-video CTA-visibility issue is moot. No video logic changes needed.
- **Post-preview booking CTA** — already exists as the gold "Book this look" button on the `convert` step (verified in `TryOnExperience.tsx` line 1410). The audit missed this; no change required.

## Files changed

1. `src/components/HeroSection.tsx` — add `<TryOnEntryButton variant="ghost" source="Hero" />`
2. `src/components/ExperienceRevealCard.tsx` — add hair-only Try-On bridge link
3. `src/components/ServicesSection.tsx` — promote chip to primary, integrate into action row
4. Luna chat quick-replies (file located during implementation) — add contextual hair chip
