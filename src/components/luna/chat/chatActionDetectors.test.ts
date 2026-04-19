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

describe("detectChatActions — front-desk handoff", () => {
  it.each([
    "Give them a call at (520) 327-6753.",
    "Best to call us directly.",
    "Our front desk can help.",
    "Call Kendell at the desk.",
    "Just give them a call.",
  ])("surfaces phone + text for front-desk phrase: %s", (msg) => {
    const actions = detectChatActions(msg, null);
    expect(actions.find((a) => a.type === "phone")?.label).toBe("Call (520) 327-6753");
    expect(actions.find((a) => a.type === "text")).toBeTruthy();
  });

  it("suppresses the 'Build my plan' tab action when handing off to front desk", () => {
    const actions = detectChatActions(
      "I'd recommend our balayage — but it's best to call us at (520) 327-6753.",
      null
    );
    expect(actions.find((a) => a.type === "phone")).toBeTruthy();
    expect(actions.find((a) => a.target === "plan")).toBeFalsy();
  });

  it("suppresses 'See our team' when front desk is already mentioned", () => {
    const actions = detectChatActions(
      "Our stylist team is incredible — call (520) 327-6753 to book.",
      null
    );
    expect(actions.find((a) => a.target === "artists")).toBeFalsy();
  });
});

describe("detectChatActions — booking intent / callback", () => {
  it.each([
    "Happy to help you book a time that works.",
    "Ready to book? I can get you in.",
    "Let's lock in a time this week.",
    "I can reserve that slot for you.",
  ])("surfaces a callback action for booking phrase: %s", (msg) => {
    const actions = detectChatActions(msg, null);
    const callback = actions.find((a) => a.type === "callback");
    expect(callback).toBeTruthy();
    expect(callback?.label).toBe("Get a quick call back");
  });

  it("does not duplicate the callback action when multiple booking phrases appear", () => {
    const actions = detectChatActions(
      "Ready to book? Let's lock in a time and reserve it.",
      null
    );
    const callbacks = actions.filter((a) => a.type === "callback");
    expect(callbacks).toHaveLength(1);
  });

  it("does not produce a callback when the message is purely informational", () => {
    const actions = detectChatActions("Our hours are Tue–Sat.", null);
    expect(actions.find((a) => a.type === "callback")).toBeFalsy();
  });

  it("offers 'Reserve this service' scroll action on a recommendation phrase", () => {
    const actions = detectChatActions(
      "I'd recommend our signature facial — perfect for sensitive skin.",
      null
    );
    const scroll = actions.find((a) => a.type === "scroll");
    expect(scroll?.target).toBe("callback");
    expect(scroll?.label).toBe("Reserve this service");
  });

  it("recommendation triggers BOTH scroll-to-callback AND plan tab when no front-desk handoff", () => {
    const actions = detectChatActions("That would be a great option for you.", null);
    expect(actions.find((a) => a.type === "scroll" && a.target === "callback")).toBeTruthy();
    expect(actions.find((a) => a.type === "tab" && a.target === "plan")).toBeTruthy();
  });

  it("does not offer 'See our team' when a Reserve action is already queued", () => {
    const actions = detectChatActions(
      "I'd recommend our top stylist for color work.",
      null
    );
    expect(actions.find((a) => a.label.includes("Reserve"))).toBeTruthy();
    expect(actions.find((a) => a.target === "artists")).toBeFalsy();
  });
});

describe("detectChatActions — pricing & team", () => {
  it("offers the team tab when stylists are referenced (without front-desk handoff)", () => {
    const actions = detectChatActions("Our team has incredible artists for that.", null);
    expect(actions.find((a) => a.target === "artists")).toBeTruthy();
  });

  it("offers 'See my personalized plan' when pricing is mentioned", () => {
    const actions = detectChatActions("Color services typically start at $200.", null);
    expect(actions.find((a) => a.label.includes("personalized plan"))).toBeTruthy();
  });

  it("caps actions at 3 even when many triggers fire at once", () => {
    const actions = detectChatActions(
      "Pricing starts at $100. I'd recommend our stylist. Ready to book? Call (520) 327-6753.",
      null
    );
    expect(actions.length).toBeLessThanOrEqual(3);
  });

  it("returns an empty array for plain conversational text", () => {
    const actions = detectChatActions("Hello, how are you today?", null);
    expect(actions).toEqual([]);
  });
});

describe("userHasHighBookingIntent — extended cases", () => {
  it("matches every canonical phrase in the list", () => {
    const phrases = [
      "i'm ready to book", "im ready to book", "ready to book",
      "let's lock it in", "lets lock it in", "lock it in",
      "have someone call me", "call me back", "get a call back",
      "book it", "book me", "schedule me",
    ];
    phrases.forEach((p) => expect(userHasHighBookingIntent(p)).toBe(true));
  });

  it("matches when the phrase is embedded in a longer sentence", () => {
    expect(userHasHighBookingIntent("yes please, schedule me for Saturday")).toBe(true);
    expect(userHasHighBookingIntent("can you get a call back for me?")).toBe(true);
  });

  it("does not match weak/ambiguous phrases", () => {
    expect(userHasHighBookingIntent("maybe I'll book later")).toBe(false);
    expect(userHasHighBookingIntent("how do I book?")).toBe(false);
    expect(userHasHighBookingIntent("looking at the booking page")).toBe(false);
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
