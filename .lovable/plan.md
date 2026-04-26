# Plan: Perplexity Comet UI/UX Audit Prompt for Hush Salon

## Goal
Produce a single, copy-paste-ready prompt you can drop into Perplexity Comet's browser agent. Comet will navigate the live site (https://hush-salon.lovable.app) end-to-end and return a stakeholder-grade audit you can present to the three founders (Sheri, Danielle, Kathy).

## What the prompt will instruct Comet to do
The prompt is structured as a **role + mission + scripted journey + scoring rubric + deliverable format** — that structure is what makes Comet act like a real auditor instead of skimming the homepage.

1. **Role framing** — "Senior luxury hospitality UX auditor reviewing for the founders."
2. **Context block** — what Hush is (Tucson salon, 2002, Pureology Pure 100), brand voice (refined rockstar), the "Zero Dead Ends" principle, Luna concierge being chat-only, real photography rule, no Continue copy rule. This prevents Comet from flagging intentional design decisions as "issues."
3. **Scripted user journeys** Comet must complete (each on desktop AND mobile viewport):
   - First-time guest unsure what they want → Experience Finder → recommendation → callback request
   - Returning guest who knows the service → direct service browse → BookingDecisionCard
   - Stylist-specific lookup (e.g., Allison for color, Kelli for nails)
   - Luna chat: open, ask 3 realistic questions, request callback through chat
   - Footer/legal: privacy modal, hours accuracy, phone link, Google reviews link
4. **Specific checks** keyed to known features:
   - Hero + Step Inside videos actually play (not poster frames)
   - TrustBar shows 4.7★ / 315+ reviews
   - Hours render correctly per day (Tue/Thu 9–7, Wed/Fri 9–5, Sat 9–4)
   - Phone (520) 327-6753 consistent across Hero, Footer, Booking, Luna
   - No "Continue" copy anywhere
   - Luna does NOT recommend specific artists for multi-provider services
   - Mobile sticky bar behavior, scroll padding under fixed nav
   - Lazy-loaded sections appear without layout shift
   - All external links open in new tab with rel=noopener
5. **Scoring rubric** (1–5) across 8 dimensions: First Impression, Brand Cohesion, Navigation Clarity, Conversion Path, Mobile Polish, Trust Signals, Luna Concierge Quality, Performance Feel.
6. **Deliverable format** — exec summary, top 5 wins, top 5 fixes ranked by guest impact, screenshots referenced by section, and a "what to say to the founders" one-paragraph readout.

## Deliverable
A markdown file saved to `/mnt/documents/hush-comet-audit-prompt.md` with the full prompt, plus a short "how to use in Comet" header (open Comet → new agent task → paste → let it run → bring output back).

## Out of scope
- No code changes.
- No running the audit ourselves — you'll paste it into Comet and bring back the result.
- No edits to memory or the app.

## After you return with Comet's output
I'll triage findings against existing memory rules (so we don't "fix" intentional decisions), prioritize by founder-perceived impact, and propose concrete code changes for your approval.
