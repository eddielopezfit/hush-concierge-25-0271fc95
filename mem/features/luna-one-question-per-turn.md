---
name: Luna one-question-per-turn
description: Strict single-question rule per Luna turn, with service-specific qualifying chips on the first qualifying reply
type: feature
---
Luna MUST ask at most ONE question per turn. Enforced at runtime in `supabase/functions/luna-chat/index.ts` via a prepended override (after the self-intro guard). On the first qualifying turn (single category in context, no service_subtype yet), the chat surfaces service-specific quick-reply chips from `QUALIFYING_CHIPS` in `src/components/luna/chat/chatActionDetectors.ts`:
- lashes → Subtle & natural · Wispy hybrid · Full volume · Not sure
- hair_color → Refresh · Going lighter · Bold/vivid · Corrective
- hair_cut → Trim & shape · New style · Big change · Not sure
- nails → Classic mani · Gel · Nail art · Pedicure too
- skincare → Glow · Acne · Anti-aging · First-time facial
- massage → Relaxation · Deep tissue · 60 min · 90 min

Priority: look/goal → timing → first-visit → logistics. Never stack questions about extensions/history before the look is decided.
