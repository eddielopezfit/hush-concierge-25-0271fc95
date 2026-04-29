import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Camera, Check, Download, Heart, Image as ImageIcon, Loader2, MessageCircle, RotateCcw, Sparkles, Sparkle, Sun, Trash2, Upload, User, Wand2, X } from "lucide-react";
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
  /** Marked as a favorite by the guest (heart icon). */
  favorite?: boolean;
  /** Timestamp of when the look was generated, used for ordering. */
  createdAt?: number;
}

interface TryOnExperienceProps {
  source: string;
  onClose: () => void;
}

const MAX_FILE_BYTES = 6 * 1024 * 1024;

// Session-scoped persistence for refine filters. Stored as plain string IDs;
// readers validate that the persisted value still matches a known option
// before applying it (defends against stale IDs after a deploy).
const FILTER_KEYS = {
  faceShape: "hush_tryon_face_shape",
  undertone: "hush_tryon_undertone",
  category: "hush_tryon_category",
} as const;

// Long-lived guest preference: should a fresh photo upload reset the refine
// chips, or should we preserve them? Stored in localStorage so the choice
// follows the guest across visits. Default = reset (safer match to new face).
const RESET_ON_UPLOAD_KEY = "hush_tryon_reset_on_upload";

function readResetOnUploadPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = window.localStorage.getItem(RESET_ON_UPLOAD_KEY);
    if (v === null) return true; // default
    return v === "1";
  } catch {
    return true;
  }
}

function writeResetOnUploadPref(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RESET_ON_UPLOAD_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function readPersistedFilter<T extends string>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(key);
    return v ? (v as T) : null;
  } catch {
    return null;
  }
}

function writePersistedFilter(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.sessionStorage.setItem(key, value);
    else window.sessionStorage.removeItem(key);
  } catch {
    /* ignore — persistence is best-effort */
  }
}

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
 * SHA-256 hash of the raw file bytes, returned as a hex string. Used to
 * detect "is this truly a different photo?" — far more reliable than
 * comparing data URLs, which can differ across re-encodes / EXIF strips
 * even when the visual content is identical, and which can also collide
 * across different files of the same MIME type after a base64 round-trip.
 *
 * Falls back to a cheap composite key (name|size|lastModified) if the
 * SubtleCrypto API is unavailable (very old browsers, insecure context).
 */
async function hashFile(file: File): Promise<string> {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buf);
      const bytes = new Uint8Array(digest);
      let hex = "";
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, "0");
      }
      return `sha256:${hex}`;
    }
  } catch {
    /* fall through to fallback */
  }
  return `meta:${file.name}|${file.size}|${(file as File).lastModified ?? 0}`;
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
  // Refine-filter selections persist for the duration of the browser session
  // (sessionStorage) so guests who tap back/forth after upload don't lose
  // their chip choices. Cleared via "Clear filters" or when the tab closes.
  const [faceShape, setFaceShape] = useState<FaceShape | null>(() => {
    const v = readPersistedFilter<FaceShape>(FILTER_KEYS.faceShape);
    return v && FACE_SHAPES.some((f) => f.id === v) ? v : null;
  });
  const [undertone, setUndertone] = useState<Undertone | null>(() => {
    const v = readPersistedFilter<Undertone>(FILTER_KEYS.undertone);
    return v && UNDERTONES.some((u) => u.id === v) ? v : null;
  });
  const [category, setCategory] = useState<TryOnStyleCategory | null>(() => {
    const v = readPersistedFilter<TryOnStyleCategory>(FILTER_KEYS.category);
    return v && TRY_ON_CATEGORIES.some((c) => c.id === v) ? v : null;
  });
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
  // Brief skeleton shimmer for the refine chips immediately after the upload
  // resolves and the style step mounts. Pure perception polish — signals to
  // guests "we're tailoring your refinements" before chips become tappable.
  const [chipsReady, setChipsReady] = useState(false);
  // Guest preference: reset refine chips when a brand-new photo is uploaded?
  // Defaults to true (better matches to the new face). Persisted across visits.
  const [resetChipsOnUpload, setResetChipsOnUpload] = useState<boolean>(
    () => readResetOnUploadPref()
  );
  const resetChipsOnUploadRef = useRef(resetChipsOnUpload);
  useEffect(() => {
    resetChipsOnUploadRef.current = resetChipsOnUpload;
    writeResetOnUploadPref(resetChipsOnUpload);
  }, [resetChipsOnUpload]);
  // Hash of the most recently accepted photo. Drives "truly different photo?"
  // detection so re-uploading the same shot (even after a re-encode or EXIF
  // strip) doesn't wipe deliberate chip selections.
  const photoHashRef = useRef<string | null>(null);
  // Refs mirror the latest chip state so stable callbacks (e.g. handleFile,
  // wrapped in useCallback with [] deps) can read current values without
  // capturing stale closures.
  const faceShapeRef = useRef<FaceShape | null>(null);
  const undertoneRef = useRef<Undertone | null>(null);
  const categoryRef = useRef<TryOnStyleCategory | null>(null);
  useEffect(() => { faceShapeRef.current = faceShape; }, [faceShape]);
  useEffect(() => { undertoneRef.current = undertone; }, [undertone]);
  useEffect(() => { categoryRef.current = category; }, [category]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cameraOpenedAtRef = useRef<number | null>(null);
  const [cameraHelpOpen, setCameraHelpOpen] = useState(false);
  // True while the user has tapped "Take a selfie" on mobile and we're waiting
  // for them to either confirm a shot or come back without one. Drives the
  // fading framing-guide overlay so guests have a visual reference for face
  // centering and distance both before and immediately after the OS camera UI.
  const [cameraActive, setCameraActive] = useState(false);

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

  // Funnel tracking — fire "started" on mount, and on unmount fire either
  // "abandoned" (no preview reached) or nothing (preview was shown, which is
  // already tracked separately). Uses a ref so the latest value is read at
  // unmount time even though the effect itself only runs once.
  const reachedPreviewRef = useRef(false);
  useEffect(() => {
    trackFunnelEvent("hairstyle_preview", "started", {
      metadata: { source },
    });
    return () => {
      if (!reachedPreviewRef.current) {
        trackFunnelEvent("hairstyle_preview", "abandoned", {
          beacon: true, // survives tab close
          metadata: { source },
        });
      }
    };
  // Run exactly once per modal lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      trackFunnelEvent("hairstyle_preview", "upload_failed", { metadata: { reason: "heic" } });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("That file type isn't supported. Please upload a JPEG, PNG, or WEBP photo.");
      setErrorKind("format");
      trackFunnelEvent("hairstyle_preview", "upload_failed", { metadata: { reason: "format", file_type: file.type } });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That photo is larger than 6 MB. Try a smaller version or take a fresh selfie.");
      setErrorKind("too_large");
      trackFunnelEvent("hairstyle_preview", "upload_failed", { metadata: { reason: "too_large", size_kb: Math.round(file.size / 1024) } });
      return;
    }

    setIsReadingFile(true);
    try {
      // Hash the raw bytes first so we can decide "truly new photo?" before
      // any chip-clearing side effects fire. Run hashing and decoding in
      // parallel — they're independent reads of the same File.
      const [dataUrl, nextHash] = await Promise.all([
        fileToDataUrl(file),
        hashFile(file),
      ]);
      const isTrulyNewPhoto = photoHashRef.current !== nextHash;
      photoHashRef.current = nextHash;
      setPhotoDataUrl(() => {
        if (isTrulyNewPhoto) {
          const hadActiveChips =
            faceShapeRef.current !== null ||
            undertoneRef.current !== null ||
            categoryRef.current !== null;
          if (resetChipsOnUploadRef.current) {
            // Reset behavior — clear chips and confirm if any were active.
            setFaceShape(null);
            setUndertone(null);
            setCategory(null);
            writePersistedFilter(FILTER_KEYS.faceShape, null);
            writePersistedFilter(FILTER_KEYS.undertone, null);
            writePersistedFilter(FILTER_KEYS.category, null);
            if (hadActiveChips) {
              toast("Refinements reset for your new photo", {
                description: "Tap “Refine for my face & vibe” to retune.",
              });
            }
          } else if (hadActiveChips) {
            // Preserve behavior — let the guest know chips carried over.
            toast("Kept your refinements", {
              description: "Your face shape, vibe, and undertone still apply.",
            });
          }
          // Also clear any in-flight style/color picks tied to the old face.
          setStyleId(null);
          setColorId(null);
          setRenderDataUrl(null);
          setRenderSignedUrl(null);
          // Wipe the session gallery — looks belong to the previous photo.
          setSavedLooks([]);
        }
        return dataUrl;
      });
      setStep("style");
      trackFunnelEvent("hairstyle_preview", "upload_success", {
        metadata: { file_type: file.type, size_kb: Math.round(file.size / 1024) },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't read that photo. Try another.";
      setError(msg);
      setErrorKind("read_failed");
      toast.error(msg);
      trackFunnelEvent("hairstyle_preview", "upload_failed", { metadata: { reason: "read_failed" } });
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
        trackFunnelEvent("hairstyle_preview", "preview_failed", {
          metadata: { reason: "edge_error", style_id: chosenStyleId, color_id: chosenColorId },
        });
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
      reachedPreviewRef.current = true;
      // Auto-add every successful render to the session gallery (dedupe on
      // style+color, cap at 12, preserve favorite flag if it already existed).
      setSavedLooks((prev) => {
        const key = `${chosenStyleId}|${chosenColorId ?? ""}`;
        const existingIdx = prev.findIndex(
          (l) => `${l.styleId}|${l.colorId ?? ""}` === key,
        );
        const wasFavorite = existingIdx >= 0 ? !!prev[existingIdx].favorite : false;
        const next: SavedLook = {
          id: existingIdx >= 0 ? prev[existingIdx].id : crypto.randomUUID(),
          styleId: chosenStyleId,
          colorId: chosenColorId,
          renderDataUrl: payload.renderDataUrl,
          favorite: wasFavorite,
          createdAt: Date.now(),
        };
        const without = prev.filter((_, i) => i !== existingIdx);
        return [next, ...without].slice(0, 12);
      });
      trackFunnelEvent("hairstyle_preview", "preview_shown", {
        metadata: { style_id: chosenStyleId, color_id: chosenColorId },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
      trackFunnelEvent("hairstyle_preview", "preview_failed", {
        metadata: { reason: "exception", style_id: chosenStyleId, color_id: chosenColorId },
      });
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
      // Either way, the OS camera sheet has closed — drop the framing overlay
      // unless a photo is still being read in (handled below).
      if (!isReadingFile) setCameraActive(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [photoDataUrl, isReadingFile]);

  // Once a photo lands (or a file is being read), the overlay is no longer useful.
  useEffect(() => {
    if (photoDataUrl || isReadingFile) setCameraActive(false);
  }, [photoDataUrl, isReadingFile]);

  const openCamera = () => {
    if (isReadingFile) return;
    setCameraHelpOpen(false);
    setError(null);
    setErrorKind(null);
    cameraOpenedAtRef.current = Date.now();
    if (device.isMobile) setCameraActive(true);
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
    trackFunnelEvent("hairstyle_preview", "style_selected", { metadata: { style_id: id } });
    void generate(id, null);
  };

  const handleColorPick = async (id: string | null) => {
    setColorId(id);
    trackFunnelEvent("hairstyle_preview", "color_iterated", { metadata: { color_id: id } });
    if (styleId) await generate(styleId, id);
  };

  const saveLook = () => {
    if (!styleId || !renderDataUrl) return;
    // Toggle favorite on the matching gallery entry. Every render is already
    // captured into savedLooks automatically — this just marks/unmarks it.
    let nowFavorite = false;
    setSavedLooks((prev) =>
      prev.map((l) => {
        if (l.styleId === styleId && l.colorId === colorId) {
          nowFavorite = !l.favorite;
          return { ...l, favorite: nowFavorite };
        }
        return l;
      }),
    );
    if (nowFavorite) {
      trackFunnelEvent("hairstyle_preview", "saved_look", {
        metadata: { style_id: styleId, color_id: colorId },
      });
      toast.success("Marked as favorite");
    } else {
      toast("Removed from favorites");
    }
  };

  const removeLookFromGallery = (lookId: string) => {
    setSavedLooks((prev) => prev.filter((l) => l.id !== lookId));
  };

  const downloadRender = () => {
    if (!renderDataUrl) return;
    try {
      const styleMeta = styleId ? getStyleMeta(styleId) : null;
      const colorMeta = colorId ? getColorMeta(colorId) : null;
      const slug = [styleMeta?.name, colorMeta?.name]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "look";
      const a = document.createElement("a");
      a.href = renderDataUrl;
      a.download = `hush-tryon-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      trackFunnelEvent("hairstyle_preview", "downloaded_look", {
        metadata: { style_id: styleId, color_id: colorId },
      });
      toast.success("Saved to your device");
    } catch {
      toast.error("Couldn't download — try long-pressing the image instead");
    }
  };

  const goToBooking = () => {
    if (!styleId) return;
    const styleMeta = getStyleMeta(styleId);
    const colorMeta = colorId ? getColorMeta(colorId) : null;
    const lookLabel = [styleMeta?.name, colorMeta?.name].filter(Boolean).join(" · ");
    trackFunnelEvent("hairstyle_preview", "converted", {
      beacon: true,
      metadata: { style_id: styleId, color_id: colorId },
    });
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
    toast.success("Refine filters reset");
  };

  // Sync filter selections to sessionStorage so they survive step navigation
  // (back/forward), step refreshes from style → preview → style, and even a
  // brief tab switch — without leaking across browser sessions.
  useEffect(() => {
    writePersistedFilter(FILTER_KEYS.faceShape, faceShape);
  }, [faceShape]);
  useEffect(() => {
    writePersistedFilter(FILTER_KEYS.undertone, undertone);
  }, [undertone]);
  useEffect(() => {
    writePersistedFilter(FILTER_KEYS.category, category);
  }, [category]);

  // Arm the chip skeleton each time we land on the style step with a fresh
  // photo. ~550ms feels intentional without holding back interaction.
  useEffect(() => {
    if (step !== "style" || !photoDataUrl) {
      setChipsReady(false);
      return;
    }
    setChipsReady(false);
    const t = window.setTimeout(() => setChipsReady(true), 550);
    return () => window.clearTimeout(t);
  }, [step, photoDataUrl]);

  const hasFilters = faceShape !== null || undertone !== null || category !== null;
  const activeFilterCount = (faceShape ? 1 : 0) + (undertone ? 1 : 0) + (category ? 1 : 0);

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/90 backdrop-blur-sm p-0 sm:p-6 animate-fade-in">
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-card text-cream shadow-2xl sm:h-[92vh] sm:rounded-2xl sm:border sm:border-gold/20">
        {/* Mobile framing-guide overlay — fades in while the OS camera is
            active. Sits above modal content but below any toasts. Tapping
            anywhere dismisses it without affecting the camera flow. */}
        {cameraActive && device.isMobile && (
          <div
            className="pointer-events-auto absolute inset-0 z-[110] flex flex-col items-center justify-center bg-charcoal/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setCameraActive(false)}
            role="dialog"
            aria-label="Selfie framing guide"
          >
            {/* Centered oval framing guide */}
            <div className="relative flex items-center justify-center" aria-hidden="true">
              <svg
                viewBox="0 0 220 280"
                className="h-[60vh] max-h-[420px] w-auto text-gold/80 drop-shadow-[0_0_24px_rgba(201,168,76,0.35)]"
                fill="none"
              >
                {/* Soft outer glow ring */}
                <ellipse cx="110" cy="140" rx="98" ry="128" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 6" />
                {/* Primary oval */}
                <ellipse cx="110" cy="140" rx="84" ry="112" stroke="currentColor" strokeWidth="2.5" />
                {/* Crosshair — eye-line + center axis to encourage centering */}
                <line x1="110" y1="20" x2="110" y2="60" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="110" y1="220" x2="110" y2="260" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="20" y1="125" x2="42" y2="125" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="178" y1="125" x2="200" y2="125" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
              </svg>
            </div>

            <div className="mt-6 max-w-xs px-6 text-center">
              <p className="font-display text-lg text-cream mb-1">Frame your face</p>
              <ul className="font-body text-xs text-cream/75 leading-relaxed space-y-1">
                <li>Center your face inside the oval</li>
                <li>Hold your phone about an arm's length away</li>
                <li>Show your full hairline and shoulders</li>
              </ul>
              <p className="mt-4 font-body text-[11px] text-cream/45">
                Tap anywhere to hide this guide
              </p>
            </div>
          </div>
        )}

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
              <div className="mb-1 flex items-center justify-center gap-2">
                <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-body text-[10px] uppercase tracking-wider text-gold">
                  Hair
                </span>
              </div>
              <h2 className="font-display text-2xl text-cream mb-1 text-center">Choose a hairstyle</h2>
              <p className="font-body text-sm text-cream/60 mb-4 text-center">
                Tap any look to see it on you. You can try as many as you want.
              </p>

              {/* Optional refinement: face shape, undertone, category — only shown after a photo
                  is uploaded so guests aren't asked to refine looks they can't preview yet. */}
              {photoDataUrl && (
              <div className="mx-auto mb-5 max-w-3xl">
                {!chipsReady ? (
                  <div
                    className="flex items-center justify-center gap-2 animate-fade-in"
                    aria-hidden="true"
                  >
                    <span className="h-7 w-44 rounded-full bg-cream/5 animate-pulse" />
                    <span className="h-7 w-20 rounded-full bg-cream/5 animate-pulse" />
                  </div>
                ) : (
                <>
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
                      aria-label="Reset face shape, vibe, and undertone filters"
                      className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 bg-charcoal/40 px-2.5 py-1 font-body text-[11px] text-cream/85 transition-colors hover:border-gold/60 hover:text-gold"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset refine filters
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
                    {/* Guest preference: do new uploads reset these chips, or keep them?
                        Stored in localStorage so the choice persists across visits. */}
                    <label className="mt-1 flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={resetChipsOnUpload}
                        onChange={(e) => setResetChipsOnUpload(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 accent-[hsl(var(--gold))] cursor-pointer"
                      />
                      <span className="font-body text-[11px] text-cream/65 leading-relaxed">
                        Reset these refinements when I upload a new photo
                        <span className="block text-cream/40">
                          {resetChipsOnUpload
                            ? "On — uploads start fresh so the new face guides results."
                            : "Off — your face shape, vibe, and undertone carry over to every upload."}
                        </span>
                      </span>
                    </label>
                    {/* On-demand reset inside the open panel — mirrors the
                        compact pill in the header so guests can always wipe
                        chips without first hunting for a small link. */}
                    {hasFilters && (
                      <div className="pt-1">
                        <button
                          onClick={resetFilters}
                          aria-label="Reset face shape, vibe, and undertone filters"
                          className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 bg-charcoal/40 px-3 py-1.5 font-body text-xs text-cream/85 transition-colors hover:border-gold/60 hover:text-gold"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reset refine filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </>
                )}
              </div>
              )}

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
                <p className="font-body text-[11px] uppercase tracking-wider text-cream/55 mb-1 text-center">Try a color · technique</p>
                <p className="font-body text-[11px] text-cream/45 mb-3 text-center">Each option matches a real Hush service.</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <button
                    disabled={isGenerating}
                    onClick={() => handleColorPick(null)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left font-body transition-colors disabled:opacity-50",
                      colorId === null
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                    )}
                  >
                    <span className="text-xs font-medium">Cut only</span>
                    <span className="text-[10px] leading-snug text-cream/50">Keep your current color</span>
                  </button>
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      disabled={isGenerating}
                      onClick={() => handleColorPick(c.id)}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border px-3 py-2 text-left font-body transition-colors disabled:opacity-50",
                        colorId === c.id
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-border bg-charcoal/40 text-cream/75 hover:border-gold/60"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 shrink-0 rounded-full border border-cream/15" style={{ backgroundColor: c.swatch }} />
                        <span className="text-xs font-medium leading-tight">{c.name}</span>
                        <MatchBadge tier={colorMatchTier(c.id, undertone)} />
                      </span>
                      <span className="text-[10px] leading-snug text-cream/50">{c.blurb}</span>
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

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl mx-auto">
                <button
                  onClick={saveLook}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 font-body text-sm transition-colors",
                    currentLookIsFavorite
                      ? "border-gold bg-gold/20 text-gold"
                      : "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20",
                  )}
                >
                  <Heart
                    className={cn(
                      "mr-1.5 inline h-4 w-4",
                      currentLookIsFavorite && "fill-current",
                    )}
                  />{" "}
                  {currentLookIsFavorite ? "Favorited" : "Favorite"}
                </button>
                <button onClick={downloadRender} className="rounded-lg border border-border bg-charcoal/40 px-3 py-2.5 font-body text-sm text-cream hover:border-gold/60">
                  <Download className="mr-1.5 inline h-4 w-4" /> Download
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
                  <div className="mb-3 flex items-center justify-between gap-3 max-w-2xl mx-auto">
                    <div>
                      <p className="font-body text-xs uppercase tracking-wider text-cream/55">Your session gallery</p>
                      <p className="font-body text-[11px] text-cream/40">
                        Tap any look to revisit it · {savedLooks.length}/12 saved this session
                      </p>
                    </div>
                    <span className="font-body text-[10px] text-cream/40 hidden sm:inline">
                      Cleared when you upload a new photo
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
                    {savedLooks.map((l) => {
                      const isActive =
                        l.styleId === styleId && l.colorId === colorId;
                      const styleMeta = getStyleMeta(l.styleId);
                      const colorMeta = l.colorId ? getColorMeta(l.colorId) : null;
                      const label = `${styleMeta?.name ?? "Look"}${colorMeta ? ` · ${colorMeta.name}` : ""}`;
                      return (
                        <div
                          key={l.id}
                          className="group relative flex shrink-0 flex-col items-center gap-1"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setStyleId(l.styleId);
                              setColorId(l.colorId);
                              setRenderDataUrl(l.renderDataUrl);
                            }}
                            className="relative block"
                            title={label}
                            aria-label={`Revisit ${label}`}
                          >
                            <img
                              src={l.renderDataUrl}
                              alt={label}
                              className={cn(
                                "h-20 w-20 rounded-lg border-2 object-cover transition-all",
                                isActive
                                  ? "border-gold ring-2 ring-gold/40"
                                  : "border-border group-hover:border-gold/60",
                              )}
                            />
                            {l.favorite && (
                              <span className="absolute -top-1 -right-1 rounded-full bg-charcoal/90 p-1 ring-1 ring-gold/40">
                                <Heart className="h-3 w-3 fill-gold text-gold" />
                              </span>
                            )}
                          </button>
                          <span className="font-body text-[10px] text-cream/55 max-w-[80px] truncate text-center">
                            {styleMeta?.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLookFromGallery(l.id);
                            }}
                            className="absolute -top-1 -left-1 rounded-full bg-charcoal/90 p-1 text-cream/60 ring-1 ring-border opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100 focus:opacity-100"
                            aria-label={`Remove ${label} from gallery`}
                            title="Remove from gallery"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
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
                <button onClick={downloadRender} className="rounded-lg border border-border bg-charcoal/40 px-4 py-2.5 font-body text-sm text-cream hover:border-gold/60 inline-flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Download photo
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
