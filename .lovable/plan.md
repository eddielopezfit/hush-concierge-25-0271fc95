

# Fix: Remove Fabricated Upsell Add-Ons

## Problem

The `upsellEngine.ts` presents add-on services in the "Personalized Hush Plan" that **do not exist** on Hush's actual menu. The screenshot shows "LED Light Therapy +$30" and "Enzyme Peel Add-On +$25" — neither is offered. This is exactly the kind of hallucinated content that destroys trust in a client presentation.

**Every upsell item needs to map to a real service from `servicesMenuData.ts`, or not exist at all.**

## Fabricated Items (Must Remove)

| Current Upsell | Status |
|---|---|
| Gloss Finish +$40 | NOT on menu |
| Scalp Treatment +$25 | NOT on menu |
| Deep Conditioning +$25 | REAL — maps to "Conditioning Treatment $30+" |
| Luxury Blowout +$35 | REAL — maps to "Luxury Wash and Blowout $35+" |
| Gel Upgrade +$15 | MISLEADING — real price gap is $20 (manicure $35 vs gel $55) |
| Nail Art +$20 | NOT on menu |
| Lash Serum +$25 | NOT on menu |
| Hot Stones +$20 | NOT on menu (explicitly in `servicesDoNotExist`) |
| Aromatherapy +$15 | NOT on menu (explicitly in `servicesDoNotExist`) |
| LED Light Therapy +$30 | NOT on menu |
| Enzyme Peel Add-On +$25 | NOT on menu |

## Fix Plan

### File 1: `src/lib/upsellEngine.ts`
Replace the entire upsell map with **only real services** from `servicesMenuData.ts`:

- **hair:color** — "Conditioning Treatment +$30" (real), "Brazilian Blowout Split End Treatment +$55" (real)
- **hair:cut** — "Luxury Wash and Blowout +$35" (real), "Added Heat Style +$15" (real)
- **hair:both** — "Conditioning Treatment +$30", "Luxury Wash and Blowout +$35"
- **hair (generic)** — "Conditioning Treatment +$30", "Luxury Wash and Blowout +$35"
- **nails** — "Gel Upgrade +$20" (real price delta between manicure and gel manicure)
- **lashes** — "Lash or Brow Tint +$20" (real service)
- **massage** — "Upgrade to 90 min +$35" (real price delta: $140 - $105)
- **skincare** — "Brow Wax +$20" (real), "Airbrush Spray Tan +$35" (real)

### File 2: `supabase/functions/_shared/luna-brain.ts`
Add these fabricated items to the `servicesDoNotExist` list so Luna never mentions them in chat either:
- "LED light therapy", "enzyme peel", "scalp treatment", "gloss finish", "nail art add-on", "lash serum treatment"

Also update the existing entry "aromatherapy massage" to just "aromatherapy" so it catches broader references.

### No UI layout changes. No database changes. No new files.

