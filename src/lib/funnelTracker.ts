/**
 * Funnel Tracker — fire-and-forget event logging for conversion funnels.
 *
 * Posts to the `track-event` edge function which writes to public.funnel_events.
 * Uses navigator.sendBeacon when available so events fire reliably even on
 * tab close (e.g. for "abandoned" events). Never throws, never blocks the UI.
 *
 * Privacy: only a per-tab anonymous session id is sent. No PII.
 */

const SESSION_KEY = "hush_funnel_session_id";
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function detectSource(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Mobi|Mobile/i.test(ua)) return "mobile_other";
  return "desktop";
}

export type HairstylePreviewStep =
  | "started"
  | "upload_success"
  | "upload_failed"
  | "style_selected"
  | "preview_shown"
  | "preview_failed"
  | "color_iterated"
  | "saved_look"
  | "converted"
  | "abandoned";

export interface TrackOptions {
  /** When true, use sendBeacon — survives tab close. */
  beacon?: boolean;
  /** Free-form metadata. Kept under 4 KB serialized server-side. */
  metadata?: Record<string, unknown>;
}

/**
 * Track a single funnel event. Always resolves — failures are swallowed.
 */
export function trackFunnelEvent(
  funnel: "hairstyle_preview",
  step: HairstylePreviewStep,
  options: TrackOptions = {},
): void {
  if (typeof window === "undefined") return;

  const payload = {
    funnel,
    step,
    session_id: getSessionId(),
    source: detectSource(),
    metadata: options.metadata ?? {},
  };

  try {
    if (options.beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      // sendBeacon doesn't accept custom headers, so we can't include the
      // anon key. The edge function still validates origin via CORS, which
      // is sufficient for anonymous tracking.
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }

    void fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ANON_KEY ? { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* swallow — analytics never breaks UX */
    });
  } catch {
    /* swallow */
  }
}

/** Convenience: read the current funnel session id (for debugging / linking). */
export function getFunnelSessionId(): string {
  return getSessionId();
}