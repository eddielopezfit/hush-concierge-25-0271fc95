import { describe, it, expect } from "vitest";
import { getUpsells } from "./upsellEngine";
import type { ConciergeContext } from "@/types/concierge";

const ctx = (overrides: Partial<ConciergeContext> = {}): ConciergeContext => ({
  source: "ExperienceFinder",
  categories: ["hair"],
  goal: null,
  timing: null,
  ...overrides,
});

describe("upsellEngine.getUpsells", () => {
  describe("empty / safe fallbacks", () => {
    it("returns [] when context is null", () => {
      expect(getUpsells(null)).toEqual([]);
    });
    it("returns [] when context is undefined", () => {
      expect(getUpsells(undefined)).toEqual([]);
    });
    it("returns [] when categories is empty", () => {
      expect(getUpsells(ctx({ categories: [] }))).toEqual([]);
    });
  });

  describe("subtype-specific revenue rules", () => {
    it("hair + color subtype returns color-specific upsells", () => {
      const items = getUpsells(ctx({ categories: ["hair"], service_subtype: "color" }));
      const names = items.map((i) => i.name);
      expect(names).toContain("Conditioning Treatment");
      expect(names).toContain("Brazilian Blowout Split End Treatment");
    });

    it("hair + cut subtype returns cut-specific upsells (blowout + heat)", () => {
      const items = getUpsells(ctx({ categories: ["hair"], service_subtype: "cut" }));
      const names = items.map((i) => i.name);
      expect(names).toContain("Luxury Wash and Blowout");
      expect(names).toContain("Added Heat Style");
    });

    it("subtype 'unsure' falls back to category default", () => {
      const items = getUpsells(ctx({ categories: ["hair"], service_subtype: "unsure" }));
      const names = items.map((i) => i.name);
      expect(names).toContain("Conditioning Treatment");
      expect(names).toContain("Luxury Wash and Blowout");
      expect(names).not.toContain("Brazilian Blowout Split End Treatment");
    });

    it("unknown subtype falls back to category default", () => {
      const items = getUpsells(
        ctx({ categories: ["hair"], service_subtype: "made_up" as never })
      );
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].category).toBe("hair");
    });
  });

  describe("primary_category override", () => {
    it("uses primary_category over categories[0]", () => {
      const items = getUpsells(
        ctx({ categories: ["nails", "hair"], primary_category: "hair" })
      );
      // primary 'hair' surfaces hair upsells; secondary 'nails' adds the gel upgrade
      const names = items.map((i) => i.name);
      expect(names).toContain("Conditioning Treatment");
      expect(names).toContain("Gel Upgrade");
    });
  });

  describe("multi-service: includes secondary categories", () => {
    it("adds one upsell from each secondary category", () => {
      const items = getUpsells(
        ctx({ categories: ["hair", "nails", "lashes"] }),
        10
      );
      const names = items.map((i) => i.name);
      expect(names).toContain("Gel Upgrade"); // from nails
      expect(names).toContain("Lash or Brow Tint"); // from lashes
    });

    it("deduplicates by name across primary and secondary", () => {
      const items = getUpsells(ctx({ categories: ["hair", "hair"] }), 10);
      const names = items.map((i) => i.name);
      const unique = new Set(names);
      expect(unique.size).toBe(names.length);
    });
  });

  describe("max cap", () => {
    it("respects default max of 3", () => {
      const items = getUpsells(ctx({ categories: ["hair", "nails", "lashes", "massage"] }));
      expect(items.length).toBeLessThanOrEqual(3);
    });

    it("respects custom max", () => {
      const items = getUpsells(ctx({ categories: ["hair"] }), 1);
      expect(items.length).toBe(1);
    });
  });

  describe("price format", () => {
    it("all upsells use a +$N price string", () => {
      const items = getUpsells(ctx({ categories: ["hair"] }), 10);
      for (const i of items) {
        expect(i.price).toMatch(/^\+\$\d+$/);
      }
    });
  });

  describe("edge cases", () => {
    it("returns [] for an unknown category with no map entry", () => {
      const items = getUpsells(ctx({ categories: ["unknown" as never] }));
      expect(items).toEqual([]);
    });

    it("max=0 returns an empty array", () => {
      const items = getUpsells(ctx({ categories: ["hair"] }), 0);
      expect(items).toEqual([]);
    });

    it("hair + 'both' subtype returns the bundled cut+color upsells", () => {
      const items = getUpsells(ctx({ categories: ["hair"], service_subtype: "both" }));
      const names = items.map(i => i.name);
      expect(names).toContain("Conditioning Treatment");
      expect(names).toContain("Luxury Wash and Blowout");
    });

    it("primary subtype upsells take precedence over secondary category extras", () => {
      const items = getUpsells(
        ctx({
          categories: ["hair", "nails"],
          primary_category: "hair",
          service_subtype: "color",
        }),
        10,
      );
      // Primary color-specific items first, then secondary nails extras
      expect(items[0].category).toBe("hair");
      const names = items.map(i => i.name);
      expect(names).toContain("Brazilian Blowout Split End Treatment");
      expect(names).toContain("Gel Upgrade");
    });

    it("secondary category with no upsell map entry contributes nothing", () => {
      const items = getUpsells(
        ctx({ categories: ["hair", "unknown" as never] }),
        10,
      );
      // Should still surface hair items, with no errors thrown
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(i => i.category === "hair")).toBe(true);
    });

    it("returns deeply distinct items (different categories not collapsed)", () => {
      const items = getUpsells(
        ctx({ categories: ["nails", "lashes", "massage", "skincare"] }),
        10,
      );
      const cats = new Set(items.map(i => i.category));
      expect(cats.size).toBeGreaterThanOrEqual(3);
    });

    it("dedupes when the same upsell name exists in primary subtype + category fallback chain", () => {
      // 'hair:color' and 'hair' both contain 'Conditioning Treatment'
      const items = getUpsells(
        ctx({ categories: ["hair", "hair"], service_subtype: "color" }),
        10,
      );
      const conditioningCount = items.filter(i => i.name === "Conditioning Treatment").length;
      expect(conditioningCount).toBe(1);
    });
  });
});
