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
  { id: "ash_brown",          name: "Ash Brown",            prompt: "a cool, multidimensional ash brown with subtle smoky undertones" },
  { id: "dark_chocolate",     name: "Dark Chocolate",       prompt: "a rich, glossy dark chocolate brown with warm depth" },
  { id: "soft_black",         name: "Soft Black",           prompt: "a soft natural black with a subtle blue-violet sheen, never flat" },
  { id: "caramel_highlights", name: "Caramel Highlights",   prompt: "warm caramel balayage highlights blended through a brunette base" },
  { id: "honey_blonde",       name: "Honey Blonde",         prompt: "a warm honey blonde with buttery, sun-kissed dimension" },
  { id: "cool_platinum",      name: "Cool Platinum",        prompt: "a cool icy platinum blonde with crisp pearl undertones" },
];

export function findStyle(id: string): TryOnStyle | undefined {
  return TRY_ON_STYLES.find((s) => s.id === id);
}

export function findColor(id: string): TryOnColor | undefined {
  return TRY_ON_COLORS.find((c) => c.id === id);
}

export function buildEditPrompt(styleId: string, colorId: string | null): string {
  const style = findStyle(styleId);
  const color = colorId ? findColor(colorId) : null;

  const styleLine = style
    ? `Restyle the hair in this photo to ${style.prompt}.`
    : "Restyle the hair in this photo with a flattering modern cut.";

  const colorLine = color
    ? ` Recolor the hair to ${color.prompt}.`
    : "";

  return [
    styleLine + colorLine,
    "Strict rules: only modify the hair (cut, length, shape, color, texture).",
    "Do NOT change the person's face, skin tone, identity, age, expression, eye color, makeup, jewelry, clothing, lighting, camera angle, or background.",
    "Keep the result photorealistic, professional salon-quality, with natural shine and realistic edges where the hair meets the skin.",
    "Preserve the original photo's resolution, framing, and overall composition.",
  ].join(" ");
}