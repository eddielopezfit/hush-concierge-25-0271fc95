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
    primary_category:   partial.primary_category   !== undefined ? partial.primary_category   : (existing?.primary_category   ?? null),
    multi_service_mode: partial.multi_service_mode !== undefined ? partial.multi_service_mode : (existing?.multi_service_mode ?? null),
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
  multiServiceMode: MultiServiceMode | undefined,
  primaryCategory: string | null | undefined,
  source:      string,
  viewedArtist: string,
  comparisonArtists: string,
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

  // Multi-service aware core sentence
  if (multiServiceMode === "bundle_guidance") {
    parts.push(`${who} exploring multiple services including ${categories || "several categories"}`);
    parts.push("They'd like help deciding what to prioritize and how to combine them");
  } else if (multiServiceMode === "unsure") {
    parts.push(`${who} exploring multiple services including ${categories || "several categories"}`);
    parts.push("They're not sure where to start and would like guidance");
  } else if (subtypeStr) {
    if (primaryCategory) {
      parts.push(`${who} exploring multiple services including ${categories || "services"}, with ${primaryCategory} as their priority — specifically ${subtypeStr}`);
    } else {
      parts.push(`${who} exploring ${categories || "services"} — specifically ${subtypeStr}`);
    }
  } else if (categories) {
    parts.push(`${who} exploring ${categories} services`);
  }

  if (goalStr && subtype !== "unsure" && multiServiceMode !== "unsure") {
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
  if (multiServiceMode === "bundle_guidance" || multiServiceMode === "unsure") {
    parts.push("Luna can help map the best combination and next step");
  } else if (rec?.recommendedService && subtype !== "unsure") {
    const catWord = categories ? categories.toLowerCase() : "services";
    parts.push(`A likely direction may be ${catWord}`);
    parts.push("Our front desk will match you with the perfect artist");
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
  const primaryCat         = ctx?.primary_category;
  const primaryCatLabel    = primaryCat ? (categoryLabels[primaryCat] || primaryCat) : "";
  const serviceCategory    = primaryCatLabel || (ctx?.categories?.length ? (categoryLabels[ctx.categories[0]] || ctx.categories[0]) : "");
  const serviceName        = ctx?.item || ctx?.group || "";
  const sourceEntry        = ctx?.source || "find_your_experience";
  const firstName          = getGuestFirstName();
  const sessionId          = getOrCreateSessionId();
  const isMultiService     = ctx?.is_multi_service ? "true" : "false";
  const multiServiceMode   = ctx?.multi_service_mode || "";
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

  const recConfidence = (ctx?.multi_service_mode === "bundle_guidance" || ctx?.multi_service_mode === "unsure")
    ? "low"
    : subtype === "unsure"
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
    ctx?.multi_service_mode,
    primaryCatLabel,
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
    multi_service_mode:        multiServiceMode,
    primary_category:          primaryCatLabel,
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

// ── Luna spoken first message (context-aware opener) ────────────────────────
//
// This is what Luna SAYS out loud when the session starts.
// Returned as a string to pass as `overrides.agent.first_message` in startSession().
// Falls back to the static default if no context is present.
//
export const buildLunaFirstMessage = (ctx: ConciergeContext | null): string => {
  const DEFAULT = "Hey — welcome to Hush. I'm Luna. How can I help you today?";
  if (!ctx) return DEFAULT;

  const firstName    = getGuestFirstName();
  const nameGreet    = firstName ? `Hey ${firstName} — ` : "Hey — ";
  const multi        = ctx.multi_service_mode;
  const subtype      = ctx.service_subtype;
  const cats         = ctx.categories ?? [];
  const goal         = ctx.goal;
  const timing       = ctx.timing;
  const primaryCat   = ctx.primary_category;

  // Subtype labels (spoken, conversational)
  const spokenSubtype: Record<string, string> = {
    cut:         "a haircut",
    color:       "color work",
    both:        "a cut and color",
    manicure:    "a manicure",
    pedicure:    "a pedicure",
    full_set:    "a full nail set",
    nail_art:    "nail art",
    fill:        "a lash fill",
    lift:        "a lash lift",
    relaxation:  "a relaxation massage",
    deep_tissue: "some deep tissue work",
    pain_relief: "a pain relief massage",
    facial:      "a facial",
    acne:        "an acne treatment",
    glow:        "a glow treatment",
  };

  const spokenGoal: Record<string, string> = {
    Refresh:     "a quick refresh",
    Relax:       "some relaxation",
    Transform:   "a full transformation",
    "Event-ready": "getting event-ready",
  };

  const spokenTiming: Record<string, string> = {
    Today:          "today",
    "This week":    "this week",
    "Planning ahead": "sometime soon",
    "Just browsing": "",
  };

  const spokenCat: Record<string, string> = {
    hair:     "hair",
    nails:    "nails",
    lashes:   "lashes",
    skincare: "skincare",
    massage:  "a massage",
  };

  // ── Multi-service / unsure ────────────────────────────────────────────────
  if (multi === "unsure" || (cats.length > 1 && !primaryCat && !subtype)) {
    const catList = cats.map(c => spokenCat[c] ?? c).join(", ");
    return `${nameGreet}sounds like you're thinking about a few things — ${catList}. ` +
      `Let's figure out the best place to start. Is there one that feels most important to you right now?`;
  }

  if (multi === "bundle_guidance") {
    const catList = cats.map(c => spokenCat[c] ?? c).join(" and ");
    return `${nameGreet}you're looking to combine ${catList} — love that. ` +
      `Let me help you figure out how to make the most of that. What's the occasion, or is this just a good self-care day?`;
  }

  // ── Single service or primary_focus ──────────────────────────────────────
  const cat     = primaryCat ?? cats[0] ?? null;
  const subtypeStr = subtype && subtype !== "unsure" ? spokenSubtype[subtype] ?? "" : "";
  const goalStr    = goal ? spokenGoal[goal] ?? "" : "";
  const timingStr  = timing ? spokenTiming[timing] ?? "" : "";

  // Special cases by category
  if (cat === "massage" && subtypeStr) {
    const timingPart = timingStr ? ` — ${timingStr}` : "";
    return `${nameGreet}you're thinking ${subtypeStr}${timingPart}. ` +
      `Perfect. Tammi is incredible — she tailors every session to exactly what your body needs. ` +
      `Are you thinking 60, 90, or 120 minutes?`;
  }

  if (cat === "skincare" && subtypeStr) {
    const timingPart = timingStr ? ` and want to get in ${timingStr}` : "";
    return `${nameGreet}you're interested in ${subtypeStr}${goalStr ? `, looking for ${goalStr}` : ""}${timingPart}. ` +
      `Our estheticians are amazing at this. Want me to walk you through what to expect, ` +
      `or are you ready to figure out timing?`;
  }

  if (cat === "hair") {
    if (subtypeStr) {
      const goalPart   = goalStr    ? `, ${goalStr}`  : "";
      const timingPart = timingStr  ? ` ${timingStr}` : "";
      return `${nameGreet}you're thinking ${subtypeStr}${goalPart}${timingPart ? " —" + timingPart : ""}. ` +
        `Let's find exactly the right fit for you. Do you have a stylist in mind, or would you like a recommendation?`;
    }
    const goalPart   = goalStr   ? ` looking for ${goalStr}` : "";
    const timingPart = timingStr ? `, ${timingStr}` : "";
    return `${nameGreet}you're exploring hair${goalPart}${timingPart}. ` +
      `Tell me a little more — are you thinking a cut, color, or both?`;
  }

  if (cat === "nails" && subtypeStr) {
    const timingPart = timingStr ? ` — ${timingStr}` : "";
    return `${nameGreet}you're thinking ${subtypeStr}${timingPart}. ` +
      `Anita does incredible nail work. Want me to tell you more about what that looks like here?`;
  }

  // Generic fallback with any context we have
  if (subtypeStr || goalStr) {
    const detail = subtypeStr || goalStr;
    const timingPart = timingStr ? ` — ${timingStr}` : "";
    return `${nameGreet}so you're thinking ${detail}${timingPart}. ` +
      `Tell me a little more about what you're hoping to walk away with.`;
  }

  if (cats.length) {
    const catStr = cats.map(c => spokenCat[c] ?? c).join(" and ");
    return `${nameGreet}so you're exploring ${catStr}. What are you hoping to feel like when you leave?`;
  }

  return DEFAULT;
};
