import { ConciergeContext } from "@/types/concierge";
import {
  goalLabels,
  timingLabels,
  formatCategoryList,
} from "@/lib/conciergeLabels";

const STORAGE_KEY = "hush_concierge_context";

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
    console.error("Failed to save concierge context");
  }
};

export const clearConciergeContext = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Failed to clear concierge context");
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

// Helper to build a first message for Luna based on context
export const buildLunaFirstMessage = (ctx: ConciergeContext | null): string | undefined => {
  if (!ctx) return undefined;
  
  const parts: string[] = [];
  
  if (ctx.categories && ctx.categories.length > 0) {
    const names = formatCategoryList(ctx.categories);
    parts.push(`I see you're interested in ${names}`);
  }
  
  if (ctx.group && ctx.item) {
    parts.push(`specifically ${ctx.item} from our ${ctx.group} menu`);
  }
  
  if (ctx.goal) {
    const label = goalLabels[ctx.goal] || ctx.goal;
    parts.push(`Your goal is to ${label.toLowerCase()}`);
  }
  
  if (ctx.timing) {
    const label = timingLabels[ctx.timing] || ctx.timing;
    parts.push(`and you're looking to book ${label.toLowerCase()}`);
  }

  if (ctx.preferredArtist) {
    parts.push(`You're interested in working with ${ctx.preferredArtist}`);
  }
  
  if (parts.length === 0) return undefined;
  
  return `Welcome! ${parts.join(". ")}. Let me help you find the perfect experience.`;
};

/**
 * Build dynamic variables for ElevenLabs session.
 * Uses natural language for luna_context_summary.
 */
export const buildDynamicVariables = (ctx: ConciergeContext | null): Record<string, string> => {
  let selectedCategories = "";
  if (ctx?.categories && ctx.categories.length > 0) {
    selectedCategories = formatCategoryList(ctx.categories);
  }

  const selectedGoal = ctx?.goal ? (goalLabels[ctx.goal] || ctx.goal) : "";
  const selectedTiming = ctx?.timing ? (timingLabels[ctx.timing] || ctx.timing) : "";
  const preferredArtist = ctx?.preferredArtist || "";

  // Build natural language summary
  const summaryParts: string[] = [];
  if (selectedCategories) {
    summaryParts.push(`You're exploring ${selectedCategories} services`);
  }
  if (selectedGoal) {
    summaryParts.push(`aiming to ${selectedGoal.toLowerCase()}`);
  }
  if (selectedTiming) {
    summaryParts.push(`looking to book ${selectedTiming.toLowerCase()}`);
  }
  if (preferredArtist) {
    summaryParts.push(`interested in working with ${preferredArtist}`);
  }
  
  const lunaContextSummary = summaryParts.length > 0 
    ? summaryParts.join(", ") + "."
    : "";

  return {
    selected_categories: selectedCategories,
    selected_goal: selectedGoal,
    selected_timing: selectedTiming,
    preferred_artist: preferredArtist,
    luna_context_summary: lunaContextSummary,
  };
};
