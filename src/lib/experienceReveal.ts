import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";

// ── Experience Type Labels ──────────────────────────────────────────────────

interface ExperienceProfile {
  label: string;
  timeEstimate: string;
  priceRange: string;
  consultationRequired: boolean;
}

const subtypeProfiles: Record<string, ExperienceProfile> = {
  // Hair
  cut:   { label: "Precision Cut Experience",        timeEstimate: "45–60 min", priceRange: "$45–$90",   consultationRequired: false },
  color: { label: "Dimensional Color Experience",    timeEstimate: "2–3 hours", priceRange: "$95–$300+", consultationRequired: true },
  both:  { label: "Full Transformation Session",     timeEstimate: "3–4 hours", priceRange: "$140–$390+",consultationRequired: true },
  // Nails
  manicure: { label: "Manicure Experience",          timeEstimate: "30–45 min", priceRange: "$25–$55",   consultationRequired: false },
  pedicure: { label: "Pedicure Experience",          timeEstimate: "45–60 min", priceRange: "$45–$65",   consultationRequired: false },
  full_set: { label: "Full Nail Set Experience",     timeEstimate: "60–90 min", priceRange: "$55–$85",   consultationRequired: false },
  nail_art: { label: "Nail Art Experience",          timeEstimate: "60–90 min", priceRange: "$55–$100+", consultationRequired: false },
  // Lashes
  "lash_full_set": { label: "Lash Set Experience",  timeEstimate: "90–120 min",priceRange: "$150–$250+",consultationRequired: false },
  fill:     { label: "Lash Fill Visit",              timeEstimate: "45–60 min", priceRange: "$65–$95",   consultationRequired: false },
  lift:     { label: "Lash Lift Experience",          timeEstimate: "45–60 min", priceRange: "$75–$95",   consultationRequired: false },
  // Skincare
  facial:   { label: "Signature Facial Experience",  timeEstimate: "60 min",    priceRange: "$85–$150",  consultationRequired: false },
  acne:     { label: "Corrective Skin Session",      timeEstimate: "60–90 min", priceRange: "$95–$200+", consultationRequired: true },
  glow:     { label: "Glow Refresh Experience",      timeEstimate: "45–60 min", priceRange: "$85–$175",  consultationRequired: false },
  // Massage
  relaxation:  { label: "Relaxation Massage",        timeEstimate: "60–90 min", priceRange: "$75–$120",  consultationRequired: false },
  deep_tissue: { label: "Deep Tissue Session",       timeEstimate: "60–90 min", priceRange: "$85–$130",  consultationRequired: false },
  pain_relief: { label: "Therapeutic Recovery Session",timeEstimate: "60–90 min",priceRange: "$85–$130", consultationRequired: false },
};

const goalCategoryLabels: Record<string, Record<string, string>> = {
  refresh:   { hair: "Quick Refresh Visit", nails: "Nail Refresh", skincare: "Skin Refresh", lashes: "Lash Maintenance", massage: "Recovery Session" },
  relax:     { hair: "Self-Care Retreat", nails: "Pampering Session", skincare: "Spa Facial Experience", lashes: "Lash Luxury", massage: "Deep Relaxation Experience" },
  transform: { hair: "Full Transformation Session", nails: "Statement Nail Experience", skincare: "Advanced Skin Transformation", lashes: "Volume Lash Transformation", massage: "Total Reset Session" },
  event:     { hair: "Event-Ready Experience", nails: "Event Nail Session", skincare: "Red Carpet Glow", lashes: "Event Lash Set", massage: "Pre-Event Unwind" },
};


// ── Main Reveal Builder ─────────────────────────────────────────────────────

export interface RevealData {
  experienceLabel: string;
  timeEstimate: string;
  priceRange: string;
  consultationRequired: boolean;
  isMultiService: boolean;
  categories: ServiceCategoryId[];
}

// ── Per-category profile resolver (used by stacked multi-service plan) ─────

export interface CategoryPlanItem {
  category: ServiceCategoryId;
  label: string;
  timeEstimate: string;
  priceRange: string;
  consultationRequired: boolean;
}

const categoryDefaultProfile: Record<ServiceCategoryId, ExperienceProfile> = {
  hair:     { label: "Hair Service",          timeEstimate: "60–90 min",  priceRange: "$60–$200+", consultationRequired: false },
  nails:    { label: "Nail Service",          timeEstimate: "45–75 min",  priceRange: "$35–$85",   consultationRequired: false },
  lashes:   { label: "Lash Service",          timeEstimate: "60–90 min",  priceRange: "$65–$250+", consultationRequired: false },
  skincare: { label: "Skincare Service",      timeEstimate: "60–90 min",  priceRange: "$85–$200+", consultationRequired: false },
  massage:  { label: "Massage Session",       timeEstimate: "60–90 min",  priceRange: "$75–$130",  consultationRequired: false },
};

/** Build a per-category plan list (one row per selected category) */
export function buildCategoryPlanItems(context: ConciergeContext | null | undefined): CategoryPlanItem[] {
  if (!context?.categories?.length) return [];
  const goal = context.goal || "refresh";
  const subtype = context.service_subtype;
  const primaryCat = context.primary_category || context.categories[0];

  return context.categories.map((cat) => {
    // Apply the subtype profile only to the primary category it was chosen for
    const isPrimary = cat === primaryCat;
    const subtypeProfile = isPrimary && subtype && subtype !== "unsure" ? subtypeProfiles[subtype] : undefined;
    const fallback = categoryDefaultProfile[cat];
    const goalLabel = goalCategoryLabels[goal]?.[cat];

    return {
      category: cat,
      label: subtypeProfile?.label || goalLabel || fallback.label,
      timeEstimate: subtypeProfile?.timeEstimate || fallback.timeEstimate,
      priceRange: subtypeProfile?.priceRange || fallback.priceRange,
      consultationRequired: subtypeProfile?.consultationRequired ?? fallback.consultationRequired,
    };
  });
}

/** Parse a price-range string like "$95–$300+" → { min: 95, max: 300 } (max=min if single) */
function parsePriceRange(s: string): { min: number; max: number } | null {
  const nums = s.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const min = parseInt(nums[0], 10);
  const max = nums.length > 1 ? parseInt(nums[1], 10) : min;
  return { min, max };
}

/** Parse a time string like "45–60 min", "2–3 hours", "60 min" → minutes {min,max} */
function parseTimeRange(s: string): { min: number; max: number } | null {
  const isHours = /hour/i.test(s);
  const nums = s.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const a = parseInt(nums[0], 10);
  const b = nums.length > 1 ? parseInt(nums[1], 10) : a;
  const mult = isHours ? 60 : 1;
  return { min: a * mult, max: b * mult };
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = mins / 60;
  // Round to nearest 0.5 for display
  const rounded = Math.round(h * 2) / 2;
  return rounded === Math.floor(rounded) ? `${rounded} hr` : `${rounded} hrs`;
}

export interface PlanTotals {
  timeRange: string;
  priceRange: string;
  hasConsultationItem: boolean;
}

/** Sum per-category items into a combined plan total */
export function computePlanTotals(items: CategoryPlanItem[]): PlanTotals | null {
  if (!items.length) return null;
  let minMins = 0, maxMins = 0;
  let minPrice = 0, maxPrice = 0;
  let hasOpenEnded = false;
  let hasConsult = false;

  for (const it of items) {
    const t = parseTimeRange(it.timeEstimate);
    if (t) { minMins += t.min; maxMins += t.max; }
    const p = parsePriceRange(it.priceRange);
    if (p) { minPrice += p.min; maxPrice += p.max; }
    if (/\+/.test(it.priceRange)) hasOpenEnded = true;
    if (it.consultationRequired) hasConsult = true;
  }

  const timeRange = minMins === maxMins ? formatMinutes(minMins) : `${formatMinutes(minMins)}–${formatMinutes(maxMins)}`;
  const priceRange = minPrice === maxPrice
    ? `$${minPrice}${hasOpenEnded ? "+" : ""}`
    : `$${minPrice}–$${maxPrice}${hasOpenEnded ? "+" : ""}`;

  return { timeRange, priceRange, hasConsultationItem: hasConsult };
}

export function buildRevealData(context: ConciergeContext | null | undefined): RevealData | null {
  if (!context || !context.categories || context.categories.length === 0) return null;

  const primaryCat = context.primary_category || context.categories[0];
  const subtype = context.service_subtype;
  const goal = context.goal || "refresh";
  const isMulti = context.categories.length > 1;

  // Resolve profile from subtype first, then goal+category fallback
  let profile: ExperienceProfile | undefined;
  if (subtype && subtype !== "unsure") {
    profile = subtypeProfiles[subtype];
  }

  let experienceLabel: string;
  if (profile) {
    experienceLabel = profile.label;
  } else {
    experienceLabel = goalCategoryLabels[goal]?.[primaryCat] || "Personalized Experience";
  }

  if (isMulti && !profile) {
    const catLabels = context.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1));
    experienceLabel = catLabels.join(" + ") + " Experience";
  }

  const timeEstimate = profile?.timeEstimate || (isMulti ? "2–4 hours" : "60–90 min");
  // Safe estimated ranges for multi-service combos — never calculated, never promised
  const multiServicePriceRange = (() => {
    const cats = context.categories;
    const hasHair = cats.includes("hair");
    const hasMassage = cats.includes("massage");
    const count = cats.length;
    if (hasHair && count >= 3) return "Most combinations like this run $200–$500+ — your stylist confirms during consultation";
    if (hasHair && count === 2) return "Most combinations like this run $150–$400+ — confirmed during consultation";
    if (hasMassage && count >= 2) return "Most combinations like this run $130–$300 — confirmed when booking";
    return "Most combinations like this run $100–$300 — confirmed when booking";
  })();
  const priceRange = profile?.priceRange || (isMulti ? multiServicePriceRange : "$45–$150+");
  const consultationRequired = profile?.consultationRequired ?? (primaryCat === "hair" && (subtype === "color" || subtype === "both"));

  return {
    experienceLabel,
    timeEstimate,
    priceRange,
    consultationRequired,
    isMultiService: isMulti,
    categories: context.categories,
  };
}

// ── Booking Mode Logic ──────────────────────────────────────────────────────

export type BookingMode = "consultation" | "guided_front_desk" | "direct_or_callback";

const CONSULTATION_SUBTYPES = new Set([
  "color", "both",
]);

const CONSULTATION_KEYWORDS = [
  "balayage", "foilayage", "corrective", "fantasy", "vivid",
  "block color", "extensions", "transformation",
];

export function deriveBookingMode(
  revealData: RevealData,
  context: ConciergeContext | null | undefined,
): BookingMode {
  // 1. Consultation-required from reveal
  if (revealData.consultationRequired) return "consultation";

  const primaryCat = context?.primary_category || context?.categories?.[0];
  const subtype = context?.service_subtype;

  // 2. Subtype-based consultation check
  if (subtype && CONSULTATION_SUBTYPES.has(subtype)) return "consultation";

  // 3. Multi-service with hair as primary → consultation
  if (revealData.isMultiService && primaryCat === "hair") return "consultation";

  // 4. Service name keyword match
  const serviceName = (context?.item || context?.group || "").toLowerCase();
  if (CONSULTATION_KEYWORDS.some(k => serviceName.includes(k))) return "consultation";

  // 5. Direct-eligible categories
  if (primaryCat && ["nails", "lashes", "skincare", "massage"].includes(primaryCat)) {
    return "direct_or_callback";
  }

  // 6. Default for hair and everything else
  return "guided_front_desk";
}

// ── Booking mode UI config ──────────────────────────────────────────────────

export interface BookingModeConfig {
  badge: string;
  headline: string;
  subcopy: string;
  primaryLabel: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  confirmHeadline: string;
  confirmSubcopy: string;
}

export function getBookingModeConfig(mode: BookingMode, timing?: string | null): BookingModeConfig {
  const urgencyNote = timing === "today"
    ? " We'll prioritize same-day availability."
    : timing === "week"
    ? " We'll check this week's openings for you."
    : "";

  switch (mode) {
    case "consultation":
      return {
        badge: "Consultation",
        headline: "This experience starts with a quick consultation",
        subcopy: `For a service like this, the best next step is a quick conversation so Hush can match timing, pricing, and the right stylist fit.${urgencyNote}`,
        primaryLabel: "Request Consultation",
        secondaryLabel: "Call Front Desk",
        tertiaryLabel: "Chat with Luna",
        confirmHeadline: "Your consultation request is in",
        confirmSubcopy: "The Hush team will follow up during business hours",
      };
    case "guided_front_desk":
      return {
        badge: "Guided Booking",
        headline: "Let Hush help you lock this in",
        subcopy: `You already know what you want — the fastest next step is to have Hush confirm the best fit and availability.${urgencyNote}`,
        primaryLabel: "Request Callback",
        secondaryLabel: "Call Front Desk",
        tertiaryLabel: "Chat with Luna",
        confirmHeadline: "Got it — your request was sent",
        confirmSubcopy: "The Hush team will follow up during business hours",
      };
    case "direct_or_callback":
      return {
        badge: "Direct Booking",
        headline: "You can book this directly",
        subcopy: `We'll match you with the best time and stylist for this service.${urgencyNote}`,
        primaryLabel: "Check Availability",
        secondaryLabel: "Call Front Desk",
        tertiaryLabel: "Chat with Luna",
        confirmHeadline: "Got it — your request was sent",
        confirmSubcopy: "The Hush team will follow up during business hours",
      };
  }
}

/** Map categories to Slack channel slugs for routing */
export function getSlackChannel(category: string | null | undefined): string {
  switch (category) {
    case "nails": return "nails";
    case "lashes": return "lashes";
    case "skincare": return "skin";
    case "massage": return "massage";
    default: return "leads";
  }
}
