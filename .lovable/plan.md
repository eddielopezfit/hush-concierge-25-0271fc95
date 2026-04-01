

# Team Photo Placement — Community / Inner Circle Section

## Decision

The **Inner Circle section** is the clear winner. Here's the strategic reasoning:

- **About section** already has the founders photo — adding a second image there creates visual clutter
- **Artists section** features individual artist cards — a group shot competes with the per-artist layout
- **Inner Circle section has ZERO imagery** — it's all text and icon cards. A team photo here is the single highest-impact visual upgrade available on the page

The team photo answers the question every visitor subconsciously asks when they see "Join the Inner Circle": **who am I joining?** Showing the full crew transforms an abstract loyalty pitch into a visible community.

## Implementation

### 1. Copy photo to `public/images/hush-team.jpg`

### 2. Update `CommunitySection.tsx`
Add a full-width team photo between the section header and the perks cards grid:

- Rounded container with the signature `glow-gold-subtle` treatment (matching the About section style)
- Gentle gradient overlay from bottom for text readability
- A short caption: *"The crew behind the chair"* in display italic
- `object-cover` with `object-[center_30%]` to keep faces in frame
- Max height ~280px to stay proportional without dominating the section
- Responsive: slightly taller on desktop, tighter crop on mobile

### 3. No other section changes
The perks cards, email form, and all existing content stay exactly as-is — the photo slots in above them.

## Files Changed
| File | Change |
|------|--------|
| `public/images/hush-team.jpg` | New asset |
| `src/components/CommunitySection.tsx` | Add team photo block between header and perks grid |

