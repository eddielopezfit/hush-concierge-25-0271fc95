import { describe, it, expect } from "vitest";
import {
  categoryLabels,
  goalLabels,
  timingLabels,
  VALID_TIMINGS,
  VALID_GOALS,
  VALID_CATEGORIES,
  normalizeTiming,
  normalizeGoal,
  normalizeCategory,
  formatCategoryList,
  getLabel,
} from "./conciergeLabels";

describe("conciergeLabels - constants", () => {
  it("exposes a label for every valid category", () => {
    VALID_CATEGORIES.forEach((c) => {
      expect(categoryLabels[c]).toBeTruthy();
    });
  });

  it("exposes a label for every valid goal", () => {
    VALID_GOALS.forEach((g) => {
      expect(goalLabels[g]).toBeTruthy();
    });
  });

  it("exposes a label for every valid timing", () => {
    VALID_TIMINGS.forEach((t) => {
      expect(timingLabels[t]).toBeTruthy();
    });
  });
});

describe("normalizeTiming", () => {
  it("returns null for empty / nullish inputs", () => {
    expect(normalizeTiming(null)).toBeNull();
    expect(normalizeTiming(undefined)).toBeNull();
    expect(normalizeTiming("")).toBeNull();
  });

  it("normalizes canonical values", () => {
    expect(normalizeTiming("today")).toBe("today");
    expect(normalizeTiming("week")).toBe("week");
    expect(normalizeTiming("planning")).toBe("planning");
    expect(normalizeTiming("browsing")).toBe("browsing");
  });

  it("normalizes legacy / display variants", () => {
    expect(normalizeTiming("This Week")).toBe("week");
    expect(normalizeTiming("this-week")).toBe("week");
    expect(normalizeTiming("  Planning Ahead  ")).toBe("planning");
    expect(normalizeTiming("Just Browsing")).toBe("browsing");
  });

  it("returns null for unknown values", () => {
    expect(normalizeTiming("someday")).toBeNull();
  });
});

describe("normalizeGoal", () => {
  it("returns null for empty / nullish inputs", () => {
    expect(normalizeGoal(null)).toBeNull();
    expect(normalizeGoal(undefined)).toBeNull();
    expect(normalizeGoal("")).toBeNull();
  });

  it("normalizes canonical goals", () => {
    expect(normalizeGoal("refresh")).toBe("refresh");
    expect(normalizeGoal("RELAX")).toBe("relax");
    expect(normalizeGoal("  transform ")).toBe("transform");
    expect(normalizeGoal("event")).toBe("event");
  });

  it("maps event-ready → event", () => {
    expect(normalizeGoal("event-ready")).toBe("event");
  });

  it("returns null for unknown goals", () => {
    expect(normalizeGoal("party")).toBeNull();
  });
});

describe("normalizeCategory", () => {
  it("returns null for empty / nullish inputs", () => {
    expect(normalizeCategory(null)).toBeNull();
    expect(normalizeCategory(undefined)).toBeNull();
    expect(normalizeCategory("")).toBeNull();
  });

  it("normalizes canonical categories", () => {
    expect(normalizeCategory("hair")).toBe("hair");
    expect(normalizeCategory("NAILS")).toBe("nails");
    expect(normalizeCategory(" Lashes ")).toBe("lashes");
    expect(normalizeCategory("skincare")).toBe("skincare");
    expect(normalizeCategory("massage")).toBe("massage");
  });

  it("maps legacy massage variants", () => {
    expect(normalizeCategory("massage-therapy")).toBe("massage");
    expect(normalizeCategory("Massage Therapy")).toBe("massage");
  });

  it("returns null for unknown categories", () => {
    expect(normalizeCategory("waxing")).toBeNull();
  });
});

describe("formatCategoryList", () => {
  it("returns empty string for empty / nullish inputs", () => {
    expect(formatCategoryList([])).toBe("");
    expect(formatCategoryList(null as unknown as never)).toBe("");
  });

  it("renders single category", () => {
    expect(formatCategoryList(["hair"])).toBe("Hair");
  });

  it("renders two categories with 'and'", () => {
    expect(formatCategoryList(["hair", "nails"])).toBe("Hair and Nails");
  });

  it("renders three+ with Oxford comma", () => {
    expect(formatCategoryList(["hair", "nails", "lashes"])).toBe(
      "Hair, Nails, and Lashes",
    );
    expect(formatCategoryList(["hair", "nails", "lashes", "massage"])).toBe(
      "Hair, Nails, Lashes, and Massage",
    );
  });
});

describe("getLabel", () => {
  it("returns canonical labels for known values", () => {
    expect(getLabel("category", "hair")).toBe("Hair");
    expect(getLabel("goal", "relax")).toBe("Relax");
    expect(getLabel("timing", "week")).toBe("This week");
  });

  it("falls back to the raw value when unknown", () => {
    expect(getLabel("category", "waxing")).toBe("waxing");
    expect(getLabel("goal", "party")).toBe("party");
    expect(getLabel("timing", "someday")).toBe("someday");
  });
});
