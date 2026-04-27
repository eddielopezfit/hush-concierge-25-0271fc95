// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildEditPrompt, findStyle, findColor } from "../_shared/try-on-catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET = "try-on-renders";
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function dataUrlToBytes(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  const m = /^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  try {
    const mime = m[1];
    const b64 = m[2];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mime, bytes };
  } catch {
    return null;
  }
}

function bytesToDataUrl(mime: string, bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);
    if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "Storage not configured" }, 500);

    const body = await req.json().catch(() => null) as
      | {
          imageBase64?: string;
          styleId?: string;
          colorId?: string | null;
          sessionId?: string | null;
          faceShape?: string | null;
          undertone?: string | null;
        }
      | null;

    if (!body) return json({ error: "Invalid JSON body" }, 400);

    const { imageBase64, styleId, colorId, sessionId, faceShape, undertone } = body;
    const VALID_FACES = new Set(["oval", "round", "square", "heart", "long", "unsure"]);
    const VALID_UNDERTONES = new Set(["cool", "warm", "neutral", "unsure"]);
    const safeFace = faceShape && VALID_FACES.has(faceShape) ? (faceShape as any) : null;
    const safeUndertone = undertone && VALID_UNDERTONES.has(undertone) ? (undertone as any) : null;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return json({ error: "imageBase64 is required (data URL)" }, 400);
    }
    if (!styleId || !findStyle(styleId)) {
      return json({ error: "Invalid styleId" }, 400);
    }
    if (colorId && !findColor(colorId)) {
      return json({ error: "Invalid colorId" }, 400);
    }

    const decoded = dataUrlToBytes(imageBase64);
    if (!decoded) return json({ error: "imageBase64 must be a valid data URL" }, 400);
    if (!ALLOWED_MIME.has(decoded.mime)) {
      return json({ error: "Only JPEG, PNG, or WEBP images are supported" }, 400);
    }
    if (decoded.bytes.byteLength > MAX_BYTES) {
      return json({ error: "Image is larger than 6 MB" }, 413);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Resolve / create session row
    let workingSessionId = sessionId ?? null;
    let sourcePath: string | null = null;

    if (workingSessionId) {
      const { data: existing } = await supabase
        .from("try_on_sessions")
        .select("id, source_image_path")
        .eq("id", workingSessionId)
        .maybeSingle();
      if (existing) sourcePath = existing.source_image_path;
      else workingSessionId = null;
    }

    if (!workingSessionId) {
      const { data: created, error: createErr } = await supabase
        .from("try_on_sessions")
        .insert({})
        .select("id")
        .single();
      if (createErr || !created) {
        console.error("session insert failed:", createErr);
        return json({ error: "Could not start try-on session" }, 500);
      }
      workingSessionId = created.id as string;
    }

    // Upload source on first call
    if (!sourcePath) {
      const ext = decoded.mime === "image/png" ? "png" : decoded.mime === "image/webp" ? "webp" : "jpg";
      sourcePath = `${workingSessionId}/source.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(sourcePath, decoded.bytes, {
        contentType: decoded.mime,
        upsert: true,
      });
      if (upErr) {
        console.error("source upload failed:", upErr);
        return json({ error: "Could not store source photo" }, 500);
      }
      await supabase
        .from("try_on_sessions")
        .update({ source_image_path: sourcePath })
        .eq("id", workingSessionId);
    }

    // Call Lovable AI image edit
    const prompt = buildEditPrompt(styleId, colorId ?? null, safeFace, safeUndertone);
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (aiResp.status === 429) {
      return json({ error: "We're a little busy — try this look again in a minute." }, 429);
    }
    if (aiResp.status === 402) {
      return json({ error: "Try-On preview credits are exhausted. Please contact the salon." }, 402);
    }
    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      return json({ error: "Could not generate the preview. Please try a different photo." }, 502);
    }

    const aiJson = await aiResp.json() as any;
    const generatedDataUrl: string | undefined =
      aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedDataUrl) {
      console.error("AI response missing image", JSON.stringify(aiJson)?.slice(0, 500));
      return json({ error: "The model didn't return an image — try another style." }, 502);
    }

    const decodedOut = dataUrlToBytes(generatedDataUrl);
    if (!decodedOut) return json({ error: "Generated image was malformed" }, 502);

    const renderPath = `${workingSessionId}/renders/${styleId}__${colorId ?? "none"}__${Date.now()}.png`;
    const { error: renderUpErr } = await supabase.storage.from(BUCKET).upload(renderPath, decodedOut.bytes, {
      contentType: decodedOut.mime || "image/png",
      upsert: false,
    });
    if (renderUpErr) {
      console.error("render upload failed:", renderUpErr);
      // Still return the data URL so the user sees their preview even if storage failed
    }

    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(renderPath, 60 * 60 * 24); // 24h

    await supabase
      .from("try_on_sessions")
      .update({
        last_style_id: styleId,
        last_color_id: colorId ?? null,
        last_render_path: renderPath,
      })
      .eq("id", workingSessionId);

    return json({
      sessionId: workingSessionId,
      styleId,
      colorId: colorId ?? null,
      renderDataUrl: bytesToDataUrl(decodedOut.mime || "image/png", decodedOut.bytes),
      renderSignedUrl: signed?.signedUrl ?? null,
      renderPath,
    });
  } catch (err) {
    console.error("try-on-transform fatal:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});