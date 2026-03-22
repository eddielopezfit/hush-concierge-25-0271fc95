import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { getArtistsByCategory, TeamMember } from "@/data/teamData";

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

// ── Stylist Fit Mapping ─────────────────────────────────────────────────────

interface StylistFit {
  name: string;
  specialty: string;
  photo: string | null;
}

const subtypeStylistOverrides: Record<string, string[]> = {
  color:       ["Michelle Yrigolla", "Whitney Hernandez", "Charly Camano"],
  both:        ["Michelle Yrigolla", "Silviya Warren", "Ana Moreno"],
  cut:         ["Kathy Charette", "Priscilla", "Ana Moreno"],
};

function getStylistFits(context: ConciergeContext): StylistFit[] {
  const subtype = context.service_subtype;
  const primaryCat = context.primary_category || context.categories?.[0];

  // Check subtype overrides first
  if (subtype && subtype !== "unsure" && subtypeStylistOverrides[subtype]) {
    const names = subtypeStylistOverrides[subtype];
    const allArtists = primaryCat ? getArtistsByCategory(primaryCat) : [];
    return names.slice(0, 3).map(name => {
      const artist = allArtists.find(a => a.name === name);
      return { name, specialty: artist?.fitStatement || artist?.specialty || "", photo: artist?.photo || null };
    });
  }

  // Default: pull from category
  if (!primaryCat) return [];
  const artists = getArtistsByCategory(primaryCat);
  return artists.slice(0, 3).map(a => ({
    name: a.name,
    specialty: a.fitStatement || a.specialty,
    photo: a.photo || null,
  }));
}

// ── Main Reveal Builder ─────────────────────────────────────────────────────

export interface RevealData {
  experienceLabel: string;
  timeEstimate: string;
  priceRange: string;
  consultationRequired: boolean;
  stylistFits: StylistFit[];
  isMultiService: boolean;
  categories: ServiceCategoryId[];
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
  const priceRange = profile?.priceRange || (isMulti ? "Varies by combination" : "$45–$150+");
  const consultationRequired = profile?.consultationRequired ?? (primaryCat === "hair" && (subtype === "color" || subtype === "both"));

  const stylistFits = getStylistFits(context);

  return {
    experienceLabel,
    timeEstimate,
    priceRange,
    consultationRequired,
    stylistFits,
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
  showInlineCapture: boolean;
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
        showInlineCapture: false,
      };
    case "guided_front_desk":
      return {
        badge: "Guided Booking",
        headline: "Let Hush help you lock this in",
        subcopy: `You already know what you want — the fastest next step is to have Hush confirm the best fit and availability.${urgencyNote}`,
        primaryLabel: "Request Callback",
        secondaryLabel: "Call Front Desk",
        tertiaryLabel: "Chat with Luna",
        showInlineCapture: false,
      };
    case "direct_or_callback":
      return {
        badge: "Direct Booking",
        headline: "You can book this directly",
        subcopy: `We'll match you with the best time and stylist for this service.${urgencyNote}`,
        primaryLabel: "Check Availability",
        secondaryLabel: "Call Front Desk",
        tertiaryLabel: "Chat with Luna",
        showInlineCapture: true,
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
