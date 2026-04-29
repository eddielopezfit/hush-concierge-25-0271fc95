---
name: Hair Preview Flow
description: Try-on virtual hairstyle preview is hair-only, 3-step flow with collapsible filters
type: feature
---
The virtual try-on is renamed to "Preview a New Hairstyle" (formerly "Try Your New Look") to avoid implying nail/lash/skincare previews — it is HAIR-ONLY.

Flow is 3 steps: Upload → Style → Preview.
- Face shape, skin undertone, and category (vibe) are OPTIONAL filters collapsed behind a "Refine for my face & vibe" pill on the style screen, not separate steps.
- Color picking moved to the preview screen as inline chips so guests get the wow first, then iterate.
- Upload screen offers TWO buttons: "Take a selfie" (capture="user") and "Upload a photo". HEIC/HEIF rejected with friendly iPhone "Most Compatible" guidance. FileReader has explicit loading state (isReadingFile) and onerror/onabort handlers.

Entry button (TryOnEntryButton) is gated to the Hair service card in ServicesSection (`service.id === "hair"`) — never surface on Nails, Lashes, Skincare, or Massage.
