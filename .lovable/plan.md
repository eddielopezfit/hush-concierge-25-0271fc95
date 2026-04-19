
User clarified: "Selena" = the chat panel in Kasandra's Hub project. Need to find that project and compare its chat panel architecture against Luna's, then propose optimizations.

Plan:

1. **Find Kasandra's Hub** in the workspace (cross_project--search_project for "kasandra" / "selena").
2. **Read Selena's panel files** — locate her main widget component, tab/nav structure, context store, nudge logic, message persistence, edge functions.
3. **Document Luna's architecture** in a single reference doc at `docs/luna-panel-architecture.md` covering:
   - Component tree (LunaChatWidget → LunaTabNav → 5 tabs)
   - State model (LunaContext, ConciergeContext w/ 24h TTL)
   - Proactive nudge engine (30s dwell on services/artists, 20s inactivity on finder, IntersectionObserver + rAF)
   - Tab transition system (Framer variants, AnimatePresence mode="wait")
   - Chime/audio init pattern (lazy build on first open)
   - Cross-tab event bus (`luna-switch-tab` CustomEvent)
   - Edge function backbone (luna-chat, session-start, session-summarize)
   - Lead capture timing (after 4th msg), exit intent, dedup windows
   - Mobile vs desktop panel sizing (full-screen dvh on mobile)
4. **Compare side-by-side** in same doc: a table of "Luna has X / Selena has Y / Recommendation."
5. **Output a prioritized optimization list** Selena could adopt (e.g., proactive nudges, tab event bus, lazy chime, TTL'd context, structured tab nav vs free chat).

No code changes to Luna. Pure documentation + cross-project analysis. Doc lives in current project so user can hand it to the Selena/Kasandra Hub team.

Deliverable: one markdown file `docs/luna-panel-architecture.md` (~400 lines) with architecture, ASCII component diagram, comparison table, and ranked optimization recommendations.
