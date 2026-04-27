import { Scissors, Hand, Sparkles, Eye, Heart, LucideIcon } from "lucide-react";

export interface ServiceItem {
  name: string;
  price: string;
  /** Short, guest-facing description of what the service includes */
  description?: string;
  /** Unique ID for cross-category shared services */
  sharedId?: string;
  /** Additional category IDs this service should appear under */
  crossCategories?: string[];
}

export interface ServiceGroup {
  name: string;
  items: ServiceItem[];
}

export interface DirectContact {
  name: string;
  phone: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  pricePreview: string;
  groups: ServiceGroup[];
  notes?: string[];
  directContacts?: DirectContact[];
}

export const servicesMenuData: ServiceCategory[] = [
  {
    id: "hair",
    title: "Hair",
    icon: Scissors,
    pricePreview: "Women's cuts from $60 · Color from $68",
    groups: [
      {
        name: "Precision Haircuts",
        items: [
          { name: "Women's", price: "$60+", description: "Personalized consultation, shampoo and condition, precision cut, finished with a blowout and style." },
          { name: "Men's", price: "$35+", description: "Tailored consultation and shampoo, precision cut, and a clean finish styled to your everyday look." },
          { name: "Children 12 & Under", price: "$35+", description: "Gentle, kid-friendly cut with shampoo and styling — designed to keep little guests comfortable." },
          { name: "Bang Trim", price: "$18+", description: "Quick in-between trim to keep your fringe shaped and out of your eyes." },
          { name: "Beard Trim", price: "$18+", description: "Shape, edge, and detail your beard for a clean, polished finish." },
        ],
      },
      {
        name: "Styling",
        items: [
          { name: "Luxury Wash and Blowout", price: "$35+", description: "Professional shampoo, scalp massage, and conditioning followed by a smooth, voluminous blowout." },
          { name: "Special Occasion Style", price: "$75+", description: "Updos, curls, or statement styling for weddings, proms, and events. Bring inspiration photos." },
          { name: "Added Heat Style", price: "$15+", description: "Add curls, waves, or a flat-iron polish to any cut for extra definition." },
        ],
      },
      {
        name: "Texture Waves",
        items: [
          { name: "Short Hair", price: "$75+", description: "Long-lasting wave or curl pattern wrapped and processed for effortless wash-and-go texture." },
          { name: "Long Hair", price: "$120+", description: "Wave or curl pattern designed for longer lengths — more sectioning and processing time." },
        ],
      },
      {
        name: "Conditioning Treatments",
        items: [
          { name: "Conditioning Treatment", price: "$30+", description: "Deep moisture or protein treatment processed under heat for instantly softer, shinier hair." },
          { name: "Brazilian Blowout Split End Treatment", price: "$55+", description: "Bonding treatment that seals split ends and reduces breakage — safe for color-treated hair." },
          { name: "Brazilian Blowout Smoothing Treatment", price: "$275+", description: "Keratin-based smoothing service that eliminates frizz and softens curl for up to 12 weeks." },
        ],
      },
      {
        name: "Expert Color",
        items: [
          { name: "Root Touchup", price: "$68+", description: "Color applied to new-growth regrowth to keep your existing shade seamless between full appointments." },
          { name: "All Over Color", price: "$75+", description: "Single shade applied root to ends — full coverage, a fresh start, or a bold change." },
          { name: "Color Refresher", price: "$30+", description: "Gloss or toner that revives faded tone, adds shine, and extends the life of your color." },
          { name: "Toner/Root Smudge", price: "$55+", description: "Neutralizes brassiness or softly blends roots into lighter ends for a seamless finish." },
        ],
      },
      {
        name: "On Scalp Lightener",
        items: [
          { name: "Retouch (5 weeks or less regrowth)", price: "$90+", description: "Lightener applied only to new growth — best when regrowth is short, for even results and healthier hair." },
          { name: "Full Head Lightening Service", price: "$150+", description: "All-over lightening for first-time blondes or significant regrowth. Multiple sessions may be recommended." },
        ],
      },
      {
        name: "Foilayage / Balayage",
        items: [
          { name: "Full Weave", price: "$96+", description: "Traditional foil highlights placed throughout the entire head for all-over brightening." },
          { name: "Partial Weave", price: "$76+", description: "Foil highlights focused on the top and face-framing sections — dimension without full commitment." },
          { name: "Back to Back Foils", price: "$150+", description: "High-density foil placement across the head for maximum brightness and contrast." },
          { name: "Balayage", price: "Based on consultation", description: "Freehand hand-painted lightener for a sun-kissed, lived-in look that grows out beautifully." },
          { name: "Foilayage", price: "Based on consultation", description: "Hand-painted balayage sealed in foils for brighter lift while keeping a soft, blended finish." },
        ],
      },
      {
        name: "Corrective Color",
        items: [
          { name: "Corrective Color", price: "Based on consultation", description: "For color that didn't go as planned. We assess your hair and build a personalized correction plan — may take multiple sessions." },
        ],
      },
      {
        name: "Block Color",
        items: [
          { name: "Block Color", price: "Based on consultation", description: "Bold, geometric color sections in two or more contrasting shades — think hidden underlayers or half-and-half looks." },
        ],
      },
      {
        name: "Fantasy Color",
        items: [
          { name: "Fantasy Color", price: "Based on consultation", description: "Vivid non-natural shades — pastels, blues, purples, pinks, and more. Often requires pre-lightening for the brightest result." },
        ],
      },
    ],
  },
  {
    id: "nails",
    title: "Nails",
    icon: Hand,
    pricePreview: "Manicure from $35 · Full set from $95",
    groups: [
      {
        name: "Nail Services",
        items: [
          { name: "Manicure", price: "$35+", description: "Soak, cuticle care, shaping, hand massage, and traditional polish finished with a glossy top coat." },
          { name: "Manicure w/Gel", price: "$55+", description: "Classic manicure finished with cured gel polish for a chip-resistant shine that lasts 2–3 weeks." },
          { name: "Pedicure", price: "$60+", description: "Warm soak, exfoliation, callus buffing, cuticle care, shaping, and a relaxing foot and calf massage with traditional polish." },
          { name: "Pedicure w/Gel", price: "$80+", description: "All the relaxation of our pedicure finished with long-lasting gel polish — ideal for sandal season." },
          { name: "Polish Change", price: "$30+", description: "Quick polish removal and a fresh coat in regular or gel — perfect for in-between appointments." },
          { name: "Fills", price: "$60+", description: "Maintenance for acrylic or hard-gel extensions — new growth filled in, reshaped, and repainted." },
          { name: "Fills w/Gel", price: "$65+", description: "Standard fill finished with a gel overlay or gel polish for extra durability and shine." },
          { name: "Back Fills", price: "$75+", description: "For grown-out or neglected extensions needing more product reapplied at the base. Includes reshape and repaint." },
          { name: "Glues", price: "$50+", description: "Press-on or pre-made nail tips applied with glue, then filed and shaped to your preference." },
          { name: "Nail Set", price: "$95+", description: "Full acrylic or hard-gel extensions sculpted on natural nails or tips — shape and length are completely customized." },
          { name: "Nail Set w/Gel", price: "$110+", description: "Full nail set finished with long-lasting gel polish for the ultimate shine and chip resistance." },
        ],
      },
    ],
    notes: ["Please allow 24 hrs. for cancellations."],
    directContacts: [
      { name: "Anita Apodaca", phone: "(520) 591-0208" },
      { name: "Kelly Vishnevetsky", phone: "(520) 488-7149" },
      { name: "Jackie", phone: "(520) 501-6861" },
    ],
  },
  {
    id: "lashes",
    title: "Lashes",
    icon: Eye,
    pricePreview: "Classic Lash Set $180 · Volume Lash Set $250",
    groups: [
      {
        name: "Lash Services",
        items: [
          { name: "Classic Lash Set", price: "$180", description: "One extension applied to each natural lash for a clean, polished, everyday look. Approx. 90–120 minutes." },
          { name: "Classic Lash Fill", price: "$70", description: "Refresh fill recommended every 2–3 weeks to replace shed extensions and keep your set looking full." },
          { name: "Hybrid Lash Set", price: "$220", description: "A textured mix of Classic and Volume techniques — wispier than Classic, softer than full Volume." },
          { name: "Hybrid Lash Fill", price: "$80", description: "Maintenance fill for Hybrid clients to refresh the mixed-texture look. Recommended every 2–3 weeks." },
          { name: "Volume Lash Set", price: "$250", description: "Handmade fans of 2–6 ultra-fine extensions per natural lash for dramatic, glam fullness." },
          { name: "Volume Lash Fill", price: "$90", description: "Maintenance fill for Volume clients to keep your set looking dense and full. Every 2–3 weeks." },
          { name: "Lash Lift & Perm", price: "$65", description: "Natural alternative to extensions — lifts your own lashes from the root for an eye-opening curl that lasts 6–8 weeks." },
          { name: "Lash or Brow Tint", price: "$20", description: "Semi-permanent tint that deepens lashes or brows for fuller, more defined color. Lasts 4–6 weeks.", sharedId: "brow-lash-tint", crossCategories: ["skincare"] },
        ],
      },
    ],
    directContacts: [
      { name: "Allison", phone: "(520) 250-6606" },
    ],
  },
  {
    id: "skincare",
    title: "Skincare & Spray Tan",
    icon: Sparkles,
    pricePreview: "Signature Facial $95 · Airbrush Spray Tan $35",
    groups: [
      {
        name: "Skincare & Spray Tan Services",
        items: [
          { name: "Signature Facial", price: "$95", description: "Customized cleanse, exfoliation, steam, extractions if needed, mask, and a finishing toner, serum, and moisturizer." },
          { name: "Dermaplane / Hydrafacial / Microdermabrasion Facials", price: "$115", description: "Choose your renewal: Dermaplane (smooth manual exfoliation), HydraFacial (cleanse + extract + hydrating serums), or Microdermabrasion (mechanical exfoliation for tone and texture)." },
          { name: "Microneedling", price: "$299", description: "Tiny micro-channels stimulate collagen and elastin to firm skin and improve fine lines, scars, and tone. A series is recommended." },
          { name: "Brow Wax", price: "$20", description: "Warm-wax shaping and cleanup tailored to your facial features. Lasts 3–4 weeks.", sharedId: "brow-wax", crossCategories: ["lashes"] },
          { name: "Airbrush Spray Tan", price: "$35", description: "Streak-free DHA airbrush tan applied for an even, natural-looking glow. Develops over 4–8 hours, lasts 5–10 days." },
          { name: "Other waxing services", price: "Call for pricing", description: "Additional waxing options available — call Patty directly for what's offered and pricing." },
        ],
      },
    ],
    directContacts: [
      { name: "Patty", phone: "(520) 870-6048" },
    ],
  },
  {
    id: "massage",
    title: "Massage",
    icon: Heart,
    pricePreview: "60 min $105 · 90 min $140",
    groups: [
      {
        name: "Massage Sessions",
        items: [
          { name: "60 min", price: "$105", description: "Full-body therapeutic massage focused on tension and circulation. Pressure customized from light relaxation to medium therapeutic." },
          { name: "90 min", price: "$140", description: "Extended session for deeper attention to neck, shoulders, back, and legs — ideal for chronic tension or recovery." },
          { name: "120 min", price: "$190", description: "Two-hour head-to-toe experience often including face, scalp, and foot work. Ultimate decompress and reset." },
        ],
      },
    ],
    notes: [
      "Name your stylist when booking for a 20% discount.",
      "Please allow 24 hrs. for cancellations.",
    ],
    directContacts: [
      { name: "Tammi", phone: "(520) 370-3018" },
    ],
  },
];

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return servicesMenuData.find((cat) => cat.id === id);
};

/**
 * Get all cross-referenced service items that belong to a given category
 * but are defined in other categories via crossCategories.
 */
export function getCrossReferencedItems(categoryId: string): ServiceGroup | null {
  const crossItems: ServiceItem[] = [];

  for (const cat of servicesMenuData) {
    if (cat.id === categoryId) continue;
    for (const group of cat.groups) {
      for (const item of group.items) {
        if (item.crossCategories?.includes(categoryId)) {
          if (!crossItems.some(ci => ci.sharedId === item.sharedId)) {
            crossItems.push(item);
          }
        }
      }
    }
  }

  return crossItems.length > 0
    ? { name: "Also Available", items: crossItems }
    : null;
}

/**
 * Get a category with cross-referenced items appended as an extra group.
 */
export function getCategoryWithCrossRefs(id: string): ServiceCategory | undefined {
  const category = getCategoryById(id);
  if (!category) return undefined;

  const crossGroup = getCrossReferencedItems(id);
  if (!crossGroup) return category;

  return {
    ...category,
    groups: [...category.groups, crossGroup],
  };
}
