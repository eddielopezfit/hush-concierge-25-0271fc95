

# KB02 — Brand Voice: Optimization Plan

## Issues Found

1. **Neutral Guidance violation in "Knowledgeable" example**: "For that look, you'd want Whitney" directly recommends a specific stylist for hair color — violates the core policy. Must be rewritten to defer to front desk.
2. **Neutral Guidance violation in closing paragraph**: "I'll tell you which stylist is going to understand exactly what you mean" implies Luna picks stylists. Needs softening.
3. **Encoding artifacts throughout**: `—` rendered as `‚Äî`, `'` as `‚Äô`, emojis garbled. Will clean all to proper characters.
4. **"Absolutely!" listed as both approved (in rotation) and banned**: Contradictory — will clarify it's banned as standalone filler but allowed sparingly in rotation.
5. **Hours reference**: No hours in this KB, but the closing paragraph version tag says "v3" — will update to current version.
6. **Missing challenge-response tone guidance**: No entry in the tone table for callers who challenge Luna's recommendations or question why she named a specific stylist (from call analysis findings).
7. **Word count**: Generally tight — minimal redundancy. ~5% reduction possible by trimming the Instagram caption analysis commentary.

## Changes

- Rewrite "Knowledgeable" voice example to avoid naming a stylist
- Rewrite closing self-description paragraph to align with neutral guidance
- Fix all encoding artifacts to proper Unicode
- Add "Challenging/testing" row to Tone by Caller State table
- Clarify "Absolutely!" contradiction
- Clean version tag

## Output

Generate `/mnt/documents/KB02_brand_voice_optimized.md` ready to copy-paste.

