/**
 * Luna Voice Bus - Global singleton to enforce single ElevenLabs voice session
 */

// In-memory state (primary)
let voiceActive = false;

// Storage key for cross-tab fallback
const LUNA_VOICE_STATE_KEY = "hush_luna_voice_active";

/**
 * Check if a voice session is currently active
 */
export function getVoiceActive(): boolean {
  // Check in-memory first, then localStorage fallback
  if (voiceActive) return true;
  
  try {
    return sessionStorage.getItem(LUNA_VOICE_STATE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Set the voice active state
 */
export function setVoiceActive(active: boolean): void {
  voiceActive = active;
  
  try {
    if (active) {
      sessionStorage.setItem(LUNA_VOICE_STATE_KEY, "true");
    } else {
      sessionStorage.removeItem(LUNA_VOICE_STATE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Request to start a voice session
 * @param source - Identifier for where the request originated (e.g., "modal", "hero", "widget")
 * @returns true if request was granted (session can start), false if already active
 */
export function requestVoiceStart(source?: string): boolean {
  console.log(`[LunaVoiceBus] requestVoiceStart called from: ${source || "unknown"}`);
  
  if (getVoiceActive()) {
    console.log("[LunaVoiceBus] Voice already active, dispatching luna:voice-already-active");
    window.dispatchEvent(new CustomEvent("luna:voice-already-active", { 
      detail: { source } 
    }));
    return false;
  }
  
  // Grant the request
  setVoiceActive(true);
  console.log("[LunaVoiceBus] Voice start granted, dispatching luna:voice-start-request");
  window.dispatchEvent(new CustomEvent("luna:voice-start-request", { 
    detail: { source } 
  }));
  return true;
}

/**
 * End the current voice session and clear the lock
 */
export function endVoiceSession(): void {
  console.log("[LunaVoiceBus] endVoiceSession called");
  setVoiceActive(false);
  window.dispatchEvent(new CustomEvent("luna:voice-ended"));
}

/**
 * Subscribe to voice state changes
 * Returns an unsubscribe function
 */
export function subscribeToVoiceState(callback: (active: boolean) => void): () => void {
  const handleStart = () => callback(true);
  const handleEnd = () => callback(false);
  const handleAlreadyActive = () => callback(true);
  
  window.addEventListener("luna:voice-start-request", handleStart);
  window.addEventListener("luna:voice-ended", handleEnd);
  window.addEventListener("luna:voice-already-active", handleAlreadyActive);
  
  return () => {
    window.removeEventListener("luna:voice-start-request", handleStart);
    window.removeEventListener("luna:voice-ended", handleEnd);
    window.removeEventListener("luna:voice-already-active", handleAlreadyActive);
  };
}
