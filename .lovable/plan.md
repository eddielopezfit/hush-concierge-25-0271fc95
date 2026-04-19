

The user wants a prompt they can paste into Perplexity Comet (browser-controlling AI) to perform a full UI/UX audit of the Hush Salon site. Comet can navigate, click, scroll, fill forms, screenshot, and read the DOM — so the prompt needs to direct it through every critical flow and surface findings in a structured report.

## Deliverable

A single, copy-pasteable prompt saved to `/mnt/documents/comet-uiux-audit-prompt.md` plus shown inline in chat. Targets the published URL `https://hush-salon.lovable.app`.

## Prompt structure

1. **Role & objective** — senior product designer auditing a luxury salon site for conversion, accessibility, and polish.
2. **Scope** — desktop (1440) + mobile (390) viewports, every section of homepage, Luna panel (all 5 tabs), Experience Finder quiz, Services pricing modal, Booking callback, exit-intent flow.
3. **Audit dimensions** (rate each 1–5 with evidence + screenshot):
   - Visual hierarchy & brand consistency (gold/charcoal, Playfair/DM Sans)
   - Conversion clarity (no "Continue" copy, intent-driven CTAs, zero dead ends)
   - Luna concierge flow — open bubble, switch tabs, send messages, trigger nudges, exit intent
   - Experience Finder — complete the 3-step quiz with multi-service path
   - Mobile responsiveness — sticky bar, full-screen Luna, tap targets ≥44px
   - Accessibility — focus rings, skip link, contrast (AA), aria labels, keyboard nav
   - Performance feel — LCP, lazy-load jank, animation smoothness
   - Trust signals — reviews, hours badge, founders portrait, contact number visibility
   - Copy quality — voice/tone, no broken neutrality (Luna shouldn't recommend stylist for multi-provider services)
   - Broken states — 404, dead anchors, "Ask Luna about [artist]" must open chat thread
4. **Step-by-step task list** Comet must execute (numbered, deterministic).
5. **Output format** — markdown report with: Executive Summary, Severity-ranked Issues table (Critical/High/Medium/Low), Screenshot evidence per issue, Quick wins, Strategic recommendations.
6. **Constraints** — don't submit real PII in lead forms (use "Audit Bot" + 555 number), don't spam phone calls, capture before leaving each page.

## Format

Markdown file ~250 lines, ready to paste into Comet. Plain prose + numbered steps + a final "Report template" Comet fills in.

