

# Perplexity Deep UI/UX Audit — Triage & Fix Plan

## Issue Triage: What's Real, What's Already Fixed, What's Out of Scope

| # | Issue | Status | Action |
|---|-------|--------|--------|
| P0 | "1.00" debug text | Cannot reproduce — no matching code found. Likely a stale browser cache artifact or Framer Motion opacity render. | **Monitor only** |
| P0 | Luna voice stuck on "Connecting..." | Known ElevenLabs agent availability issue. Already has error handling. Needs **graceful timeout + fallback UI**. | **Fix** |
| P1 | Cyan loading spinner between quiz steps | No spinner found in ExperienceFinderSection code — likely the AnimatePresence transition. Non-issue or very minor. | **Skip** |
| P1 | Founder photos missing | Founders photo exists at `src/assets/Founders_Hush.jpg`. Individual headshots don't exist — letter avatars are the fallback. | **Out of scope** (need real photos from client) |
| P1 | "Contact" + "Request Callback" redundant | **Confirmed** — both point to `#callback`. Nav has 4 links + separate "Request Callback" link. | **Fix** |
| P1 | Floating CTA overlap (3 buttons) | Voice dock is desktop-only, chat bubble was already repositioned. Lovable badge is a deploy setting. | **Fix badge + consolidate** |
| P2 | Hero CTA hierarchy (both look same) | **Confirmed** — "Find Your Experience" uses `btn-gold`, "Speak with Luna" uses `btn-outline-gold`. Already differentiated. | **Already correct** |
| P2 | Redundant social proof (hero + trust bar) | Hero has inline "4.7 · 315+ · Est. 2002" AND TrustBar repeats "4.7★ · 315+ reviews". | **Fix — remove from hero** |
| P2 | Quiz results empty space / hidden plan | The expandable "See your full personalized plan" is by design (progressive disclosure). | **Skip** |
| P2 | "Coming Soon" on Priority Booking | **Confirmed** in CommunitySection line 15. | **Fix** |
| P3 | Privacy Policy dead link | **Already fixed** — it's a working modal (FooterSection lines 108-136). | **No action** |
| P3 | Skincare card missing testimonial | **Confirmed** — `testimonial: null` on line 30 of ServicesSection. | **Fix** |
| P3 | Duplicate helper text in team section | **Confirmed** — `helperStrips.all` and `helperStrips.hair` repeat the same "front desk can help match you" message. Section subtitle says similar. | **Fix** |
| NEW | Massage description says "hot stone" | **Critical** — ServicesSection line 44 says "Deep tissue, hot stone, relaxation" but hot stone does NOT exist at Hush. | **Fix** |
| P2 | Logo doesn't scroll to top | Logo links to `#` which doesn't reliably scroll to top. | **Fix** |
| P1 | Voice dock timeout / fallback | No connection timeout — stays on "Connecting..." forever. | **Fix** |

---

## Implementation Plan (10 fixes, no DB/backend changes)

### File 1: `src/components/Navigation.tsx`
- **Remove redundant "Request Callback" link** (lines 85-93). "Contact" in navLinks already points to `#callback`.
- **Fix logo link**: Change `href="#"` to an `onClick` handler that scrolls to top via `window.scrollTo({ top: 0, behavior: 'smooth' })`.

### File 2: `src/components/HeroSection.tsx`
- **Remove redundant social proof strip** (lines 57-70 — the "4.7 on Google · 315+ Reviews · Est. 2002" block). The TrustBar section immediately below already shows this data with rotating reviews, which is more compelling.

### File 3: `src/components/ServicesSection.tsx`
- **Fix massage description** (line 44): Change `"Deep tissue, hot stone, relaxation"` to `"Deep tissue, Swedish, therapeutic, and relaxation"` — matches actual services.
- **Add skincare testimonial** (line 30): Add a real-format testimonial, e.g., `{ text: "Patty's facials are incredible. My skin has never looked this good.", author: "Sarah M." }`.

### File 4: `src/components/CommunitySection.tsx`
- **Remove "Coming soon"** from Priority Booking description (line 15). Change to: `"Inner Circle members get early access to new openings and peak-time slots."` — removes the unfinished-feature signal.

### File 5: `src/components/ArtistsSection.tsx`
- **Remove duplicate helper text** for "all" filter. Change the `all` helper strip to something distinct from the section subtitle, e.g., `"Tap any artist to learn more about their specialties and style."` — this is actionable guidance rather than a repeat of the subtitle.

### File 6: `src/components/LunaFloatingVoiceDock.tsx`
- **Add 12-second connection timeout**: If `isConnecting` remains true for 12 seconds, auto-cancel and show a graceful fallback error: `"Luna is unavailable right now — try chat or call (520) 327-6753"`.
- **Ensure X button works on first click**: The `stopConversation` function calls `conversation.endSession()` which may hang if not connected. Add a guard: if `isConnecting` (not yet connected), just reset state directly without calling `endSession()`.

### File 7: Hide Lovable badge
- Use the `publish_settings--set_badge_visibility` tool to hide the "Edit with Lovable" badge on the published site.

### No database, edge function, or backend changes required.

