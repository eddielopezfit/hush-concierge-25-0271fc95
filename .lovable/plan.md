## Virtual Try-On Experience — "Try Your New Look"

A new **Phase 2: Transformation Engine** that lets a guest upload a selfie (or pick a sample model), preview curated styles & colors, save/compare looks, and hand the chosen look directly into Luna + the booking pipeline.

---

### 1. Tech approach (honest & realistic)

True browser-based hair try-on requires either:
- a licensed AR SDK (ModiFace / Perfect Corp / Banuba — paid, account-gated), or
- an AI image-editing model.

**We'll use Lovable AI image editing** (`google/gemini-3.1-flash-image-preview`, aka Nano Banana 2). It's already wired through `LOVABLE_API_KEY` — no external account, no per-key billing setup for the founders. Each transformation is a single edge-function call returning a new PNG.

Tradeoff to be transparent about: it's **AI-generated preview**, not real-time AR. Render time is ~3–8s per look. We'll frame the UX as "stylist-curated preview" with a clear *"AI-generated visualization — your stylist will tailor the final result"* disclaimer to manage expectations and stay aligned with Luna's neutral-guidance brand voice.

### 2. New section + entry points

- **New full-screen modal**: `src/components/tryon/TryOnExperience.tsx` (lazy-loaded) — owns the entire flow.
- **Entry CTA "Try Your New Look"** added to:
  - `HeroSection.tsx` — secondary CTA next to the existing "Discover" button
  - `ServicesSection.tsx` — pinned chip on the **Hair** card
  - `PersonalizedPlanSection.tsx` — appended as a discovery step
  - `LunaChatWidget` ExploreTab — new tile

### 3. Flow (5 steps, stylist-paced — never overwhelming)

| Step | Screen | Notes |
|---|---|---|
| 1 | **Intro + photo source** | "Upload a selfie" or "Use a model similar to me" (4 curated diverse model thumbnails — real photography per project rule, no AI/stock). Helper copy: *"See how different styles and colors could look on you before booking."* |
| 2 | **Style category** | 4 cards: Short/Textured · Medium/Layered · Long/Flowing · Bold/Trendy. Each opens a 6-style mini-gallery sourced from `tryOnStyleData.ts`. |
| 3 | **Color** | 4 default tones (Ash Brown, Dark Chocolate, Soft Black, Caramel Highlights) + a 5th "Skip color" pill. |
| 4 | **Preview** | Side-by-side **Original ↔ Transformed** with a draggable swipe slider (`react-compare-slider` or hand-rolled — preference is hand-rolled to avoid the dep). Buttons: *Save look · Try another color · Try another style · Compare saved looks*. |
| 5 | **Conversion bridge** | Two CTAs: **"Book this look"** (opens BookingDecisionCard, pre-filled with style+color+photo URL) and **"Get a stylist consultation"** (opens Luna chat with full try-on context merged into `ConciergeContext`). |

After 2–3 interactions, **Luna nudge** slides up from bottom: *"Based on what you're trying, here are looks our team would love to bring to life for you…"* — three curated matches. This uses the existing `useDwellNudge` pattern, not a separate engine.

### 4. Backend — new edge function `try-on-transform`

`supabase/functions/try-on-transform/index.ts`
- Accepts: `{ imageBase64, styleId, colorId, sessionId }`
- Validates with Zod (max 6MB image, allowed mime: jpeg/png/webp)
- Calls Lovable AI Gateway with `google/gemini-3.1-flash-image-preview`, system prompt instructing it to **only modify hair** (style + color) while preserving face, identity, lighting, background
- Returns the generated image as base64 + a signed Supabase Storage URL (uploads to a new private `try-on-renders` bucket so we can analytics/recall later)
- Handles 429 / 402 with friendly toasts on the client (per Lovable AI patterns)
- CORS allowlist matches existing functions
- Adds `verify_jwt = false` block in `supabase/config.toml` so anon visitors can use it

### 5. Database additions (one migration)

```
- table public.try_on_sessions
   - id uuid pk default gen_random_uuid()
   - guest_profile_id uuid null (links to existing guest_profiles)
   - source_image_path text  (storage path, private)
   - chosen_styles jsonb     (array of {styleId, colorId, render_path, saved_at})
   - converted_to_lead bool default false
   - created_at, updated_at
- new private storage bucket: try-on-renders (RLS: service_role write, owners read via signed URLs only — no public access for privacy)
- RLS: service_role full access, no anon read (signed URLs only)
```

A row is created on first transform, updated as user saves looks, and the `id` is appended to `concierge_context` when handing off to booking/Luna so Slack alerts include a deep-link to the rendered image for the front desk.

### 6. Style/Color catalog

`src/data/tryOnStyleData.ts` — typed array of ~24 curated styles across the 4 categories, each with: `id`, `name`, `category`, `referenceImageUrl` (real reference, used for thumbnail only), `prompt` (the precise instruction passed to the image model, e.g. *"transform the hair to a chin-length textured French bob with soft curtain bangs, keeping face, skin tone, and background unchanged"*).

Same shape for `tryOnColorData.ts`.

This keeps prompts **on the backend-readable client data file** but the actual model call still happens inside the edge function — we pass `styleId`+`colorId` only, and the function looks up the prompt server-side from a mirrored `_shared/try-on-catalog.ts`. Prevents prompt-injection from a tampered client.

### 7. Luna integration (neutral, on-brand)

- Adds `tryOnLook` to `ConciergeContext`: `{ styleId, styleName, colorId, colorName, renderUrl, savedLooks: string[] }`
- When user picks **"Get a stylist consultation"**, Luna opens with a contextual greeting: *"I see you've been exploring a [Soft Caramel Bob] — beautiful direction. I can help you find the right time and our front desk will pair you with the stylist best suited to bring it to life."* (Stays neutral per the artist-recommendation policy — never names a specific stylist for hair color/cut.)
- Slack lead routing (`lead-qualify`) gets a new field `try_on_render_url` so Kendell + the hair channel see the actual visualization.

### 8. UX guardrails (matches existing principles)

- **Zero Dead Ends**: every screen has a primary action + a "Save & exit" path that still captures the lead.
- **No Continue copy**: buttons read *"See my new look"*, *"Try this color"*, *"Save this style"*, *"Show me the booking"*.
- **Privacy**: a one-line consent under the upload box: *"Your photo is used only to generate your preview and is automatically deleted after 7 days."* — backed by a scheduled cleanup (added to existing `process-email-queue` cron pattern, or a new tiny cron function).
- **Mobile-first**: full-screen sheet on mobile; centered modal on desktop. Swipe-slider works with touch + mouse drag.
- **Performance**: TryOn modal is **route-split** (`React.lazy`) so it never enters the eager bundle and doesn't impact the hero video work we just finished.

### 9. Memory updates

After build, save:
- `mem://features/virtual-try-on` — feature spec, Lovable AI image-edit model, 7-day retention, neutral-guidance disclaimer
- Update `mem://index.md` Memories list

### 10. What is **not** in scope for Phase 2 (deferred to Phase 3)

- AI face-shape / undertone detection
- Personalized style ranking algorithm
- Social sharing / "rate my look"
- Custom user-defined color tones
- Real-time AR (would require ModiFace/Perfect Corp license — separate conversation)

### 11. Files to be created / edited

**Created**
- `src/components/tryon/TryOnExperience.tsx` (root modal)
- `src/components/tryon/steps/PhotoStep.tsx`
- `src/components/tryon/steps/StyleStep.tsx`
- `src/components/tryon/steps/ColorStep.tsx`
- `src/components/tryon/steps/PreviewStep.tsx`
- `src/components/tryon/steps/ConversionStep.tsx`
- `src/components/tryon/CompareSlider.tsx`
- `src/components/tryon/TryOnEntryButton.tsx` (reusable CTA)
- `src/data/tryOnStyleData.ts`
- `src/data/tryOnColorData.ts`
- `src/hooks/useTryOnSession.ts`
- `supabase/functions/try-on-transform/index.ts`
- `supabase/functions/_shared/try-on-catalog.ts`
- `supabase/functions/try-on-cleanup/index.ts` (7-day retention)
- One migration: `try_on_sessions` table + `try-on-renders` bucket + RLS

**Edited**
- `src/components/HeroSection.tsx` — add secondary "Try Your New Look" CTA
- `src/components/ServicesSection.tsx` — add try-on chip on Hair card
- `src/components/PersonalizedPlanSection.tsx` — append try-on prompt
- `src/components/luna/ExploreTab.tsx` — add tile
- `src/contexts/LunaContext.tsx` + `src/types/concierge.ts` — add `tryOnLook` field
- `supabase/functions/lead-qualify/index.ts` — pass `try_on_render_url` into Slack payload
- `supabase/config.toml` — register new functions

---

**Reality check for the founders:** this is exactly the "wow within 60 seconds" moment that turns the hub from *salon website* into *transformation platform*. The disclaimer keeps it honest (it's a preview, not a guarantee), the front desk still owns the final stylist match (preserves the human touch), and every saved look becomes a richer lead than a plain callback request.

Approve to build Phase 2 as scoped, or tell me which parts you want trimmed first (e.g. ship without saved-look comparison, defer the cleanup cron, etc.).