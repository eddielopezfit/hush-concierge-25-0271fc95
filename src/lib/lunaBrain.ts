import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { servicesMenuData } from "@/data/servicesMenuData";
import {
  normalizeCategory,
  normalizeGoal,
  normalizeTiming,
  VALID_CATEGORIES,
} from "@/lib/conciergeLabels";

export interface LunaRecommendation {
  recommendedService: string;
  recommendedArtist: null;
  urgency: "low" | "medium" | "high";
  nextStep: string;
  priceRange: string | null;
  whatToExpect: string | null;
}

const serviceExpectationMap: Record<string, string> = {
  "luxury wash and blowout": "What to expect: we’ll talk through the finish you want, then come in with clean, dry hair or plan for a fresh wash so your stylist can shape the smoothest blowout.",
  "special occasion style": "What to expect: we’ll start with a quick consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can plan the shape, hold, and timing.",
  "conditioning treatment": "What to expect: we’ll take a quick look at your hair goals first, then let your stylist tailor the treatment to your texture, dryness, and finish.",
  "expert color": "What to expect: we’ll start with a consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can confirm tone, placement, and timing.",
  "root touchup": "What to expect: we’ll start with a quick consultation, then your stylist will confirm your formula, regrowth, and timing before color begins.",
  "all over color": "What to expect: we’ll start with a quick consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can confirm depth, tone, and timing.",
  "color refresher": "What to expect: we’ll start with a quick consultation, then your stylist will fine-tune tone and shine to refresh what you already love.",
  "toner/root smudge": "What to expect: we’ll start with a quick consultation, then your stylist will confirm the blend, tone, and timing needed for the softest finish.",
  "retouch (5 weeks or less regrowth)": "What to expect: we’ll start with a quick consultation, then your stylist will check regrowth and timing so the lightening stays even and healthy.",
  "full head lightening service": "What to expect: we’ll start with a consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can map brightness, upkeep, and timing.",
  "full weave": "What to expect: we’ll start with a consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can confirm placement, brightness, and timing.",
  "partial weave": "What to expect: we’ll start with a consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can focus brightness exactly where it matters most.",
  "back to back foils": "What to expect: we’ll start with a consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can plan maximum brightness and timing.",
  balayage: "What to expect: we’ll start with a consultation, then bring a few inspiration photos and arrive with clean, dry hair so your stylist can map the right brightness and timing.",
  foilayage: "What to expect: we’ll start with a consultation, then bring a few inspiration photos and arrive with clean, dry hair so your stylist can plan the brighter foil placement and timing.",
  "corrective color": "What to expect: we’ll start with a consultation, then bring inspiration photos and a quick color history so your stylist can map the safest correction plan and timing.",
  "block color": "What to expect: we’ll start with a consultation, then bring inspiration photos and arrive with clean, dry hair so your stylist can plan placement, saturation, and timing.",
  "fantasy color": "What to expect: we’ll start with a consultation, then bring inspiration photos and be ready to talk maintenance, pre-lightening, and timing for the most vivid result.",
};

// Artist recommendations removed — Luna no longer recommends specific stylists
// Single-provider services are handled factually in the system prompt

// Goal-based service suggestions per category
const goalServiceMap: Record<string, Record<ServiceCategoryId, string>> = {
  refresh: {
    hair: "Luxury Wash and Blowout",
    nails: "Manicure",
    lashes: "Lash Lift & Perm",
    skincare: "Signature Facial",
    massage: "60 min",
  },
  relax: {
    hair: "Conditioning Treatment",
    nails: "Pedicure",
    lashes: "Classic Lash Set",
    skincare: "Signature Facial",
    massage: "90 min",
  },
  transform: {
    hair: "Expert Color",
    nails: "Nail Set w/Gel",
    lashes: "Volume Lash Set",
    skincare: "Microneedling",
    massage: "120 min",
  },
  event: {
    hair: "Special Occasion Style",
    nails: "Manicure w/Gel",
    lashes: "Hybrid Lash Set",
    skincare: "Dermaplane / Hydrafacial / Microdermabrasion Facials",
    massage: "60 min",
  },
};

function getUrgency(timing: string | null): "low" | "medium" | "high" {
  switch (timing) {
    case "today": return "high";
    case "week": return "medium";
    case "planning": return "low";
    case "browsing": return "low";
    default: return "medium";
  }
}

function getNextStep(urgency: "low" | "medium" | "high", hasMultipleCategories: boolean): string {
  if (urgency === "high") {
    return "Call us now at (520) 327-6753 for same-day availability, or let Luna help you book instantly.";
  }
  if (urgency === "medium") {
    return hasMultipleCategories
      ? "Luna can help you plan a multi-service visit this week. Speak or chat to get started."
      : "Let Luna check availability and help you lock in your appointment this week.";
  }
  return hasMultipleCategories
    ? "Take your time exploring. When you're ready, Luna can build a custom experience across multiple services."
    : "Browse our menu at your pace. Luna is here whenever you'd like personalized recommendations.";
}

function getPriceRange(categoryId: ServiceCategoryId, serviceName: string): string | null {
  try {
    const category = servicesMenuData.find(c => c.id === categoryId);
    if (!category) return null;
    for (const group of category.groups) {
      for (const item of group.items) {
        const service = serviceName.toLowerCase();
        const candidate = item.name.toLowerCase();
        if (service.includes(candidate) || candidate.includes(service)) {
          return item.price;
        }
      }
    }
    return category.pricePreview || null;
  } catch (err) {
    console.warn("[lunaBrain] Error resolving price range:", err);
    return null;
  }
}

function getExactMenuItem(categoryId: ServiceCategoryId, itemName: string | null | undefined) {
  const exactItem = typeof itemName === "string" ? itemName.trim().toLowerCase() : "";
  if (!exactItem) return null;

  const category = servicesMenuData.find((c) => c.id === categoryId);
  return category?.groups
    .flatMap((group) => group.items)
    .find((item) => item.name.toLowerCase() === exactItem) ?? null;
}

/**
 * Safely resolve the primary category from context.
 * Prioritizes explicit primary_category, then falls back to categories[0].
 */
function resolvePrimaryCategory(context: ConciergeContext): ServiceCategoryId {
  // If a primary_category was explicitly chosen (multi-service flow), use it
  if (context.primary_category && VALID_CATEGORIES.includes(context.primary_category)) {
    return context.primary_category;
  }

  const categories = context.categories;
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return "hair";
  }
  const first = categories[0];
  if (VALID_CATEGORIES.includes(first)) return first;
  const normalized = normalizeCategory(first);
  return normalized ?? "hair";
}

/**
 * Generate a structured recommendation from ConciergeContext.
 * Handles partial, missing, or malformed context gracefully.
 */
export function generateRecommendation(context: ConciergeContext | null | undefined): LunaRecommendation {
  // Fallback for completely missing context
  if (!context) {
    console.debug("[lunaBrain] No context provided, returning default recommendation");
    return {
      recommendedService: "Luxury Wash and Blowout",
      recommendedArtist: null,
      urgency: "medium",
      nextStep: "Browse our menu at your pace. Luna is here whenever you'd like personalized recommendations.",
      priceRange: null,
      whatToExpect: null,
    };
  }

  const primaryCategory = resolvePrimaryCategory(context);
  const normalizedGoal = normalizeGoal(context.goal) ?? "refresh";
  const normalizedTiming = normalizeTiming(context.timing);
  const urgency = getUrgency(normalizedTiming);
  const exactMenuItem = getExactMenuItem(primaryCategory, context.item);

  // Get recommended service based on goal + category
  const serviceMap = goalServiceMap[normalizedGoal] || goalServiceMap.refresh;
  let recommendedService = serviceMap[primaryCategory] || serviceMap.hair;

  // Subtype overrides goal-based suggestion with specific service
  const subtypeServiceOverride: Record<string, string> = {
    cut: "Women's", color: "Expert Color", both: "Women's + Expert Color",
    manicure: "Manicure", pedicure: "Pedicure", full_set: "Nail Set", nail_art: "Nail Set w/Gel",
    fill: "Classic Lash Fill", lift: "Lash Lift & Perm",
    relaxation: "90 min", deep_tissue: "90 min", pain_relief: "90 min",
    facial: "Signature Facial", acne: "Microneedling",
    glow: "Dermaplane / Hydrafacial / Microdermabrasion Facials",
  };
  const subtype = context.service_subtype;
  if (!exactMenuItem && subtype && subtype !== "unsure" && subtypeServiceOverride[subtype]) {
    recommendedService = subtypeServiceOverride[subtype];
  }

  if (exactMenuItem) {
    recommendedService = exactMenuItem.name;
  }

  // Do not recommend specific artists — the team feels it's biased
  const recommendedArtist = null;

  const priceRange = exactMenuItem?.price || context.price || getPriceRange(primaryCategory, recommendedService);
  const whatToExpect = serviceExpectationMap[recommendedService.toLowerCase()] ?? null;

  const categoryCount = Array.isArray(context.categories) ? context.categories.length : 0;
  const nextStep = getNextStep(urgency, categoryCount > 1);

  return {
    recommendedService,
    recommendedArtist,
    urgency,
    nextStep,
    priceRange,
    whatToExpect,
  };
}

/**
 * Generate a contextual chat response using the brain.
 * Never throws — always returns a safe string.
 */
export function generateChatResponse(message: string, context: ConciergeContext | null | undefined): string {
  try {
    const lower = (message || "").toLowerCase();

    // Team Compare mode removed — Luna no longer recommends specific artists
    // Guide guests to the front desk for personalized matching
    if (context?.source === "Team Compare") {
      return "Our team has stylists with a wide range of specialties — from vivid color to precision blonding, extensions, curly hair, and more. The front desk team knows everyone's strengths and will match you perfectly. Call (520) 327-6753 or let me help connect you!";
    }

    // If we have context with categories, generate smart responses
    if (context?.categories && Array.isArray(context.categories) && context.categories.length > 0) {
      const rec = generateRecommendation(context);

      if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("what should")) {
        let response = `Based on your selections, I'd start with **${rec.recommendedService}**`;
        if (rec.priceRange) response += ` (${rec.priceRange})`;
        if (rec.whatToExpect) {
          response += `\n\n**What to expect:** ${rec.whatToExpect.replace(/^What to expect:\s*/i, "")}`;
        }
        response += `\n\n${rec.nextStep}`;
        return response;
      }

      if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
        const categoryId = context.categories[0];
        const category = servicesMenuData.find(c => c.id === categoryId);
        if (category) {
          const items = category.groups.flatMap(g => g.items).slice(0, 4);
          const priceList = items.map(i => `${i.name}: ${i.price}`).join(" | ");
          return `Here's a quick look at ${category.title} pricing: ${priceList}. Want the full menu or help choosing?`;
        }
      }

      if (lower.includes("book") || lower.includes("appointment") || lower.includes("schedule")) {
        return `${rec.nextStep} I can also connect you with our front desk at (520) 327-6753.`;
      }
    }

    // No context — guide to ExperienceFinder
    if (lower.includes("service") || lower.includes("explore") || lower.includes("what do you")) {
      return "We offer Hair, Nails, Skincare & Spray Tan, Lashes, and Massage. Try our Experience Finder above to get a personalized recommendation, or just tell me what you're looking for!";
    }

    if (lower.includes("book") || lower.includes("appointment")) {
      return "I'd love to help you get booked! You can call our front desk at (520) 327-6753, or share your name and phone number and we'll reach out to you.";
    }

    if (lower.includes("hour") || lower.includes("open") || lower.includes("when")) {
      return "We're open Tuesday and Thursday from 9 AM to 7 PM, Wednesday and Friday from 9 AM to 5 PM, and Saturday from 9 AM to 4 PM. We're closed Sunday and Monday. Want me to help you plan the right day?";
    }

    if (lower.includes("where") || lower.includes("address") || lower.includes("location") || lower.includes("direction")) {
      return "We're at 4635 E Fort Lowell Rd, Tucson, AZ 85712. Would you like directions or to book a visit?";
    }

    if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
      return "Our services range from $18 for trims to $299 for advanced treatments. What service are you interested in? I can give you specific pricing.";
    }

    // Default
    return "I'm here to help with services, pricing, booking, or anything about Hush. What would you like to know?";
  } catch (err) {
    console.error("[lunaBrain] Error generating chat response:", err);
    return "I'm here to help with services, pricing, booking, or anything about Hush. What would you like to know?";
  }
}
