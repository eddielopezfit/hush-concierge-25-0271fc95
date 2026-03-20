import { supabase } from "@/integrations/supabase/client";
import { ConciergeContext } from "@/types/concierge";

export async function saveSession(context: ConciergeContext): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert([{ context: context as unknown as Record<string, unknown> }])
      .select("id")
      .single();

    if (error) {
      console.error("[saveSession] Error saving session:", error.message);
      return null;
    }

    console.log("[saveSession] Session saved:", data.id);
    return data.id;
  } catch (err) {
    console.error("[saveSession] Unexpected error:", err);
    return null;
  }
}

export async function saveLead(lead: {
  name: string;
  phone: string;
  email?: string;
  category?: string;
  goal?: string;
  timing?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("leads").insert({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || null,
      category: lead.category || null,
      goal: lead.goal || null,
      timing: lead.timing || null,
    });

    if (error) {
      console.error("[saveLead] Error saving lead:", error.message);
      return false;
    }

    console.log("[saveLead] Lead saved successfully");
    return true;
  } catch (err) {
    console.error("[saveLead] Unexpected error:", err);
    return false;
  }
}
