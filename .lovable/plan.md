

# Full UI/UX & End-User Experience Audit

## Critical Issue: Dual Panel Conflict (User-Reported)

**Root cause found.** In `BookingDecisionCard.tsx` line 87-93, `handleTertiary()` calls BOTH `openChatWidget()` AND `openModal(context)`:

```typescript
const handleTertiary = () => {
  if (onChatWithLuna) {
    onChatWithLuna();
  } else {
    openChatWidget();          // Opens LunaChatWidget panel
    if (context) openModal(context);  // ALSO opens LunaModal overlay
  }
};
```

This means when a user completes the Experience Finder quiz, sees the Reveal Card, and clicks "Chat with Luna" — both the full-screen LunaModal AND the bottom-right LunaChatWidget open simultaneously, exactly as shown in the screenshot.

**Fix:** Remove the `openModal(context)` call from `handleTertiary`. The intent is to open the chat widget, not both.

---

## All Issues Found (Priority Order)

### 1. DUAL PANEL BUG (Critical — Blocks Presentation)
- **File:** `BookingDecisionCard.tsx` line 91-93
- **Fix:** `handleTertiary` should only call `openChatWidget()`, not also `openModal(context)`

### 2. HERO MOBILE HOURS BADGE WRONG (High)
- **File:** `HeroSection.tsx` line 119
- Shows "Open Today · 9am – 7pm" — hardcoded and incorrect
- Salon closes at 6 PM (Tue-Fri) and 4 PM (Sat), and is closed Sun/Mon
- **Fix:** Make this dynamic based on day of week, or remove it. At minimum change to correct hours.

### 3. FLOATING ELEMENTS OVERLAP ON MOBILE (High)
Three fixed-position elements compete for bottom-right space:
- `MobileStickyBar` — `bottom-0`, `z-40`
- `LunaChatWidget` bubble — `bottom-24 md:bottom-6 right-6`, `z-[9999]`
- `LunaFloatingVoiceDock` pill — `bottom-24 right-6`, `z-[9998]`, `hidden md:flex`

The voice dock is desktop-only (`hidden md:flex`), but the chat widget bubble sits at `bottom-24` on mobile which puts it right above the sticky bar. When the chat panel opens on mobile (`max-md:h-[92vh]`), it covers almost the full screen — this is correct. But the bubble + sticky bar stack looks cramped.

**Fix:** On mobile, the chat bubble should sit higher (e.g., `bottom-28`) to clear the sticky bar padding, or integrate the "Ask Luna" action into the sticky bar itself.

### 4. LUNA MODAL + EXPERIENCE REVEAL CARD REDUNDANCY (Medium)
When the quiz completes, both the ExperienceRevealCard (inline) and the LunaModal (if triggered via "Chat with Luna" or "Speak with Luna") show the same context chips and "soft direction" text. The user sees their selections twice in different formats. This creates visual clutter rather than progressive disclosure.

**Fix:** The LunaModal should not re-render context chips when coming from the reveal card — it should go straight to CTAs.

### 5. LEAD CAPTURE IN LUNAMODAL SAVES TO LOCALSTORAGE ONLY (Medium)
- **File:** `LunaModal.tsx` line 115-123
- The exit-intent lead capture (`handleLeadSubmit`) saves phone + context to `localStorage` only — NOT to the database
- Meanwhile `BookingDecisionCard` correctly uses `saveLead()` and `saveCallbackRequest()` to persist to the backend
- **Fix:** Replace the localStorage save with the same `saveLead()` call used elsewhere

### 6. VOICE DOCK MUTE BUTTON IS A NO-OP (Medium)
- **File:** `LunaFloatingVoiceDock.tsx` line 115-118
- `toggleMute` only toggles React state — it does not actually mute the microphone track
- Comment says "ElevenLabs SDK doesn't expose a direct mute" but the actual mic track from `getUserMedia` could be disabled
- **Fix:** Access the audio track and set `enabled = false` on mute

### 7. NO "START OVER" ON REVEAL STEP (Low)
- **File:** `ExperienceFinderSection.tsx` line 668-678
- The "Start over" link is shown on steps 2-5 but NOT on the reveal step (`currentStep !== "reveal"` is excluded)
- If a user wants to redo the quiz after seeing results, there's no obvious reset
- **Fix:** Show "Start over" on the reveal step too

### 8. PERSONALIZED PLAN SECTION INVISIBLE WITHOUT QUIZ (Low — Correct Behavior)
- `PersonalizedPlanSection` returns `null` when `categories.length === 0` — this is correct but means first-time visitors see a gap in page flow between ExperienceFinder and Services sections

### 9. EXPERIENCE FINDER MIN-HEIGHT CREATES DEAD SPACE (Low)
- Line 380: `min-h-[420px]` with `pb-24 md:pb-0` — on desktop after quiz completion, the reveal card may leave significant whitespace below due to the fixed min-height container

---

## Implementation Plan

### File 1: `src/components/BookingDecisionCard.tsx`
- Remove `openModal(context)` from `handleTertiary` (line 92)
- Keep only `openChatWidget()`

### File 2: `src/components/HeroSection.tsx`
- Replace hardcoded "Open Today · 9am – 7pm" (line 119) with day-aware logic:
  - Mon/Sun: "Closed Today"
  - Tue-Fri: "Open Today · 9 AM – 6 PM"
  - Sat: "Open Today · 9 AM – 4 PM"

### File 3: `src/components/LunaModal.tsx`
- Replace localStorage lead save (lines 115-123) with `saveLead()` from `@/lib/saveSession`

### File 4: `src/components/ExperienceFinderSection.tsx`
- Change line 669 condition to also show "Start over" on the reveal step:
  `{currentStep !== 1 && (` instead of `{currentStep !== 1 && currentStep !== "reveal" && (`

### File 5: `src/components/LunaChatWidget.tsx`
- Adjust mobile bubble position from `bottom-24` to `bottom-[6.5rem]` to better clear the MobileStickyBar

### No backend or database changes required.

