import type { PersistedChat } from "./types";

const CHAT_STORAGE_KEY = "hush_luna_chat_v1";
const CHAT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function loadPersistedChat(): PersistedChat | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedChat;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > CHAT_TTL_MS) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePersistedChat(data: PersistedChat): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function clearPersistedChat(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
