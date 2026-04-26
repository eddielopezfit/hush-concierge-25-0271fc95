# Hush Audio Overview Prompt v2 — Strategic Advisor Edition

## Deliverable
One file: `/mnt/documents/Hush_NotebookLM_Overview_Prompts_v2.md`

Contains the rewritten **Audio Overview prompt** (video prompt + outreach script carried forward unchanged from v1 with light tonal updates for consistency).

## Strategic shift from v1 → v2

| Dimension | v1 | v2 |
|---|---|---|
| Length target | 8–10 min | **No cap — clarity over brevity** (18 min is fine) |
| Tone | Podcast hosts ("gift" framing) | **Senior strategic advisor presenting to a boardroom** — warm, confident, founder-to-founder |
| Data treatment | Stats stated as fact | **Every number sourced inline** (SimilarWeb March 2026, Google Business Profile, US Census Tucson, etc.) |
| "What's in it for them" | Feature-led (Luna does X, system does Y) | **Outcome-led** — time, legacy, retention, freedom from the phone |
| The ask | Hidden / no ask | **Transparent founders-partnership ask** placed near the end |
| Pronunciation | Generic | **Hard-coded phonetic guide** (KATH-ee, KEN-dell, TAM-ee, hush-salon-dot-lovable-dot-app) |
| Founder names | Mentioned 1–2x | **Minimum 6x — open every chapter addressing Sheri, Danielle, and Kathy by name** |

## Voice direction (the most important change)

The host(s) should sound like **Eddie's senior strategic advisor briefing the Hush founders directly** — not two podcasters discussing a third party. Think: a trusted consultant walking three founders through a system that was built for them, with the data, the reasoning, and the ask laid out clean.

- Address Sheri, Danielle, and Kathy directly throughout ("Sheri, here's what we found…")
- Speak with the authority of someone who has built this for SMBs before
- Warm but not salesy — assume the founders are smart, busy, and skeptical
- Acknowledge what they already do well (315+ Google reviews, 4.7 stars, 24 years) before introducing the gap

## Required citations (every stat gets a receipt)

The prompt must instruct the hosts to source every claim out loud:

- **1,000 monthly visits / 1.05 pages per visit** → "according to SimilarWeb traffic estimates pulled in March 2026"
- **315+ Google reviews / 4.7 stars** → "verified on Hush's Google Business Profile"
- **$130 average ticket** → "based on Hush's published service menu and industry benchmarks for full-service salons in the Tucson market"
- **Closed roughly 50% of the week** → "Hush's published hours: closed Sundays and Mondays, plus early closes Wed/Fri/Sat"
- **24-year reputation** → "founded in 2002, verified via Hush's About page and Pureology Pure 100 Club tenure"
- **$9,360/year revenue lift** → "1,000 visits × 2% capture rate × 30% close rate × $130 ticket = $9,360 in year-one new revenue, conservative model"
- **~$46k enterprise value** → "$9,360 annual lift × 5x revenue multiple, standard SMB valuation benchmark"

## New chapter structure (10 chapters, ~18 min)

1. **Open with respect** (90s) — Address founders by name. Acknowledge 24 years, 315+ reviews, 4.7 stars. Frame: "You've already won the hardest part — the chair work, the relationships, the reputation. What we're here to talk about is the one room you haven't had time to furnish: the digital front door."
2. **The diagnostic** (3 min) — SimilarWeb data, sourced. The padlock metaphor moved here. The "closed half the week" stat lands here, not at minute 16.
3. **Who Eddie is and why this exists** (90s) — Systems designer/architect for SMBs, friend of Mark Crawford from the poker room. Eddie mentioned to Mark he wanted to build something for Hush. This is not a cold pitch — this is a finished system, built on spec, with no obligation.
4. **What we built — the five pillars** (4 min) — Experience Finder, Luna, real-time business logic, triple-net lead capture (SMS/email/Slack), trust infrastructure. Each pillar tied to a founder outcome, not a feature.
5. **Luna in 90 seconds** (90s, hard cap) — Sommelier analogy. Neutral guidance. Service denial logic (no hot stone, no prenatal, no LED). Why she'll never embarrass the brand.
6. **What's actually in it for you** (3 min) — The outcomes ladder:
   - More time behind the chair, less time on the phone
   - First-time guests who feel the brand before they walk in
   - Your reputation finally matching your digital presence
   - A system that works the 50% of hours you're closed
   - Legacy preservation — Rockstars, Groupies Only, Pure 100 Club all carried forward
7. **The ROI math, transparently** (2 min) — Walk the formula slowly. Acknowledge it's conservative. Note that capture rates above 2% are common with concierge-style flows.
8. **What this isn't** (90s) — Not Vagaro. Not a chatbot. Not generic AI. Not a SaaS contract. Built specifically for Hush and only Hush.
9. **The ask, transparently** (2 min) — **NEW.** The honest exchange:
   - Founders pricing (well below market for a build of this depth)
   - Unlimited edits for a defined window (12 months)
   - In return: permission to tell the Hush story as a case study — how a 24-year Tucson salon closed the digital gap and what other SMB founders can learn from it
   - Frame it as legacy, not transaction: "Your story, told honestly, becomes the proof other founders need to invest in their own digital front door."
10. **Close** (90s) — Direct address to Sheri, Danielle, Kathy. Invite them to a 30-minute walkthrough. No pressure. The system exists either way — they decide if it goes live for them.

## Pronunciation guide (hard-coded into the prompt)

- Kathy → **KATH-ee** (not Cathy)
- Kendell → **KEN-dell** (not Kendall)
- Tammi → **TAM-ee**
- Sheri → **SHARE-ee**
- Danielle → **dan-YELL**
- Allison → **AL-ih-son**
- Domain → **"hush dash salon dot lovable dot app"** (spell it phonetically)
- Pureology → **pyur-AH-loh-jee**

## Guardrails for the hosts

- Never use the word "chatbot"
- Never compare Hush to other Tucson salons by name
- Never imply the founders are behind on technology — frame the gap as opportunity, not failure
- Never overclaim — Luna is good, not magic; the ROI is conservative, not guaranteed
- Always cite sources out loud the first time a stat appears
- Always address founders by name when opening a new chapter

## Voice & video prompts (carried forward)

- Video Overview prompt: light edits to match advisor tone, same 5-chapter structure, same brand palette (charcoal/cream/gold, Playfair/DM Sans)
- Outreach text scripts: updated to reference "founders pricing + case study partnership" framing instead of pure gift framing

## Faithfulness to brand memory

- Luna chat-only, no voice
- Neutral guidance policy honored
- Front desk: Kendell at (520) 327-6753
- Service denials: hot stone, prenatal, LED
- Hours: Tue/Thu 9–7, Wed/Fri 9–5, Sat 9–4, Closed Sun/Mon
- Founders: Sheri Turner, Danielle Cole, Kathy
- Brand equity preserved: Rockstars, Groupies Only, Pure 100 Club

## QA checklist

- Every numerical claim has an inline source citation
- Founders addressed by name minimum 6 times
- Pronunciation guide present and explicit
- Case study ask present, framed as partnership not transaction
- Outcomes ladder clearly separated from feature list
- No 8-minute time cap; 18 min target acknowledged
- Hosts directed to speak AS advisor, not ABOUT Hush

## Out of scope

- No code changes to the live site
- No regeneration of the encyclopedia source doc (v1 stands)
- No actual NotebookLM upload — that's your manual step
