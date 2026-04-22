import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { ConciergeContext } from "@/types/concierge";
import { rememberLastCategory } from "@/hooks/useStartLuna";

const STORAGE_KEY = "hush_concierge_context";

function readFromStorage(): ConciergeContext | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? (JSON.parse(s) as ConciergeContext) : null;
  } catch { return null; }
}

function writeToStorage(ctx: ConciergeContext | null): void {
  try {
    if (ctx) localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

interface LunaContextType {
  isModalOpen: boolean;
  context: ConciergeContext | undefined;
  openModal: (ctx?: ConciergeContext) => void;
  closeModal: () => void;
  openChatWidget: (preferredTab?: unknown) => void;
  chatWidgetRequested: boolean;
  requestedTab: string | null;
  clearChatWidgetRequest: () => void;
  hasInteracted: boolean;
  markInteracted: () => void;
  // Unified concierge state
  conciergeContext: ConciergeContext | null;
  setConcierge: (ctx: ConciergeContext) => void;
  mergeConcierge: (partial: Partial<ConciergeContext>) => void;
  clearConcierge: () => void;
}

const LunaCtx = createContext<LunaContextType>({
  isModalOpen: false,
  context: undefined,
  openModal: () => {},
  closeModal: () => {},
  openChatWidget: () => {},
  chatWidgetRequested: false,
  requestedTab: null,
  clearChatWidgetRequest: () => {},
  hasInteracted: false,
  markInteracted: () => {},
  conciergeContext: null,
  setConcierge: () => {},
  mergeConcierge: () => {},
  clearConcierge: () => {},
});

export const LunaProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [context, setContext] = useState<ConciergeContext | undefined>();
  const [chatWidgetRequested, setChatWidgetRequested] = useState(false);
  const [requestedTab, setRequestedTab] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [conciergeContext, setConciergeContextState] = useState<ConciergeContext | null>(() => readFromStorage());

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setConciergeContextState(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setConcierge = useCallback((ctx: ConciergeContext) => {
    setConciergeContextState(ctx);
    writeToStorage(ctx);
  }, []);

  const mergeConcierge = useCallback((partial: Partial<ConciergeContext>) => {
    setConciergeContextState(prev => {
      const merged: ConciergeContext = {
        source:             partial.source             ?? prev?.source             ?? "",
        categories:         partial.categories         ?? prev?.categories         ?? [],
        goal:               partial.goal               !== undefined ? partial.goal               : (prev?.goal               ?? null),
        timing:             partial.timing             !== undefined ? partial.timing             : (prev?.timing             ?? null),
        service_subtype:    partial.service_subtype    !== undefined ? partial.service_subtype    : (prev?.service_subtype    ?? null),
        primary_category:   partial.primary_category   !== undefined ? partial.primary_category   : (prev?.primary_category   ?? null),
        multi_service_mode: partial.multi_service_mode !== undefined ? partial.multi_service_mode : (prev?.multi_service_mode ?? null),
        is_multi_service:   partial.is_multi_service   !== undefined ? partial.is_multi_service   : (prev?.is_multi_service   ?? false),
        is_new_client:      partial.is_new_client      !== undefined ? partial.is_new_client      : (prev?.is_new_client      ?? null),
        budget_sensitivity: partial.budget_sensitivity !== undefined ? partial.budget_sensitivity : (prev?.budget_sensitivity ?? null),
        preferredArtist:    partial.preferredArtist    !== undefined ? partial.preferredArtist    : (prev?.preferredArtist    ?? null),
        preferredArtistId:  partial.preferredArtistId  !== undefined ? partial.preferredArtistId  : (prev?.preferredArtistId  ?? null),
        category:           partial.category           !== undefined ? partial.category           : (prev?.category           ?? null),
        group:              partial.group              !== undefined ? partial.group              : (prev?.group              ?? null),
        item:               partial.item               !== undefined ? partial.item               : (prev?.item               ?? null),
        price:              partial.price              !== undefined ? partial.price              : (prev?.price              ?? null),
        quizCompletedAt:    partial.quizCompletedAt    !== undefined ? partial.quizCompletedAt    : (prev?.quizCompletedAt    ?? null),
      };
      writeToStorage(merged);
      // Persist the last meaningful service category for one-tap "Start Luna".
      rememberLastCategory(merged.primary_category ?? merged.category ?? merged.categories?.[0] ?? null);
      return merged;
    });
  }, []);

  const clearConcierge = useCallback(() => {
    setConciergeContextState(null);
    writeToStorage(null);
  }, []);

  const openModal = useCallback((ctx?: ConciergeContext) => {
    setContext(ctx);
    setIsModalOpen(true);
    setHasInteracted(true);
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const openChatWidget = useCallback((preferredTab?: unknown) => {
    // Accept an optional tab string. Guard against being passed as a raw
    // onClick handler (where the first arg is a SyntheticEvent, not a string).
    const tab = typeof preferredTab === "string" ? preferredTab : null;
    setRequestedTab(tab);
    setChatWidgetRequested(true);
    setHasInteracted(true);
  }, []);

  const clearChatWidgetRequest = useCallback(() => {
    setChatWidgetRequested(false);
    setRequestedTab(null);
  }, []);
  const markInteracted = useCallback(() => setHasInteracted(true), []);

  return (
    <LunaCtx.Provider value={{
      isModalOpen, context, openModal, closeModal,
      openChatWidget, chatWidgetRequested, requestedTab, clearChatWidgetRequest,
      hasInteracted, markInteracted,
      conciergeContext, setConcierge, mergeConcierge, clearConcierge,
    }}>
      {children}
    </LunaCtx.Provider>
  );
};

export const useLuna = () => useContext(LunaCtx);
