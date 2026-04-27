import { m, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ServiceCategory, getCategoryWithCrossRefs } from "@/data/servicesMenuData";
import { useLuna } from "@/contexts/LunaContext";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { PriceConfidenceAccordion } from "@/components/PriceConfidenceAccordion";

interface ServiceMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ServiceCategory | null;
}

export const ServiceMenuModal = ({ isOpen, onClose, category }: ServiceMenuModalProps) => {
  const { openModal, setConcierge } = useLuna();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Resolve category with cross-referenced items
  const resolvedCategory = category ? getCategoryWithCrossRefs(category.id) ?? category : null;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (resolvedCategory && resolvedCategory.groups.length === 1) {
      setOpenAccordions([resolvedCategory.groups[0].name]);
    } else {
      setOpenAccordions([]);
    }
  }, [category?.id]);

  const buildCategoryContext = (groupName?: string, itemName?: string, itemPrice?: string): ConciergeContext => {
    if (!category) {
      return { source: "Service Menu", categories: [], goal: null, timing: null };
    }
    return {
      source: `Service Menu: ${category.title}`,
      categories: [category.id as ServiceCategoryId],
      goal: null,
      timing: null,
      group: groupName || null,
      item: itemName || null,
      price: itemPrice || null,
    };
  };

  const handleChatWithLuna = () => {
    const ctx = buildCategoryContext();
    setConcierge(ctx);
    onClose();
    setTimeout(() => openModal(ctx), 100);
  };

  if (!resolvedCategory) return null;

  const CategoryIcon = resolvedCategory.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/90 backdrop-blur-md"
          onClick={onClose}
        >
          <m.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full h-[90vh] md:h-auto md:max-h-[85vh] md:max-w-2xl lg:max-w-3xl md:mx-4 rounded-t-2xl md:rounded-xl border border-gold/30 bg-card shadow-[0_0_60px_-15px_hsl(43_45%_58%/0.3)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 md:p-8 border-b border-secondary">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/20 transition-all z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-4 pr-10">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl text-cream">
                  {resolvedCategory.title}
                </h2>
              </div>
              <p className="font-body text-muted-foreground text-sm md:text-base mb-3">
                Explore services and pricing. Luna can help you choose the right artist and confirm details.
              </p>
              <p className="font-body text-muted-foreground/70 text-xs italic">
                Prices shown are listed starting points. Some services are consultation-based.
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8 py-4">
              {resolvedCategory.id === "hair" && (
                <div className="mb-4">
                  <PriceConfidenceAccordion />
                </div>
              )}
              <Accordion
                type="multiple"
                value={openAccordions}
                onValueChange={setOpenAccordions}
                className="space-y-2"
              >
                {resolvedCategory.groups.map((group) => (
                  <AccordionItem
                    key={group.name}
                    value={group.name}
                    className="border border-secondary rounded-lg overflow-hidden bg-background/30"
                  >
                    <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gold/5 transition-colors [&[data-state=open]]:bg-gold/5">
                      <span className="font-display text-lg text-cream text-left">
                        {group.name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-0">
                        {group.items.map((item, idx) => {
                          const isConsultationPrice = item.price.toLowerCase().includes("consultation");
                          const showConsultationNote = resolvedCategory.id === "hair" && isConsultationPrice;

                          return (
                            <div
                              key={`${item.name}-${idx}`}
                              className="flex justify-between items-start py-3 min-h-[48px] border-b border-secondary/50 last:border-0"
                            >
                              <div className="pr-4">
                                <span className="font-body text-cream/90 text-sm md:text-base block">
                                  {item.name}
                                </span>
                                {item.description && (
                                  <p className="mt-1 font-body text-[12px] md:text-[13px] leading-snug text-muted-foreground/85">
                                    {item.description}
                                  </p>
                                )}
                                {showConsultationNote && (
                                  <span className="mt-1 block text-[11px] font-body text-muted-foreground/80">
                                    Price based on consultation
                                  </span>
                                )}
                              </div>
                              <span
                                className={`font-body text-sm md:text-base whitespace-nowrap ${
                                  isConsultationPrice || item.price === "Available"
                                    ? "text-muted-foreground italic"
                                    : "text-gold font-medium"
                                }`}
                              >
                                {item.price}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {resolvedCategory.notes && resolvedCategory.notes.length > 0 && (
                <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-secondary/50">
                  {resolvedCategory.notes!.map((note, idx) => (
                    <p key={idx} className="font-body text-sm text-cream/60 italic">
                      {note}
                    </p>
                  ))}
                </div>
              )}

              {resolvedCategory.directContacts && resolvedCategory.directContacts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary/50">
                  <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-4">
                    Direct Booking Contacts
                  </h4>
                  <div className="space-y-2">
                    {resolvedCategory.directContacts.map((contact) => (
                      <div key={contact.name} className="flex justify-between items-center py-2">
                        <span className="font-body text-cream/70 text-sm">{contact.name}</span>
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                          className="font-body text-sm text-gold hover:text-gold/80 transition-colors"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 p-6 md:p-8 border-t border-secondary bg-card">
              <div className="flex flex-col sm:flex-row gap-3">
                <m.button
                  onClick={handleChatWithLuna}
                  className="btn-gold py-4 px-6 flex items-center justify-center gap-3 flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat with Luna</span>
                </m.button>
              </div>

              <a
                href="tel:+15203276753"
                className="flex items-center justify-center gap-2 mt-4 text-muted-foreground hover:text-gold transition-colors font-body text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call front desk (520) 327-6753</span>
              </a>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
