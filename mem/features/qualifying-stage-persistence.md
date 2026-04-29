---
name: Qualifying Stage Per-Service Persistence
description: Luna chip qualifying stage is persisted per single-service signature in sessionStorage so context switches don't reset progression
type: feature
---
Luna's `qualifyingStage` (look → timing → booking chip progression) is persisted per single-service signature via `src/components/luna/chat/qualifyingStageStore.ts`.

- Key format: `${categories[0]}::${service_subtype || ""}` — only single-category contexts persist (multi-service flows don't progress).
- Storage: `sessionStorage` under `hush_luna_qualifying_stages_v1` (visit-scoped).
- Restored on context change in `ChatTab.tsx` (greeting, transition, and persisted-load branches all call `loadQualifyingStage(ctx)` instead of hard-resetting to 0).
- Saved on every advance (handleSendInternal), every "← Go back" decrement, and on resetChat (back to 0 for current ctx).

Why: switching between services (lashes → skincare → back to lashes) used to drop the guest back to stage-0 look chips even though they'd already answered look + timing for that service. Per-signature memory keeps each service's progression intact within the visit.
