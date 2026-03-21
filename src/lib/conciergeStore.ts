import { ConciergeContext } from "@/types/concierge";
import {
  categoryLabels,
  goalLabels,
  timingLabels,
  formatCategoryList,
} from "@/lib/conciergeLabels";

const STORAGE_KEY = "hush_concierge_context";
const REC_KEY = "hush_luna_recommendation";
const FIRST_NAME_KEY = "hush_guest_first_name";
const SESSION_ID_KEY = "hush_session_id";

// ── Storage helpers ──────────────────────────────────────────────────────────

export const getConciergeContext = (): ConciergeContext | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ConciergeContext;
  } catch {
    return null;
  }
};

export const setConciergeContext = (ctx: ConciergeContext): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    console.error("[conciergeStore] Failed to save context");
  }
};

export const clearConciergeContext = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("[conciergeStore] Failed to clear context");
  }
};

export const mergeConciergeContext = (partial: Partial<ConciergeContext>): ConciergeContext => {
  const existing = getConciergeContext();
  const merged: ConciergeContext = {
    source: partial.source ?? existing?.source ?? "",
    categories: partial.categories ?? existing?.categories ?? [],
    goal: partial.goal !== undefined ? partial.goal : (existing?.goal ?? null),
    timing: partial.timing !== undefined ? partial.timing : (existing?.timing ?? null),
    category: partial.category !== undefined ? partial.category : (existing?.category ?? null),
    group: partial.group !== undefined ? partial.group : (existing?.group ?? null),
    item: partial.item !== undefined ? partial.item : (existing?.item ?? null),
    price: partial.price !== undefined ? partial.price : (existing?.price ?? null),
    preferredArtist: partial.preferredArtist !== undefined ? partial.preferredArtist : (existing?.preferredArtist ?? null),
    preferredArtistId: partial.preferredArtistId !== undefined ? partial.preferredArtistId : (existing?.preferredArtistId ?? null),
  };
  setConciergeContext(merged);
  return merged;
};

// ── Session ID ───────────────────────────────────────────────────────────────

export const getOrCreateSessionId = (): string => {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return "";
  }
};

// ── Guest name ───────────────────────────────────────────────────────────────

export const setGuestFirstName = (fullName: string): void => {
  if (!fullName?.trim()) return;
  const first = fullName.trim().split(/\s+/)[0];
  try { sessionStorage.setItem(FIRST_NAME_KEY, first); } catch { /* ignore */ }
};

export const getGuestFirstName = (): string => {
  try { return sessionStorage.getItem(FIRST_NAME_KEY) || ""; } catch { return ""; }
};

// ── Legacy helper ────────────────────────────────────────────────────────────

export const buildLunaFirstMessage = (ctx: ConciergeContext | null): string | undefined => {
  if (!ctx) return undefined;
  const parts: string[] = [];
  if (ctx.categories?.length) parts.push(`I see you're interested in ${formatCategoryList(ctx.categories)}`);
  if (ctx.group && ctx.item) parts.push(`specifically ${ctx.item} from our ${ctx.group} menu`);
  if (ctx.goal) parts.push(`Your goal is to ${(goalLabels[ctx.goal] || ctx.goal).toLowerCase()}`);
  if (ctx.timing) parts.push(`and you're looking to book ${(timingLabels[ctx.timing] || ctx.timing).toLowerCase()}`);
  if (ctx.preferredArtist) parts.push(`You're interested in working with ${ctx.preferredArtist}`);
  if (!parts.length) return undefined;
  return `Welcome! ${parts.join(". ")}. Let me help you find the perfect experience.`;
};

// ── Main build function ──────────────────────────────────────────────────────

export const buildDynamicVariables = (ctx: ConciergeContext | null): Record<string, string> => {

  // ── 1. Resolve display values ──────────────────────────────────────────────
  const selectedCategories = ctx?.categories?.length
    ? formatCategoryList(ctx.categories)
    : "";

  // goalLabels keys: refresh → "Refresh", relax → "Relax", transform → "Transform", event → "Event-ready"
  const selectedGoal    = ctx?.goal   ? (goalLabels[ctx.goal]     || ctx.goal)   : "";
  const selectedTiming  = ctx?.timing ? (timingLabels[ctx.timing] || ctx.timing) : "";
  const preferredArtist = ctx?.preferredArtist || "";

  const serviceCategory = ctx?.categories?.length
    ? (categoryLabels[ctx.categories[0]] || ctx.categories[0])
    : "";

  const serviceName   = ctx?.item  || ctx?.group || "";
  const servicePrice  = ctx?.price || "";
  const sourceEntry   = ctx?.source || "";
  const firstName     = getGuestFirstName();
  const sessionId     = getOrCreateSessionId();

  // ── 2. Load recommendation from sessionStorage ─────────────────────────────
  const rec = (() => {
    try {
      const r = sessionStorage.getItem(REC_KEY);
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  })();

  const recommendedService = rec?.recommendedService || "";
  const recommendedArtist  = rec?.recommendedArtist  || "";
  const recommendedPrice   = rec?.priceRange         || "";
  const urgency            = rec?.urgency            || "";
  const nextStep           = rec?.nextStep           || "";

  // ── 3. Build natural-language summary ─────────────────────────────────────
  // goalPhraseMap keys must match goalLabels OUTPUT values exactly
  const goalPhraseMap: Record<string, string> = {
    "Refresh":    "looking for a quick refresh",
    "Relax":      "wanting to relax and unwind",
    "Transform":  "ready for a full transformation",
    "Event-ready":"getting ready for a special event",
  };

  // timingPhraseMap keys must match timingLabels OUTPUT values exactly (case-sensitive)
  const timingPhraseMap: Record<string, string> = {
    "Today":          "hoping to come in today",
    "This week":      "looking to book this week",
    "Planning ahead": "planning ahead for a future visit",
    "Just browsing":  "just exploring options for now",
  };

  const parts: string[] = [];

  // Greet by name if available
  if (firstName) {
    parts.push(`Guest name: ${firstName}`);
  }

  // Category
  if (selectedCategories) {
    parts.push(`Interested in: ${selectedCategories}`);
  }

  // Specific service (from menu deep-link)
  if (serviceName && serviceName !== selectedCategories) {
    parts.push(`Specific service: ${serviceName}${servicePrice ? ` (${servicePrice})` : ""}`);
  }

  // Goal
  if (selectedGoal) {
    const phrase = goalPhraseMap[selectedGoal];
    parts.push(phrase ? `Goal: ${phrase}` : `Goal: ${selectedGoal}`);
  }

  // Timing
  if (selectedTiming) {
    const phrase = timingPhraseMap[selectedTiming];
    parts.push(phrase ? `Timeframe: ${phrase}` : `Timeframe: ${selectedTiming}`);
  }

  // Preferred artist
  if (preferredArtist) {
    parts.push(`Interested in: ${preferredArtist}`);
  }

  // Recommendation from lunaBrain
  if (recommendedService) {
    const recLine = [`Suggested: ${recommendedService}`];
    if (recommendedPrice) recLine.push(`at ${recommendedPrice}`);
    if (recommendedArtist) recLine.push(`with ${recommendedArtist}`);
    parts.push(recLine.join(" "));
  }

  // Source
  if (sourceEntry) {
    parts.push(`Entry: ${sourceEntry}`);
  }

  const lunaContextSummary = parts.length > 0 ? parts.join(" | ") : "";

  // ── 4. Return full variable set ───────────────────────────────────────────
  return {
    // Primary context variable — appears in first message
    luna_context_summary: lunaContextSummary,

    // Discrete fields — consumed by Section 1C in system prompt
    first_name:       firstName,
    service_category: serviceCategory,
    service_name:     serviceName,
    selected_goal:    selectedGoal,
    selected_timing:  selectedTiming,
    preferred_artist: preferredArtist,
    source_entry:     sourceEntry,
    session_id:       sessionId,

    // Recommendation fields
    recommended_service: recommendedService,
    recommended_artist:  recommendedArtist,
    recommended_price:   recommendedPrice,
    urgency:             urgency,

    // Legacy — kept for backward compat
    selected_categories: selectedCategories,
  };
};
