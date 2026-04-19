import { describe, it, expect } from "vitest";
import {
  buildContextGreeting,
  userHasHighBookingIntent,
  getQuickReplies,
  getSmartChips,
  detectChatActions,
  isErrorResponse,
  getContextPills,
  getContextFingerprint,
} from "./chatActionDetectors";
import type { ConciergeContext } from "@/types/concierge";

const ctx = (overrides: Partial<ConciergeContext> = {}): ConciergeContext => ({
  source: "chat",
  categories: [],
  goal: null,
  timing: null,
  ...overrides,
});

describe("buildContextGreeting", () => {
  it("returns the default welcome when context is null or empty", () => {
    expect(buildContextGreeting(null)).toMatch(/welcome to Hush/i);
    expect(buildContextGreeting(ctx())).toMatch(/welcome to Hush/i);
  });

  it("acknowledges multi-category intent with timing", () => {
    const result = buildContextGreeting(
      ctx({ categories: ["hair", "nails"], timing: "this_week" })
    );
    expect(result).toMatch(/hair.*nail/i);
    expect(result.toLowerCase()).toContain("experience");
  });

  it("specializes for hair color with transform goal", () => {
    const result = buildContextGreeting(
      ctx({ categories: ["hair"], service_subtype: "color", goal: "transform" })
    );
    expect(result.toLowerCase()).toContain("color");
    expect(result.toLowerCase()).toContain("transformation");
  });

  it("specializes for nails / lashes / skincare / massage subtypes", () => {
    expect(buildContextGreeting(ctx({ categories: ["nails"], service_subtype: "manicure" })))
      .toMatch(/manicure/i);
    expect(buildContextGreeting(ctx({ categories: ["lashes"], service_subtype: "fill" })))
      .toMatch(/fill/i);
    expect(buildContextGreeting(ctx({ categories: ["skincare"], service_subtype: "facial" })))
      .toMatch(/facial/i);
    expect(buildContextGreeting(ctx({ categories: ["massage"], service_subtype: "deep_tissue" })))
      .toMatch(/deep tissue/i);
  });
});

describe("userHasHighBookingIntent", () => {
  it("matches canonical booking phrases", () => {
    expect(userHasHighBookingIntent("I'm ready to book")).toBe(true);
    expect(userHasHighBookingIntent("Have someone call me")).toBe(true);
    expect(userHasHighBookingIntent("lock it in")).toBe(true);
    expect(userHasHighBookingIntent("book me please")).toBe(true);
  });

  it("is case-insensitive and tolerates surrounding text", () => {
    expect(userHasHighBookingIntent("OK, I'M READY TO BOOK now")).toBe(true);
    expect(userHasHighBookingIntent("  call me back  ")).toBe(true);
  });

  it("rejects unrelated chat", () => {
    expect(userHasHighBookingIntent("what's the weather")).toBe(false);
    expect(userHasHighBookingIntent("just looking around")).toBe(false);
    expect(userHasHighBookingIntent("")).toBe(false);
  });
});

describe("getQuickReplies", () => {
  it("falls back to the default conversion-focused replies", () => {
    const replies = getQuickReplies(null, "Tell me more about Hush.");
    expect(replies).toContain("I'm ready to book");
    expect(replies).toContain("Have someone call me");
    expect(replies).toHaveLength(4);
  });

  it("specializes when the assistant mentions pricing", () => {
    const replies = getQuickReplies(null, "Pricing typically starts at $200.");
    expect(replies[0]).toBe("I'm ready to book");
    expect(replies).toContain("Help me decide");
  });

  it("specializes for stylist mentions", () => {
    const replies = getQuickReplies(null, "Our stylist Allison is amazing.");
    expect(replies).toContain("Help me find the right service");
  });

  it("specializes for occasion mentions", () => {
    const replies = getQuickReplies(null, "For your wedding day we offer...");
    expect(replies[0]).toBe("Let's plan my full look");
  });
});

describe("getSmartChips", () => {
  it("returns onboarding chips when context is empty", () => {
    const chips = getSmartChips(null);
    expect(chips).toHaveLength(3);
    expect(chips[0]).toMatch(/new/i);
  });

  it("returns multi-service chips when several categories selected", () => {
    const chips = getSmartChips(ctx({ categories: ["hair", "skincare"] }));
    expect(chips[0]).toMatch(/combine/i);
  });

  it("returns hair-color-specific chips", () => {
    const chips = getSmartChips(ctx({ categories: ["hair"], service_subtype: "color" }));
    expect(chips.join(" ")).toMatch(/balayage|highlights|color/i);
  });

  it("returns nail / lash / skincare / massage chip sets", () => {
    expect(getSmartChips(ctx({ categories: ["nails"] })).join(" ")).toMatch(/gel|nail/i);
    expect(getSmartChips(ctx({ categories: ["lashes"] })).join(" ")).toMatch(/lash/i);
    expect(getSmartChips(ctx({ categories: ["skincare"] })).join(" ")).toMatch(/facial|skin/i);
    expect(getSmartChips(ctx({ categories: ["massage"] })).join(" ")).toMatch(/massage|minutes/i);
  });
});

describe("detectChatActions", () => {
  it("surfaces phone + text actions when front desk is mentioned", () => {
    const actions = detectChatActions("Give them a call at (520) 327-6753.", null);
    expect(actions.find((a) => a.type === "phone")).toBeTruthy();
    expect(actions.find((a) => a.type === "text")).toBeTruthy();
  });

  it("offers a callback action on booking intent", () => {
    const actions = detectChatActions("Happy to help you book — let's lock in a time.", null);
    expect(actions.find((a) => a.type === "callback")).toBeTruthy();
  });

  it("offers the team tab when stylists are referenced (without front-desk handoff)", () => {
    const actions = detectChatActions("Our team has incredible artists for that.", null);
    expect(actions.find((a) => a.target === "artists")).toBeTruthy();
  });

  it("caps actions at 3", () => {
    const actions = detectChatActions(
      "Pricing starts at $100. I'd recommend our stylist. Ready to book? Call (520) 327-6753.",
      null
    );
    expect(actions.length).toBeLessThanOrEqual(3);
  });
});

describe("isErrorResponse", () => {
  it("flags known error phrases", () => {
    expect(isErrorResponse("I'm having trouble connecting right now.")).toBe(true);
    expect(isErrorResponse("Give me just a moment and try again.")).toBe(true);
  });

  it("returns false for healthy responses", () => {
    expect(isErrorResponse("Welcome to Hush!")).toBe(false);
  });
});

describe("context helpers", () => {
  it("getContextPills returns labels for each filled field", () => {
    const pills = getContextPills(
      ctx({ categories: ["hair"], service_subtype: "color", goal: "transform", timing: "this_week" })
    );
    expect(pills.length).toBeGreaterThanOrEqual(3);
    expect(pills.some((p) => /color/i.test(p))).toBe(true);
  });

  it("getContextFingerprint produces a stable string", () => {
    const a = getContextFingerprint(ctx({ categories: ["hair"], service_subtype: "color" }));
    const b = getContextFingerprint(ctx({ categories: ["hair"], service_subtype: "color" }));
    expect(a).toBe(b);
    expect(getContextFingerprint(null)).toBe("none");
  });
});
