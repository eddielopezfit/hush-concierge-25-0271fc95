import type { PersistedChat } from "./types";

const CHAT_STORAGE_KEY = "hush_luna_chat_v1";
const VISIT_THREAD_KEY = "hush_luna_visit_thread_id";
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
    if (data.visitThreadId) {
      sessionStorage.setItem(VISIT_THREAD_KEY, data.visitThreadId);
    }
  } catch {
    /* ignore */
  }
}

export function getVisitThreadId(): string | null {
  try {
    return sessionStorage.getItem(VISIT_THREAD_KEY);
  } catch {
    return null;
  }
}

export function setVisitThreadId(threadId: string | null | undefined): void {
  try {
    if (threadId) sessionStorage.setItem(VISIT_THREAD_KEY, threadId);
    else sessionStorage.removeItem(VISIT_THREAD_KEY);
  } catch {
    /* ignore */
  }
}

export function clearVisitThreadId(): void {
  try {
    sessionStorage.removeItem(VISIT_THREAD_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPersistedChat(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    sessionStorage.removeItem(VISIT_THREAD_KEY);
  } catch {
    /* ignore */
  }
}
