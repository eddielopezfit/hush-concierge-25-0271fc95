import { ConciergeContext } from "@/types/concierge";
import type { Json } from "@/integrations/supabase/types";
import { normalizeTiming, normalizeGoal, normalizeCategory } from "@/lib/conciergeLabels";

const SUBMIT_LEAD_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`;

/**
 * Save a concierge session to the database via edge function.
 * Never throws — returns null on failure.
 */
export async function saveSession(context: ConciergeContext | null | undefined): Promise<string | null> {
  // Sessions are now handled by session-start edge function.
  // This function is kept for backward compatibility but is a no-op.
  console.debug("[saveSession] Sessions now managed by session-start edge function.");
  return null;
}

/**
 * Save a lead to the database via edge function.
 * Normalizes category and timing values before persisting.
 * Never throws — returns false on failure.
 */
export async function saveLead(lead: {
  name: string;
  phone: string;
  email?: string;
  category?: string;
  goal?: string;
  timing?: string;
}): Promise<boolean> {
  const hasPhone = lead.phone?.trim();
  const hasEmail = lead.email?.trim();
  if (!lead.name?.trim() || (!hasPhone && !hasEmail)) {
    console.warn("[saveLead] Missing required fields (name + phone or email), skipping.");
    return false;
  }

  try {
    const normalizedTiming = normalizeTiming(lead.timing) ?? lead.timing ?? null;
    const normalizedGoal = normalizeGoal(lead.goal) ?? lead.goal ?? null;

    let normalizedCategory: string | null = null;
    if (lead.category) {
      const parts = lead.category.split(",").map(s => s.trim()).filter(Boolean);
      const normalized = parts.map(p => normalizeCategory(p) ?? p);
      normalizedCategory = normalized.join(", ");
    }

    const resp = await fetch(SUBMIT_LEAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        type: "lead",
        name: lead.name.trim(),
        phone: lead.phone.trim(),
        email: lead.email?.trim() || null,
        category: normalizedCategory,
        goal: normalizedGoal,
        timing: normalizedTiming,
      }),
    });

    if (!resp.ok) {
      console.error("[saveLead] Edge function error:", resp.status);
      return false;
    }

    console.debug("[saveLead] Lead saved successfully");
    return true;
  } catch (err) {
    console.error("[saveLead] Unexpected error:", err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Submit a callback request via edge function.
 * Never throws — returns false on failure.
 */
export async function saveCallbackRequest(data: {
  full_name: string;
  phone: string;
  email?: string;
  interested_in?: string;
  timing?: string;
  message?: string;
  source?: string;
  concierge_context?: any;
}): Promise<boolean> {
  if (!data.full_name?.trim() || !data.phone?.trim()) {
    console.warn("[saveCallbackRequest] Missing required fields, skipping.");
    return false;
  }

  try {
    const resp = await fetch(SUBMIT_LEAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        type: "callback",
        ...data,
      }),
    });

    if (!resp.ok) {
      console.error("[saveCallbackRequest] Edge function error:", resp.status);
      return false;
    }

    console.debug("[saveCallbackRequest] Callback request saved successfully");
    return true;
  } catch (err) {
    console.error("[saveCallbackRequest] Unexpected error:", err instanceof Error ? err.message : err);
    return false;
  }
}
