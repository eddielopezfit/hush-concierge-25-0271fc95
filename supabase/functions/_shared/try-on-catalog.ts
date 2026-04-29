// Server-authoritative catalog of style + color prompts for the Try-On engine.
// The client only sends styleId / colorId — actual prompt text lives here so it
// can't be tampered with from the browser.

export type TryOnStyleCategory = "short_textured" | "medium_layered" | "long_flowing" | "bold_trendy";

export interface TryOnStyle {
  id: string;
  name: string;
  category: TryOnStyleCategory;
  prompt: string;
}

export interface TryOnColor {
  id: string;
  name: string;
  prompt: string;
}

export const TRY_ON_STYLES: TryOnStyle[] = [
  // Short / Textured
  { id: "short_textured_pixie",      name: "Textured Pixie",            category: "short_textured", prompt: "a chic textured pixie cut with piecey layers, soft side-swept fringe, and natural movement" },
  { id: "short_french_bob",          name: "French Bob",                category: "short_textured", prompt: "a chin-length French bob with soft curtain bangs and a slight curve under the jawline" },
  { id: "short_undercut_crop",       name: "Undercut Crop",             category: "short_textured", prompt: "a modern crop with subtle taper at the sides and tousled length on top" },
  { id: "short_sleek_bob",           name: "Sleek Sharp Bob",           category: "short_textured", prompt: "a glossy chin-length blunt bob with a clean center part and razor-sharp ends" },
  // Medium / Layered
  { id: "medium_long_bob",           name: "Long Bob (Lob)",            category: "medium_layered", prompt: "a collarbone-length lob with subtle face-framing layers and natural beachy texture" },
  { id: "medium_curtain_layers",     name: "Curtain-Layer Shag",        category: "medium_layered", prompt: "a shoulder-length modern shag with curtain bangs and feathered, airy layers" },
  { id: "medium_blowout",            name: "Bouncy '90s Blowout",       category: "medium_layered", prompt: "a voluminous shoulder-length blowout with bouncy ends and soft face-framing layers" },
  { id: "medium_wolf_cut",           name: "Modern Wolf Cut",           category: "medium_layered", prompt: "a wolf cut with shorter choppy layers around the face that flow into longer, wispy ends" },
  // Long / Flowing
  { id: "long_beach_waves",          name: "Effortless Beach Waves",    category: "long_flowing",   prompt: "long flowing hair past the shoulders with soft, loose beach waves and natural movement" },
  { id: "long_face_framing",         name: "Face-Framing Layers",       category: "long_flowing",   prompt: "long hair with sweeping face-framing layers, a center part, and silky polished ends" },
  { id: "long_silky_straight",       name: "Silky Straight",            category: "long_flowing",   prompt: "long, silky-straight hair past the chest with a glass-like shine and a clean center part" },
  { id: "long_loose_curls",          name: "Loose Romantic Curls",      category: "long_flowing",   prompt: "long hair with loose, romantic spiral curls cascading from mid-length down" },
  // Bold / Trendy
  { id: "bold_blunt_micro_bangs",    name: "Blunt Micro-Bangs",         category: "bold_trendy",    prompt: "a sleek shoulder-length cut with bold blunt micro-bangs sitting high on the forehead" },
  { id: "bold_high_pony",            name: "Sculpted High Pony",        category: "bold_trendy",    prompt: "a polished, slicked-back high ponytail with a glossy finish and a long flowing tail" },
  { id: "bold_money_piece",          name: "Money-Piece Highlights",    category: "bold_trendy",    prompt: "shoulder-length hair with bold contrasting money-piece highlights framing the face" },
  { id: "bold_textured_mullet",      name: "Editorial Mullet",          category: "bold_trendy",    prompt: "a modern editorial mullet with shorter top layers and a longer textured back" },
];

export const TRY_ON_COLORS: TryOnColor[] = [
  // IDs mirror the client catalog and map 1:1 to real Hush hair services.
  { id: "balayage_caramel",   name: "Balayage · Caramel",   prompt: "a hand-painted balayage with warm caramel ribbons softly melting through a brunette base, lived-in seamless blending, no harsh lines" },
  { id: "balayage_champagne", name: "Balayage · Champagne", prompt: "a hand-painted balayage in a soft champagne-beige tone, neutral and luminous, painted seamlessly from mid-shaft to ends" },
  { id: "foilayage_honey",    name: "Foilayage · Honey",    prompt: "foilayage highlights in a warm honey blonde, brighter and more uniform than balayage, with buttery sun-kissed dimension throughout" },
  { id: "foilayage_platinum", name: "Foilayage · Platinum", prompt: "foilayage highlights lifted to a cool icy platinum blonde with crisp pearl undertones and bright, even brightness from mid-lengths to ends" },
  { id: "lived_in_brunette",  name: "Lived-In Brunette",    prompt: "a rich, glossy lived-in brunette with subtle warm depth and natural-looking root shadow, low-maintenance grow-out" },
  { id: "money_piece",        name: "Money-Piece",          prompt: "bold contrasting money-piece highlights brightening the front face-framing pieces, with the rest of the hair kept in its natural tone" },
  { id: "vivid_accent_rose",  name: "Vivid Accent · Rose",  prompt: "a statement vivid fashion-color accent in a soft rose-pink tone placed through the underlayer or face-frame, vibrant but salon-polished" },
  { id: "soft_black_gloss",   name: "Soft Black Gloss",     prompt: "a soft natural black gloss with a luminous, never-flat sheen and subtle blue-violet shimmer in the light" },
];

export function findStyle(id: string): TryOnStyle | undefined {
  return TRY_ON_STYLES.find((s) => s.id === id);
}

export function findColor(id: string): TryOnColor | undefined {
  return TRY_ON_COLORS.find((c) => c.id === id);
}

export type FaceShape = "oval" | "round" | "square" | "heart" | "long" | "unsure";
export type Undertone = "cool" | "warm" | "neutral" | "unsure";

const FACE_SHAPE_GUIDANCE: Record<Exclude<FaceShape, "unsure">, string> = {
  oval:   "an oval face",
  round:  "a round face — favor shapes that add length and structure",
  square: "a square face — favor soft, layered shapes that balance a strong jawline",
  heart:  "a heart-shaped face — favor shapes that add width near the jaw",
  long:   "a long face — favor shapes with width and softness around the cheekbones",
};

const UNDERTONE_GUIDANCE: Record<Exclude<Undertone, "unsure">, string> = {
  cool:    "cool skin undertones (pink/blue)",
  warm:    "warm skin undertones (golden/peach)",
  neutral: "neutral skin undertones",
};

export function buildEditPrompt(
  styleId: string,
  colorId: string | null,
  faceShape: FaceShape | null = null,
  undertone: Undertone | null = null,
): string {
  const style = findStyle(styleId);
  const color = colorId ? findColor(colorId) : null;

  const styleLine = style
    ? `Restyle the hair in this photo to ${style.prompt}.`
    : "Restyle the hair in this photo with a flattering modern cut.";

  const colorLine = color
    ? ` Recolor the hair to ${color.prompt}.`
    : "";

  const guidanceParts: string[] = [];
  if (faceShape && faceShape !== "unsure") {
    guidanceParts.push(`Tailor the cut to flatter ${FACE_SHAPE_GUIDANCE[faceShape]}`);
  }
  if (color && undertone && undertone !== "unsure") {
    guidanceParts.push(`Adjust tonality so the color harmonizes with ${UNDERTONE_GUIDANCE[undertone]}`);
  }
  const guidanceLine = guidanceParts.length
    ? ` ${guidanceParts.join(". ")}.`
    : "";

  return [
    styleLine + colorLine + guidanceLine,
    "Strict rules: only modify the hair (cut, length, shape, color, texture).",
    "Do NOT change the person's face, skin tone, identity, age, expression, eye color, makeup, jewelry, clothing, lighting, camera angle, or background.",
    "Keep the result photorealistic, professional salon-quality, with natural shine and realistic edges where the hair meets the skin.",
    "Preserve the original photo's resolution, framing, and overall composition.",
  ].join(" ");
}