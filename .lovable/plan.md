

# Hush AI Concierge — Phase 1: Make It Real

## Overview

Phase 1 addresses the most critical gap: making every user-facing action produce a real outcome. The callback form already saves to `leads` — but there's no dedicated `callback_requests` table with status tracking, the BookingSection buttons are dead, testimonials are fictional, and artist context injection has a bug. This plan covers Weeks 1-2 of the roadmap.

---

## What Already Works (No Changes Needed)

- **CallbackSection.tsx** — Already wired to Supabase via `saveLead()`. Saves to `leads` table with error handling, TCPA consent, and success state. This is functional.
- **FooterSection.tsx** — Social links (Instagram, Facebook), Get Directions, phone, hours — all already real and correct.
- **ArtistsSection.tsx** — Real team roster with 16 photos already imported. Monogram fallbacks for 5 members without photos.
- **LunaVoiceWidget.tsx** — ElevenLabs integration with dynamic variables. Working.
- **saveSession.ts / conciergeLabels.ts** — Normalization layer already in place.

---

## What Needs Fixing

### 1. Create `callback_requests` Table (New Supabase Migration)

The existing `leads` table works for basic lead capture, but the roadmap calls for a richer `callback_requests` table with status tracking, source context, and concierge context snapshots. This enables the salon to manage callbacks as a pipeline.

**Database migration:**
- Create `callback_requests` table with: `id`, `full_name`, `phone`, `email`, `interested_in`, `timing`, `message`, `source`, `concierge_context` (jsonb), `status` (default 'new'), `created_at`
- RLS: anon INSERT allowed, authenticated SELECT/UPDATE for future admin

**Update CallbackSection.tsx:**
- Change `saveLead()` call to insert into `callback_requests` instead
- Include `message`, `source: 'callback_form'`, and full `concierge_context` snapshot
- Keep existing `leads` insert as well (backward compatibility) or migrate fully

### 2. Wire Dead Buttons in BookingSection.tsx

The three cards ("Talk to Luna", "Chat with Luna", "Call the Front Desk") have no `onClick` handlers on the first two buttons.

**Changes:**
- Import `LunaModal`, `useLunaModal`, and `ConciergeContext`
- Add `onClick` to "Speak with Luna" button — opens LunaModal with `source: "Booking Section"`
- Add `onClick` to "Start a Chat" button — scrolls to `#callback` section (same as current LunaModal chat behavior) or opens LunaModal in chat mode
- Render `<LunaModal>` in the component

### 3. Replace Fictional Testimonials

**TestimonialsSection.tsx:**
- Replace 3 fake testimonials with verified real reviews:
  - Andrea Mitchell (Facebook) — Whitney blonde review
  - Cara B Foster (Facebook) — Michelle color correction
  - Megan Petersen (Google, Jan 2026) — Allison hair review
- Update stats line from "500+ five-star reviews" to "4.7 stars on Google · 315+ Facebook reviews"

### 4. Fix Artist Context Injection

**ArtistsSection.tsx line 121:**
- `categories: [artist.department.toLowerCase() as any]` — this passes "founders", "front desk", "esthetics" etc. which are not valid `ServiceCategoryId` values
- Fix: map department strings to valid category IDs ("Esthetics" → "skincare", "Founders" → "hair", "Front Desk" → skip/null)

### 5. Create Shared Data Files

**Create `src/data/teamData.ts`:**
- Extract the `artists` array from `ArtistsSection.tsx` into a shared data file
- Add `TeamMember` interface with full attributes: `id`, `name`, `department`, `role`, `photo`, `specialty`, `specialties`, `bestFor`, `serviceIds`, `instagram`, `directPhone`, `isPrimaryBooking`
- Both `ArtistsSection.tsx` and `luna/ArtistsTab.tsx` import from here (single source of truth)

**Create `src/data/categoryData.ts`:**
- Extract shared category definitions (IDs, labels, icons, goals, timings) from `ExperienceFinderSection.tsx`
- Import in: `ExperienceFinderSection`, `CallbackSection`, `ExperienceCategoriesSection`, `LunaModal`
- Eliminates 4 local re-definitions of the same category list

### 6. Add `preferredArtist` to ConciergeContext

**`src/types/concierge.ts`:**
- Add `preferredArtist?: string` and `preferredArtistId?: string`
- Update `ArtistsSection.tsx` to set these fields instead of using `sessionStorage`
- Update `conciergeStore.ts` merge logic to include these fields

### 7. Upgrade `luna_context_summary` to Natural Language

**`src/lib/conciergeStore.ts`:**
- The `buildDynamicVariables` function currently produces `"Selected: Hair • Refresh • Today"` — this violates the requirement for natural language
- Change to: `"You're exploring Hair services, aiming to refresh, and looking to book today."`
- Already specified in a prior prompt but the current code still uses `"Selected: ..."` format

---

## Files Changed Summary

| File | Action |
|---|---|
| **Supabase migration** | Create `callback_requests` table |
| `CallbackSection.tsx` | Insert into `callback_requests` with full context |
| `BookingSection.tsx` | Wire dead buttons to LunaModal |
| `TestimonialsSection.tsx` | Replace with 3 real verified reviews |
| `ArtistsSection.tsx` | Fix department→category mapping, import from teamData |
| **New:** `src/data/teamData.ts` | Single source of truth for team roster |
| **New:** `src/data/categoryData.ts` | Shared category/goal/timing definitions |
| `src/types/concierge.ts` | Add `preferredArtist` fields |
| `src/lib/conciergeStore.ts` | Fix `luna_context_summary` to natural language |
| `luna/ArtistsTab.tsx` | Import from shared teamData |

---

## What This Does NOT Include (Phase 2+)

- Recommendation engine rebuild (`recommendationEngine.ts`)
- Global LunaContext provider (removing local LunaModal instances)
- Enriched service data model
- Supabase intelligence schema (analytics_events, conversation_logs)
- Text chat via edge function
- Conversational flows (bridal, color correction)

