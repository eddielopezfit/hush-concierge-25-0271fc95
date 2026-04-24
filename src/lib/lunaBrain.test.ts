import { describe, it, expect } from "vitest";
import { generateRecommendation, generateChatResponse } from "./lunaBrain";
import type { ConciergeContext } from "@/types/concierge";

const ctx = (overrides: Partial<ConciergeContext> = {}): ConciergeContext => ({
  source: "ExperienceFinder",
  categories: ["hair"],
  goal: "refresh",
  timing: "week",
  ...overrides,
});

describe("lunaBrain.generateRecommendation", () => {
  it("never returns a specific artist (neutral guidance)", () => {
    const rec = generateRecommendation(ctx({ categories: ["hair"], goal: "transform" }));
    expect(rec.recommendedArtist).toBeNull();
  });

  it("returns safe defaults when context is null", () => {
    const rec = generateRecommendation(null);
    expect(rec.recommendedArtist).toBeNull();
    expect(rec.recommendedService).toBeTruthy();
    expect(rec.urgency).toBe("medium");
  });

  it("returns safe defaults when context is undefined", () => {
    const rec = generateRecommendation(undefined);
    expect(rec.recommendedArtist).toBeNull();
    expect(rec.urgency).toBe("medium");
  });

  describe("urgency by timing", () => {
    it("today => high", () => {
      expect(generateRecommendation(ctx({ timing: "today" })).urgency).toBe("high");
    });
    it("week => medium", () => {
      expect(generateRecommendation(ctx({ timing: "week" })).urgency).toBe("medium");
    });
    it("planning => low", () => {
      expect(generateRecommendation(ctx({ timing: "planning" })).urgency).toBe("low");
    });
    it("browsing => low", () => {
      expect(generateRecommendation(ctx({ timing: "browsing" })).urgency).toBe("low");
    });
    it("unknown timing => medium", () => {
      expect(generateRecommendation(ctx({ timing: null })).urgency).toBe("medium");
    });
  });

  describe("consultation triggers (high urgency same-day)", () => {
    it("high urgency surfaces direct phone CTA", () => {
      const rec = generateRecommendation(ctx({ timing: "today" }));
      expect(rec.urgency).toBe("high");
      expect(rec.nextStep).toMatch(/\(520\) 327-6753/);
      expect(rec.nextStep.toLowerCase()).toContain("same-day");
    });

    it("multi-category medium urgency mentions multi-service planning", () => {
      const rec = generateRecommendation(
        ctx({ categories: ["hair", "nails"], timing: "week" })
      );
      expect(rec.urgency).toBe("medium");
      expect(rec.nextStep.toLowerCase()).toContain("multi-service");
    });

    it("single category medium urgency suggests booking this week", () => {
      const rec = generateRecommendation(ctx({ timing: "week", categories: ["hair"] }));
      expect(rec.nextStep.toLowerCase()).toContain("this week");
    });

    it("low urgency uses browsing language", () => {
      const rec = generateRecommendation(ctx({ timing: "browsing" }));
      expect(rec.nextStep.toLowerCase()).toMatch(/browse|take your time/);
    });
  });

  describe("service mapping by goal + category", () => {
    it("transform + hair => Expert Color", () => {
      const rec = generateRecommendation(ctx({ goal: "transform", categories: ["hair"] }));
      expect(rec.recommendedService).toBe("Expert Color");
    });

    it("relax + massage => 90 min Massage", () => {
      const rec = generateRecommendation(ctx({ goal: "relax", categories: ["massage"] }));
      expect(rec.recommendedService).toBe("90 min Massage");
    });

    it("event + lashes => Hybrid Lash Set", () => {
      const rec = generateRecommendation(ctx({ goal: "event", categories: ["lashes"] }));
      expect(rec.recommendedService).toBe("Hybrid Lash Set");
    });

    it("subtype overrides goal-based suggestion", () => {
      const rec = generateRecommendation(
        ctx({ goal: "refresh", categories: ["hair"], service_subtype: "color" })
      );
      expect(rec.recommendedService).toBe("Expert Color");
    });

    it("subtype 'unsure' does not override", () => {
      const rec = generateRecommendation(
        ctx({ goal: "refresh", categories: ["hair"], service_subtype: "unsure" })
      );
      expect(rec.recommendedService).toBe("Luxury Wash and Blowout");
    });

    it("uses exact hair service pricing language for Balayage and Foilayage", () => {
      const balayageRec = generateRecommendation(
        ctx({ categories: ["hair"], goal: "transform", item: "Balayage" })
      );
      const foilayageRec = generateRecommendation(
        ctx({ categories: ["hair"], goal: "transform", item: "Foilayage" })
      );

      expect(balayageRec.recommendedService).toBe("Balayage");
      expect(balayageRec.priceRange).toBe("Based on consultation");
      expect(balayageRec.whatToExpect).toContain("we’ll start with a consultation");
      expect(foilayageRec.recommendedService).toBe("Foilayage");
      expect(foilayageRec.priceRange).toBe("Based on consultation");
      expect(foilayageRec.whatToExpect).toContain("we’ll start with a consultation");
    });

    it("adds what-to-expect guidance for other hair and color services", () => {
      const allOverColorRec = generateRecommendation(
        ctx({ categories: ["hair"], item: "All Over Color" })
      );
      const fullWeaveRec = generateRecommendation(
        ctx({ categories: ["hair"], item: "Full Weave" })
      );
      const correctiveRec = generateRecommendation(
        ctx({ categories: ["hair"], item: "Corrective Color" })
      );

      expect(allOverColorRec.whatToExpect).toContain("consultation");
      expect(fullWeaveRec.whatToExpect).toContain("consultation");
      expect(correctiveRec.whatToExpect).toContain("consultation");
      expect(correctiveRec.priceRange).toBe("Based on consultation");
    });

    it("mirrors exact website service copy across all categories when item context exists", () => {
      expect(
        generateRecommendation(ctx({ categories: ["nails"], item: "Manicure w/Gel" }))
      ).toMatchObject({ recommendedService: "Manicure w/Gel", priceRange: "$55+" });

      expect(
        generateRecommendation(ctx({ categories: ["lashes"], item: "Hybrid Lash Set" }))
      ).toMatchObject({ recommendedService: "Hybrid Lash Set", priceRange: "from $220" });

      expect(
        generateRecommendation(ctx({ categories: ["skincare"], item: "Microneedling" }))
      ).toMatchObject({ recommendedService: "Microneedling", priceRange: "from $299" });

      expect(
        generateRecommendation(ctx({ categories: ["massage"], item: "90 min" }))
      ).toMatchObject({ recommendedService: "90 min", priceRange: "from $140" });
    });
  });

  describe("primary_category resolution", () => {
    it("primary_category overrides categories[0]", () => {
      const rec = generateRecommendation(
        ctx({
          categories: ["nails", "hair"],
          primary_category: "hair",
          goal: "transform",
        })
      );
      expect(rec.recommendedService).toBe("Expert Color");
    });

    it("falls back to 'hair' when categories is empty", () => {
      const rec = generateRecommendation(
        ctx({ categories: [], goal: "refresh" })
      );
      expect(rec.recommendedService).toBe("Luxury Wash and Blowout");
    });
  });
});

describe("lunaBrain.generateChatResponse — neutral-guidance fallbacks", () => {
  it("Team Compare source defers to front desk and never names a stylist", () => {
    const reply = generateChatResponse("who is best for color?", ctx({ source: "Team Compare" }));
    expect(reply).toMatch(/front desk/i);
    expect(reply).toMatch(/\(520\) 327-6753/);
    // Should not name specific stylists
    expect(reply).not.toMatch(/\b(Sheri|Danielle|Kathy|Allison|Kendell|Kelli|Anita|Jacky|Tammi)\b/);
  });

  it("never recommends an artist for multi-provider hair questions", () => {
    const reply = generateChatResponse(
      "who should I book for balayage?",
      ctx({ categories: ["hair"], goal: "transform" })
    );
    expect(reply).not.toMatch(/\b(Sheri|Danielle|Kathy|Allison)\b/);
  });

  it("recommend keyword surfaces the recommended service from context", () => {
    const reply = generateChatResponse(
      "what do you recommend?",
      ctx({ categories: ["hair"], goal: "transform", timing: "week" })
    );
    expect(reply).toContain("Expert Color");
  });

  it("price keyword without context returns the general pricing range", () => {
    const reply = generateChatResponse("how much does it cost?", null);
    expect(reply).toMatch(/\$/);
  });

  it("hours keyword returns Tue–Sat schedule", () => {
    const reply = generateChatResponse("what are your hours?", null);
    expect(reply.toLowerCase()).toContain("tuesday");
    expect(reply.toLowerCase()).toContain("saturday");
  });

  it("location keyword returns the address", () => {
    const reply = generateChatResponse("where are you located?", null);
    expect(reply).toMatch(/4635 E Fort Lowell/);
  });

  it("booking keyword always points to the front desk", () => {
    const reply = generateChatResponse("I want to book", null);
    expect(reply).toMatch(/\(520\) 327-6753/);
  });

  it("returns the safe default for unrecognized input", () => {
    const reply = generateChatResponse("asdf qwerty", null);
    expect(reply).toMatch(/here to help/i);
  });

  it("never throws on malformed input", () => {
    expect(() =>
      generateChatResponse(undefined as unknown as string, null)
    ).not.toThrow();
  });
});
