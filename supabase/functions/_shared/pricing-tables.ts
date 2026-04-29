// Canonical pricing data mirrored from src/data/servicesMenuData.ts
// Used by luna-chat to inject deterministic, complete pricing tables so the LLM
// never trims rows when summarizing a category's menu.

export type PricingItem = { name: string; price: string; description?: string };
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
          { name: "Women's", price: "$60+", description: "Personalized consultation, shampoo, precision cut, and finishing blowout tailored to your hair type and lifestyle." },
          { name: "Men's", price: "$35+", description: "Tailored men's cut with consultation, shampoo, precision shaping, and a clean finish." },
          { name: "Children 12 & Under", price: "$35+", description: "Gentle, patient haircut for kids — shaped to suit their hair type and everyday wear." },
          { name: "Bang Trim", price: "$18+", description: "Quick between-visit reshape to keep your fringe sitting exactly the way you like it." },
          { name: "Beard Trim", price: "$18+", description: "Precision beard shaping and clean lines to refresh your look between full cuts." },
        ],
      },
      {
        name: "Styling",
        items: [
          { name: "Luxury Wash and Blowout", price: "$35+", description: "Indulgent shampoo, scalp massage, conditioning, and a salon-quality blowout for smooth, voluminous hair." },
          { name: "Special Occasion Style", price: "$75+", description: "Updos, curls, or statement styling for weddings, proms, photoshoots, and big nights out." },
          { name: "Added Heat Style", price: "$15+", description: "Add-on curling, flat-iron, or wave styling layered onto any cut or blowout." },
        ],
      },
      {
        name: "Texture Waves",
        items: [
          { name: "Short Hair", price: "$75+", description: "Long-lasting wave or curl pattern created through a professional perming process — sized for shorter hair." },
          { name: "Long Hair", price: "$120+", description: "Soft, lasting waves or curls perm-styled into longer hair for effortless, wash-and-go texture." },
        ],
      },
      {
        name: "Conditioning Treatments",
        items: [
          { name: "Conditioning Treatment", price: "$30+", description: "Deep moisture or protein treatment processed under heat for instantly softer, shinier, healthier-feeling hair." },
          { name: "Brazilian Blowout Split End Treatment", price: "$55+", description: "Bonding treatment that seals split ends and repairs surface damage — safe for color-treated hair." },
          { name: "Brazilian Blowout Smoothing Treatment", price: "$275+", description: "Pro keratin smoothing that eliminates frizz and softens curl for up to 12 weeks of glossy, easy-to-style hair." },
        ],
      },
      {
        name: "Expert Color",
        items: [
          { name: "Root Touchup", price: "$68+", description: "Color applied to new growth only to seamlessly match and maintain your existing shade." },
          { name: "All Over Color", price: "$75+", description: "Single shade applied root-to-end for full coverage, a fresh start, or a clean color change." },
          { name: "Color Refresher", price: "$30+", description: "Quick gloss or toner to revive faded tones, add shine, and extend the life of your color." },
          { name: "Toner/Root Smudge", price: "$55+", description: "Neutralizes brassiness and softly blends roots into lighter ends for a seamless, dimensional finish." },
        ],
      },
      {
        name: "On Scalp Lightener",
        items: [
          { name: "Retouch (5 weeks or less regrowth)", price: "$90+", description: "Lightener applied only to fresh regrowth for clients maintaining previously lightened hair." },
          { name: "Full Head Lightening Service", price: "$150+", description: "Full-head lift for first-time lightening or significant regrowth — multiple sessions may be recommended." },
        ],
      },
      {
        name: "Foilayage / Balayage",
        items: [
          { name: "Full Weave", price: "$96+", description: "Traditional foil highlights placed throughout the entire head for even, all-over brightness." },
          { name: "Partial Weave", price: "$76+", description: "Strategic foil highlights through the top and front to frame your face and add dimension." },
          { name: "Back to Back Foils", price: "$150+", description: "High-density foil placement across the whole head for maximum brightness and contrast." },
          { name: "Balayage", price: "Based on consultation", description: "Freehand hand-painted highlights for a sun-kissed, lived-in look that grows out beautifully." },
          { name: "Foilayage", price: "Based on consultation", description: "Hand-painting paired with foils for higher lift and brighter, blended dimension." },
        ],
      },
      {
        name: "Specialty Color (Consultation Required)",
        items: [
          { name: "Corrective Color", price: "Based on consultation", description: "Custom plan to fix uneven tones, brassiness, or at-home color gone wrong — may require multiple sessions." },
          { name: "Block Color", price: "Based on consultation", description: "Bold, geometric color sections using two or more contrasting shades for a fashion-forward statement." },
          { name: "Fantasy Color", price: "Based on consultation", description: "Vivid pastels, blues, purples, pinks, and beyond — full-spectrum creative color, often paired with pre-lightening." },
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
          { name: "Manicure", price: "$35+", description: "Classic soak, cuticle care, shaping, hand massage, and traditional polish for a polished everyday look." },
          { name: "Manicure w/Gel", price: "$55+", description: "Full classic manicure finished with chip-resistant gel polish that lasts 2–3 weeks." },
          { name: "Pedicure", price: "$60+", description: "Warm soak, exfoliation, callus buffing, cuticle care, shaping, calf massage, and polish." },
          { name: "Pedicure w/Gel", price: "$80+", description: "Full relaxing pedicure finished with long-lasting, glossy gel polish — perfect for sandal season." },
          { name: "Polish Change", price: "$30+", description: "Quick removal and fresh application of regular or gel polish in your chosen shade." },
          { name: "Fills", price: "$60+", description: "Maintenance for acrylic or hard-gel extensions — new product on regrowth, reshaped and repainted." },
          { name: "Fills w/Gel", price: "$65+", description: "Standard fill finished with a gel overlay or gel polish for added durability and shine." },
          { name: "Back Fills", price: "$75+", description: "Deeper rework for grown-out or neglected extensions — more product removed, reapplied, and refinished." },
          { name: "Glues", price: "$50+", description: "Press-on or pre-made nail tips applied with adhesive, then filed and shaped to your preference." },
          { name: "Nail Set", price: "$95+", description: "Full set of acrylic or hard-gel extensions sculpted to your chosen length and shape with traditional polish." },
          { name: "Nail Set w/Gel", price: "$110+", description: "Full custom nail set finished with long-wear gel polish for maximum shine and chip resistance." },
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
          { name: "Classic Lash Set", price: "$180", description: "One extension applied to each natural lash for a clean, polished, mascara-free everyday look." },
          { name: "Classic Lash Fill", price: "$70", description: "Replaces shed extensions to maintain your Classic set — recommended every 2–3 weeks." },
          { name: "Hybrid Lash Set", price: "$220", description: "A mix of Classic and Volume techniques for textured, wispy fullness between natural and dramatic." },
          { name: "Hybrid Lash Fill", price: "$80", description: "Maintenance fill that refreshes your Hybrid set's mixed-texture look every 2–3 weeks." },
          { name: "Volume Lash Set", price: "$250", description: "Handmade fans of ultra-fine extensions on each lash for dramatic, photogenic fullness and depth." },
          { name: "Volume Lash Fill", price: "$90", description: "Maintenance fill that restores the bold, full look of your Volume set every 2–3 weeks." },
          { name: "Lash Lift & Perm", price: "$65", description: "Lifts and curls your natural lashes from the root for an eye-opening result that lasts 6–8 weeks." },
          { name: "Lash or Brow Tint", price: "$20", description: "Semi-permanent tint that deepens lashes or brows for a fuller, defined look lasting 4–6 weeks." },
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
          { name: "Signature Facial", price: "$95", description: "Customized cleanse, exfoliation, steam, mask, and finishing skincare to brighten and balance your skin." },
          { name: "Dermaplane / Hydrafacial / Microdermabrasion Facials", price: "$115", description: "Three advanced renewal options: dermaplane smoothing, HydraFacial deep hydration, or crystal microdermabrasion." },
          { name: "Microneedling", price: "$299", description: "Collagen-stimulating treatment that smooths fine lines, scars, and uneven tone — numbing applied for comfort." },
          { name: "Brow Wax", price: "$20", description: "Professional waxing and shaping to clean up and define brows — results last 3–4 weeks." },
          { name: "Airbrush Spray Tan", price: "$35", description: "Custom airbrushed, streak-free sun-kissed glow that develops in hours and lasts 5–10 days." },
          { name: "Other waxing services", price: "Call for pricing", description: "Additional face and body waxing options available — call Patty for service details and pricing." },
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
          { name: "60 min", price: "$105", description: "Full-body therapeutic massage focused on tension areas — pressure customized from relaxation to therapeutic." },
          { name: "90 min", price: "$140", description: "Extended session with deeper attention to neck, shoulders, back, and legs for chronic tension or recovery." },
          { name: "120 min", price: "$190", description: "Two-hour head-to-toe experience often including face, scalp, and foot work — the ultimate reset." },
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
    lines.push("| Service | Starting at | What's included |");
    lines.push("| --- | --- | --- |");
    for (const item of group.items) {
      const desc = (item.description ?? "—").replace(/\|/g, "\\|");
      lines.push(`| ${item.name} | ${item.price} | ${desc} |`);
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
  const summary = renderPricingSummary(categories);
  const tables = categories.map(renderCategoryMarkdown).join("\n\n");
  return summary ? `${summary}\n\n${tables}` : tables;
}

/** Parse a "$60+", "$60", "Based on consultation", "Call for pricing" into a number or null. */
function parsePrice(price: string): number | null {
  const m = /\$([0-9]+(?:\.[0-9]+)?)/.exec(price);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Build a single short paragraph that summarizes the price range across the
 * rendered categories. Surfaces the lowest starting price and the highest
 * listed price per category so the guest can scan the answer in one glance
 * before diving into the detailed tables below.
 */
export function renderPricingSummary(categories: PricingCategory[]): string {
  if (!categories.length) return "";

  const parts: string[] = [];
  let hasConsultRow = false;

  for (const cat of categories) {
    const prices: number[] = [];
    for (const group of cat.groups) {
      for (const item of group.items) {
        const n = parsePrice(item.price);
        if (n != null) prices.push(n);
        else hasConsultRow = true;
      }
    }
    if (!prices.length) {
      parts.push(`${cat.title.toLowerCase()} is quoted based on a quick consultation`);
      continue;
    }
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      parts.push(`${cat.title.toLowerCase()} runs $${min}`);
    } else {
      parts.push(`${cat.title.toLowerCase()} ranges from $${min} to $${max}+`);
    }
  }

  if (!parts.length) return "";

  // Format: "Here's the quick read — hair ranges from $18 to $275+, and nails ranges from $30 to $110+."
  let summaryList: string;
  if (parts.length === 1) {
    summaryList = parts[0];
  } else if (parts.length === 2) {
    summaryList = `${parts[0]}, and ${parts[1]}`;
  } else {
    summaryList = `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
  }

  const consultNote = hasConsultRow
    ? " A few specialty services (like balayage or corrective color) are quoted after a quick consultation."
    : "";

  return `**Here's the quick read:** ${summaryList}.${consultNote} Full breakdown below 👇`;
}

/**
 * Render a compact "Service Descriptions Catalog" for system-prompt injection.
 * Gives Luna the exact one-line description for every service so she can answer
 * "what's included in X?" without forcing the guest to scroll the menu.
 */
export function renderServiceDescriptionsCatalog(): string {
  const lines: string[] = [];
  lines.push("## SERVICE DESCRIPTIONS CATALOG (one-liner per service)");
  lines.push(
    "Use these exact, guest-facing descriptions when explaining what a service includes. " +
    "Paraphrase naturally — never read verbatim — and always pair with the starting price already in the SERVICES & PRICING section. " +
    "If a guest asks about a service NOT in this catalog, do not invent one."
  );
  for (const cat of PRICING_CATEGORIES) {
    lines.push(`\n### ${cat.title}`);
    for (const group of cat.groups) {
      for (const item of group.items) {
        if (!item.description) continue;
        lines.push(`- **${item.name}** (${item.price}) — ${item.description}`);
      }
    }
  }
  return lines.join("\n");
}

/** Find a single service by fuzzy name match. Useful for follow-up tools/tests. */
export function findServiceDescription(query: string): { name: string; price: string; description: string; category: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const cat of PRICING_CATEGORIES) {
    for (const group of cat.groups) {
      for (const item of group.items) {
        if (!item.description) continue;
        const n = item.name.toLowerCase();
        if (n === q || n.includes(q) || q.includes(n)) {
          return { name: item.name, price: item.price, description: item.description, category: cat.title };
        }
      }
    }
  }
  return null;
}
