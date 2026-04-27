import { m, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Phone, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ServiceCategory, ServiceItem, getCategoryWithCrossRefs, servicesMenuData } from "@/data/servicesMenuData";
import { useLuna } from "@/contexts/LunaContext";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { PriceConfidenceAccordion } from "@/components/PriceConfidenceAccordion";
import { serviceDescriptionClass, serviceDescriptionMotion } from "@/lib/serviceDescriptionTokens";

interface ServiceMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ServiceCategory | null;
}

type PriceRangeId = "all" | "under50" | "50to100" | "100to200" | "over200" | "consult";

const PRICE_RANGES: { id: PriceRangeId; label: string }[] = [
  { id: "all", label: "All prices" },
  { id: "under50", label: "Under $50" },
  { id: "50to100", label: "$50–$100" },
  { id: "100to200", label: "$100–$200" },
  { id: "over200", label: "$200+" },
  { id: "consult", label: "Consultation" },
];

/** Parse the lowest dollar number from a price string like "$60+", "$50–$80", or "Based on consultation". Returns null if non-numeric. */
function parseStartingPrice(price: string): number | null {
  const match = price.match(/\$\s*(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function isConsultationPriceStr(price: string): boolean {
  return /consultation|call/i.test(price);
}

function matchesRange(item: ServiceItem, range: PriceRangeId): boolean {
  if (range === "all") return true;
  if (range === "consult") return isConsultationPriceStr(item.price);
  const value = parseStartingPrice(item.price);
  if (value == null) return false;
  switch (range) {
    case "under50": return value < 50;
    case "50to100": return value >= 50 && value <= 100;
    case "100to200": return value > 100 && value <= 200;
    case "over200": return value > 200;
    default: return true;
  }
}

export const ServiceMenuModal = ({ isOpen, onClose, category }: ServiceMenuModalProps) => {
  const { openModal, setConcierge } = useLuna();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(category?.id ?? null);
  const [priceRange, setPriceRange] = useState<PriceRangeId>("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // Sync active category when prop changes (modal reopened on a different card)
  useEffect(() => {
    if (category) {
      setActiveCategoryId(category.id);
      setPriceRange("all");
      setExpandedItems(new Set());
      setAllExpanded(false);
    }
  }, [category?.id]);

  // Resolve category with cross-referenced items
  const baseCategory = activeCategoryId ? getCategoryWithCrossRefs(activeCategoryId) ?? null : null;

  // Apply price-range filter
  const resolvedCategory: ServiceCategory | null = baseCategory
    ? {
        ...baseCategory,
        groups: baseCategory.groups
          .map((g) => ({ ...g, items: g.items.filter((it) => matchesRange(it, priceRange)) }))
          .filter((g) => g.items.length > 0),
      }
    : null;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (baseCategory && baseCategory.groups.length === 1) {
      setOpenAccordions([baseCategory.groups[0].name]);
    } else {
      setOpenAccordions([]);
    }
  }, [activeCategoryId]);

  const buildCategoryContext = (groupName?: string, itemName?: string, itemPrice?: string): ConciergeContext => {
    const cat = baseCategory;
    if (!cat) {
      return { source: "Service Menu", categories: [], goal: null, timing: null };
    }
    return {
      source: `Service Menu: ${cat.title}`,
      categories: [cat.id as ServiceCategoryId],
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

  const itemKey = (groupName: string, idx: number, name: string) => `${groupName}::${idx}::${name}`;

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (!resolvedCategory) return;
    if (allExpanded) {
      setExpandedItems(new Set());
      setAllExpanded(false);
    } else {
      const all = new Set<string>();
      resolvedCategory.groups.forEach((g) =>
        g.items.forEach((it, idx) => {
          if (it.description) all.add(itemKey(g.name, idx, it.name));
        })
      );
      setExpandedItems(all);
      setAllExpanded(true);
    }
  };

  if (!baseCategory) return null;

  const CategoryIcon = baseCategory.icon;
  const hasResults = !!resolvedCategory && resolvedCategory.groups.length > 0;

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
                  {baseCategory.title}
                </h2>
              </div>
              <p className="font-body text-muted-foreground text-sm md:text-base mb-3">
                Explore services and pricing. Luna can help you choose the right artist and confirm details.
              </p>
              <p className="font-body text-muted-foreground/70 text-xs italic mb-4">
                Prices shown are listed starting points. Some services are consultation-based.
              </p>

              {/* Quick filters */}
              <div className="space-y-3" role="group" aria-label="Quick filters">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                  {servicesMenuData.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = cat.id === activeCategoryId;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategoryId(cat.id);
                          setPriceRange("all");
                        }}
                        aria-pressed={isActive}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-body transition-all ${
                          isActive
                            ? "bg-gold/20 border-gold/60 text-gold"
                            : "bg-secondary/40 border-secondary text-cream/70 hover:text-cream hover:border-gold/30"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.title}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by starting price">
                  {PRICE_RANGES.map((range) => {
                    const isActive = range.id === priceRange;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setPriceRange(range.id)}
                        aria-pressed={isActive}
                        className={`px-3 py-1.5 rounded-full border text-xs font-body transition-all ${
                          isActive
                            ? "bg-gold/20 border-gold/60 text-gold"
                            : "bg-secondary/40 border-secondary text-cream/70 hover:text-cream hover:border-gold/30"
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8 py-4">
              {baseCategory.id === "hair" && (
                <div className="mb-4">
                  <PriceConfidenceAccordion />
                </div>
              )}
              {!hasResults && (
                <div className="py-10 text-center">
                  <p className="font-body text-sm text-muted-foreground mb-3">
                    No services match this price range in {baseCategory.title}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPriceRange("all")}
                    className="font-body text-sm text-gold hover:text-gold/80 underline-offset-4 hover:underline"
                  >
                    Clear price filter
                  </button>
                </div>
              )}
              {hasResults && (
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="text-[11px] font-body uppercase tracking-[0.16em] text-muted-foreground hover:text-gold transition-colors"
                  aria-pressed={allExpanded}
                >
                  {allExpanded ? "Collapse all" : "Expand all"}
                </button>
              </div>
              )}
              {hasResults && (
              <Accordion
                type="multiple"
                value={openAccordions}
                onValueChange={setOpenAccordions}
                className="space-y-2"
              >
                {resolvedCategory!.groups.map((group) => (
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
                          const showConsultationNote = baseCategory.id === "hair" && isConsultationPrice;
                          const key = itemKey(group.name, idx, item.name);
                          const isExpanded = expandedItems.has(key);
                          const hasDescription = !!item.description;

                          return (
                            <div
                              key={`${item.name}-${idx}`}
                              className="flex justify-between items-start py-3 min-h-[48px] border-b border-secondary/50 last:border-0"
                            >
                              <div className="pr-4 min-w-0 flex-1">
                                {hasDescription ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleItem(key)}
                                    aria-expanded={isExpanded}
                                    aria-controls={`desc-${key}`}
                                    className="group inline-flex items-center gap-1.5 -mx-1 px-1 py-0.5 rounded hover:bg-gold/5 transition-colors text-left"
                                  >
                                    <span className="font-body text-cream/90 text-sm md:text-base">
                                      {item.name}
                                    </span>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-gold transition-transform ${
                                        isExpanded ? "rotate-180 text-gold/80" : ""
                                      }`}
                                      aria-hidden="true"
                                    />
                                  </button>
                                ) : (
                                  <span className="font-body text-cream/90 text-sm md:text-base block">
                                    {item.name}
                                  </span>
                                )}
                                <AnimatePresence initial={false}>
                                  {hasDescription && isExpanded && (
                                    <m.div
                                      id={`desc-${key}`}
                                      key="desc"
                                      {...serviceDescriptionMotion.reveal}
                                      className="overflow-hidden"
                                    >
                                      <p className={serviceDescriptionClass.compact}>
                                        {item.description}
                                      </p>
                                    </m.div>
                                  )}
                                </AnimatePresence>
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
              )}

              {baseCategory.notes && baseCategory.notes.length > 0 && (
                <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-secondary/50">
                  {baseCategory.notes!.map((note, idx) => (
                    <p key={idx} className="font-body text-sm text-cream/60 italic">
                      {note}
                    </p>
                  ))}
                </div>
              )}

              {baseCategory.directContacts && baseCategory.directContacts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary/50">
                  <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-4">
                    Direct Booking Contacts
                  </h4>
                  <div className="space-y-2">
                    {baseCategory.directContacts.map((contact) => (
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
