# Hush NotebookLM Overview Prompts v3 — Video Rewrite + QA Checklist

## Deliverable
One new file: `/mnt/documents/Hush_NotebookLM_Overview_Prompts_v3.md`

Audio v2 prompt carries forward unchanged (it's working). The **Video Overview prompt is fully rewritten** to fix every gap surfaced in the m4p4 analysis, and a one-page **QA checklist** is appended so you can verify each NotebookLM render before sending it to Sheri, Danielle, and Kathy.

---

## What v3 fixes (from the video analysis)

| Gap in current video render | v3 fix |
|---|---|
| Male narrator | Hard-coded `voice: female, warm, mid-range, advisor tone — think trusted consultant, not influencer` directive at top of prompt |
| No data citations spoken | Mandatory inline source callouts: SimilarWeb (March 2026), Google Business Profile, Hush published menu, US Census Tucson |
| Missing Founders Pricing / case study ask | New **Chapter 5 script (verbatim)** locking in the partnership ask — not paraphrased, not optional |
| Cartoon/whiteboard visuals | `style: editorial, minimal, cinematic. No cartoons, no mascots, no hand-drawn icons, no stock illustrations. Use typography, real photography references, and brand color blocks only.` |
| Pronunciation drift (Cathy/Kendall) | Phonetic guide repeated at top of video prompt: KATH-ee, KEN-dell, TAM-ee, SHARE-ee, dan-YELL |
| Domain never spoken | Required spoken URL in close: "hush dash salon dot lovable dot app" |
| Founders not addressed by name on screen | Each chapter title card opens with "Sheri, Danielle, Kathy —" |

---

## v3 Video Prompt structure (5 chapters, 4–5 min, no hard cap)

1. **Cold open (30s)** — Black screen, gold serif type. "Sheri, Danielle, Kathy — this is what a digital front desk looks like when it's built only for you." Female narrator enters.
2. **The gap, with receipts (60s)** — On-screen stat cards cite SimilarWeb March 2026, Google Business Profile. Padlock metaphor visualized as a closed storefront at night.
3. **What we built (90s)** — Five pillars as title cards in Playfair Display on charcoal. Luna explained in 30s using the sommelier metaphor. Triple-Net Lead Capture shown as a 3-node diagram (SMS / Email / Slack).
4. **What's in it for you (60s)** — Outcomes ladder, not feature list. Four cards: more time at the chair, first-time guests who already feel the brand, reputation matching presence, system that works the 50% you're closed.
5. **The ask (60s) — VERBATIM SCRIPT LOCKED** — Founders Pricing + 12 months unlimited edits, in exchange for case study rights. Frame as legacy partnership. Close with spoken domain and direct invitation to a 30-min walkthrough.

## Locked Chapter 5 narration (in the prompt as a `must_say` block)

> "Sheri, Danielle, Kathy — here's the honest exchange. This system is built. It's yours at founders pricing, with twelve months of unlimited edits, well below what a build of this depth normally runs. In return, I'd ask permission to tell your story — how a twenty-four-year Tucson salon closed the digital gap — as a case study other founders can learn from. Your legacy, told honestly, becomes the proof other small business owners need to invest in their own digital front door. The system exists either way. You decide if it goes live for you. Visit hush dash salon dot lovable dot app, or reply to this message, and we'll set thirty minutes."

## Brand visual constraints (in prompt)

- Palette: charcoal `#0d0d0d`, cream `#f5f3ee`, gold `#d8b063`
- Type: Playfair Display (display), DM Sans (body)
- Photography: real salon imagery references only — no AI illustration, no whiteboard
- Motion: slow fades, no kinetic typography, no animated mascots
- Lower-thirds: founders' names + roles when first mentioned

## Pronunciation guide (repeated from audio v2)

KATH-ee · KEN-dell · TAM-ee · SHARE-ee · dan-YELL · AL-ih-son · pyur-AH-loh-jee · "hush dash salon dot lovable dot app"

## Guardrails (in prompt)

- Never use "chatbot"
- Never compare Hush to other Tucson salons by name
- Never imply the founders are behind on technology
- Always cite the source the first time a stat appears
- Female narrator throughout — no male voice, no dual-host format

---

## QA checklist (appended to the file)

A one-page checklist you run against every NotebookLM render before sending. Pass = ship; any fail = regenerate.

**Audio overview**
- [ ] Female or matched-tone narration (per your preference)
- [ ] Names pronounced KATH-ee, KEN-dell, TAM-ee
- [ ] Domain spoken as "hush dash salon dot lovable dot app"
- [ ] SimilarWeb March 2026 cited for traffic stat
- [ ] Google Business Profile cited for reviews/rating
- [ ] ROI formula walked through end-to-end ($9,360/yr, ~$46k EV)
- [ ] Founders addressed by name minimum 6 times
- [ ] Founders Pricing + case study ask present near close
- [ ] No use of "chatbot"
- [ ] No comparison to other Tucson salons by name

**Video overview**
- [ ] Female narrator
- [ ] Editorial visuals — no cartoons, mascots, or whiteboard
- [ ] Brand palette (charcoal/cream/gold) visible in title cards
- [ ] Playfair Display + DM Sans typography
- [ ] All 7 audio QA items above also pass
- [ ] Chapter 5 ask matches the locked verbatim script
- [ ] Final frame shows spoken + written domain

---

## Out of scope

- Audio v2 prompt is unchanged (working as intended)
- Encyclopedia source doc unchanged
- No code changes to the live site
- No NotebookLM upload — that remains your manual step

## Faithfulness to memory

- Luna chat-only, no voice
- Neutral guidance policy honored
- Front desk Kendell at (520) 327-6753
- Service denials: hot stone, prenatal, LED
- Hours: Tue/Thu 9–7, Wed/Fri 9–5, Sat 9–4, Closed Sun/Mon
- Founders: Sheri Turner, Danielle Cole, Kathy
- Brand equity preserved: Rockstars, Groupies Only, Pure 100 Club
