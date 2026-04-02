

# Luna System Prompt & Knowledge Base Optimization + Session-Start Fix

## Two Issues to Address

### Issue 1: session-start 500 Error
The `conversations` table has a check constraint that only allows channels: `chat`, `voice`, `text`. But the code sends `"finder"` (from Experience Finder) and `"find_my_look"` (from Find My Look tab). This causes the 500 error.

**Fix:** Add a database migration to expand the check constraint to include `finder` and `find_my_look`.

### Issue 2: Remove Artist Recommendations from Luna

Correct — Luna should **no longer recommend specific stylists**. She should guide guests to the front desk for artist matching. Here's what needs to change:

---

## Changes

### A. Database Migration — Fix Channel Constraint
Drop and recreate `conversations_channel_check` to allow: `chat`, `voice`, `text`, `finder`, `find_my_look`.

### B. `supabase/functions/luna-chat/index.ts` — Rewrite SYSTEM_PROMPT
The inline system prompt (186 lines) contains a full matching matrix and explicit instructions to "recommend by FIT, name 2 options." This needs to be replaced with:
- **Remove** the entire stylist matching matrix and "STYLIST RECOMMENDATIONS" section
- **Remove** "COMPARISON MODE" section
- **Replace** with a neutral guidance policy: Luna describes team specialties generally but defers all specific artist pairing to the front desk / Kendell
- **Keep** single-provider facts (Allison = only lash artist, Tammi = only massage therapist) since those aren't biased — they're factual
- **Remove** individual artist phone numbers (except front desk)

### C. `supabase/functions/_shared/luna-brain.ts` — Update CORE_BRAIN
- **Remove** the "STYLIST GUIDANCE — THE RECOMMENDATION ENGINE" section (lines 99-161) including the matching matrix
- **Replace** with: Luna names the team generally, mentions single-provider services factually, but for multi-provider categories says "the front desk will match you with the right person"
- **Update** CHAT_WRAPPER to remove "You CAN and SHOULD recommend by fit" instruction and replace with neutral guidance
- **Keep** team profiles section (names, specialties) as general knowledge — Luna can say "we have stylists who specialize in X" without naming who to pick

### D. `src/lib/lunaBrain.ts` — Client-Side Brain
- Already returns `recommendedArtist: null` — good
- Remove the `artistsByCategory` map and all comparison-mode logic in `generateChatResponse`
- Remove the "Team Compare" source handling that lists specific artists

### E. `src/lib/KB12_recommendation_engine.md` — Knowledge Base
- Add a header disclaimer: "This document is for internal reference only. Luna does NOT use this to recommend specific artists. All artist matching is handled by the front desk team."
- The file stays for human reference but Luna's prompt no longer references it

### F. `src/lib/SYSTEM_PROMPT_v6.md` — Reference Prompt
- Update Section 5 (Recommendation Engine) to reflect the new neutral policy
- This is a reference doc used for ElevenLabs voice — mark the recommendation sections as deprecated/updated

---

## What Luna WILL Still Do
- Name single-provider services factually (Allison for lashes, Tammi for massage, Patty for microneedling)
- Describe team specialties in general terms ("we have stylists who specialize in vivid color, precision blonding, extensions...")
- Guide guests to the front desk for personalized matching
- State all documented prices confidently

## What Luna Will STOP Doing
- Naming 2 specific stylists for hair services
- Using the matching matrix to pick artists
- Running "comparison mode" in chat
- Sharing individual stylist phone numbers

