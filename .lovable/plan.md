

## Yes — there's a clear "tier" hierarchy in the descriptions

Looking at the current `fitStatement` copy (the line shown under each artist's specialty on the card), the language varies in a way that reads as a quality ranking:

### Current tiering (unintentional)

**Tier 1 — "Hero" language (sounds best):**
- Michelle: *"Guests often choose her for major color changes and transformations."*
- Silviya: *"European touch — 10+ years at Hush. Strong option for balayage and extensions."*
- Anita: *"Guests often choose her for creative designs and nail artistry."*
- Allison: *"Vivid Specialist + Lash Slayer — great for multi-service visits."*

**Tier 2 — "Solid pick" language (neutral-positive):**
- Whitney: *"Great for dimensional blondes, bridal hair, and event styling."*
- Charly: *"The go-to for natural waves and textured looks."*
- Melissa: *"A great fit for guests wanting length, volume, or seamless extensions."*
- Ana: *"Great for versatile everyday looks and low-maintenance styling."*

**Tier 3 — "Defensive / niche" language (reads weaker):**
- Kathy Charette: *"Specializes in precision cuts for difficult hair textures."* — sounds like a fix-it specialist, not aspirational
- Priscilla: *"Known for dependable quality and precision — visit after visit."* — "dependable" reads as "safe but unexciting"
- Zaida: *"A strong option for guests ready for a dramatic change."* — qualified ("a strong option") vs. confident ("the go-to")

### The pattern that creates the imbalance

Three linguistic moves elevate or flatten artists:
1. **Specificity** — "European touch — 10+ years at Hush" beats "dependable quality"
2. **Verb strength** — "Guests often choose her" > "Great for" > "A strong option for"
3. **Credentials** — Tenure, education, signature techniques (Michelle/Silviya have these; Priscilla/Ana don't)

This conflicts with `mem://brand/luna-neutral-guidance-policy` (no AI bias in stylist selection) — even though Luna is neutral in chat, the static cards aren't.

---

### Proposed fix — Level the language without flattening differentiation

Rewrite the bottom-tier `fitStatement` lines to use the same confident "go-to / known for / great with" framing, while keeping each artist's genuine niche:

| Artist | Current | Proposed |
|---|---|---|
| Kathy Charette | "Specializes in precision cuts for difficult hair textures." | "The go-to for precision cuts on thick, fine, and tricky hair." |
| Priscilla | "Known for dependable quality and precision — visit after visit." | "The go-to for clients who want precision and consistency every visit." |
| Zaida | "A strong option for guests ready for a dramatic change." | "The go-to for bold makeovers and total transformations." |
| Ana | "Great for versatile everyday looks and low-maintenance styling." | "The go-to for versatile everyday looks and easy-to-maintain color." |
| Melissa | "A great fit for guests wanting length, volume, or seamless extensions." | "The go-to for length, volume, and seamless extensions." |

Also normalize the top tier so no one reads as "the obvious pick":
- Michelle: drop "Guests often choose her for major changes" → "The go-to for complex color, extensions, and color correction."
- Anita: same pattern → "The go-to for creative nail art and custom designs."

**Result:** Every artist gets a confident "the go-to for [their actual niche]" line. No one sounds like a backup option, no one sounds like the only real choice.

### Files touched
- `src/data/teamData.ts` only (single field per artist — `fitStatement`)

No UI changes, no logic changes, no risk to demo. Pure copy normalization.

Reply **"ship it"** to apply, or tell me which specific artists you want re-leveled.

