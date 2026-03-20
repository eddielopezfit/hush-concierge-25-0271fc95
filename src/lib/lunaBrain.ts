import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { servicesMenuData } from "@/data/servicesMenuData";

export interface LunaRecommendation {
  recommendedService: string;
  recommendedArtist: string | null;
  urgency: "low" | "medium" | "high";
  nextStep: string;
  priceRange: string | null;
}

// Artist mapping by category for deterministic recommendations
const artistsByCategory: Record<ServiceCategoryId, { name: string; specialty: string }[]> = {
  hair: [
    { name: "Michelle Yrigolla", specialty: "Master Stylist & Color Educator" },
    { name: "Silviya Warren", specialty: "High Fashion Color" },
    { name: "Whitney Hernandez", specialty: "Dimensional Blondes & Updos" },
    { name: "Charly Camano", specialty: "Color & Waves" },
    { name: "Melissa Brunty", specialty: "Extensions & Long Hair" },
    { name: "Ana Moreno", specialty: "Color, Cuts & Styling" },
  ],
  nails: [
    { name: "Anita Apodaca", specialty: "Nail Tech & Educator" },
    { name: "Kelly Vishnevetsky", specialty: "Pedicures & Extensions" },
    { name: "Jackie", specialty: "Nail Art & Extensions" },
  ],
  lashes: [
    { name: "Allison Griessel", specialty: "Creative Color & Lashes" },
  ],
  skincare: [
    { name: "Patty", specialty: "Facials & Skincare" },
    { name: "Lori", specialty: "Facials & Skincare" },
  ],
  massage: [
    { name: "Tammy", specialty: "Massage Therapist" },
  ],
};

// Goal-based service suggestions per category
const goalServiceMap: Record<string, Record<ServiceCategoryId, string>> = {
  refresh: {
    hair: "Luxury Wash and Blowout",
    nails: "Manicure",
    lashes: "Lash Lift & Perm",
    skincare: "Signature Facial",
    massage: "60 min Massage",
  },
  relax: {
    hair: "Conditioning Treatment",
    nails: "Pedicure",
    lashes: "Classic Lash Set",
    skincare: "Signature Facial",
    massage: "90 min Massage",
  },
  transform: {
    hair: "Expert Color — Full Transformation",
    nails: "Nail Set w/Gel",
    lashes: "Volume Lash Set",
    skincare: "Microneedling",
    massage: "120 min Massage",
  },
  event: {
    hair: "Special Occasion Style + Color",
    nails: "Manicure w/Gel + Pedicure w/Gel",
    lashes: "Hybrid Lash Set",
    skincare: "Dermaplane / Hydrafacial",
    massage: "60 min Massage",
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
  const category = servicesMenuData.find(c => c.id === categoryId);
  if (!category) return null;
  for (const group of category.groups) {
    for (const item of group.items) {
      if (serviceName.toLowerCase().includes(item.name.toLowerCase())) {
        return item.price;
      }
    }
  }
  return category.pricePreview || null;
}

export function generateRecommendation(context: ConciergeContext): LunaRecommendation {
  const primaryCategory = context.categories?.[0] || "hair";
  const goal = context.goal || "refresh";
  const urgency = getUrgency(context.timing);

  // Get recommended service based on goal + category
  const serviceMap = goalServiceMap[goal] || goalServiceMap.refresh;
  const recommendedService = serviceMap[primaryCategory] || serviceMap.hair;

  // Pick an artist for the primary category
  const artists = artistsByCategory[primaryCategory] || [];
  const recommendedArtist = artists.length > 0
    ? `${artists[0].name} — ${artists[0].specialty}`
    : null;

  const priceRange = getPriceRange(primaryCategory, recommendedService);

  const nextStep = getNextStep(urgency, (context.categories?.length || 0) > 1);

  return {
    recommendedService,
    recommendedArtist,
    urgency,
    nextStep,
    priceRange,
  };
}

// Generate a contextual chat response using the brain
export function generateChatResponse(message: string, context: ConciergeContext | null): string {
  const lower = message.toLowerCase();

  // If we have context, generate a smart response
  if (context && context.categories && context.categories.length > 0) {
    const rec = generateRecommendation(context);

    if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("what should")) {
      const parts = [`Based on your selections, I'd recommend **${rec.recommendedService}**`];
      if (rec.priceRange) parts.push(`(${rec.priceRange})`);
      if (rec.recommendedArtist) parts.push(`with ${rec.recommendedArtist}`);
      parts.push(`. ${rec.nextStep}`);
      return parts.join(" ");
    }

    if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
      const category = servicesMenuData.find(c => context.categories.includes(c.id as ServiceCategoryId));
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
    return "We're open Tuesday through Saturday starting at 9 AM. Closed Sundays and Mondays. Would you like to schedule a visit?";
  }

  if (lower.includes("where") || lower.includes("address") || lower.includes("location") || lower.includes("direction")) {
    return "We're at 4635 E Fort Lowell Rd, Tucson, AZ 85712. Would you like directions or to book a visit?";
  }

  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
    return "Our services range from $18 for trims to $299 for advanced treatments. What service are you interested in? I can give you specific pricing.";
  }

  // Default
  return "I'm here to help with services, pricing, booking, or anything about Hush. What would you like to know?";
}
