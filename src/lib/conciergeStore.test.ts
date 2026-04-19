import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getConciergeContext,
  setConciergeContext,
  clearConciergeContext,
  mergeConciergeContext,
  getOrCreateSessionId,
  setGuestFirstName,
  getGuestFirstName,
  buildDynamicVariables,
  buildLunaFirstMessage,
} from "./conciergeStore";
import type { ConciergeContext } from "@/types/concierge";

const STORAGE_KEY = "hush_concierge_context";
const STORAGE_TS_KEY = "hush_concierge_context_ts";
const TTL_MS = 24 * 60 * 60 * 1000;

const baseCtx: ConciergeContext = {
  source: "find_your_experience",
  categories: ["hair"],
  goal: "Refresh",
  timing: "This week",
  service_subtype: "cut",
  primary_category: null,
  multi_service_mode: null,
  is_multi_service: false,
  is_new_client: null,
  budget_sensitivity: null,
  preferredArtist: null,
  preferredArtistId: null,
  category: null,
  group: null,
  item: null,
  price: null,
};

describe("conciergeStore — persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it("returns null when no context stored", () => {
    expect(getConciergeContext()).toBeNull();
  });

  it("persists and reads back a context", () => {
    setConciergeContext(baseCtx);
    expect(getConciergeContext()).toEqual(baseCtx);
    expect(localStorage.getItem(STORAGE_TS_KEY)).not.toBeNull();
  });

  it("clearConciergeContext removes the stored value", () => {
    setConciergeContext(baseCtx);
    clearConciergeContext();
    expect(getConciergeContext()).toBeNull();
  });

  it("returns null and clears storage when context is older than TTL", () => {
    setConciergeContext(baseCtx);
    // Backdate the timestamp past the TTL
    localStorage.setItem(STORAGE_TS_KEY, String(Date.now() - TTL_MS - 1000));
    expect(getConciergeContext()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_TS_KEY)).toBeNull();
  });

  it("returns context when within TTL window", () => {
    setConciergeContext(baseCtx);
    localStorage.setItem(STORAGE_TS_KEY, String(Date.now() - (TTL_MS - 60_000)));
    expect(getConciergeContext()).not.toBeNull();
  });

  it("returns null on malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    localStorage.setItem(STORAGE_TS_KEY, String(Date.now()));
    expect(getConciergeContext()).toBeNull();
  });
});

describe("conciergeStore — mergeConciergeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("creates a complete context from a partial when nothing exists", () => {
    const merged = mergeConciergeContext({ categories: ["nails"], source: "luna_chat" });
    expect(merged.categories).toEqual(["nails"]);
    expect(merged.source).toBe("luna_chat");
    expect(merged.goal).toBeNull();
    expect(merged.is_multi_service).toBe(false);
  });

  it("merges new fields onto existing context without losing prior values", () => {
    setConciergeContext(baseCtx);
    const merged = mergeConciergeContext({ goal: "Transform" });
    expect(merged.goal).toBe("Transform");
    expect(merged.categories).toEqual(["hair"]);
    expect(merged.service_subtype).toBe("cut");
  });

  it("allows explicit null overrides (distinguishes undefined from null)", () => {
    setConciergeContext(baseCtx);
    const merged = mergeConciergeContext({ goal: null });
    expect(merged.goal).toBeNull();
    expect(merged.timing).toBe("This week"); // untouched
  });

  it("persists merged result to storage", () => {
    mergeConciergeContext({ categories: ["lashes"] });
    const stored = getConciergeContext();
    expect(stored?.categories).toEqual(["lashes"]);
  });
});

describe("conciergeStore — session id & guest name", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("creates and reuses the same session id", () => {
    const id1 = getOrCreateSessionId();
    const id2 = getOrCreateSessionId();
    expect(id1).toMatch(/^sess_\d+_[a-z0-9]+$/);
    expect(id2).toBe(id1);
  });

  it("stores only the first name", () => {
    setGuestFirstName("Charly Garcia");
    expect(getGuestFirstName()).toBe("Charly");
  });

  it("ignores empty/whitespace name input", () => {
    setGuestFirstName("   ");
    expect(getGuestFirstName()).toBe("");
  });
});

describe("conciergeStore — buildDynamicVariables", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("returns empty-ish defaults when ctx is null", () => {
    const vars = buildDynamicVariables(null);
    expect(vars.service_category).toBe("");
    expect(vars.source_entry).toBe("find_your_experience");
    expect(vars.is_multi_service).toBe("false");
    expect(vars.session_id).toMatch(/^sess_/);
  });

  it("populates labels from a single-category hair context", () => {
    setGuestFirstName("Charly");
    const vars = buildDynamicVariables(baseCtx);
    expect(vars.first_name).toBe("Charly");
    expect(vars.service_category.toLowerCase()).toContain("hair");
    expect(vars.selected_goal).toBeTruthy();
    expect(vars.selected_timing).toBeTruthy();
    expect(vars.luna_context_summary).toContain("Charly");
  });

  it("flags multi-service contexts and downgrades confidence", () => {
    const vars = buildDynamicVariables({
      ...baseCtx,
      categories: ["hair", "nails"],
      is_multi_service: true,
      multi_service_mode: "bundle_guidance",
      service_subtype: null,
    });
    expect(vars.is_multi_service).toBe("true");
    expect(vars.multi_service_mode).toBe("bundle_guidance");
    expect(vars.recommendation_confidence).toBe("low");
  });
});
