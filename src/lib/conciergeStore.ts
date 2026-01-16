import { ConciergeContext } from "@/types/concierge";

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
    const categoryLabels: Record<string, string> = {
      hair: "Hair",
      nails: "Nails",
      lashes: "Lashes",
      skincare: "Skincare",
      massage: "Massage",
    };
    const names = ctx.categories.map(c => categoryLabels[c] || c).join(" and ");
    parts.push(`I see you're interested in ${names}`);
  }
  
  // Specific service item
  if (ctx.group && ctx.item) {
    parts.push(`specifically ${ctx.item} from our ${ctx.group} menu`);
  }
  
  // Goal
  if (ctx.goal) {
    const goalLabels: Record<string, string> = {
      refresh: "refresh",
      relax: "relax",
      transform: "transform",
      event: "get event-ready",
    };
    parts.push(`Your goal is to ${goalLabels[ctx.goal] || ctx.goal}`);
  }
  
  // Timing
  if (ctx.timing) {
    const timingLabels: Record<string, string> = {
      today: "today",
      week: "this week",
      planning: "sometime in the future",
      browsing: "when you're ready",
    };
    parts.push(`and you're looking to book ${timingLabels[ctx.timing] || ctx.timing}`);
  }
  
  // If no meaningful context, return undefined to use default greeting
  if (parts.length === 0) return undefined;
  
  return `Welcome! ${parts.join(". ")}. Let me help you find the perfect experience.`;
};
