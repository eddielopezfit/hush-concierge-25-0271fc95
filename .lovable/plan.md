
## Plan: Top 5 Quick-Win Fixes from Audit

Tackling the 4 highest-ROI fixes (skipping #1 photo replacement — needs real Hush imagery from owner, can't fabricate).

### 1. Hero CTA hierarchy (HeroSection.tsx)
Demote "Talk to Our AI Concierge" from outlined gold button to subtle ghost text-link beneath the primary "Find Your Experience" button. Single dominant CTA = cleaner luxury signal.

### 2. Booking form validation (BookingCallbackSection.tsx + InlineCallbackCTA.tsx)
Add Zod schema: name (1–100 chars), phone (E.164-ish: 10+ digits after stripping), email (valid format, optional), message (≤500). Show inline field-level errors below each input. Move "Name and phone required" hint above the submit button.

### 3. Category badge in TrustBar (TrustBar.tsx)
Add a small gold-bordered pill: "Tucson's First AI-Guided Salon" — positioned alongside the 4.7★ rating badge. Free category-claim moat.

### 4. Standardize pricing format (servicesMenuData.ts)
Audit all `pricePreview` and service price strings. Convert any `"$X | $Y"` or flat `"$105"` patterns to consistent `"from $X"` format across hair, nails, skincare, lashes, massage.

### 5. Skipped (needs owner input)
- **Real photos for Nails/Skincare/Massage cards** — requires actual Hush photography uploaded by salon. Will flag to user post-implementation.
- **Tammi placeholder portrait** — same constraint.

### Files touched
- `src/components/HeroSection.tsx` — CTA demotion
- `src/components/TrustBar.tsx` — category badge
- `src/components/BookingCallbackSection.tsx` — Zod validation + hint reposition
- `src/components/InlineCallbackCTA.tsx` — Zod validation (if it has its own form)
- `src/data/servicesMenuData.ts` — pricing normalization

### Out of scope (deferred)
- Stock photo replacement (need real assets)
- Luna proactive nudge after 30s on Services/Artists (separate feature, larger scope)
- LocalBusiness JSON-LD schema (SEO task, separate pass)
- Footer "Book an Appointment" CTA (low risk, can bundle if you want)
- Returning-client memory deepening + 24h follow-up edge function (strategic, multi-day)

Want me to also bundle the footer booking CTA (tiny add) and the LocalBusiness JSON-LD into this pass, or keep it tight to the 4 audit quick-wins?
