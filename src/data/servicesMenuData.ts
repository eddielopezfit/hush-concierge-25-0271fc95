import { Scissors, Hand, Sparkles, Eye, Heart, LucideIcon } from "lucide-react";

export interface ServiceItem {
  name: string;
  price: string;
  /** Short guest-facing description of what the service includes */
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
        name: "Corrective Color",
        items: [
          { name: "Corrective Color", price: "Based on consultation", description: "Custom plan to fix uneven tones, brassiness, or at-home color gone wrong — may require multiple sessions." },
        ],
      },
      {
        name: "Block Color",
        items: [
          { name: "Block Color", price: "Based on consultation", description: "Bold, geometric color sections using two or more contrasting shades for a fashion-forward statement." },
        ],
      },
      {
        name: "Fantasy Color",
        items: [
          { name: "Fantasy Color", price: "Based on consultation", description: "Vivid pastels, blues, purples, pinks, and beyond — full-spectrum creative color, often paired with pre-lightening." },
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
          { name: "Classic Lash Set", price: "$180", description: "One extension applied to each natural lash for a clean, polished, mascara-free everyday look." },
          { name: "Classic Lash Fill", price: "$70", description: "Replaces shed extensions to maintain your Classic set — recommended every 2–3 weeks." },
          { name: "Hybrid Lash Set", price: "$220", description: "A mix of Classic and Volume techniques for textured, wispy fullness between natural and dramatic." },
          { name: "Hybrid Lash Fill", price: "$80", description: "Maintenance fill that refreshes your Hybrid set's mixed-texture look every 2–3 weeks." },
          { name: "Volume Lash Set", price: "$250", description: "Handmade fans of ultra-fine extensions on each lash for dramatic, photogenic fullness and depth." },
          { name: "Volume Lash Fill", price: "$90", description: "Maintenance fill that restores the bold, full look of your Volume set every 2–3 weeks." },
          { name: "Lash Lift & Perm", price: "$65", description: "Lifts and curls your natural lashes from the root for an eye-opening result that lasts 6–8 weeks." },
          { name: "Lash or Brow Tint", price: "$20", description: "Semi-permanent tint that deepens lashes or brows for a fuller, defined look lasting 4–6 weeks.", sharedId: "brow-lash-tint", crossCategories: ["skincare"] },
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
          { name: "Signature Facial", price: "$95", description: "Customized cleanse, exfoliation, steam, mask, and finishing skincare to brighten and balance your skin." },
          { name: "Dermaplane / Hydrafacial / Microdermabrasion Facials", price: "$115", description: "Three advanced renewal options: dermaplane smoothing, HydraFacial deep hydration, or crystal microdermabrasion." },
          { name: "Microneedling", price: "$299", description: "Collagen-stimulating treatment that smooths fine lines, scars, and uneven tone — numbing applied for comfort." },
          { name: "Brow Wax", price: "$20", description: "Professional waxing and shaping to clean up and define brows — results last 3–4 weeks.", sharedId: "brow-wax", crossCategories: ["lashes"] },
          { name: "Airbrush Spray Tan", price: "$35", description: "Custom airbrushed, streak-free sun-kissed glow that develops in hours and lasts 5–10 days." },
          { name: "Other waxing services", price: "Call for pricing", description: "Additional face and body waxing options available — call Patty for service details and pricing." },
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
