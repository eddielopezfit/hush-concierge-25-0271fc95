# Push Hush from 9.1 → 10/10

Three surgical fixes addressing the exact issues Comet flagged. No new infrastructure, no architectural changes — pure polish on a build that's already production-ready.

---

## 1. Eliminate desktop hero "black sidebars" (visual blocker)

**Problem:** At 1297px+ widescreens, the desktop hero video doesn't fill the viewport edge-to-edge — it leaves blurred dark bars on left/right that read as letterboxing and undermine the luxury feel. The previous fix softened the gradient overlay, but the root cause is the video's intrinsic aspect ratio being narrower than ultrawide viewports.

**Fix in `src/components/HeroSection.tsx`:**
- Wrap the desktop `<video>` in a container that uses `scale-110` + `object-cover` with `object-position: center` so the video over-renders by ~10% and crops cleanly at the edges instead of leaving bars.
- Add a `bg-charcoal` (matching salon brand) base layer behind the video so even during the first paint frame, the edges read as intentional brand color, not "missing video."
- Keep the existing Ken Burns animation intact.
- Mobile path is unchanged (`object-position: center top` already works correctly).

**Validation:** Test at 1297px, 1536px, and 1920px viewports — video should fill edge-to-edge with no visible bars.

---

## 2. Cut perceived cold-load time (~3–4s → <1.5s perceived)

**Problem:** The `#hush-shell` branded loader is charming but adds a cognitive "waiting" beat before hero paints. We can't make the JS bundle parse faster, but we can make the *transition* feel instantaneous.

**Fix in `index.html`:**
- Add `<link rel="preload" as="image" href="<desktop hero poster URL>" fetchpriority="high">` so the hero's poster image starts downloading in parallel with the JS bundle (currently it only loads after React mounts and the `<video poster>` attribute is read).
- Add a matching mobile preload guarded by `media="(max-width: 767px)"` so we never download both posters.
- Add `<link rel="preconnect" href="https://ltnjxrpicsgujxvfluwz.supabase.co" crossorigin>` to warm the connection to the Supabase storage CDN serving the poster + video.
- Tighten the shell fade-out: change the inline `transition` from `.6s` to `.35s` so once React mounts, the shell clears faster.

**Fix in `src/main.tsx` (or wherever shell is dismissed):**
- Verify the shell `is-hidden` class is added on the *first* React paint, not on a delayed effect. If currently behind a `setTimeout` or animation gate, hoist it earlier.

**Validation:** Throttle network to "Fast 3G" in DevTools, hard-reload — should see hero poster within ~1.5s, full video shortly after. The branded shell still appears for users on truly slow connections.

---

## 3. Add explicit TCPA consent checkbox to callback form

**Problem:** Current form (`BookingCallbackSection.tsx` line 397–400) uses *implied consent* via fine-print under the submit button. This is federally permissible but legally weaker than express written consent — and as Hush scales SMS volume, regulators (CA, TX, FL especially) increasingly expect a checkbox.

**Fix in `src/components/BookingCallbackSection.tsx`:**
- Add `tcpaConsent: false` to the `formData` state.
- Add a `<Checkbox>` (already exists at `src/components/ui/checkbox.tsx`) above the submit button with this label:
  > *"I agree to receive calls, texts, and emails from Hush Salon & Day Spa about my inquiry. Message and data rates may apply. Reply STOP to opt out at any time."*
- Make the checkbox **required to submit** — extend `isFormValid` to include `formData.tcpaConsent === true`.
- Style the checkbox in the brand palette: `border-gold/30`, gold check on tick, body font for the label, smaller text (`text-xs text-cream/60`) so it doesn't compete with the primary CTA visually.
- Remove the now-redundant fine-print paragraph at lines 397–400 (the checkbox label replaces it).
- Mirror the same checkbox into `src/components/luna/chat/LeadCaptureForm.tsx` for the in-Luna lead capture so consent is uniform across all three entry points (callback form, Luna chat, Experience Finder result handoff).

**Validation:**
- Submit attempt without checking → button stays disabled, helpful microcopy explains why.
- Check + submit → flows through normally, consent state can optionally be logged to the lead row in Supabase for compliance audit (low-effort follow-up; not required to ship).

---

## Out of scope (intentional)

- **Productizing as SaaS** — Comet's $25–75K MRR scenario is a real opportunity but a separate strategic decision, not a polish task.
- **Logging consent timestamp to DB** — Nice-to-have for audit trail; can ship as a follow-up migration once SMS volume justifies it.
- **Further bundle splitting** — The Suspense + Skeleton boundaries shipped in the previous loop already handle CLS well; chasing another 200ms here has diminishing returns.

---

## Test checklist before declaring 10/10

1. Hard-refresh on 1920px desktop — no black sidebars on hero video.
2. Hard-refresh on Fast 3G throttle — hero poster paints within ~1.5s.
3. Submit callback form without checking TCPA → submit button stays disabled.
4. Check TCPA + submit → SMS + email + Slack still fire correctly.
5. Submit lead via Luna chat → same TCPA checkbox enforces consent.

## Scope
~30 minutes of focused work. Three files touched: `HeroSection.tsx`, `index.html`, `BookingCallbackSection.tsx` (+ `LeadCaptureForm.tsx` for parity). No DB changes, no edge function redeploys.
