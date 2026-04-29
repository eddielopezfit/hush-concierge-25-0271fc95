// Client-side metadata only — no prompts (those live in the edge function).
export type TryOnStyleCategory = "short_textured" | "medium_layered" | "long_flowing" | "bold_trendy";

export type FaceShape = "oval" | "round" | "square" | "heart" | "long" | "unsure";
export type Undertone = "cool" | "warm" | "neutral" | "unsure";

export interface TryOnStyleMeta {
  id: string;
  name: string;
  category: TryOnStyleCategory;
  blurb: string;
  /** Face shapes this style tends to flatter. Used for soft sorting only. */
  flattersShapes?: FaceShape[];
}

export interface TryOnColorMeta {
  id: string;
  name: string;
  swatch: string; // hex for UI swatch
  blurb: string;
  /** Undertones this color tends to harmonize with. */
  flattersUndertones?: Undertone[];
}

export const TRY_ON_CATEGORIES: { id: TryOnStyleCategory; label: string; description: string }[] = [
  { id: "short_textured",  label: "Short & Textured", description: "Bold, low-maintenance, modern shapes" },
  { id: "medium_layered",  label: "Medium & Layered", description: "Effortless movement, lots of versatility" },
  { id: "long_flowing",    label: "Long & Flowing",   description: "Romantic length, soft shape, big presence" },
  { id: "bold_trendy",     label: "Bold & Trendy",    description: "Statement looks for the brave-hearted" },
];

export const TRY_ON_STYLES: TryOnStyleMeta[] = [
  { id: "short_textured_pixie",   name: "Textured Pixie",       category: "short_textured", blurb: "Piecey layers, soft fringe",        flattersShapes: ["oval", "heart", "square"] },
  { id: "short_french_bob",       name: "French Bob",           category: "short_textured", blurb: "Chin length, curtain bangs",         flattersShapes: ["oval", "long", "heart"] },
  { id: "short_undercut_crop",    name: "Undercut Crop",        category: "short_textured", blurb: "Tapered sides, tousled top",         flattersShapes: ["oval", "square", "round"] },
  { id: "short_sleek_bob",        name: "Sleek Sharp Bob",      category: "short_textured", blurb: "Glossy, blunt, sharp",               flattersShapes: ["oval", "long", "heart"] },
  { id: "medium_long_bob",        name: "Long Bob",             category: "medium_layered", blurb: "Collarbone length, beachy",          flattersShapes: ["oval", "round", "square", "heart"] },
  { id: "medium_curtain_layers",  name: "Curtain Shag",         category: "medium_layered", blurb: "Feathered, airy layers",             flattersShapes: ["oval", "round", "long", "heart"] },
  { id: "medium_blowout",         name: "'90s Blowout",         category: "medium_layered", blurb: "Bouncy, voluminous ends",            flattersShapes: ["oval", "long", "square"] },
  { id: "medium_wolf_cut",        name: "Wolf Cut",             category: "medium_layered", blurb: "Choppy face frame, wispy ends",      flattersShapes: ["oval", "round", "square"] },
  { id: "long_beach_waves",       name: "Beach Waves",          category: "long_flowing",   blurb: "Loose, effortless waves",            flattersShapes: ["oval", "long", "square", "heart"] },
  { id: "long_face_framing",      name: "Face-Framing Layers",  category: "long_flowing",   blurb: "Sweeping, polished ends",            flattersShapes: ["oval", "round", "long", "square", "heart"] },
  { id: "long_silky_straight",    name: "Silky Straight",       category: "long_flowing",   blurb: "Glass-like shine",                   flattersShapes: ["oval", "heart", "square"] },
  { id: "long_loose_curls",       name: "Romantic Curls",       category: "long_flowing",   blurb: "Cascading spiral curls",             flattersShapes: ["oval", "long", "square", "heart"] },
  { id: "bold_blunt_micro_bangs", name: "Micro-Bangs",          category: "bold_trendy",    blurb: "Statement blunt fringe",             flattersShapes: ["oval", "long"] },
  { id: "bold_high_pony",         name: "Sculpted Pony",        category: "bold_trendy",    blurb: "Slick, polished, long",              flattersShapes: ["oval", "heart"] },
  { id: "bold_money_piece",       name: "Money-Piece",          category: "bold_trendy",    blurb: "Contrast face highlights",           flattersShapes: ["oval", "round", "long", "square", "heart"] },
  { id: "bold_textured_mullet",   name: "Editorial Mullet",     category: "bold_trendy",    blurb: "Short top, textured back",           flattersShapes: ["oval", "square", "heart"] },
];

export const TRY_ON_COLORS: TryOnColorMeta[] = [
  // Each color maps 1:1 to a real Hush hair service so the booking handoff is precise.
  { id: "balayage_caramel",   name: "Balayage · Caramel",   swatch: "#a87148", blurb: "Hand-painted, sun-kissed warmth", flattersUndertones: ["warm", "neutral"] },
  { id: "balayage_champagne", name: "Balayage · Champagne", swatch: "#c9a979", blurb: "Soft, hand-painted neutral lift", flattersUndertones: ["cool", "neutral"] },
  { id: "foilayage_honey",    name: "Foilayage · Honey",    swatch: "#c79a55", blurb: "Foil-bright, buttery blonde",     flattersUndertones: ["warm", "neutral"] },
  { id: "foilayage_platinum", name: "Foilayage · Platinum", swatch: "#d8d4c9", blurb: "Icy, pearl-cool brightness",      flattersUndertones: ["cool"] },
  { id: "lived_in_brunette",  name: "Lived-In Brunette",    swatch: "#3a241c", blurb: "Rich, glossy, low-maintenance",   flattersUndertones: ["warm", "neutral", "cool"] },
  { id: "money_piece",        name: "Money-Piece",          swatch: "#dcb87a", blurb: "Bright face-framing highlights",  flattersUndertones: ["cool", "warm", "neutral"] },
  { id: "vivid_accent_rose",  name: "Vivid Accent · Rose",  swatch: "#b8526a", blurb: "Statement fashion color (Allison)", flattersUndertones: ["cool", "neutral"] },
  { id: "soft_black_gloss",   name: "Soft Black Gloss",     swatch: "#1a1717", blurb: "Natural black with luminous gloss", flattersUndertones: ["cool", "neutral"] },
];

export const FACE_SHAPES: { id: FaceShape; label: string; hint: string }[] = [
  { id: "oval",   label: "Oval",        hint: "Slightly longer than wide, balanced" },
  { id: "round",  label: "Round",       hint: "Soft jaw, similar width and length" },
  { id: "square", label: "Square",      hint: "Strong jaw, equal width" },
  { id: "heart",  label: "Heart",       hint: "Wider forehead, narrow chin" },
  { id: "long",   label: "Long / Oblong", hint: "Notably longer than wide" },
  { id: "unsure", label: "Not sure",    hint: "Skip — your stylist will assess" },
];

export const UNDERTONES: { id: Undertone; label: string; hint: string }[] = [
  { id: "cool",    label: "Cool",      hint: "Pink, red, or blue undertones · veins look blue" },
  { id: "warm",    label: "Warm",      hint: "Yellow, peach, golden undertones · veins look green" },
  { id: "neutral", label: "Neutral",   hint: "A mix of both" },
  { id: "unsure",  label: "Not sure",  hint: "Skip — your colorist will read it in person" },
];

/**
 * Returns styles sorted with face-shape matches first.
 * Items without a match keep their original order at the bottom.
 */
export function sortStylesByFace(styles: TryOnStyleMeta[], face: FaceShape | null): TryOnStyleMeta[] {
  if (!face || face === "unsure") return styles;
  return [...styles].sort((a, b) => {
    const aMatch = a.flattersShapes?.includes(face) ? 1 : 0;
    const bMatch = b.flattersShapes?.includes(face) ? 1 : 0;
    return bMatch - aMatch;
  });
}

/**
 * Returns colors sorted with undertone matches first.
 */
export function sortColorsByUndertone(colors: TryOnColorMeta[], undertone: Undertone | null): TryOnColorMeta[] {
  if (!undertone || undertone === "unsure") return colors;
  return [...colors].sort((a, b) => {
    const aMatch = a.flattersUndertones?.includes(undertone) ? 1 : 0;
    const bMatch = b.flattersUndertones?.includes(undertone) ? 1 : 0;
    return bMatch - aMatch;
  });
}

export function styleFlattersFace(styleId: string, face: FaceShape | null): boolean {
  if (!face || face === "unsure") return false;
  return !!getStyleMeta(styleId)?.flattersShapes?.includes(face);
}

export function colorFlattersUndertone(colorId: string, undertone: Undertone | null): boolean {
  if (!undertone || undertone === "unsure") return false;
  return !!getColorMeta(colorId)?.flattersUndertones?.includes(undertone);
}

export type MatchTier = "best" | "good" | "none";

/**
 * Score a style against the chosen face shape.
 * - "best": style explicitly flatters this face shape
 * - "good": style is broadly universal (flatters 4+ shapes), so it's a safe pick
 * - "none": no signal (or face = unsure / null)
 */
export function styleMatchTier(styleId: string, face: FaceShape | null): MatchTier {
  if (!face || face === "unsure") return "none";
  const meta = getStyleMeta(styleId);
  if (!meta?.flattersShapes?.length) return "none";
  if (meta.flattersShapes.includes(face)) return "best";
  if (meta.flattersShapes.length >= 4) return "good";
  return "none";
}

/**
 * Score a color against the chosen undertone.
 * - "best": color explicitly flatters this undertone
 * - "good": color works across all 3 undertones (universally flattering)
 * - "none": no signal
 */
export function colorMatchTier(colorId: string, undertone: Undertone | null): MatchTier {
  if (!undertone || undertone === "unsure") return "none";
  const meta = getColorMeta(colorId);
  if (!meta?.flattersUndertones?.length) return "none";
  if (meta.flattersUndertones.includes(undertone)) return "best";
  if (meta.flattersUndertones.length >= 3) return "good";
  return "none";
}

export function getStyleMeta(id: string) {
  return TRY_ON_STYLES.find((s) => s.id === id);
}
export function getColorMeta(id: string) {
  return TRY_ON_COLORS.find((c) => c.id === id);
}