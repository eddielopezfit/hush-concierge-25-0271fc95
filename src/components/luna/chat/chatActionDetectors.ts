import { ConciergeContext } from "@/types/concierge";
import { formatCategoryList, categoryLabels, goalLabels, timingLabels } from "@/lib/conciergeLabels";
import type { ChatAction } from "./types";

// ── Per-service qualifying chips (the "look/goal" question, asked first) ────
// These are surfaced when Luna's last message clearly contains a qualifying
// question AND the guest hasn't yet locked in a service_subtype. Tapping a
// chip sends a natural-language reply that lets Luna branch cleanly.
const QUALIFYING_CHIPS: Record<string, string[]> = {
  lashes: ["Subtle & natural", "Wispy hybrid", "Full volume", "Not sure — help me decide"],
  hair_color: ["Refresh my current shade", "Going lighter", "Bold or vivid", "Corrective work"],
  hair_cut: ["Trim & shape", "New style", "Big change", "Not sure yet"],
  hair: ["Cut", "Color", "Cut + color", "Not sure yet"],
  nails: ["Classic manicure", "Gel / long-lasting", "Nail art", "Pedicure too"],
  skincare: ["Glow for an event", "Acne or clarity", "Anti-aging", "First-time facial"],
  massage: ["Relaxation", "Deep tissue / tension", "60 minutes", "90 minutes"],
};

// Heuristic: does Luna's last message look like a qualifying question?
// (i.e. she's trying to learn more before recommending)
function looksLikeQualifyingTurn(msg: string): boolean {
  const lower = (msg || "").toLowerCase();
  if (!lower.includes("?")) return false;
  const cues = [
    "are you", "do you", "would you", "what are you",
    "are you looking", "are you thinking",
    "subtle", "natural", "volume", "fluff",
    "trim", "fresh cut", "big change",
    "gel", "regular", "manicure", "pedicure",
    "glow", "acne", "anti-aging",
    "60 or 90", "60, 90", "relaxation", "deep tissue",
    "classic", "hybrid", "balayage", "highlights",
  ];
  return cues.some((c) => lower.includes(c));
}

function pickQualifyingChips(ctx: ConciergeContext | null, msg: string): string[] | null {
  if (!ctx?.categories?.length) return null;
  if (ctx.categories.length > 1) return null;       // multi-service handled by generic chips
  if (ctx.service_subtype) return null;             // already past qualifying
  if (!looksLikeQualifyingTurn(msg)) return null;

  const cat = ctx.categories[0];
  if (cat === "hair") {
    const lower = msg.toLowerCase();
    if (lower.includes("color") || lower.includes("balayage") || lower.includes("highlight")) {
      return QUALIFYING_CHIPS.hair_color;
    }
    if (lower.includes("cut") || lower.includes("trim") || lower.includes("style")) {
      return QUALIFYING_CHIPS.hair_cut;
    }
    return QUALIFYING_CHIPS.hair;
  }
  return QUALIFYING_CHIPS[cat] ?? null;
}

// ── Error detection ─────────────────────────────────────────────────────────
export const ERROR_PHRASES = [
  "having trouble connecting",
  "give me just a moment and try again",
];

export function isErrorResponse(content: string): boolean {
  const lower = content.toLowerCase();
  return ERROR_PHRASES.some((p) => lower.includes(p));
}

export const ERROR_QUICK_REPLIES = [
  "Try again",
  "Call (520) 327-6753",
  "Browse services",
  "Help me choose",
];

// ── Context-aware greeting builder ──────────────────────────────────────────
export function buildContextGreeting(ctx: ConciergeContext | null): string {
  if (!ctx?.categories?.length) {
    return "Hey there — welcome to Hush. I'm Luna, your digital concierge.\n\nI know our entire team, every service we offer, and how to get you exactly what you're looking for. Think of me as your personal guide to the salon.\n\nWhat brings you in today?";
  }

  const cats = ctx.categories;
  const sub = ctx.service_subtype;
  const goal = ctx.goal;
  const timing = ctx.timing;
  const timingStr = timing ? (timingLabels[timing] || timing).toLowerCase() : "";

  if (cats.length > 1) {
    const names = formatCategoryList(cats);
    const timingPart = timingStr ? ` ${timingStr}` : "";
    return `You're building a ${names.toLowerCase()} experience${timingPart} — love that. Want me to help map out the best combination, or do you have questions about specific services?`;
  }

  const cat = cats[0];

  if (cat === "hair") {
    if (sub === "color") {
      const goalPart = goal === "transform" ? ", a full transformation" : "";
      const timingPart = timingStr ? ` ${timingStr}` : "";
      return `You're thinking color work${goalPart}${timingPart ? " —" + timingPart : ""}. I can help you understand the process, compare options, or figure out timing. What would be most helpful?`;
    }
    if (sub === "cut") {
      return `Looking for a fresh cut${timingStr ? " " + timingStr : ""}. Want help understanding what our stylists specialize in, or do you have questions about pricing?`;
    }
    if (sub === "both") {
      return `Cut and color together${timingStr ? " — " + timingStr : ""}. That's a great combo. Want me to walk you through what to expect, or help you compare options?`;
    }
    const goalPart = goal ? `, looking for ${(goalLabels[goal] || goal).toLowerCase()}` : "";
    return `You're exploring hair services${goalPart}${timingStr ? " — " + timingStr : ""}. Tell me more — are you thinking a cut, color, or something else?`;
  }

  if (cat === "nails") {
    if (sub === "manicure") return `Thinking about a manicure${timingStr ? " " + timingStr : ""}. Gel or regular? I can walk you through what we offer.`;
    if (sub === "pedicure") return `A pedicure sounds perfect${timingStr ? " for " + timingStr : ""}. Want details on our options, or ready to figure out timing?`;
    if (sub === "full_set") return `Full nail set${timingStr ? " " + timingStr : ""} — great choice. Want to know about gel options, or have questions about pricing?`;
    return `You're looking at nails${timingStr ? " " + timingStr : ""}. I can help you figure out the right service — gel, regular, full set, or nail art?`;
  }

  if (cat === "lashes") {
    if (sub === "full_set") return `Lash full set${timingStr ? " " + timingStr : ""} — exciting! Want me to explain classic vs hybrid vs volume?`;
    if (sub === "fill") return `Lash fill${timingStr ? " " + timingStr : ""}. Quick question — do you know if you have classic, hybrid, or volume?`;
    return `You're exploring lashes${timingStr ? " — " + timingStr : ""}. Are you thinking a full set, fill, or lash lift?`;
  }

  if (cat === "skincare") {
    if (sub === "facial") return `A facial${timingStr ? " " + timingStr : ""} — we have several options from signature to microneedling. What's your skin goal right now?`;
    if (sub === "acne") return `Dealing with breakouts or skin concerns${timingStr ? " — hoping to come in " + timingStr : ""}. Our estheticians are incredible at this. Want me to walk you through options?`;
    return `You're thinking skincare${timingStr ? " " + timingStr : ""}. Are you looking for relaxation, correction, or a glow-up?`;
  }

  if (cat === "massage") {
    if (sub === "relaxation") return `A relaxation massage${timingStr ? " " + timingStr : ""} — that sounds perfect. Are you thinking 60, 90, or 120 minutes?`;
    if (sub === "deep_tissue") return `Deep tissue work${timingStr ? " " + timingStr : ""}. Tammi is amazing at this. Are you thinking 60 or 90 minutes?`;
    return `You're interested in a massage${timingStr ? " — " + timingStr : ""}. Relaxation, deep tissue, or pain relief?`;
  }

  const names = formatCategoryList(cats);
  return `You're exploring ${names.toLowerCase()}${timingStr ? " — " + timingStr : ""}. I know everything about our services and team. What would be most helpful?`;
}

// ── Soft transition for mid-session context changes ─────────────────────────
export function buildContextTransition(ctx: ConciergeContext | null): string {
  if (!ctx?.categories?.length) {
    return "Got it — starting fresh. What would you like to explore?";
  }
  const cats = ctx.categories;
  const sub = ctx.service_subtype;
  const timing = ctx.timing;
  const timingStr = timing ? (timingLabels[timing] || timing).toLowerCase() : "";

  if (cats.length > 1) {
    const names = formatCategoryList(cats);
    return `Switching gears — looks like you're now exploring ${names.toLowerCase()}${timingStr ? " " + timingStr : ""}. What would you like to know?`;
  }

  const cat = cats[0];
  const catLabel = (categoryLabels[cat] || cat).toLowerCase();
  const subDisplay: Record<string, string> = {
    cut: "a cut", color: "color work", both: "cut + color",
    manicure: "a manicure", pedicure: "a pedicure", full_set: "a full set", nail_art: "nail art",
    fill: "a fill", lift: "a lash lift",
    relaxation: "a relaxation massage", deep_tissue: "deep tissue", pain_relief: "pain relief work",
    facial: "a facial", acne: "acne treatment", glow: "a glow treatment",
  };
  const focus = sub && subDisplay[sub] ? subDisplay[sub] : catLabel;
  return `Got it — switching to ${focus}${timingStr ? " " + timingStr : ""}. What would you like to know?`;
}

// ── Persistent quick replies — shown after EVERY Luna response ──────────────
export function getQuickReplies(_ctx: ConciergeContext | null, lastAssistantMsg: string): string[] {
  const lower = (lastAssistantMsg || "").toLowerCase();

  // Service-specific qualifying chips take priority during the discovery turn
  const qualifying = pickQualifyingChips(_ctx, lastAssistantMsg);
  if (qualifying) return qualifying;

  if (lower.includes("price") || lower.includes("cost") || lower.includes("pricing")) {
    return ["I'm ready to book", "Have someone call me", "Help me decide", "Connect me with the team"];
  }
  if (lower.includes("stylist") || lower.includes("artist") || lower.includes("specialist")) {
    return ["I'm ready to book", "Have someone call me", "Help me find the right service", "Connect me with the team"];
  }
  if (lower.includes("event") || lower.includes("wedding") || lower.includes("occasion")) {
    return ["Let's plan my full look", "I'm ready to book", "Have someone call me", "Connect me with the team"];
  }
  if (lower.includes("option") || lower.includes("explore") || lower.includes("browse")) {
    return ["Walk me through options", "I'm ready to book", "Have someone call me", "Connect me with the team"];
  }
  if (lower.includes("recommend") || lower.includes("suggest")) {
    return ["That sounds perfect — book it", "Have someone call me", "Tell me more about that", "Connect me with the team"];
  }
  if (lower.includes("ready") || lower.includes("lock") || lower.includes("reserve") || lower.includes("book")) {
    return ["Let's lock it in", "Have someone call me", "Help me decide", "What will it cost?"];
  }

  return ["I'm ready to book", "Have someone call me", "Help me decide", "Connect me with the team"];
}

// ── Detect intent from assistant message for in-chat CTAs ───────────────────
export function detectChatActions(msg: string, _ctx: ConciergeContext | null): ChatAction[] {
  const lower = msg.toLowerCase();
  const actions: ChatAction[] = [];

  const mentionsFrontDesk = lower.includes("(520) 327-6753") || lower.includes("call us") || lower.includes("front desk") || lower.includes("call kendell") || lower.includes("give them a call");
  if (mentionsFrontDesk) {
    actions.push({ label: "Call (520) 327-6753", type: "phone" });
    actions.push({ label: "Text us", type: "text" });
  }

  if (lower.includes("i'd suggest") || lower.includes("i'd recommend") || lower.includes("great option") || lower.includes("perfect for")) {
    if (!actions.find((a) => a.type === "scroll")) {
      actions.push({ label: "Reserve this service", type: "scroll", target: "callback" });
    }
    if (!mentionsFrontDesk) {
      actions.push({ label: "Build my personalized plan", type: "tab", target: "plan" });
    }
  }

  if (lower.includes("stylist") || lower.includes("specialist") || lower.includes("artist") || lower.includes("our team")) {
    if (!actions.find((a) => a.label.includes("Reserve")) && !mentionsFrontDesk) {
      actions.push({ label: "See our team", type: "tab", target: "artists" });
    }
  }

  if (lower.includes("ready to book") || lower.includes("lock in") || lower.includes("reserve") || lower.includes("help you book")) {
    if (!actions.find((a) => a.type === "callback")) {
      actions.push({ label: "Get a quick call back", type: "callback" });
    }
  }

  if (lower.includes("pricing") || lower.includes("price range") || lower.includes("starts at")) {
    if (!actions.find((a) => a.label.includes("plan")) && actions.length < 3) {
      actions.push({ label: "See my personalized plan", type: "tab", target: "plan" });
    }
  }

  return actions.slice(0, 3);
}

// ── High-intent user phrases that should auto-open the lead form ────────────
export function userHasHighBookingIntent(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const phrases = [
    "i'm ready to book", "im ready to book", "ready to book",
    "let's lock it in", "lets lock it in", "lock it in",
    "have someone call me", "call me back", "get a call back",
    "book it", "book me", "schedule me",
  ];
  return phrases.some((p) => lower === p || lower.includes(p));
}

// ── Initial smart chips for greeting only ───────────────────────────────────
export function getSmartChips(ctx: ConciergeContext | null): string[] {
  if (!ctx?.categories?.length) {
    return [
      "I'm new — what should I know?",
      "What's everyone loving right now?",
      "I have something specific in mind",
    ];
  }

  const cat = ctx.categories[0];
  const sub = ctx.service_subtype;

  if (ctx.categories.length > 1) {
    return [
      "Help me combine these services",
      "How long will everything take?",
      "What's the total cost look like?",
    ];
  }

  if (cat === "hair") {
    if (sub === "color") return [
      "Balayage vs highlights — what's the difference?",
      "How long does color take?",
      "What's the price range for color?",
    ];
    if (sub === "cut") return [
      "What styles are trending right now?",
      "How much is a women's haircut?",
      "Do I need a consultation first?",
    ];
    if (sub === "both") return [
      "How long does cut + color take?",
      "What's the price range?",
      "Do you do consultations?",
    ];
    return [
      "Help me figure out what I need",
      "What's the difference between services?",
      "Show me hair pricing",
    ];
  }

  if (cat === "nails") return [
    "Gel vs regular — what's best?",
    "How long does a full set last?",
    "What's nail pricing like?",
  ];

  if (cat === "lashes") return [
    "Classic vs volume — what's the difference?",
    "How long do lashes last?",
    "What's lash pricing?",
  ];

  if (cat === "skincare") return [
    "Which facial is right for me?",
    "What's the difference between treatments?",
    "What's skincare pricing?",
  ];

  if (cat === "massage") return [
    "60 vs 90 minutes — what do you recommend?",
    "What's massage pricing?",
    "Do you have openings this week?",
  ];

  return [
    "Help me figure out what I need",
    "What's popular right now?",
    "Show me pricing",
  ];
}

// ── Context bar pills ───────────────────────────────────────────────────────
export function getContextPills(ctx: ConciergeContext | null): string[] {
  if (!ctx) return [];
  const pills: string[] = [];
  if (ctx.categories?.length) {
    ctx.categories.forEach((c) => pills.push(categoryLabels[c] || c));
  }
  if (ctx.service_subtype && ctx.service_subtype !== "unsure") {
    const subtypeDisplay: Record<string, string> = {
      cut: "Cut", color: "Color", both: "Cut + Color",
      manicure: "Manicure", pedicure: "Pedicure", full_set: "Full Set", nail_art: "Nail Art",
      fill: "Fill", lift: "Lash Lift",
      relaxation: "Relaxation", deep_tissue: "Deep Tissue", pain_relief: "Pain Relief",
      facial: "Facial", acne: "Acne Treatment", glow: "Glow Treatment",
    };
    pills.push(subtypeDisplay[ctx.service_subtype] || ctx.service_subtype);
  }
  if (ctx.goal) pills.push(goalLabels[ctx.goal] || ctx.goal);
  if (ctx.timing) pills.push(timingLabels[ctx.timing] || ctx.timing);
  return pills;
}

export function getContextFingerprint(ctx: ConciergeContext | null): string {
  if (!ctx) return "none";
  return `${ctx.categories?.join(",") || ""}_${ctx.service_subtype || ""}_${ctx.goal || ""}_${ctx.timing || ""}_${ctx.source || ""}`;
}
