

## Audit Reality Check — Most Findings Are Outdated

The audit was run against an older `eddielopezfit/hush-concierge-25-0271fc95` GitHub repo. The live `hush-salon.lovable.app` Lovable project has already shipped fixes for most of the "critical" items. Let me verify each claim against current code, then plan the genuinely missing fixes.

### Verification pass needed

1. **Callback form captures no data (P0)** — Need to verify `BookingCallbackSection.tsx` actually calls `saveCallbackRequest` → `submit-lead` edge function. Audit claims it's a `setTimeout(1000)` fake. I know from prior work that `submit-lead` exists and writes to `callback_requests` + `leads` tables.
2. **"Chat with Luna" is a stub redirect (P0)** — Need to verify Luna chat is real (we have `luna-chat` edge function streaming Gemini responses + `ChatTab.tsx`). Audit claims it scrolls to callback.
3. **handleReset doesn't clear localStorage (P1)** — Need to check `ExperienceFinderSection.tsx` reset handler against current `LunaContext.clearConcierge()`.
4. **Voice widget / ElevenLabs (P1)** — Audit references `LunaVoiceWidget.tsx` and mic permission UX. Per `mem://constraints/no-voice-integration`, voice was REMOVED. This file shouldn't exist anymore.
5. **No backend at all** — False. Project has Lovable Cloud, 7+ edge functions, `leads`, `callback_requests`, `conversations`, `messages` tables.
6. **Massage 20% discount note never surfaced** — Worth verifying in `servicesMenuData.ts` + Luna system prompt.
7. **Pricing claims** — Verify Women's haircut, Balayage (we just normalized it to "$96+ (final price after consultation)"), Brazilian Blowout.

### Genuinely actionable items (if confirmed)

After verification, the only fixes likely still needed:
- **A.** `handleReset` in Experience Finder calling `clearConcierge()` (if missing)
- **B.** Massage 20% "name your stylist" discount surfaced in Luna system prompt + visible in services UI
- **C.** Phone/email format validation on `BookingCallbackSection` (zod)
- **D.** Women's haircut pricing visibility in `pricePreview`
- **E.** Remove any stale references to `LunaVoiceWidget` if found

### Plan

**Phase 1 — Verify (read-only)**
- View `BookingCallbackSection.tsx` to confirm `saveCallbackRequest` is wired
- View `ExperienceFinderSection.tsx` reset handler
- View `LunaModal.tsx` "Chat with Luna" button handler
- View `servicesMenuData.ts` for massage discount note + Women's haircut pricePreview
- Search for `LunaVoiceWidget` references
- View Luna system prompt (`SYSTEM_PROMPT_v7.md`) for massage discount mention

**Phase 2 — Reply with verified audit response**
- For each audit claim: ✅ already fixed / ⚠️ partially true / ❌ outdated
- Present a TIGHT fix plan covering only the genuinely missing items (likely A–D above)
- No re-implementation of items already shipped

**Phase 3 (after approval) — Ship the real gaps**
- Fix items A–D in single pass
- All low-risk, data + small UI changes

Reply **"verify and plan"** to run the verification pass and return the cleaned-up audit response with the real fix plan, or **"skip verify, ship A–D"** if you trust the shortlist.

