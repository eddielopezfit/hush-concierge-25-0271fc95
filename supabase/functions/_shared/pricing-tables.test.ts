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
      (row) => !rendered.includes(`| ${row} |`),
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
      // Match: "| <row> | <price> |"
      const re = new RegExp(
        `\\|\\s*${row.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\|\\s*([^|]+?)\\s*\\|`,
      );
      const match = rendered.match(re);
      assert(match, `Row "${row}" not found in ${catId} table`);
      const price = match![1].trim();
      assert(price.length > 0, `Row "${row}" has empty price`);
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
      rendered.includes(`| ${name} | ${price} |`),
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
        block.includes(`| ${row} |`),
        `Row "${row}" missing from full pricing block (category: ${catId})`,
      );
    }
  }
});
