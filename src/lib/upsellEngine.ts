import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";

export interface UpsellItem {
  name: string;
  price: string;
  description: string;
  category: ServiceCategoryId;
}

const upsellMap: Record<string, UpsellItem[]> = {
  "hair:color": [
    { name: "Gloss Finish", price: "+$40", description: "Mirror-shine seal for lasting vibrancy", category: "hair" },
    { name: "Deep Conditioning", price: "+$25", description: "Restore moisture after chemical services", category: "hair" },
  ],
  "hair:both": [
    { name: "Gloss Finish", price: "+$40", description: "Mirror-shine seal for lasting vibrancy", category: "hair" },
    { name: "Scalp Treatment", price: "+$25", description: "Detox and nourish from the root", category: "hair" },
  ],
  "hair:cut": [
    { name: "Luxury Blowout", price: "+$35", description: "Salon-perfect finish with styling", category: "hair" },
    { name: "Scalp Treatment", price: "+$25", description: "Detox and nourish from the root", category: "hair" },
  ],
  hair: [
    { name: "Deep Conditioning", price: "+$25", description: "Hydrate and protect between services", category: "hair" },
    { name: "Luxury Blowout", price: "+$35", description: "Salon-perfect finish with styling", category: "hair" },
  ],
  nails: [
    { name: "Gel Upgrade", price: "+$15", description: "Chip-free shine that lasts 2–3 weeks", category: "nails" },
    { name: "Nail Art", price: "+$20", description: "Custom designs for a statement look", category: "nails" },
  ],
  lashes: [
    { name: "Lash Serum", price: "+$25", description: "Strengthen and condition natural lashes", category: "lashes" },
  ],
  massage: [
    { name: "Hot Stones", price: "+$20", description: "Deep warmth for tension release", category: "massage" },
    { name: "Aromatherapy", price: "+$15", description: "Custom essential oil blend for your session", category: "massage" },
  ],
  skincare: [
    { name: "LED Light Therapy", price: "+$30", description: "Boost collagen and reduce inflammation", category: "skincare" },
    { name: "Enzyme Peel Add-On", price: "+$25", description: "Gentle exfoliation for instant glow", category: "skincare" },
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
