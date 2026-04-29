---
name: Journey Context Session Binding
description: journeyContext payloads must be tagged with [session:<conversation_id>] so luna-chat can drop stale/cross-session context
type: constraint
---
**Rule:** Any client that sends `journeyContext` to `luna-chat` MUST prepend a `[session:<conversation_id>]` header line whenever a conversation_id exists. The edge function calls `verifyJourneyContext()` and DROPS the payload if the tag is missing or doesn't match — preventing cached context from one session leaking into another (wrong category scope, wrong recommendation, etc.).

**Why:** `journeyContext` is built from `localStorage` which persists across conversations on the same browser. Without binding, a guest who started a hair Try-On yesterday could get hair-scoped pricing answers in today's nails-only session.

**How to apply:**
- Client (`useChatStreaming.ts`): wrap `getJourneyContextString()` with `[session:${conversationId}]\n…` when `conversationId` is set.
- Edge function (`luna-chat/index.ts`): always pipe incoming `journeyContext` through `verifyJourneyContext(raw, conversation_id)` before downstream use.
- Tests live at `supabase/functions/luna-chat/journeyContextVerifier.test.ts`.
