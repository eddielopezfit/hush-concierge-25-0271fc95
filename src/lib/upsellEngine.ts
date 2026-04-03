import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";

export interface UpsellItem {
  name: string;
  price: string;
  description: string;
  category: ServiceCategoryId;
}

const upsellMap: Record<string, UpsellItem[]> = {
  "hair:color": [
    { name: "Conditioning Treatment", price: "+$30", description: "Restore moisture after chemical services", category: "hair" },
    { name: "Brazilian Blowout Split End Treatment", price: "+$55", description: "Seal and protect color-treated ends", category: "hair" },
  ],
  "hair:both": [
    { name: "Conditioning Treatment", price: "+$30", description: "Hydrate and protect between services", category: "hair" },
    { name: "Luxury Wash and Blowout", price: "+$35", description: "Salon-perfect finish with styling", category: "hair" },
  ],
  "hair:cut": [
    { name: "Luxury Wash and Blowout", price: "+$35", description: "Salon-perfect finish with styling", category: "hair" },
    { name: "Added Heat Style", price: "+$15", description: "Flat iron or curling iron finish", category: "hair" },
  ],
  hair: [
    { name: "Conditioning Treatment", price: "+$30", description: "Hydrate and protect between services", category: "hair" },
    { name: "Luxury Wash and Blowout", price: "+$35", description: "Salon-perfect finish with styling", category: "hair" },
  ],
  nails: [
    { name: "Gel Upgrade", price: "+$20", description: "Chip-free shine that lasts 2–3 weeks", category: "nails" },
  ],
  lashes: [
    { name: "Lash or Brow Tint", price: "+$20", description: "Define and enhance your natural lashes or brows", category: "lashes" },
  ],
  massage: [
    { name: "Upgrade to 90 min", price: "+$35", description: "Extended session for deeper relaxation", category: "massage" },
  ],
  skincare: [
    { name: "Brow Wax", price: "+$20", description: "Clean, shaped brows to complete your look", category: "skincare" },
    { name: "Airbrush Spray Tan", price: "+$35", description: "Sun-kissed glow with no UV exposure", category: "skincare" },
  ],
};

export function getUpsells(context: ConciergeContext | null | undefined, max = 3): UpsellItem[] {
  if (!context?.categories?.length) return [];

  const primary = context.primary_category || context.categories[0];
  const subtype = context.service_subtype;

  // Try specific subtype key first, then category fallback
  const key = subtype && subtype !== "unsure" ? `${primary}:${subtype}` : primary;
  const items = upsellMap[key] || upsellMap[primary] || [];

  // For multi-service, also pull from secondary categories
  if (context.categories.length > 1) {
    const secondary = context.categories.filter(c => c !== primary);
    const extras = secondary.flatMap(c => (upsellMap[c] || []).slice(0, 1));
    const combined = [...items, ...extras];
    const seen = new Set<string>();
    return combined.filter(u => {
      if (seen.has(u.name)) return false;
      seen.add(u.name);
      return true;
    }).slice(0, max);
  }

  return items.slice(0, max);
}
