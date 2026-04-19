import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCadenceRecommendations } from "./cadenceEngine";
import type { ServiceCategoryId } from "@/types/concierge";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-19T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("cadenceEngine.getCadenceRecommendations", () => {
  it("returns an empty list for no categories", () => {
    expect(getCadenceRecommendations([])).toEqual([]);
  });

  it("returns one recommendation per category in order", () => {
    const recs = getCadenceRecommendations(["hair", "nails", "lashes"]);
    expect(recs.map((r) => r.category)).toEqual(["hair", "nails", "lashes"]);
  });

  describe("retention intervals per service", () => {
    const cases: Array<[ServiceCategoryId, [number, number], string]> = [
      ["hair", [6, 8], "Hair"],
      ["lashes", [2, 3], "Lashes"],
      ["nails", [2, 4], "Nails"],
      ["skincare", [4, 6], "Skincare"],
      ["massage", [2, 4], "Massage"],
    ];

    it.each(cases)("%s -> weeks %s, label %s", (cat, weeks, label) => {
      const [rec] = getCadenceRecommendations([cat]);
      expect(rec.intervalWeeks).toEqual(weeks);
      expect(rec.label).toBe(label);
    });
  });

  it("computes a future date range based on interval weeks (hair = 6–8 weeks)", () => {
    const [rec] = getCadenceRecommendations(["hair"]);
    // 2026-04-19 + 6w = May 31, +8w = Jun 14
    expect(rec.nextDateRange).toBe("May 31 – Jun 14");
  });

  it("computes nails range (2–4 weeks from now)", () => {
    const [rec] = getCadenceRecommendations(["nails"]);
    // 2026-04-19 + 2w = May 3, +4w = May 17
    expect(rec.nextDateRange).toBe("May 3 – May 17");
  });

  it("date range format is consistent across all categories", () => {
    const recs = getCadenceRecommendations(["hair", "lashes", "nails", "skincare", "massage"]);
    for (const r of recs) {
      expect(r.nextDateRange).toMatch(/^[A-Z][a-z]{2} \d{1,2} – [A-Z][a-z]{2} \d{1,2}$/);
    }
  });
});
