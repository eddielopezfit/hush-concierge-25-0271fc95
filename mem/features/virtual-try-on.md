---
name: virtual-try-on
description: Phase 2 Transformation Engine — AI hairstyle/color try-on via Lovable AI image edit
type: feature
---
"Try Your New Look" virtual try-on lets guests upload a selfie and preview hair styles + colors before booking.

- Powered by Lovable AI image edit model `google/gemini-3.1-flash-image-preview` (Nano Banana 2) via edge function `try-on-transform`
- Server-authoritative prompt catalog at `supabase/functions/_shared/try-on-catalog.ts` (16 styles, 6 colors). Client only sends styleId/colorId — never raw prompts
- Storage: private bucket `try-on-renders`, signed URLs (24h)
- DB: `try_on_sessions` (service_role only RLS)
- Entry CTAs: Hero (ghost variant), Services hair card (chip variant). Reusable `TryOnEntryButton`
- Modal `TryOnExperience` is `React.lazy` — never in eager bundle
- Hard rule in copy: "AI-generated visualization — your stylist will tailor the final result". Maintains neutral guidance + manages expectations
- Conversion bridge: "Book this look" merges look into ConciergeContext + scrolls to booking-callback. "Get a stylist consultation" opens Luna chat tab
- Photo retention: stated as 7 days (cleanup cron deferred to Phase 3)
- Uses sonner for toasts, createPortal for modal, custom CompareSlider (no extra deps)
- Personalization step (between Upload and Category) captures optional face shape + skin undertone. Used to (a) sort styles/colors with best matches first via `sortStylesByFace` / `sortColorsByUndertone`, (b) inject soft guidance into the AI prompt server-side, (c) include in the "Send to Luna" handoff message. Both fields are skippable ("Not sure"). Not persisted to DB yet — session-scoped only.

