

# Reduce Mobile CTA Clutter

## Problem
On mobile, the hero viewport shows **6 interactive elements** competing for attention:
1. Hero "Find Your Experience" button
2. "Open Today" hours badge
3. AI Concierge voice pill (floating, bottom-left)
4. Ask Luna chat bubble (floating, bottom-right)
5. MobileStickyBar "Find Your Experience" (duplicate of #1)
6. MobileStickyBar Phone + Directions icons

This creates visual noise and violates the "Zero Dead Ends" principle by overwhelming rather than guiding.

## Solution

**Hide the hero CTA on mobile** since the sticky bar already duplicates it. Keep the sticky bar as the single persistent action zone. Consolidate floating widgets so they don't stack on top of each other.

### Changes

**1. Hide hero "Find Your Experience" button on mobile**
`src/components/HeroSection.tsx` — Add `hidden sm:flex` to the primary CTA wrapper so on mobile the hero is purely atmospheric (headline + tagline + hours badge). The sticky bar handles conversion.

**2. Hide hero hours badge when sticky bar is visible**
The sticky bar already signals "we're here." Remove the hours badge from the hero on mobile to reduce clutter — or move it into the sticky bar if desired.

**3. Consolidate floating widgets on mobile**
Combine the AI Concierge pill and Ask Luna bubble into a single floating action button on mobile. Tapping it opens the Luna chat widget (which already has voice access via the chat tabs). This removes one floating element.
- `src/components/LunaFloatingVoiceDock.tsx` — Hide on mobile (`hidden md:flex`)
- `src/components/LunaChatWidget.tsx` — Keep as the sole floating widget on mobile, relabel bubble to "Luna" or "AI Concierge" to cover both voice and chat entry points

**4. Simplify MobileStickyBar**
Keep it as-is — it's well-designed with the three-button thumb-zone layout (Find Experience + Call + Directions). This becomes the only persistent CTA bar on mobile.

### Result: Mobile CTA count drops from 6 to 3
- MobileStickyBar (Find Experience + Call + Directions) — persistent
- Single Luna floating bubble — persistent
- Hero becomes a clean brand moment with no competing buttons

### Files Modified
| File | Change |
|---|---|
| `src/components/HeroSection.tsx` | Hide primary CTA + hours badge on mobile |
| `src/components/LunaFloatingVoiceDock.tsx` | Hide on mobile viewports |
| `src/components/LunaChatWidget.tsx` | Update mobile bubble label to cover both voice/chat |

