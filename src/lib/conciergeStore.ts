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
  };
  setConciergeContext(merged);
  return merged;
};

// Helper to build a first message for Luna based on context
// Only includes fields that exist - never says "null"
export const buildLunaFirstMessage = (ctx: ConciergeContext | null): string | undefined => {
  if (!ctx) return undefined;
  
  const parts: string[] = [];
  
  // Categories
  if (ctx.categories && ctx.categories.length > 0) {
    const names = formatCategoryList(ctx.categories);
    parts.push(`I see you're interested in ${names}`);
  }
  
  // Specific service item
  if (ctx.group && ctx.item) {
    parts.push(`specifically ${ctx.item} from our ${ctx.group} menu`);
  }
  
  // Goal
  if (ctx.goal) {
    const label = goalLabels[ctx.goal] || ctx.goal;
    parts.push(`Your goal is to ${label.toLowerCase()}`);
  }
  
  // Timing
  if (ctx.timing) {
    const label = timingLabels[ctx.timing] || ctx.timing;
    parts.push(`and you're looking to book ${label.toLowerCase()}`);
  }
  
  // If no meaningful context, return undefined to use default greeting
  if (parts.length === 0) return undefined;
  
  return `Welcome! ${parts.join(". ")}. Let me help you find the perfect experience.`;
};

/**
 * Build dynamic variables for ElevenLabs session
 * Uses shared label maps from conciergeLabels.
 */
export const buildDynamicVariables = (ctx: ConciergeContext | null): Record<string, string> => {
  // Format categories with proper conjunction
  let selectedCategories = "";
  if (ctx?.categories && ctx.categories.length > 0) {
    selectedCategories = formatCategoryList(ctx.categories);
  }

  const selectedGoal = ctx?.goal ? (goalLabels[ctx.goal] || ctx.goal) : "";
  const selectedTiming = ctx?.timing ? (timingLabels[ctx.timing] || ctx.timing) : "";

  // Build summary - only include non-empty parts
  const summaryParts: string[] = [];
  if (selectedCategories) summaryParts.push(selectedCategories);
  if (selectedGoal) summaryParts.push(selectedGoal);
  if (selectedTiming) summaryParts.push(selectedTiming);
  
  const lunaContextSummary = summaryParts.length > 0 
    ? `Selected: ${summaryParts.join(" • ")}`
    : "";

  return {
    selected_categories: selectedCategories,
    selected_goal: selectedGoal,
    selected_timing: selectedTiming,
    luna_context_summary: lunaContextSummary,
  };
};
