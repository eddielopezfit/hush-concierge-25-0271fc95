/**
 * Shared Booking Rules — Single Source of Truth
 *
 * Used by: lead-qualify, capture-lead, request-callback, voice-session-log, session-summarize
 * 
 * Consolidates:
 *   - Consultation-required service list
 *   - Booking path routing by category
 *   - Priority scoring
 *   - Slack channel routing
 *
 * SYNC NOTE: If these rules change, update SYSTEM_PROMPT_v5.md Section 8 and
 *            the ElevenLabs agent prompt to match.
 */

// ── Consultation-Required Services ──────────────────────────────────────────

export const CONSULTATION_SERVICES = [
  "balayage",
  "foilayage",
  "corrective color",
  "corrective",
  "fantasy color",
  "vivid color",
  "block color",
  "extensions",
  "hair extensions",
] as const;

export function requiresConsultation(service: string | null): boolean {
  if (!service) return false;
  const lower = service.toLowerCase();
  return CONSULTATION_SERVICES.some((s) => lower.includes(s));
}

// ── Booking Path by Category ────────────────────────────────────────────────

export type BookingPath = "front_desk" | "direct" | "consultation";
export type Priority = "P1" | "P2" | "P3" | "P4";

export interface RoutingRule {
  booking_path: BookingPath;
  action_owner: string;
  consultation_required?: boolean;
}

/** Operational routing rules — NO direct phone numbers exposed to guests. */
export const BOOKING_RULES: Record<string, RoutingRule> = {
  hair: {
    booking_path: "front_desk",
    action_owner: "Kendell / Front Desk",
    consultation_required: false,
  },
  nails: {
    booking_path: "direct",
    action_owner: "Nail Team",
  },
  lashes: {
    booking_path: "direct",
    action_owner: "Allison Griessel",
  },
  skincare: {
    booking_path: "direct",
    action_owner: "Skincare Specialist",
  },
  massage: {
    booking_path: "direct",
    action_owner: "Tammi",
  },
};

/** Internal-only booking path display (for Slack messages, NOT guest-facing). */
export const INTERNAL_BOOKING_PATHS: Record<string, string> = {
  hair:     "Front Desk: (520) 327-6753",
  nails:    "Direct: Anita (520) 591-0208 · Kelly (520) 488-7149 · Jackie (520) 501-6861",
  lashes:   "Direct: Allison (520) 250-6606",
  skincare: "Direct: Patty (520) 870-6048 · Lori (520) 400-5091",
  massage:  "Direct: Tammi (520) 370-3018",
};

export function getInternalBookingPath(category?: string | null): string {
  return INTERNAL_BOOKING_PATHS[category?.toLowerCase() ?? ""] || INTERNAL_BOOKING_PATHS.hair;
}

export function getRoutingRule(category?: string | null): RoutingRule {
  return BOOKING_RULES[category?.toLowerCase() ?? ""] || BOOKING_RULES.hair;
}

// ── Internal Routing Suggestion (for Slack/ops) ─────────────────────────────

export function deriveInternalRouting(
  category: string | null,
  service: string | null
): string {
  const rule = getRoutingRule(category);

  if (requiresConsultation(service)) {
    return `Route to Kendell for consultation booking. Service "${service}" requires in-person evaluation before pricing.`;
  }

  if (rule.booking_path === "direct") {
    const path = getInternalBookingPath(category);
    return `${path}. Action owner: ${rule.action_owner}.`;
  }

  return `Route to Kendell / Front Desk at (520) 327-6753. Action owner: ${rule.action_owner}.`;
}

// ── Priority Scoring ────────────────────────────────────────────────────────

export function derivePriority(
  urgency: string | null,
  callbackRequested: boolean,
  consultationRequired: boolean,
  intentScore: number
): Priority {
  if (callbackRequested) return "P1";
  if (urgency === "today") return "P1";
  if (consultationRequired && urgency === "week") return "P1";
  if (intentScore >= 80) return "P1";
  if (urgency === "week" || urgency === "this week" || intentScore >= 60) return "P2";
  if (urgency === "planning" || intentScore >= 40) return "P3";
  return "P4";
}

// ── Slack Channel Routing ───────────────────────────────────────────────────

export type SlackChannel = "callbacks" | "leads" | "nails" | "lashes" | "skin" | "massage" | "voice";

export function resolveSlackChannel(
  category: string | null,
  callbackRequested: boolean,
): SlackChannel {
  if (callbackRequested) return "callbacks";
  const cat = category?.toLowerCase();
  switch (cat) {
    case "nails":    return "nails";
    case "lashes":   return "lashes";
    case "skincare": return "skin";
    case "massage":  return "massage";
    default:         return "leads";
  }
}

// ── Category Detection (from transcript text) ───────────────────────────────

export function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("hair") || lower.includes("color") || lower.includes("cut") || lower.includes("blowout") || lower.includes("balayage")) return "hair";
  if (lower.includes("nail") || lower.includes("manicure") || lower.includes("pedicure")) return "nails";
  if (lower.includes("lash")) return "lashes";
  if (lower.includes("facial") || lower.includes("skin") || lower.includes("spray tan")) return "skincare";
  if (lower.includes("massage")) return "massage";
  return null;
}

// ── Urgency Detection (from transcript text) ────────────────────────────────

export function detectUrgency(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("today") || lower.includes("right now") || lower.includes("asap")) return "today";
  if (lower.includes("this week") || lower.includes("soon")) return "week";
  if (lower.includes("planning") || lower.includes("next month")) return "planning";
  return "browsing";
}

// ── High-Intent Signal Detection ────────────────────────────────────────────

export const HIGH_INTENT_SIGNALS = [
  "book", "appointment", "schedule", "call me", "callback",
  "phone number", "available", "availability", "openings",
  "price", "how much", "cost", "consultation",
  "when can", "next opening", "today", "asap",
  "my number is", "call back", "reach me",
] as const;

export function isHighIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return HIGH_INTENT_SIGNALS.some((s) => lower.includes(s));
}

// ── Slack Priority Display ──────────────────────────────────────────────────

export const PRIORITY_EMOJI: Record<Priority, string> = {
  P1: "🔴", P2: "🟠", P3: "🟡", P4: "⚪",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  P1: "HIGH PRIORITY", P2: "MEDIUM", P3: "STANDARD", P4: "LOW",
};

export function getUrgencyAction(priority: Priority): string {
  if (priority === "P1") return "🚨 *Action:* @Kendell — Call within 10 minutes";
  if (priority === "P2") return "⏰ *Action:* @Kendell — Follow up today";
  return "📋 *Action:* @Kendell — Add to follow-up queue";
}
