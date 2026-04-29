import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Camera, Check, Image as ImageIcon, Loader2, MessageCircle, Sparkles, Sparkle, Sun, Upload, User, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLuna } from "@/contexts/LunaContext";
import {
  FACE_SHAPES,
  TRY_ON_CATEGORIES,
  TRY_ON_COLORS,
  TRY_ON_STYLES,
  UNDERTONES,
  colorMatchTier,
  getColorMeta,
  getStyleMeta,
  sortColorsByUndertone,
  sortStylesByFace,
  styleMatchTier,
  type MatchTier,
  type FaceShape,
  type TryOnStyleCategory,
  type Undertone,
} from "@/data/tryOnStyleData";
import { CompareSlider } from "./CompareSlider";
import { cn } from "@/lib/utils";
import { trackFunnelEvent } from "@/lib/funnelTracker";

function MatchBadge({ tier }: { tier: MatchTier }) {
  if (tier === "none") return null;
  const isBest = tier === "best";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 font-body text-[9px] uppercase tracking-wider leading-none",
        isBest
          ? "border-gold/60 bg-gold/15 text-gold"
          : "border-cream/20 bg-cream/5 text-cream/70"
      )}
    >
      <Sparkle className="h-2.5 w-2.5" />
      {isBest ? "Best match" : "Good match"}
    </span>
  );
}

type Step = "intro" | "style" | "preview" | "convert";

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
    reader.onerror = () => reject(new Error("Couldn't read that photo. Try another."));
    reader.onabort = () => reject(new Error("Photo upload was cancelled."));
    reader.readAsDataURL(file);
  });
}

/**
 * Phase 2 — Transformation Engine.
 *
 * AI-generated visualization. Real stylist still tailors the final result —
 * surfaced explicitly in copy so guests don't expect a perfect match.
 *
 * Streamlined flow: Upload → Style (with optional face/undertone/category filters)
 * → Preview (with inline color iteration). Collapsed from 5 steps to 3 to reduce
 * friction before the wow moment.
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
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tags the source/type of the most recent error so the recovery UI can
  // tailor its "Try again" affordances. Only set for errors that happen on
  // the intro/upload step — generation errors are handled inline elsewhere.
  const [errorKind, setErrorKind] = useState<
    null | "heic" | "format" | "too_large" | "read_failed" | "generic"
  >(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cameraOpenedAtRef = useRef<number | null>(null);
  const [cameraHelpOpen, setCameraHelpOpen] = useState(false);

  // Device detection — drives copy, button order, and platform-specific guidance.
  // SSR-safe: defaults to false on server, hydrates on first client render.
  const device = useMemo(() => {
    if (typeof navigator === "undefined") {
      return { isMobile: false, isIOS: false, isAndroid: false };
    }
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || /Mobi|Mobile/i.test(ua);
    return { isMobile, isIOS, isAndroid };
  }, []);

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
    setErrorKind(null);

    // HEIC isn't browser-renderable — give a clear, friendly message instead of silent fail
    const name = file.name?.toLowerCase() ?? "";
    if (name.endsWith(".heic") || name.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif") {
      const msg = "iPhone HEIC photos aren't supported yet. In your camera settings switch to 'Most Compatible' or share the photo as JPEG, then try again.";
      setError(msg);
      setErrorKind("heic");
      toast.error(msg);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("That file type isn't supported. Please upload a JPEG, PNG, or WEBP photo.");
      setErrorKind("format");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That photo is larger than 6 MB. Try a smaller version or take a fresh selfie.");
      setErrorKind("too_large");
      return;
    }

    setIsReadingFile(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPhotoDataUrl(dataUrl);
      setStep("style");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't read that photo. Try another.";
      setError(msg);
      setErrorKind("read_failed");
      toast.error(msg);
    } finally {
      setIsReadingFile(false);
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, sessionId]);

  // Camera permission fallback: when the user taps "Take a selfie" on mobile,
  // we record a timestamp. If they return to the page without selecting a
  // photo (likely because they denied the OS camera prompt or backed out),
  // we surface a friendly help panel pointing them to "Upload a photo" and
  // explaining how to grant camera permission in their browser.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const openedAt = cameraOpenedAtRef.current;
      if (!openedAt) return;
      // Only treat as "denied/cancelled" if the user came back fast AND no
      // photo was set. >300ms guards against the flicker of opening the
      // camera UI; isReadingFile=true means a photo is being processed.
      const elapsed = Date.now() - openedAt;
      cameraOpenedAtRef.current = null;
      if (elapsed > 300 && !photoDataUrl && !isReadingFile) {
        setCameraHelpOpen(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [photoDataUrl, isReadingFile]);

  const openCamera = () => {
    if (isReadingFile) return;
    setCameraHelpOpen(false);
    setError(null);
    setErrorKind(null);
    cameraOpenedAtRef.current = Date.now();
    cameraInputRef.current?.click();
  };

  const openUpload = () => {
    if (isReadingFile) return;
    setCameraHelpOpen(false);
    setError(null);
    setErrorKind(null);
    fileInputRef.current?.click();
  };

  const handleStylePick = (id: string) => {
    setStyleId(id);
    setColorId(null);
    void generate(id, null);
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

    const headerParts: string[] = [];
    if (faceLabel) headerParts.push(`face shape: ${faceLabel}`);
    if (undertoneLabel) headerParts.push(`skin undertone: ${undertoneLabel}`);
    const contextHeader = headerParts.length
      ? `[My features → ${headerParts.join(" · ")}]`
      : `[My features → not specified — happy for the stylist to assess in person]`;

    const lines = [
      contextHeader,
      `I just tried on a look in the virtual try-on and want your take.`,
      styleMeta ? `• Style: ${styleMeta.name}${styleMeta.blurb ? ` — ${styleMeta.blurb}` : ""}` : null,
      colorMeta ? `• Color: ${colorMeta.name}${colorMeta.blurb ? ` — ${colorMeta.blurb}` : ""}` : `• Color: keeping my current color`,
      faceLabel ? `• Face shape: ${faceLabel}` : null,
      undertoneLabel ? `• Skin undertone: ${undertoneLabel}` : null,
      renderSignedUrl ? `• Preview: ${renderSignedUrl}` : null,
      ``,
      `Please factor my face shape and undertone into your guidance, and tell me which stylist would be a great fit and what to expect at my appointment.`,
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
    if (step === "style") setStep("intro");
    else if (step === "preview") setStep("style");
    else if (step === "convert") setStep("preview");
  };

  const resetFilters = () => {
    setFaceShape(null);
    setUndertone(null);
    setCategory(null);
    toast.success("Filters cleared");
  };

  const hasFilters = faceShape !== null || undertone !== null || category !== null;
  const activeFilterCount = (faceShape ? 1 : 0) + (undertone ? 1 : 0) + (category ? 1 : 0);

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
              <p className="font-display text-lg sm:text-xl text-cream truncate">Preview a New Hairstyle</p>
              <p className="font-body text-[11px] text-cream/45 truncate">
                AI-generated preview · Your stylist tailors the final result
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
            step === "intro" && errorKind ? (
              <div className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-left">
                <p className="font-body text-sm text-destructive mb-1">
                  {errorKind === "heic" && "We can't read iPhone HEIC photos yet"}
                  {errorKind === "format" && "That file type isn't supported"}
                  {errorKind === "too_large" && "That photo is too large"}
                  {errorKind === "read_failed" && "We couldn't read that photo"}
                  {errorKind === "generic" && "Something went wrong"}
                </p>
                <p className="font-body text-xs text-cream/70 leading-relaxed mb-3">
                  {errorKind === "heic" &&
                    "Open Settings → Camera → Formats → Most Compatible on your iPhone, then take a fresh selfie below — or pick a JPEG from your library."}
                  {errorKind === "format" &&
                    "We accept JPEG, PNG, or WEBP. Pick a different photo or take a new selfie."}
                  {errorKind === "too_large" &&
                    "The file must be under 6 MB. A fresh selfie from your camera is usually well under the limit."}
                  {errorKind === "read_failed" &&
                    "The file may be corrupt or partially downloaded. Try a different photo or take a fresh selfie."}
                  {errorKind === "generic" && error}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCamera}
                    disabled={isReadingFile}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/15 px-3 py-1.5 font-body text-xs text-gold hover:bg-gold/25 disabled:opacity-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {device.isMobile ? "Take a fresh selfie" : "Use webcam"}
                  </button>
                  <button
                    onClick={openUpload}
                    disabled={isReadingFile}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 bg-charcoal/40 px-3 py-1.5 font-body text-xs text-cream/85 hover:border-gold/60 hover:text-cream disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Pick a different photo
                  </button>
                  <button
                    onClick={() => { setError(null); setErrorKind(null); }}
                    className="ml-auto font-body text-[11px] text-cream/55 underline underline-offset-4 hover:text-gold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-body text-sm text-destructive">
                {error}
              </div>
            )
          )}

          {step === "intro" && (
            <div className="mx-auto max-w-xl text-center">
              <Wand2 className="mx-auto mb-4 h-10 w-10 text-gold" />
              <h2 className="font-display text-3xl text-cream mb-3">See yourself transformed</h2>
              <p className="font-body text-sm text-cream/70 mb-6 leading-relaxed">
                {device.isMobile
                  ? "Snap a quick selfie and we'll preview a new hairstyle in seconds — so you walk into your appointment knowing exactly what you want."
                  : "Upload a clear, front-facing selfie and we'll preview a new hairstyle in seconds — so you walk into your appointment knowing exactly what you want."}
              </p>

              {/* Quick selfie quality tips — proven to dramatically improve render quality */}
              <div className="mb-6 grid grid-cols-3 gap-2 text-left">
                <div className="rounded-lg border border-border/50 bg-charcoal/30 p-2.5">
                  <Sun className="mb-1 h-4 w-4 text-gold" />
                  <p className="font-body text-[11px] leading-snug text-cream/75">Bright, even light — face the window</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-charcoal/30 p-2.5">
                  <User className="mb-1 h-4 w-4 text-gold" />
                  <p className="font-body text-[11px] leading-snug text-cream/75">Look straight ahead, neutral expression</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-charcoal/30 p-2.5">
                  <Sparkle className="mb-1 h-4 w-4 text-gold" />
                  <p className="font-body text-[11px] leading-snug text-cream/75">Hairline fully visible — no hat or tie-back</p>
                </div>
              </div>

              {/* Mobile: camera primary, upload secondary. Desktop: upload primary, camera hidden. */}
              {device.isMobile ? (
                <div className="space-y-3">
                  <button
                    onClick={openCamera}
                    disabled={isReadingFile}
                    className="group flex w-full flex-col items-center gap-2 rounded-xl border-2 border-gold bg-gold/10 px-6 py-7 text-cream transition-colors hover:bg-gold/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-8 w-8 text-gold transition-transform group-hover:scale-110" />
                    <span className="font-body text-base text-cream">Take a selfie</span>
                    <span className="font-body text-xs text-cream/65">
                      {device.isIOS ? "Opens your front camera — allow access when iOS asks" : "Opens your front camera — tap allow when prompted"}
                    </span>
                  </button>
                  <button
                    onClick={openUpload}
                    disabled={isReadingFile}
                    className="group flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-cream/25 bg-charcoal/30 px-6 py-4 text-cream/75 transition-colors hover:border-gold/60 hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="h-5 w-5 text-cream/60" />
                    <span className="font-body text-sm">Or pick a photo from your library</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={openUpload}
                    disabled={isReadingFile}
                    className="group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-charcoal/40 px-6 py-8 text-cream/80 transition-colors hover:border-gold hover:bg-charcoal/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-7 w-7 text-gold transition-transform group-hover:scale-110" />
                    <span className="font-body text-base text-cream">Upload a photo</span>
                    <span className="font-body text-xs text-cream/55">JPEG, PNG, WEBP · up to 6 MB</span>
                  </button>
                  <button
                    onClick={openCamera}
                    disabled={isReadingFile}
                    className="group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-charcoal/40 px-6 py-8 text-cream/80 transition-colors hover:border-gold hover:bg-charcoal/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-7 w-7 text-gold transition-transform group-hover:scale-110" />
                    <span className="font-body text-base text-cream">Use webcam</span>
                    <span className="font-body text-xs text-cream/55">If your computer has a camera</span>
                  </button>
                </div>
              )}

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
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="user"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.currentTarget.value = "";
                }}
              />

              {isReadingFile && (
                <div className="mt-6 flex items-center justify-center gap-2 text-cream/70">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  <span className="font-body text-sm">Reading your photo…</span>
                </div>
              )}

              {/* Camera permission fallback — appears if guest taps camera then comes back without a photo */}
              {cameraHelpOpen && (
                <div className="mt-6 rounded-lg border border-gold/40 bg-gold/5 p-4 text-left">
                  <p className="font-body text-sm text-cream mb-2">Didn't see the camera open?</p>
                  <p className="font-body text-xs text-cream/70 leading-relaxed mb-3">
                    Your browser may have blocked camera access. You can either:
                  </p>
                  <ul className="font-body text-xs text-cream/70 leading-relaxed mb-3 list-disc pl-5 space-y-1">
                    <li>
                      <button onClick={openUpload} className="text-gold underline underline-offset-2">
                        Pick a photo from your library
                      </button>{" "}
                      instead — works every time.
                    </li>
                    {device.isIOS && (
                      <li>Or open <span className="text-cream">Settings → Safari → Camera → Allow</span>, then tap "Take a selfie" again.</li>
                    )}
                    {device.isAndroid && (
                      <li>Or tap the lock icon left of the address bar → <span className="text-cream">Permissions → Camera → Allow</span>, then refresh.</li>
                    )}
                  </ul>
                  <button
                    onClick={() => setCameraHelpOpen(false)}
                    className="font-body text-[11px] text-cream/55 underline underline-offset-4 hover:text-gold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {device.isIOS && (
                <p className="mt-6 font-body text-[11px] text-cream/45 leading-relaxed">
                  iPhone tip: if "Upload a photo" gives a HEIC error, open <span className="text-cream/65">Settings → Camera → Formats → Most Compatible</span>, then take a fresh photo.
                </p>
              )}
              <p className={cn("font-body text-[11px] text-cream/45 leading-relaxed", device.isIOS ? "mt-3" : "mt-6")}>
                Your photo is used only to generate your preview and is automatically removed after 7 days. We never share it.
              </p>
            </div>
          )}

          {step === "style" && (
            <div>
              <h2 className="font-display text-2xl text-cream mb-1 text-center">Choose a style</h2>
              <p className="font-body text-sm text-cream/60 mb-4 text-center">
                Tap any look to see it on you. You can try as many as you want.
              </p>

              {/* Optional refinement: face shape, undertone, category — collapsed by default */}
              <div className="mx-auto mb-5 max-w-3xl">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setFiltersOpen((v) => !v)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-body text-xs transition-colors",
                      filtersOpen || hasFilters
                        ? "border-gold/60 bg-gold/10 text-gold"
                        : "border-border bg-charcoal/40 text-cream/70 hover:border-gold/60"
                    )}
                  >
                    {filtersOpen ? "Hide refinements" : "Refine for my face & vibe"}
                    {activeFilterCount > 0 && !filtersOpen && (
                      <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold/20 px-1 text-[10px] text-gold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="font-body text-[11px] text-cream/55 underline underline-offset-4 hover:text-gold"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {filtersOpen && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-charcoal/30 p-4 space-y-4">
                    <div>
                      <p className="font-body text-[11px] uppercase tracking-wider text-cream/55 mb-2">Vibe</p>
                      <div className="flex flex-wrap gap-1.5">
                        {TRY_ON_CATEGORIES.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setCategory(category === c.id ? null : c.id)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 font-body text-xs transition-colors",
                              category === c.id
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                            )}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-body text-[11px] uppercase tracking-wider text-cream/55 mb-2">Face shape <span className="normal-case text-cream/40">(optional)</span></p>
                      <div className="flex flex-wrap gap-1.5">
                        {FACE_SHAPES.filter((f) => f.id !== "unsure").map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFaceShape(faceShape === f.id ? null : f.id)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 font-body text-xs transition-colors",
                              faceShape === f.id
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-body text-[11px] uppercase tracking-wider text-cream/55 mb-2">Skin undertone <span className="normal-case text-cream/40">(optional)</span></p>
                      <div className="flex flex-wrap gap-1.5">
                        {UNDERTONES.filter((u) => u.id !== "unsure").map((u) => (
                          <button
                            key={u.id}
                            onClick={() => setUndertone(undertone === u.id ? null : u.id)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 font-body text-xs transition-colors",
                              undertone === u.id
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                            )}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="font-body text-[11px] text-cream/45">
                      Optional — helps us sort the most flattering looks first. Your stylist always has the final say.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    disabled={isGenerating}
                    onClick={() => handleStylePick(s.id)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-border bg-charcoal/40 p-3 text-left transition-colors hover:border-gold/60 hover:bg-charcoal/60 disabled:opacity-50"
                  >
                    <span className="font-display text-base text-cream">{s.name}</span>
                    <MatchBadge tier={styleMatchTier(s.id, faceShape)} />
                    <span className="font-body text-[11px] text-cream/55">{s.blurb}</span>
                  </button>
                ))}
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

              {/* Inline color iteration — moved here so guests get the wow first, then refine */}
              <div className="mx-auto mt-6 max-w-2xl">
                <p className="font-body text-[11px] uppercase tracking-wider text-cream/55 mb-2 text-center">Try a color</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    disabled={isGenerating}
                    onClick={() => handleColorPick(null)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-body text-xs transition-colors disabled:opacity-50",
                      colorId === null
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                    )}
                  >
                    Cut only
                  </button>
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      disabled={isGenerating}
                      onClick={() => handleColorPick(c.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 font-body text-xs transition-colors disabled:opacity-50",
                        colorId === c.id
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                      )}
                    >
                      <span className="h-4 w-4 rounded-full border border-cream/15" style={{ backgroundColor: c.swatch }} />
                      {c.name}
                      <MatchBadge tier={colorMatchTier(c.id, undertone)} />
                    </button>
                  ))}
                </div>
                {isGenerating && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-cream/70">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    <span className="font-body text-xs">Updating preview…</span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 max-w-2xl mx-auto">
                <button onClick={saveLook} className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 font-body text-sm text-gold hover:bg-gold/20">
                  <Check className="mr-1.5 inline h-4 w-4" /> Save look
                </button>
                <button onClick={() => setStep("style")} className="rounded-lg border border-border bg-charcoal/40 px-3 py-2.5 font-body text-sm text-cream hover:border-gold/60">
                  Try another style
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
