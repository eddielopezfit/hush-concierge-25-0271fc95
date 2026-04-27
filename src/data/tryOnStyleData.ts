// Client-side metadata only — no prompts (those live in the edge function).
export type TryOnStyleCategory = "short_textured" | "medium_layered" | "long_flowing" | "bold_trendy";

export interface TryOnStyleMeta {
  id: string;
  name: string;
  category: TryOnStyleCategory;
  blurb: string;
}

export interface TryOnColorMeta {
  id: string;
  name: string;
  swatch: string; // hex for UI swatch
  blurb: string;
}

export const TRY_ON_CATEGORIES: { id: TryOnStyleCategory; label: string; description: string }[] = [
  { id: "short_textured",  label: "Short & Textured", description: "Bold, low-maintenance, modern shapes" },
  { id: "medium_layered",  label: "Medium & Layered", description: "Effortless movement, lots of versatility" },
  { id: "long_flowing",    label: "Long & Flowing",   description: "Romantic length, soft shape, big presence" },
  { id: "bold_trendy",     label: "Bold & Trendy",    description: "Statement looks for the brave-hearted" },
];

export const TRY_ON_STYLES: TryOnStyleMeta[] = [
  { id: "short_textured_pixie",   name: "Textured Pixie",       category: "short_textured", blurb: "Piecey layers, soft fringe" },
  { id: "short_french_bob",       name: "French Bob",           category: "short_textured", blurb: "Chin length, curtain bangs" },
  { id: "short_undercut_crop",    name: "Undercut Crop",        category: "short_textured", blurb: "Tapered sides, tousled top" },
  { id: "short_sleek_bob",        name: "Sleek Sharp Bob",      category: "short_textured", blurb: "Glossy, blunt, sharp" },
  { id: "medium_long_bob",        name: "Long Bob",             category: "medium_layered", blurb: "Collarbone length, beachy" },
  { id: "medium_curtain_layers",  name: "Curtain Shag",         category: "medium_layered", blurb: "Feathered, airy layers" },
  { id: "medium_blowout",         name: "'90s Blowout",         category: "medium_layered", blurb: "Bouncy, voluminous ends" },
  { id: "medium_wolf_cut",        name: "Wolf Cut",             category: "medium_layered", blurb: "Choppy face frame, wispy ends" },
  { id: "long_beach_waves",       name: "Beach Waves",          category: "long_flowing",   blurb: "Loose, effortless waves" },
  { id: "long_face_framing",      name: "Face-Framing Layers",  category: "long_flowing",   blurb: "Sweeping, polished ends" },
  { id: "long_silky_straight",    name: "Silky Straight",       category: "long_flowing",   blurb: "Glass-like shine" },
  { id: "long_loose_curls",       name: "Romantic Curls",       category: "long_flowing",   blurb: "Cascading spiral curls" },
  { id: "bold_blunt_micro_bangs", name: "Micro-Bangs",          category: "bold_trendy",    blurb: "Statement blunt fringe" },
  { id: "bold_high_pony",         name: "Sculpted Pony",        category: "bold_trendy",    blurb: "Slick, polished, long" },
  { id: "bold_money_piece",       name: "Money-Piece",          category: "bold_trendy",    blurb: "Contrast face highlights" },
  { id: "bold_textured_mullet",   name: "Editorial Mullet",     category: "bold_trendy",    blurb: "Short top, textured back" },
];

export const TRY_ON_COLORS: TryOnColorMeta[] = [
  { id: "ash_brown",          name: "Ash Brown",          swatch: "#6b5a4f", blurb: "Cool, smoky depth" },
  { id: "dark_chocolate",     name: "Dark Chocolate",     swatch: "#3a241c", blurb: "Rich, glossy warmth" },
  { id: "soft_black",         name: "Soft Black",         swatch: "#1a1717", blurb: "Natural, never flat" },
  { id: "caramel_highlights", name: "Caramel Highlights", swatch: "#a87148", blurb: "Sun-kissed dimension" },
  { id: "honey_blonde",       name: "Honey Blonde",       swatch: "#c79a55", blurb: "Buttery, warm, soft" },
  { id: "cool_platinum",      name: "Cool Platinum",      swatch: "#d8d4c9", blurb: "Icy, pearl undertones" },
];

export function getStyleMeta(id: string) {
  return TRY_ON_STYLES.find((s) => s.id === id);
}
export function getColorMeta(id: string) {
  return TRY_ON_COLORS.find((c) => c.id === id);
}