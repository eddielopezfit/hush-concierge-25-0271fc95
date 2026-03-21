import { ConciergeContext, ServiceSubtype, MultiServiceMode } from "@/types/concierge";
import {
  categoryLabels,
  goalLabels,
  timingLabels,
  formatCategoryList,
} from "@/lib/conciergeLabels";

// ── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEY    = "hush_concierge_context";
const REC_KEY        = "hush_luna_recommendation";
const FIRST_NAME_KEY = "hush_guest_first_name";
const SESSION_ID_KEY = "hush_session_id";

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const getConciergeContext = (): ConciergeContext | null => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? (JSON.parse(s) as ConciergeContext) : null;
  } catch { return null; }
};

export const setConciergeContext = (ctx: ConciergeContext): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx)); }
  catch { console.error("[conciergeStore] write failed"); }
};

export const clearConciergeContext = (): void => {
  try { localStorage.removeItem(STORAGE_KEY); }
  catch { console.error("[conciergeStore] clear failed"); }
};

export const mergeConciergeContext = (partial: Partial<ConciergeContext>): ConciergeContext => {
  const existing = getConciergeContext();
  const merged: ConciergeContext = {
    source:             partial.source             ?? existing?.source             ?? "",
    categories:         partial.categories         ?? existing?.categories         ?? [],
    goal:               partial.goal               !== undefined ? partial.goal               : (existing?.goal               ?? null),
    timing:             partial.timing             !== undefined ? partial.timing             : (existing?.timing             ?? null),
    service_subtype:    partial.service_subtype    !== undefined ? partial.service_subtype    : (existing?.service_subtype    ?? null),
    is_multi_service:   partial.is_multi_service   !== undefined ? partial.is_multi_service   : (existing?.is_multi_service   ?? false),
    is_new_client:      partial.is_new_client      !== undefined ? partial.is_new_client      : (existing?.is_new_client      ?? null),
    budget_sensitivity: partial.budget_sensitivity !== undefined ? partial.budget_sensitivity : (existing?.budget_sensitivity ?? null),
    preferredArtist:    partial.preferredArtist    !== undefined ? partial.preferredArtist    : (existing?.preferredArtist    ?? null),
    preferredArtistId:  partial.preferredArtistId  !== undefined ? partial.preferredArtistId  : (existing?.preferredArtistId  ?? null),
    category:           partial.category           !== undefined ? partial.category           : (existing?.category           ?? null),
    group:              partial.group              !== undefined ? partial.group              : (existing?.group              ?? null),
    item:               partial.item               !== undefined ? partial.item               : (existing?.item               ?? null),
    price:              partial.price              !== undefined ? partial.price              : (existing?.price              ?? null),
  };
  setConciergeContext(merged);
  return merged;
};

// ── Session ID ────────────────────────────────────────────────────────────────

export const getOrCreateSessionId = (): string => {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch { return ""; }
};

// ── Guest name ────────────────────────────────────────────────────────────────

export const setGuestFirstName = (fullName: string): void => {
  if (!fullName?.trim()) return;
  const first = fullName.trim().split(/\s+/)[0];
  try { sessionStorage.setItem(FIRST_NAME_KEY, first); } catch { /* ignore */ }
};

export const getGuestFirstName = (): string => {
  try { return sessionStorage.getItem(FIRST_NAME_KEY) || ""; } catch { return ""; }
};

// ── Subtype human labels ─────────────────────────────────────────────────────

const subtypeLabels: Record<string, string> = {
  cut:          "a haircut or cleanup",
  color:        "color or highlights",
  both:         "a cut and color",
  manicure:     "a manicure",
  pedicure:     "a pedicure",
  full_set:     "a full set",
  nail_art:     "nail art",
  fill:         "a lash fill",
  lift:         "a lash lift",
  relaxation:   "a relaxation massage",
  deep_tissue:  "deep tissue work",
  pain_relief:  "pain relief massage",
  facial:       "a facial",
  acne:         "acne or correction treatment",
  glow:         "a glow or refresh treatment",
  unsure:       "",
};

// ── Conversational summary ────────────────────────────────────────────────────

function buildConversationalSummary(
  categories:  string,
  goal:        string,
  timing:      string,
  subtype:     ServiceSubtype | null | undefined,
  artist:      string,
  firstName:   string,
  rec:         { recommendedService?: string; priceRange?: string; recommendedArtist?: string } | null,
): string {
  const parts: string[] = [];
  const who = firstName ? `${firstName} is` : "The guest is";
  const subtypeStr = subtype && subtype !== "unsure" ? subtypeLabels[subtype] || "" : "";

  const goalMap: Record<string, string> = {
    "Refresh":     "a quick refresh",
    "Relax":       "relaxation",
    "Transform":   "a full transformation",
    "Event-ready": "getting event-ready",
  };
  const goalStr = goalMap[goal] || (goal ? goal.toLowerCase() : "");

  // Core sentence
  if (subtypeStr) {
    parts.push(`${who} exploring ${categories || "services"} — specifically ${subtypeStr}`);
  } else if (categories) {
    parts.push(`${who} exploring ${categories} services`);
  }

  if (goalStr && subtype !== "unsure") {
    parts.push(`looking for ${goalStr}`);
  }

  const timingMap: Record<string, string> = {
    "Today":          "hoping to come in today",
    "This week":      "looking to book this week",
    "Planning ahead": "planning ahead",
    "Just browsing":  "just exploring for now",
  };
  if (timing) parts.push(timingMap[timing] || timing);

  if (artist) parts.push(`interested in working with ${artist}`);

  // Soft recommendation — gentle framing, never overconfident
  if (rec?.recommendedService && subtype !== "unsure") {
    const catWord = categories ? categories.toLowerCase() : "services";
    parts.push(`A likely direction may be ${catWord}`);
    if (rec.recommendedArtist) parts.push(`${rec.recommendedArtist} could be a good fit`);
    parts.push("Luna can help refine this further");
  } else if (subtype === "unsure") {
    parts.push("They're open to guidance on which service fits best");
  }

  return parts.join(". ") + ".";
}

// ── Main export ───────────────────────────────────────────────────────────────

export const buildDynamicVariables = (ctx: ConciergeContext | null): Record<string, string> => {

  const selectedCategories = ctx?.categories?.length ? formatCategoryList(ctx.categories) : "";
  const selectedGoal       = ctx?.goal    ? (goalLabels[ctx.goal]     || ctx.goal)   : "";
  const selectedTiming     = ctx?.timing  ? (timingLabels[ctx.timing] || ctx.timing) : "";
  const preferredArtist    = ctx?.preferredArtist || "";
  const subtype            = ctx?.service_subtype ?? null;
  const serviceCategory    = ctx?.categories?.length ? (categoryLabels[ctx.categories[0]] || ctx.categories[0]) : "";
  const serviceName        = ctx?.item || ctx?.group || "";
  const sourceEntry        = ctx?.source || "find_your_experience";
  const firstName          = getGuestFirstName();
  const sessionId          = getOrCreateSessionId();
  const isMultiService     = ctx?.is_multi_service ? "true" : "false";
  const isNewClient        = ctx?.is_new_client != null ? String(ctx.is_new_client) : "";
  const budgetSensitivity  = ctx?.budget_sensitivity || "";

  const subtypeLabel = subtype && subtype !== "unsure"
    ? (subtypeLabels[subtype] || subtype)
    : subtype === "unsure" ? "open to guidance" : "";

  const rec = (() => {
    try {
      const r = sessionStorage.getItem(REC_KEY);
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  })();

  const recConfidence = subtype === "unsure"
    ? "low"
    : rec?.urgency === "high" ? "high" : "medium";

  const lunaContextSummary = buildConversationalSummary(
    selectedCategories,
    selectedGoal,
    selectedTiming,
    subtype,
    preferredArtist,
    firstName,
    recConfidence !== "low" ? rec : null,
  );

  return {
    luna_context_summary:      lunaContextSummary,
    first_name:                firstName,
    service_category:          serviceCategory,
    service_name:              serviceName,
    service_subtype:           subtypeLabel,
    selected_goal:             selectedGoal,
    selected_timing:           selectedTiming,
    preferred_artist:          preferredArtist,
    source_entry:              sourceEntry,
    session_id:                sessionId,
    is_multi_service:          isMultiService,
    is_new_client:             isNewClient,
    budget_sensitivity:        budgetSensitivity,
    recommended_service:       rec?.recommendedService || "",
    recommended_artist:        rec?.recommendedArtist  || "",
    recommended_price:         rec?.priceRange         || "",
    urgency:                   rec?.urgency            || "",
    recommendation_confidence: recConfidence,
    selected_categories:       selectedCategories,
  };
};

// ── Legacy helper ─────────────────────────────────────────────────────────────

export const buildLunaFirstMessage = (ctx: ConciergeContext | null): string | undefined => {
  if (!ctx) return undefined;
  const parts: string[] = [];
  if (ctx.categories?.length) parts.push(`interested in ${formatCategoryList(ctx.categories)}`);
  if (ctx.goal) parts.push(`goal: ${(goalLabels[ctx.goal] || ctx.goal).toLowerCase()}`);
  if (ctx.timing) parts.push(`timing: ${(timingLabels[ctx.timing] || ctx.timing).toLowerCase()}`);
  if (!parts.length) return undefined;
  return `The guest is ${parts.join(", ")}.`;
};
