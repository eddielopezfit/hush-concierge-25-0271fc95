import { describe, it, expect } from "vitest";
import {
  buildCategoryPlanItems,
  computePlanTotals,
  buildRevealData,
  deriveBookingMode,
  getBookingModeConfig,
  getSlackChannel,
  type RevealData,
  type CategoryPlanItem,
} from "./experienceReveal";
import type { ConciergeContext } from "@/types/concierge";

const ctx = (overrides: Partial<ConciergeContext> = {}): ConciergeContext => ({
  source: "test",
  categories: ["hair"],
  goal: "refresh",
  timing: null,
  service_subtype: null,
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
  ...overrides,
});

describe("buildCategoryPlanItems", () => {
  it("returns [] when context is null or has no categories", () => {
    expect(buildCategoryPlanItems(null)).toEqual([]);
    expect(buildCategoryPlanItems(ctx({ categories: [] }))).toEqual([]);
  });

  it("uses subtype profile only on the primary category", () => {
    const items = buildCategoryPlanItems(
      ctx({
        categories: ["hair", "nails"],
        primary_category: "hair",
        service_subtype: "color",
      }),
    );
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe("Dimensional Color Experience");
    expect(items[0].consultationRequired).toBe(true);
    // Nails should fall back to goal/category default — not the hair subtype
    expect(items[1].label).not.toBe("Dimensional Color Experience");
  });

  it("falls back to goal label when no subtype is set", () => {
    const items = buildCategoryPlanItems(ctx({ categories: ["nails"], goal: "transform" }));
    expect(items[0].label).toBe("Statement Nail Experience");
  });

  it("ignores 'unsure' subtype and uses default", () => {
    const items = buildCategoryPlanItems(ctx({ categories: ["hair"], service_subtype: "unsure" }));
    expect(items[0].label).not.toContain("Color");
  });
});

describe("computePlanTotals", () => {
  it("returns null for empty items", () => {
    expect(computePlanTotals([])).toBeNull();
  });

  it("sums minutes and prices across items", () => {
    const items: CategoryPlanItem[] = [
      { category: "nails", label: "x", timeEstimate: "30–45 min", priceRange: "$25–$55", consultationRequired: false },
      { category: "lashes", label: "y", timeEstimate: "60 min", priceRange: "$65–$95", consultationRequired: false },
    ];
    const t = computePlanTotals(items);
    expect(t?.timeRange).toBe("1.5 hrs–2 hr");
    expect(t?.priceRange).toBe("$90–$150");
    expect(t?.hasConsultationItem).toBe(false);
  });

  it("converts hour ranges and preserves open-ended '+' pricing", () => {
    const items: CategoryPlanItem[] = [
      { category: "hair", label: "color", timeEstimate: "2–3 hours", priceRange: "$95–$300+", consultationRequired: true },
    ];
    const t = computePlanTotals(items);
    expect(t?.timeRange).toBe("2 hr–3 hr");
    expect(t?.priceRange).toBe("$95–$300+");
    expect(t?.hasConsultationItem).toBe(true);
  });
});

describe("buildRevealData", () => {
  it("returns null for missing/empty context", () => {
    expect(buildRevealData(null)).toBeNull();
    expect(buildRevealData(ctx({ categories: [] }))).toBeNull();
  });

  it("uses subtype profile when available", () => {
    const r = buildRevealData(ctx({ categories: ["hair"], service_subtype: "color" }));
    expect(r?.experienceLabel).toBe("Dimensional Color Experience");
    expect(r?.consultationRequired).toBe(true);
    expect(r?.isMultiService).toBe(false);
  });

  it("builds a multi-service combo label when no subtype", () => {
    const r = buildRevealData(ctx({ categories: ["hair", "nails"], goal: "refresh" }));
    expect(r?.isMultiService).toBe(true);
    expect(r?.experienceLabel).toBe("Hair + Nails Experience");
    expect(r?.priceRange).toMatch(/Most combinations/);
  });

  it("falls back to goal+category label when subtype is unsure", () => {
    const r = buildRevealData(ctx({ categories: ["nails"], service_subtype: "unsure", goal: "transform" }));
    expect(r?.experienceLabel).toBe("Statement Nail Experience");
  });

  it("flags consultation for hair color/both even without explicit profile flag", () => {
    const r = buildRevealData(ctx({ categories: ["hair"], service_subtype: "both" }));
    expect(r?.consultationRequired).toBe(true);
  });
});

describe("deriveBookingMode", () => {
  const reveal = (overrides: Partial<RevealData> = {}): RevealData => ({
    experienceLabel: "x",
    timeEstimate: "60 min",
    priceRange: "$50",
    consultationRequired: false,
    isMultiService: false,
    categories: ["nails"],
    ...overrides,
  });

  it("returns 'consultation' when reveal flag is set", () => {
    expect(deriveBookingMode(reveal({ consultationRequired: true }), ctx())).toBe("consultation");
  });

  it("returns 'consultation' for color/both subtypes", () => {
    expect(deriveBookingMode(reveal(), ctx({ service_subtype: "color" }))).toBe("consultation");
    expect(deriveBookingMode(reveal(), ctx({ service_subtype: "both" }))).toBe("consultation");
  });

  it("returns 'consultation' for multi-service when hair is primary", () => {
    expect(
      deriveBookingMode(
        reveal({ isMultiService: true, categories: ["hair", "nails"] }),
        ctx({ categories: ["hair", "nails"], primary_category: "hair" }),
      ),
    ).toBe("consultation");
  });

  it("matches consultation keywords in service name", () => {
    expect(deriveBookingMode(reveal(), ctx({ item: "Balayage Refresh" }))).toBe("consultation");
    expect(deriveBookingMode(reveal(), ctx({ group: "Vivid color" }))).toBe("consultation");
  });

  it("returns 'direct_or_callback' for nails/lashes/skincare/massage", () => {
    for (const cat of ["nails", "lashes", "skincare", "massage"] as const) {
      expect(deriveBookingMode(reveal({ categories: [cat] }), ctx({ categories: [cat] }))).toBe("direct_or_callback");
    }
  });

  it("falls back to 'guided_front_desk' for plain hair", () => {
    expect(deriveBookingMode(reveal({ categories: ["hair"] }), ctx({ categories: ["hair"] }))).toBe("guided_front_desk");
  });
});

describe("getBookingModeConfig", () => {
  it("returns labeled config per mode", () => {
    expect(getBookingModeConfig("consultation").primaryLabel).toBe("Request Consultation");
    expect(getBookingModeConfig("guided_front_desk").primaryLabel).toBe("Request Callback");
    expect(getBookingModeConfig("direct_or_callback").primaryLabel).toBe("Check Availability");
  });

  it("appends an urgency note for today/week timing", () => {
    expect(getBookingModeConfig("consultation", "today").subcopy).toContain("same-day");
    expect(getBookingModeConfig("guided_front_desk", "week").subcopy).toContain("this week");
    expect(getBookingModeConfig("direct_or_callback", null).subcopy).not.toContain("same-day");
  });
});

describe("getSlackChannel", () => {
  it("maps each category to its slug and defaults to 'leads'", () => {
    expect(getSlackChannel("nails")).toBe("nails");
    expect(getSlackChannel("lashes")).toBe("lashes");
    expect(getSlackChannel("skincare")).toBe("skin");
    expect(getSlackChannel("massage")).toBe("massage");
    expect(getSlackChannel("hair")).toBe("leads");
    expect(getSlackChannel(null)).toBe("leads");
    expect(getSlackChannel(undefined)).toBe("leads");
  });
});
