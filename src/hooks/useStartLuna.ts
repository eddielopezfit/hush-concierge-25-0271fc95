import { useCallback } from "react";
import { useLuna } from "@/contexts/LunaContext";
import type { ServiceCategoryId } from "@/types/concierge";

const LAST_CATEGORY_KEY = "hush_last_category";
const LAST_GUIDE_KEY = "hush_last_guide";
const VALID: ServiceCategoryId[] = ["hair", "nails", "lashes", "skincare", "massage"];

/** Luna's panel tabs — kept loose to avoid importing UI types into this hook. */
export type LunaGuideId = "find" | "explore" | "artists" | "plan" | "chat";
const VALID_GUIDES: LunaGuideId[] = ["find", "explore", "artists", "plan", "chat"];

export function rememberLastGuide(guide: LunaGuideId | null | undefined): void {
  if (!guide || !VALID_GUIDES.includes(guide)) return;
  try { localStorage.setItem(LAST_GUIDE_KEY, guide); } catch { /* ignore */ }
}

export function readLastGuide(): LunaGuideId | null {
  try {
    const v = localStorage.getItem(LAST_GUIDE_KEY) as LunaGuideId | null;
    return v && VALID_GUIDES.includes(v) ? v : null;
  } catch { return null; }
}

export function rememberLastCategory(category: ServiceCategoryId | null | undefined): void {
  if (!category || !VALID.includes(category)) return;
  try { localStorage.setItem(LAST_CATEGORY_KEY, category); } catch { /* ignore */ }
}

export function readLastCategory(): ServiceCategoryId | null {
  try {
    const v = localStorage.getItem(LAST_CATEGORY_KEY) as ServiceCategoryId | null;
    return v && VALID.includes(v) ? v : null;
  } catch { return null; }
}

/**
 * One-tap Luna launcher. Merges the last-remembered service category into
 * concierge context (so Luna opens with the guest's recent intent) and
 * opens the chat widget directly to the Chat tab.
 */
export function useStartLuna() {
  const { openChatWidget, mergeConcierge, conciergeContext } = useLuna();

  return useCallback(() => {
    const last = readLastCategory();
    if (last) {
      const existing = conciergeContext?.categories ?? [];
      const categories = existing.includes(last) ? existing : [...existing, last];
      mergeConcierge({
        source: conciergeContext?.source || "start_luna_button",
        categories,
        primary_category: conciergeContext?.primary_category ?? last,
        category: conciergeContext?.category ?? last,
      });
    }
    openChatWidget(readLastGuide() ?? undefined);
  }, [openChatWidget, mergeConcierge, conciergeContext]);
}