import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { ConciergeContext } from "@/types/concierge";

interface LunaContextType {
  isModalOpen: boolean;
  context: ConciergeContext | undefined;
  openModal: (ctx?: ConciergeContext) => void;
  closeModal: () => void;
  openChatWidget: () => void;
  chatWidgetRequested: boolean;
  clearChatWidgetRequest: () => void;
  hasInteracted: boolean;
  markInteracted: () => void;
}

const LunaCtx = createContext<LunaContextType>({
  isModalOpen: false,
  context: undefined,
  openModal: () => {},
  closeModal: () => {},
  openChatWidget: () => {},
  chatWidgetRequested: false,
  clearChatWidgetRequest: () => {},
  hasInteracted: false,
  markInteracted: () => {},
});

export const LunaProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [context, setContext] = useState<ConciergeContext | undefined>();
  const [chatWidgetRequested, setChatWidgetRequested] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const openModal = useCallback((ctx?: ConciergeContext) => {
    setContext(ctx);
    setIsModalOpen(true);
    setHasInteracted(true);
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const openChatWidget = useCallback(() => {
    setChatWidgetRequested(true);
    setHasInteracted(true);
  }, []);

  const clearChatWidgetRequest = useCallback(() => setChatWidgetRequested(false), []);

  const markInteracted = useCallback(() => setHasInteracted(true), []);

  return (
    <LunaCtx.Provider value={{
      isModalOpen, context, openModal, closeModal,
      openChatWidget, chatWidgetRequested, clearChatWidgetRequest,
      hasInteracted, markInteracted,
    }}>
      {children}
    </LunaCtx.Provider>
  );
};

export const useLuna = () => useContext(LunaCtx);
