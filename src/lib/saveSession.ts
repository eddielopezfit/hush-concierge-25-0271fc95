import { supabase } from "@/integrations/supabase/client";
import { ConciergeContext } from "@/types/concierge";
import type { Json } from "@/integrations/supabase/types";
import { normalizeTiming, normalizeGoal, normalizeCategory } from "@/lib/conciergeLabels";

/**
 * Save a concierge session to the database.
 * Normalizes context values before persisting.
 * Never throws — returns null on failure.
 */
export async function saveSession(context: ConciergeContext | null | undefined): Promise<string | null> {
  if (!context) {
    console.debug("[saveSession] No context to save, skipping.");
    return null;
  }

  try {
    // Normalize before persisting
    const normalized: ConciergeContext = {
      ...context,
      goal: normalizeGoal(context.goal) ?? context.goal ?? null,
      timing: normalizeTiming(context.timing) ?? context.timing ?? null,
    };

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ context: JSON.parse(JSON.stringify(normalized)) as Json }])
      .select("id")
      .single();

    if (error) {
      console.error("[saveSession] DB error:", error.message, error.code);
      return null;
    }

    console.debug("[saveSession] Session saved:", data.id);
    return data.id;
  } catch (err) {
    console.error("[saveSession] Unexpected error:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Save a lead to the database.
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
  if (!lead.name?.trim() || !lead.phone?.trim()) {
    console.warn("[saveLead] Missing required fields (name/phone), skipping.");
    return false;
  }

  try {
    // Normalize timing if it uses a legacy format
    const normalizedTiming = normalizeTiming(lead.timing) ?? lead.timing ?? null;
    const normalizedGoal = normalizeGoal(lead.goal) ?? lead.goal ?? null;

    // Normalize category list: split comma-separated, normalize each, rejoin
    let normalizedCategory: string | null = null;
    if (lead.category) {
      const parts = lead.category.split(",").map(s => s.trim()).filter(Boolean);
      const normalized = parts.map(p => normalizeCategory(p) ?? p);
      normalizedCategory = normalized.join(", ");
    }

    const { error } = await supabase.from("leads").insert({
      name: lead.name.trim(),
      phone: lead.phone.trim(),
      email: lead.email?.trim() || null,
      category: normalizedCategory,
      goal: normalizedGoal,
      timing: normalizedTiming,
    });

    if (error) {
      console.error("[saveLead] DB error:", error.message, error.code);
      return false;
    }

    console.debug("[saveLead] Lead saved successfully");
    return true;
  } catch (err) {
    console.error("[saveLead] Unexpected error:", err instanceof Error ? err.message : err);
    return false;
  }
}
