import { Scissors, Hand, Sparkles, Eye, Heart, LucideIcon } from "lucide-react";

export interface ServiceItem {
  name: string;
  price: string;
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
    pricePreview: "Haircuts from $35+ | Color from $68+",
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
        name: "Corrective Color",
        items: [
          { name: "Corrective Color", price: "Based on consultation" },
        ],
      },
      {
        name: "Block Color",
        items: [
          { name: "Block Color", price: "Based on consultation" },
        ],
      },
      {
        name: "Fantasy Color",
        items: [
          { name: "Fantasy Color", price: "Based on consultation" },
        ],
      },
    ],
  },
  {
    id: "nails",
    title: "Nails",
    icon: Hand,
    pricePreview: "Manicure from $35+ | Full set from $95+",
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
    directContacts: [
      { name: "Anita", phone: "(520) 591-0208" },
      { name: "Kelly", phone: "(520) 488-7149" },
      { name: "Jackie", phone: "(520) 501-6861" },
    ],
  },
  {
    id: "lashes",
    title: "Lashes",
    icon: Eye,
    pricePreview: "Sets from $180 | Fills from $70",
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
    directContacts: [
      { name: "Allison", phone: "(520) 250-6606" },
    ],
  },
  {
    id: "skincare",
    title: "Skincare & Spray Tan",
    icon: Sparkles,
    pricePreview: "Facials from $95 | Spray tan $35",
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
    directContacts: [
      { name: "Patty", phone: "(520) 870-6048" },
    ],
  },
  {
    id: "massage",
    title: "Massage",
    icon: Heart,
    pricePreview: "60 min $105 | 90 min $140",
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
    directContacts: [
      { name: "Tammy", phone: "(520) 370-3018" },
    ],
  },
];

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return servicesMenuData.find((cat) => cat.id === id);
};
