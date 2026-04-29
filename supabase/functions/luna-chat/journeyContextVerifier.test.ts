import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { verifyJourneyContext } from "./journeyContextVerifier.ts";

const CTX = "They used the Experience Finder and selected: hair.";

Deno.test("verifyJourneyContext: tag matches conversation_id → trusted", () => {
  const { journeyContext, status } = verifyJourneyContext(
    `[session:abc-123]\n${CTX}`,
    "abc-123",
  );
  assertEquals(status, "match");
  assertEquals(journeyContext, CTX);
});

Deno.test("verifyJourneyContext: tag mismatches → DROPPED", () => {
  const { journeyContext, status } = verifyJourneyContext(
    `[session:OLD-xyz]\n${CTX}`,
    "abc-123",
  );
  assertEquals(status, "mismatch");
  assertEquals(journeyContext, "");
});

Deno.test("verifyJourneyContext: session present but no tag → DROPPED (untrusted)", () => {
  const { journeyContext, status } = verifyJourneyContext(CTX, "abc-123");
  assertEquals(status, "missing_tag");
  assertEquals(journeyContext, "");
});

Deno.test("verifyJourneyContext: no conversation_id → passes through (tag stripped)", () => {
  const { journeyContext, status } = verifyJourneyContext(
    `[session:abc-123]\n${CTX}`,
    null,
  );
  assertEquals(status, "no_session");
  assertEquals(journeyContext, CTX);
  assert(!journeyContext.includes("[session:"), "tag must be stripped");
});

Deno.test("verifyJourneyContext: empty/undefined input → empty", () => {
  for (const v of [undefined, null, "", "   "]) {
    const { journeyContext, status } = verifyJourneyContext(v as any, "abc-123");
    assertEquals(status, "empty");
    assertEquals(journeyContext, "");
  }
});

Deno.test("verifyJourneyContext: tag with surrounding whitespace still matches", () => {
  const { status } = verifyJourneyContext(
    `   [session: abc-123 ]\n${CTX}`,
    "abc-123",
  );
  assertEquals(status, "match");
});

Deno.test("verifyJourneyContext: never leaks tag into trusted output", () => {
  const { journeyContext } = verifyJourneyContext(
    `[session:abc-123]\n${CTX}`,
    "abc-123",
  );
  assert(!journeyContext.includes("[session:"));
});