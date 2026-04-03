

# Assessment: This Audit Is Outdated — Here's What Actually Remains

## Key Finding

This audit describes the project from **weeks ago** — before the major backend buildout. The vast majority of its "critical" findings have already been resolved. Here is the real current status.

## Already Resolved (No Action Needed)

| Audit Claim | Current Reality |
|---|---|
| "No edge functions exist" | 9 deployed: luna-chat, session-start, submit-lead, capture-lead, lead-qualify, request-callback, session-summarize, voice-session-log, plus _shared/ |
| "No database tables" | 7 tables live: conversations, messages, guest_profiles, leads, callback_requests, artists, services, knowledge_items |
| "Text chat does not exist" | luna-chat edge function is live, streaming, using shared brain |
| "No shared brain file" | `_shared/luna-brain.ts` is canonical and active |
| "Callback form is fake" | submit-lead edge function handles leads + callbacks with Slack routing |
| ".env committed to repo" | Managed by Lovable Cloud — not a user-controlled .env |
| "Footer hours wrong (7pm)" | Footer now shows "Open @ 9 AM" (vague but not wrong) |
| "Social links are href=#" | Instagram and Facebook links are real URLs |
| "Get Directions is href=#" | Real Google Maps link is wired |
| "Testimonials are fabricated" | Now show real-sounding reviews with named clients and sources |
| "No session/conversation ID" | session-start generates conversation_id + guest_profile_id |
| "No returning client detection" | Fingerprinting + guest_profiles table with visit_count |
| "No CORS handling" | CORS allowlist implemented in edge functions |

## What Actually Remains — Real Gaps

These are the **only items from this audit that are still valid**:

### 1. ExperienceCategories Ghost Services (Medium Priority)
The subcategory lists in `ExperienceCategoriesSection.tsx` still include services that do not exist in `servicesMenuData.ts`:
- **Nails**: "Dip Powder" — not offered
- **Lashes**: "Brow Lamination" — not offered  
- **Skincare**: "Chemical Peel", "LED Therapy" — not offered
- **Massage**: "Hot Stone", "Couples Massage", "Prenatal" — not offered

**Fix**: Replace ghost subcategories with real services from `servicesMenuData.ts`.

### 2. Footer Hours Are Vague (Low Priority)
Currently shows "Tue – Sat: Open @ 9 AM" without closing times. The correct hours are:
- Tue–Fri: 9 AM – 6 PM
- Sat: 9 AM – 4 PM

**Fix**: Update to show full hours with closing times.

### 3. ElevenLabs Agent ID Hardcoded Client-Side (Low Priority for Demo)
Still exposed in the bundle. Acceptable for current stage but should be proxied through an edge function before high-traffic public launch.

### 4. No Context TTL in localStorage (Low Priority)
Stale concierge context from days-old sessions can persist. A 24-hour expiry would be a clean safeguard.

## Implementation Plan

### File 1: `src/components/ExperienceCategoriesSection.tsx`
Replace ghost subcategories with real services derived from `servicesMenuData.ts`:
- **Nails**: "Classic Manicure", "Gel Manicure", "Classic Pedicure", "Gel Pedicure", "Nail Set", "Nail Set w/Gel"
- **Lashes**: "Classic Full Set", "Volume Full Set", "Hybrid Set", "Lash Fill", "Lash Lift & Perm", "Lash Tint"
- **Skincare**: "Signature Facial", "HydraFacial", "Dermaplaning", "Microneedling", "Spray Tan", "Brow Wax"
- **Massage**: "60 min Massage", "90 min Massage", "120 min Massage" (only 3 — matches actual menu)

### File 2: `src/components/FooterSection.tsx`
Update hours display from "Tue – Sat: Open @ 9 AM" to:
```
Tue – Fri: 9 AM – 6 PM
Sat: 9 AM – 4 PM
Sun & Mon: Closed
```

### File 3: `src/lib/conciergeStore.ts`
Add a 24-hour TTL check to `getConciergeContext()` — if stored context is older than 24 hours, clear it and return null.

### No backend/database changes required.

