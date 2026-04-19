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

  describe("edge cases", () => {
    it("preserves duplicate categories (no dedupe — caller controls list)", () => {
      const recs = getCadenceRecommendations(["hair", "hair"]);
      expect(recs).toHaveLength(2);
      expect(recs[0].nextDateRange).toBe(recs[1].nextDateRange);
    });

    it("returns a fresh array on each call (no shared reference)", () => {
      const a = getCadenceRecommendations(["hair"]);
      const b = getCadenceRecommendations(["hair"]);
      expect(a).not.toBe(b);
      expect(a[0]).not.toBe(b[0]);
    });

    it("handles month rollover correctly (Dec → Jan/Feb)", () => {
      vi.setSystemTime(new Date("2026-12-15T12:00:00Z"));
      const [rec] = getCadenceRecommendations(["hair"]); // +6w / +8w
      expect(rec.nextDateRange).toBe("Jan 26 – Feb 9");
    });

    it("handles year rollover end-of-year (lashes 2-3 weeks)", () => {
      vi.setSystemTime(new Date("2026-12-28T12:00:00Z"));
      const [rec] = getCadenceRecommendations(["lashes"]);
      expect(rec.nextDateRange).toBe("Jan 11 – Jan 18");
    });

    it("recommendation order matches input order even when reversed", () => {
      const recs = getCadenceRecommendations(["massage", "skincare", "hair"]);
      expect(recs.map(r => r.category)).toEqual(["massage", "skincare", "hair"]);
    });
  });
});
