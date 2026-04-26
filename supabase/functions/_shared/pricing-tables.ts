// Canonical pricing data mirrored from src/data/servicesMenuData.ts
// Used by luna-chat to inject deterministic, complete pricing tables so the LLM
// never trims rows when summarizing a category's menu.

export type PricingItem = { name: string; price: string };
export type PricingCategory = {
  id: "hair" | "nails" | "lashes" | "skincare" | "massage";
  title: string;
  /** Keywords on the user's message that map to this category. */
  keywords: string[];
  groups: Array<{ name: string; items: PricingItem[] }>;
  notes?: string[];
};

export const PRICING_CATEGORIES: PricingCategory[] = [
  {
    id: "hair",
    title: "Hair",
    keywords: ["hair", "haircut", "cut", "color", "balayage", "foilayage", "highlight", "blowout", "blow out", "blow-out", "blowdry", "blow dry", "toner", "root touch", "lightener", "brazilian"],
    groups: [
      {
        name: "Precision Haircuts",
        items: [
          { name: "Women's", price: "$60+" },
          { name: "Men's", price: "$35+" },
          { name: "Children 12 & Under", price: "$35+" },
          { name: "Bang Trim", price: "$18+" },
          { name: "Beard Trim", price: "$18+" },
        ],
      },
      {
        name: "Styling",
        items: [
          { name: "Luxury Wash and Blowout", price: "$35+" },
          { name: "Special Occasion Style", price: "$75+" },
          { name: "Added Heat Style", price: "$15+" },
        ],
      },
      {
        name: "Texture Waves",
        items: [
          { name: "Short Hair", price: "$75+" },
          { name: "Long Hair", price: "$120+" },
        ],
      },
      {
        name: "Conditioning Treatments",
        items: [
          { name: "Conditioning Treatment", price: "$30+" },
          { name: "Brazilian Blowout Split End Treatment", price: "$55+" },
          { name: "Brazilian Blowout Smoothing Treatment", price: "$275+" },
        ],
      },
      {
        name: "Expert Color",
        items: [
          { name: "Root Touchup", price: "$68+" },
          { name: "All Over Color", price: "$75+" },
          { name: "Color Refresher", price: "$30+" },
          { name: "Toner/Root Smudge", price: "$55+" },
        ],
      },
      {
        name: "On Scalp Lightener",
        items: [
          { name: "Retouch (5 weeks or less regrowth)", price: "$90+" },
          { name: "Full Head Lightening Service", price: "$150+" },
        ],
      },
      {
        name: "Foilayage / Balayage",
        items: [
          { name: "Full Weave", price: "$96+" },
          { name: "Partial Weave", price: "$76+" },
          { name: "Back to Back Foils", price: "$150+" },
          { name: "Balayage", price: "Based on consultation" },
          { name: "Foilayage", price: "Based on consultation" },
        ],
      },
      {
        name: "Specialty Color (Consultation Required)",
        items: [
          { name: "Corrective Color", price: "Based on consultation" },
          { name: "Block Color", price: "Based on consultation" },
          { name: "Fantasy Color", price: "Based on consultation" },
        ],
      },
    ],
  },
  {
    id: "nails",
    title: "Nails",
    keywords: ["nail", "nails", "manicure", "pedicure", "mani", "pedi", "gel", "fills", "polish", "nail set"],
    groups: [
      {
        name: "Nail Services",
        items: [
          { name: "Manicure", price: "$35+" },
          { name: "Manicure w/Gel", price: "$55+" },
          { name: "Pedicure", price: "$60+" },
          { name: "Pedicure w/Gel", price: "$80+" },
          { name: "Polish Change", price: "$30+" },
          { name: "Fills", price: "$60+" },
          { name: "Fills w/Gel", price: "$65+" },
          { name: "Back Fills", price: "$75+" },
          { name: "Glues", price: "$50+" },
          { name: "Nail Set", price: "$95+" },
          { name: "Nail Set w/Gel", price: "$110+" },
        ],
      },
    ],
    notes: ["Please allow 24 hrs. for cancellations."],
  },
  {
    id: "lashes",
    title: "Lashes",
    keywords: ["lash", "lashes", "eyelash", "eyelashes", "lash lift", "lash extension", "lash fill", "lash tint", "brow tint"],
    groups: [
      {
        name: "Lash Services",
        items: [
          { name: "Classic Lash Set", price: "$180" },
          { name: "Classic Lash Fill", price: "$70" },
          { name: "Hybrid Lash Set", price: "$220" },
          { name: "Hybrid Lash Fill", price: "$80" },
          { name: "Volume Lash Set", price: "$250" },
          { name: "Volume Lash Fill", price: "$90" },
          { name: "Lash Lift & Perm", price: "$65" },
          { name: "Lash or Brow Tint", price: "$20" },
        ],
      },
    ],
  },
  {
    id: "skincare",
    title: "Skincare & Spray Tan",
    keywords: ["skin", "skincare", "facial", "facials", "dermaplane", "hydrafacial", "microdermabrasion", "microneedling", "spray tan", "tan", "wax", "waxing", "brow wax"],
    groups: [
      {
        name: "Skincare & Spray Tan Services",
        items: [
          { name: "Signature Facial", price: "$95" },
          { name: "Dermaplane / Hydrafacial / Microdermabrasion Facials", price: "$115" },
          { name: "Microneedling", price: "$299" },
          { name: "Brow Wax", price: "$20" },
          { name: "Airbrush Spray Tan", price: "$35" },
          { name: "Other waxing services", price: "Call for pricing" },
        ],
      },
    ],
  },
  {
    id: "massage",
    title: "Massage",
    keywords: ["massage", "massages", "bodywork", "rub down"],
    groups: [
      {
        name: "Massage Sessions",
        items: [
          { name: "60 min", price: "$105" },
          { name: "90 min", price: "$140" },
          { name: "120 min", price: "$190" },
        ],
      },
    ],
    notes: [
      "Name your stylist when booking for a 20% discount.",
      "Please allow 24 hrs. for cancellations.",
    ],
  },
];

const PRICING_INTENT_RE = /\b(price|prices|pricing|cost|costs|how much|menu|rates?|quote)\b/i;

/** Returns true if the message reads like a pricing/menu inquiry. */
export function isPricingQuery(message: string): boolean {
  return PRICING_INTENT_RE.test(message);
}

/** Detect categories the user is asking about. Returns [] if none, ["all"]-style
 *  is represented by returning ALL categories when the query is generic. */
export function detectPricingCategories(message: string): PricingCategory[] {
  const lower = message.toLowerCase();
  const matched = PRICING_CATEGORIES.filter((cat) =>
    cat.keywords.some((kw) => {
      // Use word-boundary match for short keywords; substring for multi-word.
      if (kw.includes(" ") || kw.includes("-")) return lower.includes(kw);
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return re.test(lower);
    })
  );
  return matched;
}

/** Render a single category as a deterministic markdown block. */
export function renderCategoryMarkdown(cat: PricingCategory): string {
  const lines: string[] = [];
  lines.push(`### ${cat.title}`);
  for (const group of cat.groups) {
    if (cat.groups.length > 1) lines.push(`\n**${group.name}**`);
    lines.push("");
    lines.push("| Service | Starting at |");
    lines.push("| --- | --- |");
    for (const item of group.items) {
      lines.push(`| ${item.name} | ${item.price} |`);
    }
  }
  if (cat.notes && cat.notes.length) {
    lines.push("");
    for (const n of cat.notes) lines.push(`_${n}_`);
  }
  return lines.join("\n");
}

/** Build the full pre-message block for one or more categories. */
export function renderPricingBlock(categories: PricingCategory[]): string {
  return categories.map(renderCategoryMarkdown).join("\n\n");
}
