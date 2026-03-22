import { ConciergeContext } from "@/types/concierge";

const SESSION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/session-start`;
const CONVERSATION_KEY = "hush_conversation_id";
const GUEST_PROFILE_KEY = "hush_guest_profile_id";
const FINGERPRINT_KEY = "hush_fingerprint";

/**
 * Generate a simple browser fingerprint.
 * Not crypto-grade — just stable enough to detect returning guests.
 */
function generateFingerprint(): string {
  try {
    const existing = localStorage.getItem(FINGERPRINT_KEY);
    if (existing) return existing;

    const parts = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset().toString(),
    ];
    // Simple hash
    let hash = 0;
    const str = parts.join("|");
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const fp = `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
    localStorage.setItem(FINGERPRINT_KEY, fp);
    return fp;
  } catch {
    return `fp_fallback_${Date.now().toString(36)}`;
  }
}

export interface SessionStartResult {
  conversation_id: string;
  guest_profile_id: string;
  is_returning: boolean;
  visit_count: number;
}

/**
 * Call the session-start edge function.
 * Stores conversation_id in sessionStorage for use by chat.
 */
export async function startSession(
  context: ConciergeContext | null,
  channel: string = "chat",
  firstName?: string,
): Promise<SessionStartResult | null> {
  try {
    const fingerprint = generateFingerprint();

    const resp = await fetch(SESSION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        fingerprint,
        concierge_context: context,
        channel,
        first_name: firstName || undefined,
      }),
    });

    if (!resp.ok) {
      console.error("[sessionManager] session-start failed:", resp.status);
      return null;
    }

    const data: SessionStartResult = await resp.json();
    sessionStorage.setItem(CONVERSATION_KEY, data.conversation_id);
    sessionStorage.setItem(GUEST_PROFILE_KEY, data.guest_profile_id);

    console.debug("[sessionManager] session started:", {
      conversation_id: data.conversation_id,
      is_returning: data.is_returning,
      visit_count: data.visit_count,
    });

    return data;
  } catch (err) {
    console.error("[sessionManager] error:", err);
    return null;
  }
}

/**
 * Get the current conversation_id from sessionStorage.
 */
export function getConversationId(): string | null {
  try {
    return sessionStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

/**
 * Get the current guest_profile_id from sessionStorage.
 */
export function getGuestProfileId(): string | null {
  try {
    return sessionStorage.getItem(GUEST_PROFILE_KEY);
  } catch {
    return null;
  }
}
