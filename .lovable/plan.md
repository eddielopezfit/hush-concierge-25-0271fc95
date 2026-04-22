

## Full System Extraction — Hush Salon Digital Hub

I'll generate a single comprehensive technical + UX + AI architecture document, optimized as a NotebookLM/ChatGPT briefing source. It will let another AI fully understand, analyze, or recreate the system.

### Deliverable

- `/mnt/documents/hush-system-extraction.md` — ~10,000 words, all 15 sections, no summarization
- `/mnt/documents/hush-system-extraction.pdf` — Printable handoff via headless Chromium

### Document structure (every section delivered in full depth)

**1. System Overview** — Product class: AI-powered conversion-focused service business hub. Business purpose: replace static legacy site with 24/7 lead-capture engine. User journeys: (a) New guest discovery → Experience Finder → Personalized Plan → callback, (b) Returning client fast-path → direct booking, (c) Browser → Luna chat → lead capture. Differentiation: guided discovery vs. menu browsing, AI concierge vs. contact form, cinematic mobile-first vs. desktop business card.

**2. Full Site Architecture** — Routes: `/` (Index), `/services` `/team` `/about` `/contact` (all redirect to `/#anchors`), `*` (NotFound). Single-page architecture with anchor-driven navigation. For each route: purpose, components, conversion goal, flow.

**3. Homepage Deep Breakdown** — Section-by-section in 10-section narrative order: Hero (cinematic video, dynamic open/closed badge), Trust Bar (4.7★/315+/Pure 100), Experience Finder (5-step quiz), Step Inside (visual narrative), Personalized Plan reveal, Services accordion menu, Inline Callback CTA, Meet the Rockstars, Testimonials (10 verified), About (founders portrait), Join Hush (Groupies Only + Be a Rockstar), Booking Callback, Footer, Mobile Sticky Bar. Each: UX intent, components, copy strategy, conversion mechanics, dynamic behavior.

**4. UI/UX System Design** — Warm Premium aesthetic (black/charcoal + gold hsl(38 50% 55%) + deep rose). Playfair Display headings + DM Sans body, WCAG AA. Component system: cards, gold-outlined CTAs, mobile sticky bar, modals, accordions, 5-tab Luna panel. Navigation: smooth scroll + 80px scroll-padding-top, hash-route hydration. Interaction: Zero Dead Ends, "No Continue" copy rule, intent-driven labels. Trust: real photography only, verified reviews, BBB A+, Pureology badge.

**5. Luna AI Concierge — Full Breakdown**
- **5.1 Persona** — warm/confident "brilliant friend who works at the salon," neutral guidance policy (never ranks stylists for multi-provider services), TCPA disclosure, never says "As an AI...", anti-hallucination hard walls, denies nonexistent services (hot stone, prenatal, LED, online booking)
- **5.2 Knowledge Base** — `SKILL.md` condensed KB + KB10/11/12 (services, team, recommendation engine), `knowledge_items` Supabase table, `services` + `artists` tables, system prompts v4–v7, deterministic `lunaBrain.ts` fallback
- **5.3 Conversation Flows** — 4-gate lead capture (3-4 exchanges + specific Q answered + interest + not "just looking"), discovery circuit-breaker after 2 uncertainty signals, escalation to Kendell at (520) 327-6753, price objection handling (validate→reframe→compare→soften)
- **5.4 Modes/Tabs** — Chat, Find My Look (in-panel quiz), My Plan (revealed plan + booking decision), Artists (full roster, no rankings), Explore (services menu) — purpose, interaction, output for each
- **5.5 Conversion Logic** — `capture_lead` and `request_callback` tools → Slack channels routed by category (#hush-nails, #hush-lashes, #hush-skin, #hush-massage, #hush-callbacks), inline LeadCaptureForm at booking touchpoints, exit-intent on LunaModal

**6. Experience Finder + Personalization** — 5-step (+0 fork): Step 0 fast-path "I know what I want" / "Help me decide," Step 1 categories (multi-select), Step 2 multi-service priority picker (if >1), Step 3 goal (refresh/relax/transform/event), Step 4 category-specific subtype (cut/color/both for hair, manicure/pedicure/full_set/nail_art for nails, etc.), Step 5 timing (today/week/planning/browsing). `lunaBrain.generateRecommendation()` → `goalServiceMap[goal][category]` with subtype override → urgency from timing → `getPriceRange()` from servicesMenuData → `RevealData` → `ExperienceRevealCard` with cinematic reveal.

**7. Booking + Conversion System** — Three modes via `deriveBookingMode()`: `consultation` (color/extensions/lashes — complimentary, no commitment), `guided_front_desk` (multi-provider services), `direct_or_callback` (single-provider specialists). `BookingDecisionCard` runs inline lead capture with idempotency guard, parallel `saveLead` + `saveCallbackRequest`. Sticky mobile bar: Call / Text / Talk to Luna. Inline CTAs after every major section.

**8. Backend Architecture**
- **8.1 Database** — 7 tables: `artists`, `services`, `knowledge_items`, `guest_profiles` (visit_count, fingerprint, preferred_categories, intent_score), `conversations` (channel, concierge_context, summary, last_summarized_at), `messages` (role, content, latency_ms, tokens_used), `leads`, `callback_requests`. All RLS service-role-only. No FKs (loose coupling).
- **8.2 Edge Functions** — `luna-chat` (streaming AI, Lovable AI gateway), `session-start`, `session-summarize` (throttled intelligence loop), `capture-lead`, `request-callback`, `submit-lead`, `lead-qualify` (Slack routing engine), `daily-digest`, `health-check`. Triggers and CORS allowlist for each.
- **8.3 Lead Handling** — Capture point → dedup window (2m/5m/24h) → Slack webhook by category with priority badges (🔴 HIGH for callbacks/today, 🟡 MEDIUM for week) → Supabase row → optional CRM/SMS hooks (Phase 2)

**9. Data + Intelligence Layer** — Behavioral: `journeyTracker.ts` IntersectionObserver → section dwell, `useDwellNudge` + `useInactivityNudge`. Captured: categories of interest, goal, timing, subtype, preferred artist, fingerprint, visit count, intent score, summarized intent_signals. Marketing use: cohort by category interest, retarget abandoned Experience Finders, identify high-intent unbooked leads.

**10. Mobile Experience** — Persistent `MobileStickyBar` (Call/Text/Luna), portrait-master hero video top-anchored, single-column section layouts, swipe-friendly tabs in Luna panel, 24h ConciergeContext TTL across visits. Conversion advantage: phone-in-hand never has to scroll back.

**11. Differentiation** — vs. traditional salon sites (static menu vs. guided discovery + AI), vs. template builders (custom voice + brand-trained AI vs. generic chatbot plugin), vs. generic chatbots (Hush-specific KB + neutral guidance policy + tool-driven lead capture vs. ChatGPT wrapper).

**12. Live vs. Phase 2**
- **Live:** Hero + video, Trust Bar, Experience Finder, Personalized Plan reveal, Services Menu, Luna 5-tab panel, Booking Decision Card, lead capture → Slack, returning-client fast path, mobile sticky bar, journey tracker, session summarization
- **Phase 2 ready:** Calendar embed, SMS confirmations/reminders, email follow-up sequences, CRM sync, daily digest activation, voice concierge (built but disabled per constraint)

**13. System Strengths** — Neutral guidance policy (protects team unity), deterministic fallback brain (works even if AI API fails), anti-hallucination hard walls, real photography only, conversion touchpoints after every section, cinematic luxury aesthetic matching 24-year brand heritage, intelligence-summarization closed loop.

**14. Gaps / Improvements** — No online booking (by constraint — phone only), no calendar sync yet, no SMS automation yet, voice concierge disabled, no member portal (excluded by business model refocus), single-language (English; Spanish callers redirected), no A/B testing harness.

**15. Rebuild Instructions** — Tech stack: React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + Framer Motion (LazyMotion) + React Router + TanStack Query + Supabase (managed Lovable Cloud) + Lovable AI Gateway (google/gemini-2.5-flash for chat). Architecture: SPA with lazy-loaded sections, route-level code splitting, Suspense boundaries, shared `LunaContext` + localStorage persistence (24h TTL), `ConciergeContext` flowing through Experience Finder → Personalized Plan → Luna → Lead Capture. Key dependencies: `react-markdown` + `remark-gfm` (chat rendering), `lucide-react` (icons), `sonner` (toasts), edge-function streaming for chat.

### Source extraction

Pulling from: `src/lib/SKILL.md`, `lunaBrain.ts`, `experienceReveal.ts`, `cadenceEngine.ts`, `upsellEngine.ts`, `journeyTracker.ts`, `conciergeStore.ts`, `sessionManager.ts`, `data/teamData.ts` (17 Rockstars), `data/servicesMenuData.ts`, all 10 edge functions, `LunaContext.tsx`, `ExperienceFinderSection.tsx`, `BookingDecisionCard.tsx`, `ChatTab.tsx`, all luna/* tab components, Supabase schema (7 tables), and 70+ memory files in `mem://`.

### Will not include

- Speculative features not in the codebase
- Hallucinated metrics (no fake conversion rates, no fake response times)
- Specific dollar figures for the founders' rate
- Voice/ElevenLabs as live (disabled per constraint, marked Phase 2)

