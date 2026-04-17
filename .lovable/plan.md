

## Hush Artists Section — Optimization Plan

The audit identified clear gaps across founders (no photos/bios visible), social media discoverability (zero handles linked), review attribution (named reviews not tied to artist cards), specialty positioning (missing differentiators like "European touch", "Vivid Specialist", "Color Educator"), and cross-department filtering (Allison missing from Lashes/Skincare). Here's the surgical fix plan.

---

### Phase A — Founder Profiles Fix (HIGH IMPACT)

**Problem:** Sheri, Danielle, Kathy show only initials. Founders are the brand's strongest trust signal.

**Action:**
1. Surface the existing founders portrait (`Founders_Hush.jpg` per `mem://brand/founders-identity-visuals`) on each founder card — crop to focus on each founder OR display group portrait fallback with name overlay.
2. Add specialties from external research:
   - **Sheri Turner** — "Lived-in Color & Transformations"
   - **Danielle Colucci** — "Foundation Cuts & Color"
   - **Kathy Crawford** — "Hi-lites & Cool Tones" + Instagram link `@kcwiththecoolhair`
3. Add legacy bios + "Known For" tags to each founder in `src/data/teamData.ts`.
4. Add "Book with [Founder]" CTA buttons (same pattern as other artists).

**Files:** `src/data/teamData.ts`, `src/components/ArtistsSection.tsx`, `src/components/luna/ArtistsTab.tsx`

---

### Phase B — Social Media Handles (HIGH IMPACT, LOW EFFORT)

**Problem:** Zero Instagram links surfaced even though artists have active accounts driving discovery.

**Action:** Add an `instagram` field to `TeamMember` and link icons on cards/modals for:
- Michelle → `@hairby_michelley`
- Silviya → `@hairdesignsbysilviya`
- Whitney → `@prettyhairandpositivity`
- Allison → `@allieglam`
- Kathy Crawford → `@kcwiththecoolhair`

Render small Instagram icon next to name (opens in new tab, `rel="noopener noreferrer"` per `mem://features/external-link-behavior`).

**Files:** `src/data/teamData.ts`, `src/components/ArtistsSection.tsx`, `src/components/luna/ArtistsTab.tsx`, `src/types/concierge.ts` (if TeamMember typed there)

---

### Phase C — Specialty & Tag Upgrades (MEDIUM IMPACT)

Update `knownFor`, `specialty`, and `bestFor` fields:

- **Michelle Yrigolla** — Add "EDUCATOR" badge (mirror FOUNDING badge styling); add "Extensions" to knownFor; add tenure note.
- **Silviya Warren** — Update specialty to "European Color & Extensions"; add "European balayage", "Dream catchers extensions", "10+ years at Hush" to knownFor/bio.
- **Whitney Hernandez** — Add "Bridal Hair (@dreambridesaz)", "Extensions" to knownFor; mark bridal as a featured specialty.
- **Allison Griessel** — Add "Vivids" to knownFor; ensure `serviceCategories: ['hair', 'lashes', 'skincare']` is set so she appears in all three filters.
- **Kathy Charette** — Reframe specialty from generic "Cuts & Color" to "Precision Cuts for Difficult Hair" (matches Alicia Robinson review).
- **Charly Camano** — Elevate "Waves & Texture" as primary niche.

**Files:** `src/data/teamData.ts`

---

### Phase D — Review Attribution (MEDIUM IMPACT)

**Problem:** Named reviews ("Whitney is the best with blondes!!", "Allison G is magical", "Michelle… reassured me") live only in the testimonial carousel — not on the artist cards where they convert.

**Action:**
1. Add an optional `featuredReview: { quote, author, source }` field to `TeamMember`.
2. Render the review inside the artist detail modal as an italic gold-bordered quote block (matches existing `legacyBio` styling).
3. Attribute confirmed reviews:
   - Whitney → Andrea Mitchell quote
   - Allison → Megan Petersen + Kassandra Estrada quotes
   - Michelle → Cara B Foster quote
   - Kathy Charette → Alicia Robinson quote (mark "Kathy" disambiguation)

**Files:** `src/data/teamData.ts`, `src/components/ArtistsSection.tsx` (detail modal), `src/components/luna/ArtistsTab.tsx` (detail view)

---

### Phase E — Cross-Department Filter Fix (BUG)

**Problem:** Allison is triple-licensed but only appears under "Hair" filter. Test confirmed she's missing from Lashes filter.

**Action:** Verify `serviceCategories: ['hair', 'lashes', 'skincare']` is set for Allison. The filter logic in `ArtistsTab.tsx` already supports `serviceCategories.includes()` — just need data fix.

**Files:** `src/data/teamData.ts`

---

### Out of Scope (intentionally deferred per demo focus)

- Years-of-experience badges across all artists (data quality varies)
- Price indicators per artist (would conflict with menu pricing)
- New badges beyond EDUCATOR (avoid badge inflation)

---

### Suggested Build Order

1. **Phase A + E together** — Founders + Allison filter (data-only changes, biggest visual impact)
2. **Phase B** — Instagram links (small UI addition, big discoverability win)
3. **Phase C** — Specialty/tag upgrades (data-only)
4. **Phase D** — Review attribution (small UI addition + data)

All four phases are demo-safe — no risky UI restructuring, no new components, just data enrichment + small additive UI elements.

**Files touched total:**
- `src/data/teamData.ts` (all phases)
- `src/components/ArtistsSection.tsx` (Phase B, D)
- `src/components/luna/ArtistsTab.tsx` (Phase B, D)

Reply with **"ship all"** or pick specific phases (e.g., "ship A + B").

