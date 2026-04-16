

# Deep Audit: Luna Concierge Panel — Full Findings & Improvement Plan

---

## Audit Summary

After reading every tab component, the edge function, brain prompt, journey tracker, session manager, concierge store, upsell engine, experience reveal logic, and booking decision card, here is a comprehensive assessment organized by tab, then cross-cutting issues.

---

## TAB-BY-TAB FINDINGS

### 1. Find My Look (FindMyLookTab.tsx)
**What works:** 3-step flow (categories → goal → timing) with step indicator, back navigation, multi-category selection, and reveal card with BookingDecisionCard.

**Issues found:**
- **No subtype step.** The ConciergeContext supports `service_subtype` (cut/color/both for hair, manicure/pedicure for nails, etc.) but FindMyLookTab never asks for it. The greeting in ChatTab and the reveal data both branch heavily on subtype — but users who go through Find My Look always arrive with `service_subtype: undefined`. This means the chat greeting falls back to generic category-level messages and the reveal card uses imprecise time/price estimates.
- **No guest name capture.** Memory says Step 1 should capture `guest_name` for personalization, but the current implementation skips this entirely. The `buildLunaFirstMessage` function and `buildConversationalSummary` both check for `firstName` but it's never populated from this flow.
- **"Next" button uses generic label.** Should use intent-driven label per the "No Continue" rule — currently says "Next" which is acceptable but could be stronger.

### 2. Explore (ExploreTab.tsx)
**What works:** Category grid with drill-down to full pricing, direct contacts shown for applicable departments, "Get a Recommendation" CTA linking to Find My Look.

**Issues found:**
- **No context injection.** Browsing services in Explore doesn't update `ConciergeContext` at all. If a user reads through all nail pricing and then switches to Chat, Luna has zero awareness of what they explored. The `trackServiceClick` function exists in journeyTracker but is never called from ExploreTab.
- **Hair sub-categories (Blonde, Brunette, Bold Color, Extensions) all map to the same service ID "hair."** There's no differentiation — tapping "Blonde" vs "Bold Color" shows identical pricing because both resolve to the same `servicesMenuData` entry. These look-based categories suggest editorial curation but deliver generic results.
- **No "Chat with Luna about this" CTA** from a specific service drill-down. The only exit is "Get a Recommendation" which goes to Find My Look, losing the specific service they were reading.

### 3. Artists (ArtistsTab.tsx)
**What works:** Department filter pills, artist cards with photo/specialty/bestFor, full profile detail view with legacyBio, knownFor tags, fitStatement, and booking CTA.

**Issues found:**
- **"Book with [Name]" button scrolls to `#callback` but the panel stays open**, so the user doesn't see the booking section. There's no close-panel logic after clicking.
- **No context injection.** Clicking an artist's "Book" or "Full Profile" doesn't set `preferredArtist` or `preferredArtistId` in ConciergeContext. The types support it, the ChatTab greeting doesn't use it, and the journey tracker's `trackArtistClick` is never called from this tab.
- **No "Ask Luna about this artist" action** from the profile view.

### 4. My Plan (MyPlanTab.tsx)
**What works:** Empty state with CTA to Find My Look, recommendation card showing service + price + urgency badge, "Luna's Advice" next step card, BookingDecisionCard, and "Start a new search" link.

**Issues found:**
- **Upsell engine exists but is never used.** `getUpsells()` is built and ready in `upsellEngine.ts` but MyPlanTab never calls it. The plan could show "Enhance your experience" add-ons (conditioning treatment, gel upgrade, etc.) but doesn't.
- **Cadence engine exists but is never used.** `cadenceEngine.ts` presumably calculates return-visit cadence but isn't referenced anywhere in the panel.
- **No personalization.** The plan doesn't show the user's name even when captured, and "Curated For You" feels generic since it's just the lunaBrain's goal-based lookup.

### 5. Chat (ChatTab.tsx)
**What works:** Context-aware greetings branching on category+subtype+goal+timing, context pills, smart chips, persistent quick replies that adapt to conversation topic, in-chat action buttons (scroll, tab switch, phone, callback), lead capture form after 4th successful exchange, new conversation button, streaming responses with markdown rendering, error handling with recovery quick replies.

**Issues found:**
- **Journey context reads from `sessionStorage` but ConciergeContext is in `localStorage`.** The `getJourneyContextString()` function tries to read concierge context from `sessionStorage` (line 128) but the actual context is stored in `localStorage` under the same key. This means Luna's AI never receives the user's Experience Finder selections in the `journeyContext` payload — it's effectively empty for that section.
- **`getConciergeContext` is imported but never called.** The import exists (line 5) but the function is unused — the component correctly uses `useLuna().conciergeContext` instead. However, the journey tracker's sessionStorage read is still broken.
- **"Connect me with the team" quick reply triggers `window.open("tel:...")` on desktop** where it may not do anything useful. Should offer the number to copy or show a "Call" button inline instead.
- **No conversation persistence across page reloads.** Messages are stored in React state only. If the user refreshes, the entire chat history is lost. The messages ARE persisted to the database via the edge function, but they're never loaded back on init.

---

## CROSS-CUTTING ISSUES

### A. Context Flow Gaps
The biggest systemic issue: **tabs operate in silos.** The ConciergeContext is designed to be the shared state, but:
- Find My Look writes context but skips subtype and name
- Explore doesn't write anything
- Artists doesn't write `preferredArtist`/`preferredArtistId`
- Chat reads context well but the AI's journeyContext is broken (sessionStorage vs localStorage mismatch)
- Journey tracker's `trackArtistClick` and `trackServiceClick` are defined but never called from the panel tabs

### B. Missing: Returning Client Awareness
The session-start edge function returns `is_returning` and `visit_count`, but this data is never surfaced in the panel. A returning guest with 5 visits should see a different experience than a first-timer.

### C. Missing: Cross-Tab Navigation Breadcrumbs
When Luna says "See our team" and the user clicks to ArtistsTab, there's no way back to the conversation they were having. Tab switching loses chat scroll position.

### D. No Upsell/Add-on Surface
The upsell engine is fully built with category-specific add-ons but completely unused in the UI.

---

## IMPLEMENTATION PLAN

### Step 1: Fix Journey Context Bug (Critical)
Fix `journeyTracker.ts` line 128 to read from `localStorage` instead of `sessionStorage` so Luna's AI actually receives the user's concierge selections.

### Step 2: Add Subtype Step to Find My Look
After category selection (step 1), show a category-specific qualifier step (cut/color/both for hair, manicure/pedicure for nails, etc.) before goal. Wire it into `ConciergeContext.service_subtype`. This makes the reveal card, chat greeting, and My Plan all dramatically more specific.

### Step 3: Wire Context from Explore & Artists Tabs
- **ExploreTab:** When a user drills into a category, call `mergeConcierge({ category: id })` and `trackServiceClick()`. Add a "Chat with Luna about [Service]" button on service detail views.
- **ArtistsTab:** On "Book" or "Full Profile" click, call `mergeConcierge({ preferredArtist: name, preferredArtistId: id })` and `trackArtistClick()`. After "Book with [Name]", close the panel then scroll.

### Step 4: Surface Upsells in My Plan
Call `getUpsells(conciergeContext)` in MyPlanTab and render 1-3 add-on suggestions below the main recommendation card with a clear "Add to my experience" feel.

### Step 5: Add Guest Name Capture
Add a first-name input to Find My Look step 1 (optional, soft prompt). Store via `setGuestFirstName()` so the greeting, plan header, and lead form can personalize.

### Step 6: Returning Client Awareness
Read `is_returning` and `visit_count` from session-start response. If returning, show a "Welcome back" badge in the panel header and adjust the Chat greeting to be warmer/more direct.

### Step 7: Panel Close on Booking Scroll
When any "Book" CTA triggers a scroll to `#callback`, also close the Luna panel so the user sees the booking section.

### Step 8: Desktop Phone Number Handling
When "Connect me with the team" is clicked on desktop (non-touch), show the number inline with a copy button instead of trying `tel:` links.

---

## Priority Order
1. **Fix journey context bug** (Step 1) — Luna's AI is flying blind without it
2. **Add subtype step** (Step 2) — unlocks all the existing subtype-specific logic
3. **Wire Explore/Artists context** (Step 3) — connects the silos
4. **Surface upsells** (Step 4) — already built, just needs rendering
5. **Panel close on booking** (Step 7) — quick UX fix
6. Steps 5, 6, 8 — polish and personalization

