# Luna Side-Panel — Architecture & Design DNA

> Reference doc for the Luna concierge chat panel in **Hush Salon**.
> Intended audience: another team (e.g. **Selena** in *Kasandra Studio*) building or refactoring a similar in-app concierge widget.
>
> **Heads-up on cross-project scan:** A scan of *Kasandra Studio* (`b139bc53-91b1-4907-be71-6bfcb6ab8be1`) found **no `Selena` component or chat panel** — only shadcn UI primitives and a compliance/brief workflow (`Dashboard`, `CreateBrief`, `DraftReview`, `ComplianceReview`, `ExportConfirmation`). This document therefore serves as a **green-field architectural blueprint** Selena can adopt rather than a line-by-line diff. Recommendations at the bottom are framed as *"adopt these patterns when you build the panel."*

---

## 1. Component Tree

```
LunaChatWidget                   ← single global mount (rendered in App.tsx, fixed-position)
├── Nudge tooltip                ← AnimatePresence, anchored above bubble
├── Collapsed Bubble + Label     ← AnimatePresence, spring entry
└── Expanded Panel               ← AnimatePresence, scale+fade
    ├── Header (avatar / title / minimize|close)
    ├── LunaTabNav               ← 5 segmented tabs w/ layoutId indicator
    └── Tab content (AnimatePresence mode="wait")
        ├── FindMyLookTab        ← guided quiz / category picker
        ├── ExploreTab           ← service browser
        ├── ArtistsTab           ← stylist roster + "Ask Luna about <name>"
        ├── MyPlanTab            ← personalized recap + booking handoff
        └── ChatTab              ← free-form chat (the heaviest tab)
```

**Single mount point.** The whole widget — bubble, nudge, panel — is one component (`LunaChatWidget`) rendered once globally. No portals, no per-page logic. State lives in `LunaContext`.

---

## 2. State Model

### 2.1 `LunaContext` (UI state — `src/contexts/LunaContext.tsx`)

| field | purpose |
|---|---|
| `isModalOpen` / `openModal` / `closeModal` | full-screen LunaModal (separate from the panel) |
| `chatWidgetRequested` / `openChatWidget` / `clearChatWidgetRequest` | external trigger to open the panel on the Chat tab |
| `hasInteracted` / `markInteracted` | gate proactive nudges site-wide |
| `conciergeContext` / `setConcierge` / `mergeConcierge` / `clearConcierge` | the unified guest profile (see §2.2) |

The provider also wires **cross-tab sync** via `window.addEventListener("storage", …)` so two open tabs stay aligned.

### 2.2 `ConciergeContext` (guest profile — `src/types/concierge.ts`)

Persisted to `localStorage` under `hush_concierge_context` with a sibling timestamp `hush_concierge_context_ts`.

**24-hour TTL** enforced inside `getConciergeContext()` — stale entries are silently purged on read. This is the single most important rule: a returning guest after >24h gets a fresh slate, but a same-day reopen restores everything.

Shape (abridged):
- `source` — entry point (`"find_your_experience"`, `"Team Compare"`, …)
- `categories[]` — selected service categories
- `service_subtype` — e.g. `cut` / `color` / `manicure` / `deep_tissue`
- `goal`, `timing`, `primary_category`, `multi_service_mode`
- `is_multi_service`, `is_new_client`, `budget_sensitivity`
- `preferredArtist` / `preferredArtistId`
- deep-link context: `category`, `group`, `item`, `price`
- `quizCompletedAt` — freshness flag for the Find My Look quiz

The `mergeConcierge` reducer uses **explicit `!== undefined` checks** (not `??`) so that a caller can intentionally clear a field by passing `null`.

### 2.3 Chat persistence (`ChatTab.tsx`)

A separate `localStorage` slot `hush_luna_chat_v1` stores:
```ts
{ messages, fingerprint, successfulExchangeCount, leadCaptured, leadDismissed, savedAt }
```
- **24-hour TTL** (mirrors ConciergeContext).
- **Context fingerprint** = `categories + subtype + goal + timing + source`. On hydrate, the chat is restored only if the fingerprint matches — otherwise the panel shows a fresh greeting. If it changes mid-session, history is **kept** but a soft transition line ("Got it — switching to a manicure. What would you like to know?") is appended.

---

## 3. Proactive Nudge Engine

Two independent nudges, both wired in `LunaChatWidget.tsx`. Each fires **at most once per session** (guarded by `sessionStorage` keys), only when the panel is closed.

### 3.1 "Compare" nudge — 30s dwell on Services or Artists
- Per-section dwell counter, accumulated via `requestAnimationFrame` + delta time (handles tab-throttling cleanly).
- `IntersectionObserver` tracks visibility (`intersectionRatio >= 0.4`).
- `MutationObserver` re-attaches the IO when sections are lazy-loaded later in the page lifecycle.
- Threshold: `30_000ms`. Storage key: `hush_luna_compare_nudge_shown`.

### 3.2 "Stuck?" nudge — 20s inactivity inside Experience Finder
- `IntersectionObserver` arms an inactivity timer when the section becomes visible.
- Activity events that reset the timer: `click`, `keydown`, `pointerdown`, `touchstart`, `scroll` (passive).
- Threshold: `20_000ms`. Storage key: `hush_luna_finder_stuck_nudge_shown`.

Both effects re-run when `isOpen` flips, and both teardown observers/listeners cleanly on unmount.

The nudge UI is a small Framer-animated tooltip with an arrow tail, positioned `bottom-[10.5rem] md:bottom-24 right-6`, anchored above the bubble. Two CTAs: accept (opens panel → Chat tab + plays chime) or dismiss.

---

## 4. Tab Transition System

```ts
const tabVariants = {
  enter:  { opacity: 0, y:  8 },
  center: { opacity: 1, y:  0 },
  exit:   { opacity: 0, y: -8 },
};

<AnimatePresence mode="wait">
  <m.div key={activeTab} variants={tabVariants} … transition={{ duration: 0.15 }}>
    {renderTabContent()}
  </m.div>
</AnimatePresence>
```

- `mode="wait"` means the outgoing tab finishes exit before the new one enters — prevents flash/overlap.
- `LunaTabNav` uses `layoutId="luna-tab-indicator"` so the underline glides between tabs.
- Active tab is **never unmounted via routing** — it's a local `useState<LunaTabId>`. Each tab's internal state is preserved during the panel's lifetime; cleared only when the panel closes (or the chat is explicitly reset).

---

## 5. Cross-Tab Event Bus

The chat tab fires actions like *"See our team"* or *"Build my plan"*. Rather than prop-drilling an `onSwitchTab` callback through every nested button:

```ts
// ChatTab.tsx
window.dispatchEvent(new CustomEvent("luna-switch-tab", { detail: "artists" }));

// LunaChatWidget.tsx
useEffect(() => {
  const handler = (e: Event) => {
    const target = (e as CustomEvent).detail;
    if (target) setActiveTab(target as LunaTabId);
  };
  window.addEventListener("luna-switch-tab", handler);
  return () => window.removeEventListener("luna-switch-tab", handler);
}, []);
```

Tabs that *do* receive a callback (`onSwitchTab` for the structured tabs) use it directly; the event bus is the escape hatch for deeply-nested or markdown-rendered actions. **One named event, well-typed `detail`, single listener**.

A second pending-prompt channel uses `sessionStorage["hush_chat_pending_prompt"]` so other tabs can seed a chat message ("Ask Luna about Allison") that auto-sends 150ms after the Chat tab mounts.

---

## 6. Lazy Audio Chime

```ts
const chimeRef = useRef<HTMLAudioElement | null>(null);
const chimeBuilt = useRef(false);

const buildChime = useCallback(() => {
  if (chimeBuilt.current) return;
  chimeBuilt.current = true;
  chimeRef.current = buildChimeAudio();   // synthesizes a WAV in-memory
}, []);
```

- `lunaChime.ts` synthesizes a soft two-tone (880 Hz + 1318.5 Hz, exponential decay) into an `AudioBuffer`, encodes WAV, wraps in an `<audio>` element. No network request, no external asset.
- Built **on first panel open only**, then reused.
- Volume capped at `0.35`. Wrapped in `try { … } catch { return null; }` for autoplay-blocked environments.
- `play()` is `.catch(() => {})` — silently swallowed if the browser blocks it.

---

## 7. Mobile vs Desktop Sizing

Single Tailwind class string handles both:

```
fixed z-[9999] bottom-6 right-6
w-[390px] h-[560px] md:w-[390px] md:h-[560px]
max-md:bottom-0 max-md:right-0 max-md:left-0
max-md:w-full max-md:h-[100dvh]
max-md:rounded-none rounded-2xl
```

- **Mobile (<md)**: full-bleed, `100dvh` (dynamic viewport height — handles iOS toolbar collapse), no border radius.
- **Desktop**: 390 × 560 floating card, 16px from bottom-right.
- Header swaps between a "minimize" affordance (desktop) and "close" X (mobile).

The collapsed bubble lives at `bottom-[6.5rem] md:bottom-6` to clear the mobile sticky bar.

---

## 8. Edge-Function Backbone

Three Supabase edge functions form the server contract:

| function | role |
|---|---|
| `session-start` | Issued on first chat open; takes a browser `fingerprint` + `concierge_context`, returns `{ conversation_id, guest_profile_id, is_returning, visit_count }`. `conversation_id` lives in `sessionStorage`. |
| `luna-chat` | Streams the assistant reply. Body: `{ messages, journeyContext, conversation_id }`. Server appends to the same conversation row. |
| `session-summarize` | Throttled background loop; condenses long chats into the `conversations.summary` column for returning-guest personalization. |

Returning-guest detection happens server-side via the fingerprint, not via cookies, so it survives across browsers on the same device class but resets across devices.

`clearConversation()` rotates only the `conversation_id` (not the `guest_profile_id` or `fingerprint`) — used by "Start fresh chat" so the next message gets a new self-intro without losing the returning-guest signal.

---

## 9. Lead Capture Timing

In `ChatTab.tsx`:

- A `successfulExchangeCount` counter increments each time Luna replies with a **non-error** message (filtered via the `ERROR_PHRASES` allowlist).
- After **4 successful exchanges** the inline lead form (`name + phone`) is mounted directly under the next assistant bubble — no modal, no interruption.
- High-intent phrases (`"i'm ready to book"`, `"have someone call me"`, `"lock it in"`, …) trigger the form **immediately**, regardless of count.
- Once captured **or** dismissed, both states persist in `localStorage` so the form never re-appears in the same 24h window.

Exit-intent fallback lives on the larger `LunaModal` component, not the side panel.

**Dedup:** lead-side dedup is enforced in the `submit-lead` edge function (2m / 5m / 24h windows depending on phone vs context match) — see `mem://technical/lead-deduplication-strategy`.

---

## 10. Persistent Quick Replies & In-Chat Actions

Two parallel UI affordances on every assistant message:

1. **`quickReplies`** — a strip of 3–4 chips below the input, reseeded after every Luna reply via `getQuickReplies(ctx, lastAssistantMsg)`. Branches on substrings (`price`, `stylist`, `recommend`, `ready`/`book`, …) so the chips always feel "of the moment." If Luna errored, the chip set switches to recovery actions (`Try again`, `Call (520) 327-6753`, …).
2. **`actions[]` on the message itself** — up to 3 in-chat buttons inferred via `detectChatActions(msg, ctx)`. Substring rules map to typed actions:
   - `phone` → `tel:`
   - `text`  → `sms:`
   - `callback` → opens inline lead form
   - `scroll` → `document.getElementById(target).scrollIntoView`
   - `tab` → dispatches `luna-switch-tab`

The "always pair Call with Text" rule is hard-coded so the front desk number is never a one-way CTA.

---

## 11. Component Diagram (data flow)

```
       Page sections (Services / Artists / Finder)
                    │
                    ▼
        IntersectionObserver + rAF
                    │
                    ▼
              Nudge tooltip ──── accept ──┐
                                          ▼
   Other tabs ── luna-switch-tab ──► LunaChatWidget (activeTab)
                                          │
                                          ▼
                                       Tab content
                                          │
                              ┌───────────┼────────────┐
                              ▼           ▼            ▼
                          ChatTab    ArtistsTab    MyPlanTab
                              │
              ┌───────────────┼──────────────┐
              ▼               ▼              ▼
        luna-chat       session-start   submit-lead
        (stream)        (init+returning) (after 4 msgs)
              │               │              │
              └───────────────┴──────────────┘
                          Supabase
                              │
                              ▼
                 conversations / leads / guest_profiles
                              │
                              ▼
                   session-summarize (throttled)
```

---

## 12. Comparison Table — "If Selena adopted this"

Since Kasandra Studio currently has no concierge panel, this is framed as **"Luna pattern → why Selena should consider it."**

| Concern | Luna's pattern | Why it's worth adopting |
|---|---|---|
| **Mount point** | Single global `LunaChatWidget` in `App.tsx` | One source of truth for open/closed state; avoids per-route re-mount + lost chat history. |
| **State separation** | `LunaContext` (UI) vs `ConciergeContext` (guest profile) vs chat persistence (its own slot) | Each has its own TTL/lifecycle. Mixing them is the #1 cause of "why did my chat reset?" bugs. |
| **TTL on persisted state** | 24h on both context and chat history | Returning users feel remembered same-day, fresh next-day. No manual cache busting. |
| **Cross-tab sync** | `window.addEventListener("storage")` rehydrates context | Two-tab usage is common (e.g. user opens artists in a new tab). |
| **Proactive nudges** | rAF-based dwell + IntersectionObserver, max-once-per-session via `sessionStorage` | rAF survives tab throttling correctly. `MutationObserver` re-attach handles lazy-loaded sections. |
| **Tab system** | Local `useState`, `AnimatePresence mode="wait"`, `layoutId` indicator | Cheaper than nested routes; preserves per-tab state; visually polished. |
| **Cross-component actions** | `CustomEvent("…-switch-tab", { detail })` | Avoids prop drilling through markdown-rendered buttons. One typed event, one listener. |
| **Audio chime** | Synthesized in-memory on first open, `try/catch` swallow autoplay errors | No network asset; no broken-image equivalent if the browser blocks it. |
| **Mobile sizing** | Single class string with `max-md:h-[100dvh]` | `dvh` correctly handles iOS toolbar; one component, two layouts. |
| **Conversation lifecycle** | `conversation_id` in `sessionStorage`; `clearConversation()` rotates only that | "Start fresh" without losing returning-guest fingerprint. |
| **Lead capture timing** | Counter + intent-phrase override, never modal | Inline form under the next bubble = 0 interruption, much better conversion than modal exit-intent alone. |
| **Quick replies** | Reseeded after every assistant message based on substring rules | Chips always feel current; degrades gracefully on errors with a recovery set. |
| **Streaming UX** | Auto-scroll only when near-bottom, "scroll to bottom" pill with unread count, fading "New" divider | Long answers don't yank the viewport. Users can scroll up to read without losing place. |

---

## 13. Prioritized Adoption List for Selena

Ranked by **leverage per LOC** if Kasandra Studio's Selena panel is built green-field:

1. **Single global mount + `LunaContext`-style provider.** Get this right first. Everything else hangs off it.
2. **TTL'd `localStorage` for guest profile** with sibling `_ts` key (24h). One helper read/write pair, huge UX win.
3. **Tab system: local state + `AnimatePresence mode="wait"` + `layoutId` indicator.** Skip nested routes for an in-app panel.
4. **`CustomEvent` bus for cross-component nav.** Specifically when chat actions need to switch tabs or seed prompts in another tab.
5. **`100dvh` mobile / floating-card desktop with one class string.** Don't fork the component for mobile.
6. **Proactive nudge engine (rAF + IO + MutationObserver), once-per-session via `sessionStorage`.** Only after the core panel is stable — premature nudges feel spammy.
7. **Lazy-built audio chime.** Tiny touch; high perceived polish; zero network cost.
8. **Streaming chat UX patterns:** near-bottom scroll detection, "new messages" pill, fading divider. Implement only when streaming is in play.
9. **Inline lead form after N exchanges + intent-phrase override.** Tune `N=4` based on Selena's funnel; the *pattern* is what matters.
10. **Edge-function trio shape:** `start-session` → `chat` → `summarize`. Even if names differ, the separation (init vs turn vs background condense) keeps the chat function lean.

### Things to deliberately **not** copy

- **Hard-coded substring rules** for quick replies / chat actions. They work for Hush because the catalog is small. Selena should consider an LLM-classified action scheme if her domain is broader.
- **`hush_*` storage keys** — namespace your own.
- **The `LunaModal` exit-intent component.** It's a separate surface from the side panel; only adopt if Selena needs a modal flow too.
- **Founder/artist-specific guardrails** (`luna-brain.ts` neutrality policy). Hush-specific business rule.

---

## 14. File Index (for hand-off)

| concern | file |
|---|---|
| Widget shell | `src/components/LunaChatWidget.tsx` |
| Tab nav | `src/components/luna/LunaTabNav.tsx` |
| Tabs | `src/components/luna/{FindMyLook,Explore,Artists,MyPlan,Chat}Tab.tsx` |
| UI context | `src/contexts/LunaContext.tsx` |
| Guest profile store | `src/lib/conciergeStore.ts` |
| Type defs | `src/types/concierge.ts` |
| Server session helper | `src/lib/sessionManager.ts` |
| Chime synthesis | `src/lib/lunaChime.ts` |
| Journey tracking | `src/lib/journeyTracker.ts` |
| Edge functions | `supabase/functions/{session-start,luna-chat,session-summarize}/index.ts` |

---

*Generated for hand-off to the Kasandra Studio / Selena team. No source files in either project were modified by producing this document.*
