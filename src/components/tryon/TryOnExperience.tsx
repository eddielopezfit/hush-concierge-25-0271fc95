import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Camera, Check, Loader2, MessageCircle, Sparkles, Sparkle, Upload, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLuna } from "@/contexts/LunaContext";
import {
  FACE_SHAPES,
  TRY_ON_CATEGORIES,
  TRY_ON_COLORS,
  TRY_ON_STYLES,
  UNDERTONES,
  colorFlattersUndertone,
  getColorMeta,
  getStyleMeta,
  sortColorsByUndertone,
  sortStylesByFace,
  styleFlattersFace,
  type FaceShape,
  type TryOnStyleCategory,
  type Undertone,
} from "@/data/tryOnStyleData";
import { CompareSlider } from "./CompareSlider";
import { cn } from "@/lib/utils";

type Step = "intro" | "face" | "category" | "style" | "color" | "preview" | "convert";

interface SavedLook {
  id: string;
  styleId: string;
  colorId: string | null;
  renderDataUrl: string;
}

interface TryOnExperienceProps {
  source: string;
  onClose: () => void;
}

const MAX_FILE_BYTES = 6 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Phase 2 — Transformation Engine.
 *
 * AI-generated visualization. Real stylist still tailors the final result —
 * surfaced explicitly in copy so guests don't expect a perfect match.
 */
export const TryOnExperience = ({ source, onClose }: TryOnExperienceProps) => {
  const { mergeConcierge, openChatWidget } = useLuna();
  const [step, setStep] = useState<Step>("intro");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<FaceShape | null>(null);
  const [undertone, setUndertone] = useState<Undertone | null>(null);
  const [category, setCategory] = useState<TryOnStyleCategory | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  const [renderDataUrl, setRenderDataUrl] = useState<string | null>(null);
  const [renderSignedUrl, setRenderSignedUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const styles = useMemo(() => {
    const filtered = TRY_ON_STYLES.filter((s) => !category || s.category === category);
    return sortStylesByFace(filtered, faceShape);
  }, [category, faceShape]);

  const colors = useMemo(
    () => sortColorsByUndertone(TRY_ON_COLORS, undertone),
    [undertone]
  );

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WEBP photo.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Photo is larger than 6 MB. Try a smaller version.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPhotoDataUrl(dataUrl);
    setStep("face");
  }, []);

  const generate = useCallback(async (chosenStyleId: string, chosenColorId: string | null) => {
    if (!photoDataUrl) return;
    setIsGenerating(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("try-on-transform", {
        body: {
          imageBase64: photoDataUrl,
          styleId: chosenStyleId,
          colorId: chosenColorId,
          sessionId,
          faceShape,
          undertone,
        },
      });
      if (fnErr) {
        const msg = fnErr.message || "Could not generate that look.";
        setError(msg);
        toast.error(msg);
        return;
      }
      const payload = data as {
        sessionId: string;
        renderDataUrl: string;
        renderSignedUrl: string | null;
      };
      setSessionId(payload.sessionId);
      setRenderDataUrl(payload.renderDataUrl);
      setRenderSignedUrl(payload.renderSignedUrl);
      setStep("preview");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [photoDataUrl, sessionId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // (faceShape/undertone are read at call time and don't need to invalidate the callback)

  const handleStylePick = (id: string) => {
    setStyleId(id);
    setStep("color");
  };

  const handleColorPick = async (id: string | null) => {
    setColorId(id);
    if (styleId) await generate(styleId, id);
  };

  const saveLook = () => {
    if (!styleId || !renderDataUrl) return;
    const exists = savedLooks.some((l) => l.styleId === styleId && l.colorId === colorId);
    if (exists) {
      toast.info("Already in your saved looks");
      return;
    }
    setSavedLooks((prev) => [
      { id: crypto.randomUUID(), styleId, colorId, renderDataUrl },
      ...prev,
    ].slice(0, 4));
    toast.success("Look saved");
  };

  const goToBooking = () => {
    if (!styleId) return;
    const styleMeta = getStyleMeta(styleId);
    const colorMeta = colorId ? getColorMeta(colorId) : null;
    const lookLabel = [styleMeta?.name, colorMeta?.name].filter(Boolean).join(" · ");
    mergeConcierge({
      source: `${source} · Try-On`,
      categories: ["hair"],
      primary_category: "hair",
      category: "hair",
      goal: lookLabel ? `Try-On: ${lookLabel}` : null,
    });
    onClose();
    document.getElementById("booking-callback")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToLuna = () => {
    if (!styleId) return;
    const styleMeta = getStyleMeta(styleId);
    const colorMeta = colorId ? getColorMeta(colorId) : null;
    const lookLabel = [styleMeta?.name, colorMeta?.name].filter(Boolean).join(" · ");
    mergeConcierge({
      source: `${source} · Try-On`,
      categories: ["hair"],
      primary_category: "hair",
      category: "hair",
      goal: lookLabel ? `Try-On: ${lookLabel}` : null,
    });
    onClose();
    openChatWidget("chat");
  };

  const sendLookToLuna = () => {
    if (!styleId) return;
    const styleMeta = getStyleMeta(styleId);
    const colorMeta = colorId ? getColorMeta(colorId) : null;
    const lookLabel = [styleMeta?.name, colorMeta?.name].filter(Boolean).join(" · ");

    mergeConcierge({
      source: `${source} · Try-On`,
      categories: ["hair"],
      primary_category: "hair",
      category: "hair",
      goal: lookLabel ? `Try-On: ${lookLabel}` : null,
    });

    const faceLabel = faceShape && faceShape !== "unsure"
      ? FACE_SHAPES.find((f) => f.id === faceShape)?.label
      : null;
    const undertoneLabel = undertone && undertone !== "unsure"
      ? UNDERTONES.find((u) => u.id === undertone)?.label
      : null;

    const lines = [
      `I just tried on a look in the virtual try-on and want your take.`,
      styleMeta ? `• Style: ${styleMeta.name}${styleMeta.blurb ? ` — ${styleMeta.blurb}` : ""}` : null,
      colorMeta ? `• Color: ${colorMeta.name}${colorMeta.blurb ? ` — ${colorMeta.blurb}` : ""}` : `• Color: keeping my current color`,
      faceLabel ? `• Face shape: ${faceLabel}` : null,
      undertoneLabel ? `• Skin undertone: ${undertoneLabel}` : null,
      renderSignedUrl ? `• Preview: ${renderSignedUrl}` : null,
      ``,
      `Can you tell me which stylist would be a great fit and what to expect at my appointment?`,
    ].filter(Boolean) as string[];

    try {
      sessionStorage.setItem("hush_chat_pending_prompt", lines.join("\n"));
    } catch {
      /* ignore — Luna will still open with context */
    }

    toast.success("Sent your look to Luna");
    onClose();
    openChatWidget("chat");
  };

  const stepBack = () => {
    setError(null);
    if (step === "face") setStep("intro");
    else if (step === "category") setStep("face");
    else if (step === "style") setStep("category");
    else if (step === "color") setStep("style");
    else if (step === "preview") setStep("color");
    else if (step === "convert") setStep("preview");
  };

  const resetFaceAndUndertone = () => {
    setFaceShape(null);
    setUndertone(null);
    toast.success("Cleared — re-sorting styles & colors");
  };

  const hasFaceOrUndertone = faceShape !== null || undertone !== null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/90 backdrop-blur-sm p-0 sm:p-6 animate-fade-in">
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-card text-cream shadow-2xl sm:h-[92vh] sm:rounded-2xl sm:border sm:border-gold/20">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {step !== "intro" && (
              <button
                onClick={stepBack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/60 hover:bg-cream/5 hover:text-cream"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="font-display text-lg sm:text-xl text-cream truncate">Try Your New Look</p>
              <p className="font-body text-[11px] text-cream/45 truncate">
                AI-generated preview · Your stylist will tailor the final result
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/60 hover:bg-cream/5 hover:text-cream"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          {error && (
            <div className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "intro" && (
            <div className="mx-auto max-w-xl text-center">
              <Wand2 className="mx-auto mb-4 h-10 w-10 text-gold" />
              <h2 className="font-display text-3xl text-cream mb-3">See yourself transformed</h2>
              <p className="font-body text-sm text-cream/70 mb-7 leading-relaxed">
                Upload a clear, front-facing selfie. We'll preview different styles and colors so you can walk into your appointment knowing exactly what you want.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gold/40 bg-charcoal/40 px-6 py-10 text-cream/80 transition-colors hover:border-gold hover:bg-charcoal/60"
              >
                <Upload className="h-8 w-8 text-gold transition-transform group-hover:scale-110" />
                <span className="font-body text-base text-cream">Upload a selfie</span>
                <span className="font-body text-xs text-cream/55">JPEG, PNG, or WEBP · up to 6 MB</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.currentTarget.value = "";
                }}
              />

              <p className="mt-6 font-body text-[11px] text-cream/45 leading-relaxed">
                Your photo is used only to generate your preview and is automatically removed after 7 days. We never share it.
              </p>
            </div>
          )}

          {step === "face" && (
            <div className="mx-auto max-w-2xl">
              <h2 className="font-display text-2xl text-cream mb-1 text-center">A little about your features</h2>
              <p className="font-body text-sm text-cream/60 mb-6 text-center">
                Optional — helps us sort the most flattering looks first and gives Luna better context. Tap <em className="not-italic text-cream/80">Not sure</em> for either to skip.
              </p>

              <div className="mb-7">
                <p className="font-body text-xs uppercase tracking-wider text-cream/55 mb-3">Face shape</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FACE_SHAPES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFaceShape(f.id)}
                      className={cn(
                        "rounded-lg border bg-charcoal/40 p-3 text-left transition-colors",
                        faceShape === f.id
                          ? "border-gold bg-charcoal/70"
                          : "border-border hover:border-gold/60"
                      )}
                    >
                      <span className="block font-display text-sm text-cream">{f.label}</span>
                      <span className="block font-body text-[11px] text-cream/55 leading-snug">{f.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-7">
                <p className="font-body text-xs uppercase tracking-wider text-cream/55 mb-3">Skin undertone</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {UNDERTONES.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setUndertone(u.id)}
                      className={cn(
                        "rounded-lg border bg-charcoal/40 p-3 text-left transition-colors",
                        undertone === u.id
                          ? "border-gold bg-charcoal/70"
                          : "border-border hover:border-gold/60"
                      )}
                    >
                      <span className="block font-display text-sm text-cream">{u.label}</span>
                      <span className="block font-body text-[11px] text-cream/55 leading-snug">{u.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setStep("category")}
                  className="btn-gold py-2.5 px-6 text-sm w-full sm:w-auto"
                >
                  Continue
                </button>
                <button
                  onClick={() => { setFaceShape("unsure"); setUndertone("unsure"); setStep("category"); }}
                  className="font-body text-sm text-cream/60 underline underline-offset-4 hover:text-gold"
                >
                  Skip — I'll let my stylist decide
                </button>
              </div>
              {hasFaceOrUndertone && (
                <div className="mt-4 text-center">
                  <button
                    onClick={resetFaceAndUndertone}
                    className="font-body text-xs text-cream/55 underline underline-offset-4 hover:text-gold"
                  >
                    Reset my face & undertone
                  </button>
                </div>
              )}
              <p className="mt-4 text-center font-body text-[11px] text-cream/45">
                Your stylist always has the final say — this just helps us start you in the right direction.
              </p>
            </div>
          )}

          {step === "category" && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-1 text-center">Pick a direction</h2>
              <p className="font-body text-sm text-cream/60 mb-6 text-center">Choose a vibe — you can try as many as you want.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRY_ON_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setStep("style"); }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl border border-border bg-charcoal/40 p-4 text-left transition-colors",
                      "hover:border-gold/60 hover:bg-charcoal/60"
                    )}
                  >
                    <span className="font-display text-lg text-cream">{c.label}</span>
                    <span className="font-body text-xs text-cream/60">{c.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "style" && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-1 text-center">Choose a style</h2>
              <p className="font-body text-sm text-cream/60 mb-6 text-center">
                Tap one to keep going. You can try others after.
                {faceShape && faceShape !== "unsure" && (
                  <span className="block text-[11px] text-gold/80 mt-1">
                    ✦ Sorted with {FACE_SHAPES.find((f) => f.id === faceShape)?.label.toLowerCase()}-face matches first
                  </span>
                )}
                {hasFaceOrUndertone && (
                  <span className="block mt-2">
                    <button
                      onClick={() => { resetFaceAndUndertone(); setStep("face"); }}
                      className="font-body text-[11px] text-cream/55 underline underline-offset-4 hover:text-gold"
                    >
                      Reset my face & undertone
                    </button>
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStylePick(s.id)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-border bg-charcoal/40 p-3 text-left transition-colors hover:border-gold/60 hover:bg-charcoal/60"
                  >
                    <span className="flex items-center gap-1.5 font-display text-base text-cream">
                      {s.name}
                      {styleFlattersFace(s.id, faceShape) && (
                        <Sparkle className="h-3 w-3 text-gold" aria-label="Flattering for your face shape" />
                      )}
                    </span>
                    <span className="font-body text-[11px] text-cream/55">{s.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "color" && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-1 text-center">Pick a color</h2>
              <p className="font-body text-sm text-cream/60 mb-6 text-center">
                Or skip — we'll preview just the cut.
                {undertone && undertone !== "unsure" && (
                  <span className="block text-[11px] text-gold/80 mt-1">
                    ✦ Sorted with {UNDERTONES.find((u) => u.id === undertone)?.label.toLowerCase()}-undertone matches first
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    disabled={isGenerating}
                    onClick={() => handleColorPick(c.id)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-charcoal/40 p-3 text-left transition-colors hover:border-gold/60 hover:bg-charcoal/60 disabled:opacity-50"
                  >
                    <span className="h-10 w-10 shrink-0 rounded-full border border-cream/15" style={{ backgroundColor: c.swatch }} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-display text-base text-cream truncate">
                        {c.name}
                        {colorFlattersUndertone(c.id, undertone) && (
                          <Sparkle className="h-3 w-3 shrink-0 text-gold" aria-label="Flatters your undertone" />
                        )}
                      </span>
                      <span className="block font-body text-[11px] text-cream/55 truncate">{c.blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 text-center">
                <button
                  disabled={isGenerating}
                  onClick={() => handleColorPick(null)}
                  className="font-body text-sm text-cream/60 underline underline-offset-4 hover:text-gold disabled:opacity-50"
                >
                  Skip color — preview the cut only
                </button>
              </div>

              {isGenerating && (
                <div className="mt-8 flex flex-col items-center gap-3 text-cream/80">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  <p className="font-body text-sm">Bringing your new look to life…</p>
                  <p className="font-body text-[11px] text-cream/50">Usually 5–10 seconds</p>
                </div>
              )}
            </div>
          )}

          {step === "preview" && photoDataUrl && renderDataUrl && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-1 text-center">Drag to compare</h2>
              <p className="font-body text-sm text-cream/60 mb-5 text-center">
                {getStyleMeta(styleId ?? "")?.name}
                {colorId ? ` · ${getColorMeta(colorId)?.name}` : ""}
              </p>
              <div className="mx-auto max-w-md">
                <CompareSlider beforeSrc={photoDataUrl} afterSrc={renderDataUrl} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl mx-auto">
                <button onClick={saveLook} className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 font-body text-sm text-gold hover:bg-gold/20">
                  <Check className="mr-1.5 inline h-4 w-4" /> Save look
                </button>
                <button onClick={() => setStep("color")} className="rounded-lg border border-border bg-charcoal/40 px-3 py-2.5 font-body text-sm text-cream hover:border-gold/60">
                  Try a color
                </button>
                <button onClick={() => setStep("category")} className="rounded-lg border border-border bg-charcoal/40 px-3 py-2.5 font-body text-sm text-cream hover:border-gold/60">
                  Try a style
                </button>
                <button onClick={() => setStep("convert")} className="btn-gold py-2.5 px-3 text-sm">
                  <Sparkles className="mr-1.5 inline h-4 w-4" /> I love it
                </button>
              </div>

              <div className="mt-3 max-w-2xl mx-auto">
                <button
                  onClick={sendLookToLuna}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 font-body text-sm text-primary hover:bg-primary/20"
                >
                  <MessageCircle className="h-4 w-4" /> Send to Luna for guidance
                </button>
                <p className="mt-2 text-center font-body text-[11px] text-cream/45">
                  Shares your style, color, and preview link with Luna so she can match you to the right stylist.
                </p>
              </div>

              {savedLooks.length > 0 && (
                <div className="mt-8">
                  <p className="font-body text-xs uppercase tracking-wider text-cream/45 mb-3 text-center">Your saved looks</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {savedLooks.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setStyleId(l.styleId);
                          setColorId(l.colorId);
                          setRenderDataUrl(l.renderDataUrl);
                        }}
                        className="group flex flex-col items-center gap-1"
                        title={`${getStyleMeta(l.styleId)?.name}${l.colorId ? ` · ${getColorMeta(l.colorId)?.name}` : ""}`}
                      >
                        <img src={l.renderDataUrl} alt="" className="h-16 w-16 rounded-lg border border-border object-cover transition-all group-hover:border-gold" />
                        <span className="font-body text-[10px] text-cream/55 max-w-[64px] truncate">
                          {getStyleMeta(l.styleId)?.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "convert" && (
            <div className="mx-auto max-w-md text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-gold" />
              <h2 className="font-display text-2xl text-cream mb-2">Ready to make it real?</h2>
              <p className="font-body text-sm text-cream/65 mb-6 leading-relaxed">
                We'll send your selected look to our front desk so they can pair you with the stylist best suited to bring it to life.
              </p>

              {renderDataUrl && (
                <img src={renderDataUrl} alt="Your selected look" className="mx-auto mb-6 max-h-64 rounded-lg border border-border object-cover" />
              )}

              <div className="flex flex-col gap-3">
                <button onClick={goToBooking} className="btn-gold py-3 px-6 text-sm sm:text-base flex items-center justify-center gap-2">
                  <Camera className="h-4 w-4" /> Book this look
                </button>
                <button onClick={sendLookToLuna} className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 font-body text-sm text-primary hover:bg-primary/20 inline-flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Send to Luna for guidance
                </button>
                <button onClick={goToLuna} className="font-body text-xs text-cream/55 hover:text-gold underline underline-offset-4">
                  Or just open chat without sharing
                </button>
              </div>

              <p className="mt-6 font-body text-[11px] text-cream/40 leading-relaxed">
                AI-generated visualization. Your stylist will personalize cut, placement, and tone to your face shape, hair history, and lifestyle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};