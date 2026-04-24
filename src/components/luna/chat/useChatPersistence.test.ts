import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  loadPersistedChat,
  savePersistedChat,
  clearPersistedChat,
  getVisitThreadId,
  setVisitThreadId,
} from "./useChatPersistence";
import type { PersistedChat } from "./types";

const KEY = "hush_luna_chat_v1";
const VISIT_KEY = "hush_luna_visit_thread_id";

const sample = (overrides: Partial<PersistedChat> = {}): PersistedChat => ({
  messages: [
    { id: "m1", role: "assistant", content: "Hi" },
    { id: "m2", role: "user", content: "Hello" },
  ],
  fingerprint: "fp-abc",
  successfulExchangeCount: 2,
  leadCaptured: false,
  leadDismissed: false,
  savedAt: Date.now(),
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-19T10:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useChatPersistence", () => {
  describe("save / load round-trip", () => {
    it("persists and restores chat state", () => {
      const data = sample({ visitThreadId: "thread-123" });
      savePersistedChat(data);
      const restored = loadPersistedChat();
      expect(restored).toEqual(data);
      expect(sessionStorage.getItem(VISIT_KEY)).toBe("thread-123");
    });

    it("returns null when nothing is stored", () => {
      expect(loadPersistedChat()).toBeNull();
    });

    it("returns null and clears storage on malformed JSON", () => {
      localStorage.setItem(KEY, "{not-json");
      expect(loadPersistedChat()).toBeNull();
    });
  });

  describe("24-hour TTL expiry", () => {
    it("returns the chat when within TTL", () => {
      savePersistedChat(sample({ savedAt: Date.now() - 23 * 60 * 60 * 1000 }));
      const restored = loadPersistedChat();
      expect(restored).not.toBeNull();
      expect(restored?.fingerprint).toBe("fp-abc");
    });

    it("returns null and removes the entry when past 24h", () => {
      savePersistedChat(
        sample({ savedAt: Date.now() - (24 * 60 * 60 * 1000 + 1) })
      );
      expect(loadPersistedChat()).toBeNull();
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it("treats missing savedAt as expired", () => {
      localStorage.setItem(
        KEY,
        JSON.stringify({ ...sample(), savedAt: undefined })
      );
      expect(loadPersistedChat()).toBeNull();
      expect(localStorage.getItem(KEY)).toBeNull();
    });

    it("expires after time advances past TTL", () => {
      savePersistedChat(sample());
      expect(loadPersistedChat()).not.toBeNull();
      vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1000);
      expect(loadPersistedChat()).toBeNull();
      expect(localStorage.getItem(KEY)).toBeNull();
    });
  });

  describe("new-chat reset", () => {
    it("clearPersistedChat removes the stored entry", () => {
      savePersistedChat(sample());
      setVisitThreadId("thread-456");
      expect(localStorage.getItem(KEY)).not.toBeNull();
      clearPersistedChat();
      expect(localStorage.getItem(KEY)).toBeNull();
      expect(sessionStorage.getItem(VISIT_KEY)).toBeNull();
      expect(loadPersistedChat()).toBeNull();
    });

    it("clearPersistedChat is a no-op when nothing is stored", () => {
      expect(() => clearPersistedChat()).not.toThrow();
      expect(loadPersistedChat()).toBeNull();
    });

    it("reads and clears the current visit thread id", () => {
      expect(getVisitThreadId()).toBeNull();
      setVisitThreadId("thread-789");
      expect(getVisitThreadId()).toBe("thread-789");
      setVisitThreadId(null);
      expect(getVisitThreadId()).toBeNull();
    });
  });
});
