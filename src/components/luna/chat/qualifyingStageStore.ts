// Per-single-service qualifying-stage memory.
//
// Switching between single-service contexts (e.g. lashes → skincare → back to
// lashes) used to reset chip progression to stage 0. We now persist the stage
// per service signature in sessionStorage so each service remembers where the
// guest left off within the current visit.
import type { ConciergeContext } from "@/types/concierge";

const STORE_KEY = "hush_luna_qualifying_stages_v1";

export function getQualifyingKey(ctx: ConciergeContext | null): string | null {
  if (!ctx?.categories?.length) return null;
  if (ctx.categories.length !== 1) return null; // only single-service flows progress
  return `${ctx.categories[0]}::${ctx.service_subtype || ""}`;
}

function readMap(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, number>): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function loadQualifyingStage(ctx: ConciergeContext | null): number {
  const key = getQualifyingKey(ctx);
  if (!key) return 0;
  const map = readMap();
  const v = map[key];
  return typeof v === "number" && v >= 0 ? v : 0;
}

export function saveQualifyingStage(ctx: ConciergeContext | null, stage: number): void {
  const key = getQualifyingKey(ctx);
  if (!key) return;
  const map = readMap();
  map[key] = Math.max(0, Math.min(stage, 2));
  writeMap(map);
}

export function clearQualifyingStages(): void {
  try {
    sessionStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}