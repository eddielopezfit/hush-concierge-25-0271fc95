import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { saveSession, saveLead, saveCallbackRequest } from "./saveSession";

const SUBMIT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`;

describe("saveSession module", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("saveSession (deprecated no-op)", () => {
    it("returns null without throwing", async () => {
      await expect(saveSession(null)).resolves.toBeNull();
      await expect(saveSession(undefined)).resolves.toBeNull();
      await expect(
        saveSession({ source: "x", categories: [], goal: null, timing: null })
      ).resolves.toBeNull();
    });
  });

  describe("saveLead", () => {
    it("returns false when name is missing", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const ok = await saveLead({ name: "", phone: "555" });
      expect(ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("returns false when both phone and email are missing", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const ok = await saveLead({ name: "Jane", phone: "" });
      expect(ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("posts a normalized lead and returns true on 200", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 200 }));

      const ok = await saveLead({
        name: "  Jane  ",
        phone: " 5551234 ",
        email: " jane@example.com ",
        category: "hair, nails",
        goal: "transform",
        timing: "this week",
      });

      expect(ok).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        SUBMIT_URL,
        expect.objectContaining({ method: "POST" })
      );
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body).toMatchObject({
        type: "lead",
        name: "Jane",
        phone: "5551234",
        email: "jane@example.com",
        category: "hair, nails",
        goal: "transform",
        timing: "week",
      });
    });

    it("accepts email-only leads (no phone)", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(null, { status: 200 })
      );
      const ok = await saveLead({ name: "Jane", phone: "", email: "j@x.com" });
      expect(ok).toBe(true);
    });

    it("returns false on non-OK response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(null, { status: 500 })
      );
      const ok = await saveLead({ name: "Jane", phone: "555" });
      expect(ok).toBe(false);
    });

    it("returns false when fetch rejects", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
      const ok = await saveLead({ name: "Jane", phone: "555" });
      expect(ok).toBe(false);
    });

    it("passes through unrecognized normalization values as-is", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 200 }));
      await saveLead({
        name: "Jane",
        phone: "555",
        category: "weird-cat",
        goal: "weird-goal",
        timing: "weird-timing",
      });
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.category).toBe("weird-cat");
      expect(body.goal).toBe("weird-goal");
      expect(body.timing).toBe("weird-timing");
    });

    it("sends nulls when optional fields omitted", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 200 }));
      await saveLead({ name: "Jane", phone: "555" });
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.email).toBeNull();
      expect(body.category).toBeNull();
      expect(body.goal).toBeNull();
      expect(body.timing).toBeNull();
    });
  });

  describe("saveCallbackRequest", () => {
    it("returns false when full_name missing", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const ok = await saveCallbackRequest({ full_name: "", phone: "555" });
      expect(ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("returns false when phone missing", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const ok = await saveCallbackRequest({ full_name: "Jane", phone: "" });
      expect(ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("posts callback payload with type=callback and returns true", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 200 }));

      const ok = await saveCallbackRequest({
        full_name: "Jane",
        phone: "555",
        email: "j@x.com",
        interested_in: "hair",
        timing: "today",
        message: "hi",
        source: "hero",
        concierge_context: { source: "hero", categories: ["hair"], goal: null, timing: null },
      });

      expect(ok).toBe(true);
      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.type).toBe("callback");
      expect(body.full_name).toBe("Jane");
      expect(body.source).toBe("hero");
    });

    it("returns false on non-OK response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(null, { status: 502 })
      );
      const ok = await saveCallbackRequest({ full_name: "Jane", phone: "555" });
      expect(ok).toBe(false);
    });

    it("returns false when fetch rejects", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));
      const ok = await saveCallbackRequest({ full_name: "Jane", phone: "555" });
      expect(ok).toBe(false);
    });
  });
});
