import { ServiceCategoryId } from "@/types/concierge";

/** Canonical display labels for service categories */
export const categoryLabels: Record<ServiceCategoryId, string> = {
  hair: "Hair",
  nails: "Nails",
  lashes: "Lashes",
  skincare: "Skincare",
  massage: "Massage",
};

/** Canonical display labels for goals */
export const goalLabels: Record<string, string> = {
  refresh: "Refresh",
  relax: "Relax",
  transform: "Transform",
  event: "Event-ready",
};

/** Canonical display labels for timing */
export const timingLabels: Record<string, string> = {
  today: "Today",
  week: "This week",
  planning: "Planning ahead",
  browsing: "Just browsing",
};

/** Valid timing IDs used across the system */
export const VALID_TIMINGS = ["today", "week", "planning", "browsing"] as const;
export type TimingId = typeof VALID_TIMINGS[number];

/** Valid goal IDs used across the system */
export const VALID_GOALS = ["refresh", "relax", "transform", "event"] as const;
export type GoalId = typeof VALID_GOALS[number];

/** Valid service category IDs */
export const VALID_CATEGORIES: ServiceCategoryId[] = ["hair", "nails", "lashes", "skincare", "massage"];

/**
 * Normalize a timing value from various sources to the canonical ID.
 * Handles legacy/inconsistent values like "this-week" → "week".
 */
export function normalizeTiming(value: string | null | undefined): TimingId | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  const map: Record<string, TimingId> = {
    today: "today",
    week: "week",
    "this-week": "week",
    "this week": "week",
    planning: "planning",
    "planning ahead": "planning",
    browsing: "browsing",
    "just browsing": "browsing",
  };
  return map[lower] ?? null;
}

/**
 * Normalize a goal value to the canonical ID.
 */
export function normalizeGoal(value: string | null | undefined): GoalId | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  if (VALID_GOALS.includes(lower as GoalId)) return lower as GoalId;
  // Handle "event-ready" → "event"
  if (lower === "event-ready") return "event";
  return null;
}

/**
 * Normalize a category value to the canonical ServiceCategoryId.
 */
export function normalizeCategory(value: string | null | undefined): ServiceCategoryId | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  // Handle legacy values
  const map: Record<string, ServiceCategoryId> = {
    hair: "hair",
    nails: "nails",
    lashes: "lashes",
    skincare: "skincare",
    massage: "massage",
    "massage-therapy": "massage",
    "massage therapy": "massage",
  };
  return map[lower] ?? null;
}

/**
 * Format category names for display with proper conjunction.
 * e.g. ["hair", "nails"] → "Hair and Nails"
 */
export function formatCategoryList(categories: ServiceCategoryId[]): string {
  if (!categories || categories.length === 0) return "";
  const names = categories.map(c => categoryLabels[c] || c);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/**
 * Get the display label for a category, goal, or timing value.
 * Falls back to the raw value if not found.
 */
export function getLabel(type: "category" | "goal" | "timing", value: string): string {
  switch (type) {
    case "category": return categoryLabels[value as ServiceCategoryId] || value;
    case "goal": return goalLabels[value] || value;
    case "timing": return timingLabels[value] || value;
  }
}
