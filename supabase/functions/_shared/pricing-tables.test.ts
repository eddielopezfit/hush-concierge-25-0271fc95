import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  PRICING_CATEGORIES,
  detectPricingCategories,
  isPricingQuery,
  renderCategoryMarkdown,
  renderPricingBlock,
  resolvePricingScope,
} from "./pricing-tables.ts";

/**
 * Source-of-truth menu (mirrors src/data/servicesMenuData.ts). If anything
 * here drifts from PRICING_CATEGORIES, the test fails — guaranteeing Luna's
 * rendered tables never silently lose a row.
 */
const SOURCE_MENU = {
  hair: [
    "Women's", "Men's", "Children 12 & Under", "Bang Trim", "Beard Trim",
    "Luxury Wash and Blowout", "Special Occasion Style", "Added Heat Style",
    "Short Hair", "Long Hair",
    "Conditioning Treatment",
    "Brazilian Blowout Split End Treatment",
    "Brazilian Blowout Smoothing Treatment",
    "Root Touchup", "All Over Color", "Color Refresher", "Toner/Root Smudge",
    "Retouch (5 weeks or less regrowth)", "Full Head Lightening Service",
    "Full Weave", "Partial Weave", "Back to Back Foils", "Balayage", "Foilayage",
    "Corrective Color", "Block Color", "Fantasy Color",
  ],
  nails: [
    "Manicure", "Manicure w/Gel", "Pedicure", "Pedicure w/Gel",
    "Polish Change", "Fills", "Fills w/Gel", "Back Fills", "Glues",
    "Nail Set", "Nail Set w/Gel",
  ],
  lashes: [
    "Classic Lash Set", "Classic Lash Fill",
    "Hybrid Lash Set", "Hybrid Lash Fill",
    "Volume Lash Set", "Volume Lash Fill",
    "Lash Lift & Perm", "Lash or Brow Tint",
  ],
  skincare: [
    "Signature Facial",
    "Dermaplane / Hydrafacial / Microdermabrasion Facials",
    "Microneedling", "Brow Wax", "Airbrush Spray Tan",
    "Other waxing services",
  ],
  massage: ["60 min", "90 min", "120 min"],
} as const;

function getCategory(id: string) {
  const cat = PRICING_CATEGORIES.find((c) => c.id === id);
  if (!cat) throw new Error(`Category not found: ${id}`);
  return cat;
}

function flatItemNames(catId: string): string[] {
  return getCategory(catId).groups.flatMap((g) => g.items.map((i) => i.name));
}

// ── Source-vs-rendered parity (per category) ────────────────────────────────
for (const [catId, expectedRows] of Object.entries(SOURCE_MENU)) {
  Deno.test(`[${catId}] PRICING_CATEGORIES contains every source-menu row`, () => {
    const present = flatItemNames(catId);
    const missing = expectedRows.filter((row) => !present.includes(row));
    assertEquals(
      missing,
      [],
      `Missing from PRICING_CATEGORIES.${catId}: ${JSON.stringify(missing)}`,
    );
  });

  Deno.test(`[${catId}] rendered markdown table contains every row`, () => {
    const rendered = renderCategoryMarkdown(getCategory(catId));
    const missing = expectedRows.filter(
      (row) => !rendered.includes(`| ${row} | `),
    );
    assertEquals(
      missing,
      [],
      `Rows missing from rendered ${catId} table: ${JSON.stringify(missing)}\n` +
        `--- rendered ---\n${rendered}`,
    );
  });

  Deno.test(`[${catId}] every rendered row carries a non-empty price`, () => {
    const rendered = renderCategoryMarkdown(getCategory(catId));
    for (const row of expectedRows) {
      // Match: "| <row> | <price> | <description> |"
      const re = new RegExp(
        `\\|\\s*${row.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\|\\s*([^|]+?)\\s*\\|\\s*([^|]+?)\\s*\\|`,
      );
      const match = rendered.match(re);
      assert(match, `Row "${row}" not found in ${catId} table`);
      const price = match![1].trim();
      assert(price.length > 0, `Row "${row}" has empty price`);
      const desc = match![2].trim();
      assert(desc.length > 0, `Row "${row}" has empty description`);
    }
  });
}

// ── Nails-specific: explicit golden test for the bug we fixed ──────────────
Deno.test("[nails] golden render matches expected snapshot of all 11 rows", () => {
  const rendered = renderCategoryMarkdown(getCategory("nails"));
  const expectedRows = [
    ["Manicure", "$35+"],
    ["Manicure w/Gel", "$55+"],
    ["Pedicure", "$60+"],
    ["Pedicure w/Gel", "$80+"],
    ["Polish Change", "$30+"],
    ["Fills", "$60+"],
    ["Fills w/Gel", "$65+"],
    ["Back Fills", "$75+"],
    ["Glues", "$50+"],
    ["Nail Set", "$95+"],
    ["Nail Set w/Gel", "$110+"],
  ];
  for (const [name, price] of expectedRows) {
    assert(
      rendered.includes(`| ${name} | ${price} | `),
      `Expected nails row "${name} | ${price}" missing in:\n${rendered}`,
    );
  }
  // Also confirm exactly 11 data rows (header + separator + 11 = 13 pipe lines).
  const dataRows = rendered.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| ---") && !l.startsWith("| Service"));
  assertEquals(dataRows.length, 11, `Expected 11 nail rows, got ${dataRows.length}`);
});

// ── Intent detection ────────────────────────────────────────────────────────
Deno.test("isPricingQuery recognises common phrasings", () => {
  for (const q of [
    "What's nail pricing like?",
    "how much does hair cost?",
    "can i see the menu?",
    "what are your rates",
    "give me a quote",
  ]) {
    assert(isPricingQuery(q), `Should detect pricing intent in: "${q}"`);
  }
});

Deno.test("isPricingQuery ignores unrelated chatter", () => {
  for (const q of [
    "Hi Luna",
    "Who's the best stylist?",
    "Can I book Allison?",
    "What time do you close?",
  ]) {
    assertEquals(isPricingQuery(q), false, `Should NOT trigger on: "${q}"`);
  }
});

Deno.test("detectPricingCategories routes to the right category", () => {
  const cases: Array<[string, string]> = [
    ["What's nail pricing like?", "nails"],
    ["how much does a haircut cost", "hair"],
    ["price for a facial?", "skincare"],
    ["lash extensions cost?", "lashes"],
    ["how much is a 60 min massage", "massage"],
  ];
  for (const [q, expectedId] of cases) {
    const cats = detectPricingCategories(q);
    assert(
      cats.some((c) => c.id === expectedId),
      `Expected ${expectedId} in detection of "${q}", got: ${cats.map((c) => c.id).join(",")}`,
    );
  }
});

// ── Multi-category render guards against accidental row loss ───────────────
Deno.test("renderPricingBlock(all categories) preserves every source row", () => {
  const block = renderPricingBlock(PRICING_CATEGORIES);
  for (const [catId, expectedRows] of Object.entries(SOURCE_MENU)) {
    for (const row of expectedRows) {
      assert(
        block.includes(`| ${row} | `),
        `Row "${row}" missing from full pricing block (category: ${catId})`,
      );
    }
  }
});

// ── resolvePricingScope: runtime safeguard ──────────────────────────────────
// Critical regression: a generic pricing question ("what will it cost?") with
// a journey-context like "selected: hair" must scope to Hair only and MUST
// NOT fall back to all categories.
Deno.test("resolvePricingScope: explicit category in message wins", () => {
  const { categories, source } = resolvePricingScope(
    "what's nail pricing?",
    "They used the Experience Finder and selected: hair.",
  );
  assertEquals(source, "message");
  assertEquals(categories.map((c) => c.id), ["nails"]);
});

Deno.test("resolvePricingScope: generic ask + hair journey → hair only", () => {
  const { categories, source } = resolvePricingScope(
    "What will it cost?",
    "They used the Experience Finder and selected: hair. Services they explored: Women's Cut.",
  );
  assertEquals(source, "journey");
  assertEquals(categories.map((c) => c.id), ["hair"]);
});

Deno.test("resolvePricingScope: generic ask + nails journey → nails only", () => {
  const { categories, source } = resolvePricingScope(
    "how much?",
    "Services they explored: Manicure w/Gel.",
  );
  assertEquals(source, "journey");
  assert(categories.some((c) => c.id === "nails"));
  assert(!categories.some((c) => c.id === "massage"));
});

Deno.test("resolvePricingScope: NEVER dumps all categories when journeyContext is present", () => {
  // Journey context exists but contains no recognizable category keywords.
  // The safeguard MUST return [] (so caller asks the guest), not ALL.
  const { categories, source } = resolvePricingScope(
    "what does it cost?",
    "User has been browsing for 1 minute(s).",
  );
  assertEquals(source, "none");
  assertEquals(categories.length, 0);
});

Deno.test("resolvePricingScope: no journeyContext at all → falls back to ALL", () => {
  const { categories, source } = resolvePricingScope("what does it cost?", "");
  assertEquals(source, "all");
  assertEquals(categories.length, PRICING_CATEGORIES.length);
});

Deno.test("resolvePricingScope: undefined journeyContext → falls back to ALL", () => {
  const { categories, source } = resolvePricingScope("price?", undefined);
  assertEquals(source, "all");
  assertEquals(categories.length, PRICING_CATEGORIES.length);
});

Deno.test("resolvePricingScope: journeyContext with multiple categories → returns those scopes only", () => {
  // Guest's journey mentions both hair and nails — generic pricing question.
  // Must return BOTH scopes (not empty, not all).
  const { categories, source } = resolvePricingScope(
    "what does it cost?",
    "They used the Experience Finder and selected: hair, nails. Services they explored: Women's Cut, Manicure w/Gel.",
  );
  assertEquals(source, "journey");
  const ids = categories.map((c) => c.id).sort();
  assertEquals(ids, ["hair", "nails"]);
  // Explicitly guard against the failure modes the runtime safeguard prevents:
  assert(categories.length > 0, "must not be empty");
  assert(categories.length < PRICING_CATEGORIES.length, "must not fall back to ALL");
  assert(!ids.includes("massage"), "must not include unrelated categories");
  assert(!ids.includes("skincare"), "must not include unrelated categories");
  assert(!ids.includes("lashes"), "must not include unrelated categories");
});
