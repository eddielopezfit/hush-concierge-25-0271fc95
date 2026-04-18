

The user wants a deep external audit of the live Hush Salon site using Perplexity Comet (browser-based AI agent) to assess: blue ocean positioning, category differentiation, perceived value, and end-user experience. Then we'll optimize from findings.

I cannot drive Comet (a separate consumer browser product) from this environment, but I can run an equivalent deep audit using the tools I do have: Perplexity API (for grounded competitive/category research) + browser automation (for first-person UX walkthrough across viewports) + Firecrawl (for full-site structural crawl). This produces the same artifact: a deep audit report.

## Plan: Deep Site Audit — "Comet-Style" Multi-Agent Pass

### Phase 1 — Connect research tools
- Connect **Perplexity** connector → grounded analysis of Tucson salon market, luxury salon category benchmarks, AI-concierge differentiation
- Connect **Firecrawl** connector → full crawl of `https://hush-salon.lovable.app` (every section, every modal copy, every CTA)

### Phase 2 — First-person UX walkthrough (browser automation)
Run scripted journeys at 3 viewports (375 mobile, 834 tablet, 1440 desktop) capturing screenshots + console logs + network timing at each step:
1. Cold land on hero → time-to-meaningful-paint, video poster, CTA clarity
2. Trust bar → social-proof legibility
3. Experience Finder full quiz (new client path + "I know what I want" fast lane)
4. Personalized Plan reveal
5. Services accordion (open Hair, Nails, Massage)
6. Artists section → click into a stylist
7. Luna chat widget → send 3 prompts (price, booking, off-topic), test exit-intent capture
8. Booking callback form submission flow (no actual submit)
9. Mobile sticky bar interactions

### Phase 3 — Category & blue-ocean analysis (Perplexity)
Run 6 grounded research queries:
- Tucson salon competitive landscape (top 10 + price positioning)
- AI concierge adoption in salon/spa industry (rare? saturated?)
- Luxury independent salon UX benchmarks (Sally Hershberger, Hair by Sam McKnight, Nine Zero One, etc.)
- "Guided experience finder" pattern in service businesses
- Industry conversion-rate benchmarks for salon websites
- Perceived-value signals that drive premium booking intent

### Phase 4 — Synthesis report (`/mnt/documents/hush-deep-audit.md` + PDF)
Structured deliverable:
1. **Executive Summary** — 1-page verdict: blue ocean? category-of-one? value tier?
2. **Category Position Map** — Hush vs. Tucson local + national luxury benchmarks (axes: tech-forward × hospitality)
3. **Perceived Value Audit** — what the site signals (premium / mid / mass) at each scroll depth, with screenshot evidence
4. **End-User Journey Heatmap** — friction points scored 1-5 per step (cold land → booking intent), per device
5. **Luna Differentiation Analysis** — how rare an AI concierge is in this category, defensibility window
6. **Blue Ocean Verdict** — is "AI-guided luxury salon discovery" an uncontested space, and for how long
7. **Top 10 Optimization Opportunities** — ranked by impact × effort, each with concrete code-level recommendation tied to actual files (HeroSection, ExperienceFinder, LunaChatWidget, etc.)
8. **Appendix** — full screenshot reel, raw Perplexity citations, Firecrawl URL map

### Technical notes
- All connector calls happen via edge functions reading `LOVABLE_API_KEY`, `PERPLEXITY_API_KEY`, `FIRECRAWL_API_KEY` from env
- Browser automation runs against the **published URL** (`hush-salon.lovable.app`) not the preview, so we audit what real users see
- Final PDF generated with the AI-gateway script + a small markdown→PDF pass; both `.md` and `.pdf` delivered to `/mnt/documents/`
- Estimated runtime: ~8-12 minutes of tool calls; no code changes to the app itself in this pass — pure audit

### What you'll get
Two artifacts in `/mnt/documents/`:
- `hush-deep-audit.md` (full report, ~15-20 pages)
- `hush-deep-audit.pdf` (presentation-ready)

After you review, we open a follow-up loop to implement the top 3-5 recommendations.

