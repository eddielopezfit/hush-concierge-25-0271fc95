import { ConciergeContext } from "@/types/concierge";

const STORAGE_KEY = "hush_concierge_context";
const STORAGE_KEY_TIMESTAMP = "hush_concierge_context_ts";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getConciergeContext = (): ConciergeContext | null => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age > TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
        return null;
      }
    }
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
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
  } catch {
    console.error("Failed to save concierge context");
  }
};

export const clearConciergeContext = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
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

/**
 * Build dynamic variables for ElevenLabs session
 * Returns formatted strings for selected_categories, selected_goal, selected_timing, and luna_context_summary
 */
export const buildDynamicVariables = (ctx: ConciergeContext | null): Record<string, string> => {
  const categoryLabels: Record<string, string> = {
    hair: "Hair",
    nails: "Nails",
    lashes: "Lashes",
    skincare: "Skincare",
    massage: "Massage",
  };
  
  const goalLabels: Record<string, string> = {
    refresh: "Quick Refresh",
    relax: "Relaxation",
    transform: "Full Transformation",
    event: "Event Ready",
  };
  
  const timingLabels: Record<string, string> = {
    today: "Today",
    week: "This Week",
    planning: "Planning Ahead",
    browsing: "Just Browsing",
  };

  // Format categories with "and" for 2+ items
  let selectedCategories = "";
  if (ctx?.categories && ctx.categories.length > 0) {
    const names = ctx.categories.map(c => categoryLabels[c] || c);
    if (names.length === 1) {
      selectedCategories = names[0];
    } else if (names.length === 2) {
      selectedCategories = `${names[0]} and ${names[1]}`;
    } else {
      selectedCategories = `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
    }
  }

  const selectedGoal = ctx?.goal ? (goalLabels[ctx.goal] || ctx.goal) : "";
  const selectedTiming = ctx?.timing ? (timingLabels[ctx.timing] || ctx.timing) : "";

  // Build rich natural language summary for Luna
  // Luna reads this as {{luna_context_summary}} and opens with a personalized response
  let lunaContextSummary = "";
  
  if (selectedCategories || selectedGoal || selectedTiming) {
    const parts: string[] = [];
    
    if (selectedCategories) {
      parts.push(`The guest is interested in ${selectedCategories}`);
    }
    
    if (selectedGoal) {
      const goalPhrases: Record<string, string> = {
        "Quick Refresh": "looking for a quick refresh",
        "Relaxation": "wanting to relax and decompress",
        "Full Transformation": "ready for a full transformation",
        "Event Ready": "getting ready for a special event",
      };
      parts.push(goalPhrases[selectedGoal] || `goal: ${selectedGoal}`);
    }
    
    if (selectedTiming) {
      const timingPhrases: Record<string, string> = {
        "Today": "hoping to come in today",
        "This Week": "looking to book this week",
        "Planning Ahead": "planning ahead for a future visit",
        "Just Browsing": "just browsing and exploring options",
      };
      parts.push(timingPhrases[selectedTiming] || `timing: ${selectedTiming}`);
    }
    
    lunaContextSummary = parts.join(". ") + ".";
  }

  return {
    selected_categories: selectedCategories,
    selected_goal: selectedGoal,
    selected_timing: selectedTiming,
    luna_context_summary: lunaContextSummary,
  };
};
