

## Luna Chat Panel — Ship All Fixes

Implementing all 7 fixes from Tier 1 + Tier 2 in the suggested build order.

### Phase 1 — Find My Look cleanup
- **Fix #1:** Gate cached results behind a session-fresh flag. Add `quizCompletedAt` timestamp to `ConciergeContext`. If absent or older than session start, show empty state with "Take the quiz" CTA that scrolls to `#experience-finder`.
- **Fix #2:** Remove non-interactive sub-tab breadcrumbs (Services/Type/Goal/Timing/Your Look). Replace with clean summary chips styled as labels (no hover, no cursor pointer).
- *Files:* `src/components/luna/FindMyLookTab.tsx`, `src/contexts/LunaContext.tsx`, `src/types/concierge.ts`

### Phase 2 — Artist booking context (biggest conversion win)
- **Fix #3:** On "Book" / "Book with [Artist]" click in `ArtistsTab`:
  1. Call `mergeConcierge({ preferredArtist, preferredArtistId })`
  2. Close panel, scroll to `#booking-callback`
- Update `BookingCallbackSection` to:
  1. Read `preferredArtist` from `useLuna()`
  2. Display gold-bordered badge "Requesting: [Artist Name]" above the form
  3. Include artist name in the submitted payload (hidden field)
- *Files:* `src/components/luna/ArtistsTab.tsx`, `src/components/BookingCallbackSection.tsx`

### Phase 3 — Allison Lashes filter verification
- **Fix #4:** Verify `serviceCategories: ['hair', 'skincare', 'lashes']` on Allison's record. Audit filter logic in `ArtistsTab.tsx` — confirm it reads `serviceCategories.includes(filter)` rather than `category === filter`.
- *Files:* `src/data/teamData.ts`, `src/components/luna/ArtistsTab.tsx`

### Phase 4 — Polish
- **Fix #5:** Add `excludeFromArtistGrid: true` to Kendell in `teamData.ts`. Filter her out of Artists tab grid (keep her data for "Call front desk" CTAs).
- **Fix #6:** Update Balayage entry in `servicesMenuData.ts` to "$96+ (final price after consultation)" so Explore tab and Services modal match.
- **Fix #7:** In `luna-chat` edge function, detect explicit booking intent (`/\b(book|schedule an? appointment|book me)\b/i`) on the user's last message. After streaming the response, append a structured marker (e.g., `\n\n[[INLINE_BOOKING_FORM]]`). `ChatTab` parses this marker and renders the existing inline lead capture form below the message.
- *Files:* `src/data/teamData.ts`, `src/components/luna/ArtistsTab.tsx`, `src/data/servicesMenuData.ts`, `supabase/functions/luna-chat/index.ts`, `src/components/luna/ChatTab.tsx`

### Files touched
- `src/contexts/LunaContext.tsx`
- `src/types/concierge.ts`
- `src/components/luna/FindMyLookTab.tsx`
- `src/components/luna/ArtistsTab.tsx`
- `src/components/luna/ChatTab.tsx`
- `src/components/BookingCallbackSection.tsx`
- `src/data/teamData.ts`
- `src/data/servicesMenuData.ts`
- `supabase/functions/luna-chat/index.ts`

No DB migrations. No new components. All changes additive — demo-safe.

