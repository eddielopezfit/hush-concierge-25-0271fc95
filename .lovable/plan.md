# Founder Pitch Kit — Hush Salon & Day Spa

Goal: Produce two pre-sale assets that move Hush's founders (Sheri, Danielle, Kathy) from "interesting" to "yes." No code changes to the live site — these are standalone deliverables.

## Deliverable 1 — `Hush_Founder_Pitch.pdf` (1-page, print-ready)

A single-page, beautifully designed PDF using the Hush brand palette (charcoal `#0d0d0d`, gold `#d8b063`, cream `#f5f3ee`) with Playfair Display headings and DM Sans body, generated via ReportLab.

**Layout (top → bottom):**

1. **Header band** — black with gold "Hush" wordmark + tagline *"A front desk that never closes."*
2. **The Problem (boxed, 3 stats from SimilarWeb March 2026):**
   - 1,000 monthly visits · 1.05 pages/visit · ranks for 3 branded keywords only
   - One-line interpretation: *"A 24-year reputation invisible to digital discovery."*
3. **The Solution (3 columns with icons):**
   - **Luna AI Concierge** — denies services you don't offer, defers multi-provider bookings, answers at 11 PM Sunday
   - **Experience Finder** — 4-step guided quiz with 24-hour session memory
   - **Lead Capture Triple-Net** — callback form + Luna chat + Finder result, all wired to SMS + email + Slack
4. **The Math (highlighted gold band):**
   - 1,000 visits/mo × 2% capture = **20 leads/mo**
   - 20 × 30% close × $130 ticket = **$780/mo · $9,360/yr**
   - At 5× revenue multiple = **$46K+ enterprise value added**
   - *…from the same traffic you already have.*
5. **Proof (footer):** "Built on Lovable + Supabase + Twilio. Live at hush-salon.lovable.app. TCPA-compliant. SMS-verified. Tested with real guest persona April 26, 2026."

**Generation approach:** Python + ReportLab using the PDF skill. Output to `/mnt/documents/Hush_Founder_Pitch.pdf`. Mandatory visual QA via `pdftoppm` to confirm no overlap, proper margins, readable contrast on dark band.

## Deliverable 2 — `Hush_Demo_Script.pdf` (60-second Loom walkthrough)

A second 1-page PDF formatted as a director's shot list for recording a Loom you can text/email to founders.

**Sections:**
- **Setup** — context line ("It's 11 PM Sunday. Hush is closed. A new guest just Googled 'balayage Tucson'…")
- **Shot list (6 beats, ~10 sec each)** with exact narration + on-screen action:
  1. Hero loads → "Open Today" badge auto-flips to "Closed — opens Tue 9 AM"
  2. Click Experience Finder → pick Hair → goal "feel legendary"
  3. Personalized plan reveals → soft language, no stylist named
  4. Open Luna → ask "do you do hot stone?" → watch her decline cleanly
  5. Submit callback form with TCPA checkbox → success screen
  6. Cut to phone → SMS arrives within 5 seconds
- **Closing line** — *"That guest didn't bounce. Hush owns that lead before Tuesday morning."*
- **Recording tips** — 1280×720 viewport, mute browser audio, end with Loom CTA card

**Generation approach:** Same ReportLab pipeline, second file → `/mnt/documents/Hush_Demo_Script.pdf`.

## What I will NOT do in this loop
- No edits to the live site — pre-sale, no buy-in yet
- No SEO landing pages (that's the Phase 2 sale)
- No video recording (you'll record the Loom yourself using the script)
- No SaaS productization

## QA checklist before delivery
- Render both PDFs to JPG via `pdftoppm` and visually inspect every page
- Confirm: no clipped text, gold-on-black contrast passes AA, columns aligned, brand voice consistent ("Rockstars" / "Tucson Comes to Feel Legendary")
- Both files emitted as `<lov-artifact>` tags so you can download immediately
