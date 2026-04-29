/**
 * Cross-session leakage safeguard for journeyContext.
 *
 * The client tags every journeyContext payload with a header line:
 *
 *   [session:<conversation_id>]
 *   <…rest of the journey summary…>
 *
 * This verifier ensures the tag matches the current `conversation_id` before
 * the rest of the pipeline (pricing scope inference, recommendation re-use,
 * etc.) trusts any of it. If the tag is missing or doesn't match, the
 * journey context is dropped entirely so a stale, cached, or spoofed
 * payload from another session can't influence this turn's answer.
 *
 * Status values:
 *   - "match"            tag present and equals conversation_id → trusted
 *   - "mismatch"         tag present but ≠ conversation_id      → DROP
 *   - "missing_tag"      conversation_id supplied but no tag    → DROP
 *   - "no_session"       no conversation_id → keep as-is (anonymous turn,
 *                        no leakage risk because there is no session to
 *                        leak across)
 *   - "empty"            empty/undefined journeyContext         → no-op
 */
export type JourneyVerifyStatus =
  | "match"
  | "mismatch"
  | "missing_tag"
  | "no_session"
  | "empty";

const TAG_RE = /^\s*\[session:([^\]\n]+)\]\s*\n?/;

export function verifyJourneyContext(
  rawJourneyContext: string | null | undefined,
  conversationId: string | null | undefined,
): { journeyContext: string; status: JourneyVerifyStatus } {
  const raw = (rawJourneyContext ?? "").trim();
  if (!raw) return { journeyContext: "", status: "empty" };

  const match = TAG_RE.exec(raw);
  const stripped = match ? raw.replace(TAG_RE, "").trim() : raw;

  // No active session → can't leak across sessions; pass through whatever
  // the client sent (with any tag stripped so it doesn't leak into prompts).
  if (!conversationId) {
    return { journeyContext: stripped, status: "no_session" };
  }

  if (!match) {
    // Session exists but client didn't stamp the payload → untrusted.
    return { journeyContext: "", status: "missing_tag" };
  }

  const taggedId = match[1].trim();
  if (taggedId !== conversationId) {
    return { journeyContext: "", status: "mismatch" };
  }

  return { journeyContext: stripped, status: "match" };
}