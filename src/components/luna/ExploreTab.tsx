import { m } from "framer-motion";
import { servicesMenuData, ServiceItem, ServiceCategory } from "@/data/servicesMenuData";
import { ChevronRight, ArrowLeft, Sun, Heart, Palette, Scissors, Eye, Hand, Sparkles, Flower2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useLuna } from "@/contexts/LunaContext";
import { ServiceCategoryId } from "@/types/concierge";
import { trackServiceClick } from "@/lib/journeyTracker";

// keywords let us narrow the displayed pricing list to what the user actually clicked
const lookCategories = [
  { id: "blonde",     label: "Blonde",     icon: Sun,       serviceId: "hair",     keywords: ["blonde", "blond", "lighten", "lightener", "weave", "foil", "balayage", "foilayage", "toner", "highlight"] },
  { id: "brunette",   label: "Brunette",   icon: Heart,     serviceId: "hair",     keywords: ["root", "all over", "color refresher", "toner", "smudge", "touchup"] },
  { id: "bold-color", label: "Bold Color", icon: Palette,   serviceId: "hair",     keywords: ["fantasy", "block", "vivid", "corrective"] },
  { id: "extensions", label: "Extensions", icon: Scissors,  serviceId: "hair",     keywords: ["extension"] },
  { id: "lashes",     label: "Lashes",     icon: Eye,       serviceId: "lashes",   keywords: [] },
  { id: "nails",      label: "Nails",      icon: Hand,      serviceId: "nails",    keywords: [] },
  { id: "skincare",   label: "Skincare",   icon: Sparkles,  serviceId: "skincare", keywords: [] },
  { id: "massage",    label: "Massage",    icon: Flower2,   serviceId: "massage",  keywords: [] },
];

interface ExploreTabProps {
  onSwitchTab: (tab: string) => void;
}

export const ExploreTab = ({ onSwitchTab }: ExploreTabProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { mergeConcierge } = useLuna();

  const selectedLookCat = selectedCategory ? lookCategories.find(c => c.id === selectedCategory) : null;
  const selectedService = selectedLookCat
    ? servicesMenuData.find(s => s.id === selectedLookCat.serviceId)
    : null;

  const handleCategorySelect = (catId: string) => {
    const cat = lookCategories.find(c => c.id === catId);
    if (cat) {
      setSelectedCategory(catId);
      // Inject context so Luna knows what the user explored
      mergeConcierge({
        source: "Explore",
        categories: [cat.serviceId as ServiceCategoryId],
        category: cat.serviceId as ServiceCategoryId,
      });
      trackServiceClick(cat.label, cat.serviceId);
    }
  };

  const handleChatAboutService = () => {
    if (selectedService) {
      const focus = selectedLookCat && selectedLookCat.keywords.length > 0
        ? `${selectedLookCat.label} (${selectedService.title})`
        : selectedService.title;
      try {
        sessionStorage.setItem(
          "hush_chat_pending_prompt",
          `Tell me more about ${focus} at Hush — what's involved, typical pricing, who it's a great fit for, and how I should book.`
        );
      } catch { /* ignore */ }
      onSwitchTab("chat");
    }
  };

  const handleAskAboutItem = (item: ServiceItem, group: string, service: ServiceCategory) => {
    // Inject context so Luna's brain knows what the guest is exploring
    mergeConcierge({
      source: "Explore › Service Card",
      categories: [service.id as ServiceCategoryId],
      category: service.id as ServiceCategoryId,
      group,
      item: item.name,
      price: item.price,
    });
    trackServiceClick(item.name, service.id);

    const descriptionLine = item.description
      ? `Here's the official description so you can read it back to me verbatim before asking follow-ups:\n"${item.description}"`
      : `(No stored description — share what you know about this service from the Hush knowledge base.)`;

    const prompt = [
      `I'm interested in **${item.name}** (${service.title} › ${group}) — listed at ${item.price}.`,
      "",
      descriptionLine,
      "",
      "Please:",
      "1. Read the description back to me in 1–2 sentences so I know we're aligned.",
      "2. Ask me 2–3 quick follow-up questions to tailor the recommendation (e.g. hair length / current state, goal, timing, first visit or returning).",
      "3. Once I answer, suggest the best next step to book — front desk number, direct specialist, or a callback.",
    ].join("\n");

    try {
      sessionStorage.setItem("hush_chat_pending_prompt", prompt);
    } catch { /* ignore */ }
    onSwitchTab("chat");
  };

  if (selectedCategory && selectedService) {
    // Narrow groups when the user picked a sub-category like "Blonde" or "Bold Color"
    const keywords = selectedLookCat?.keywords || [];
    const matchesKeyword = (text: string) =>
      keywords.length === 0 || keywords.some(k => text.toLowerCase().includes(k));

    const filteredGroups = keywords.length === 0
      ? selectedService.groups
      : selectedService.groups
          .map(g => ({
            ...g,
            items: g.items.filter(i => matchesKeyword(i.name) || matchesKeyword(g.name)),
          }))
          .filter(g => g.items.length > 0);

    // Fall back to full menu if filter wiped everything
    const groupsToShow = filteredGroups.length > 0 ? filteredGroups : selectedService.groups;
    const showingFiltered = filteredGroups.length > 0 && keywords.length > 0;

    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 px-4 pt-3 pb-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="px-4 pt-2 pb-2">
          <h3 className="font-display text-lg text-foreground">
            {showingFiltered ? `${selectedLookCat?.label} — ${selectedService.title}` : selectedService.title}
          </h3>
          <p className="text-xs text-muted-foreground font-body">{selectedService.pricePreview}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {groupsToShow.map(group => (
            <div key={group.name}>
              <p className="text-[10px] font-body text-primary uppercase tracking-wider mb-2">{group.name}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleAskAboutItem(item, group.name, selectedService)}
                    aria-label={`Ask Luna about ${item.name}`}
                    className="w-full text-left py-2 px-3 rounded-lg bg-card border border-border text-sm font-body hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-foreground">{item.name}</span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="text-primary text-xs">{item.price}</span>
                        <MessageSquare className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      </span>
                    </div>
                    {item.description && (
                      <m.p
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mt-1.5 text-[11.5px] font-body font-light text-cream/55 leading-[1.55] tracking-[0.005em] line-clamp-2 before:content-['—'] before:mr-1.5 before:text-primary/60"
                      >
                        {item.description}
                      </m.p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {selectedService.directContacts && selectedService.directContacts.length > 0 && (
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-3">
              <p className="text-[10px] font-body text-primary uppercase tracking-wider mb-2">Book Directly</p>
              {selectedService.directContacts.map(c => (
                <a key={c.name} href={`tel:${c.phone}`} className="flex justify-between text-sm font-body text-foreground py-1 hover:text-primary transition-colors">
                  <span>{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.phone}</span>
                </a>
              ))}
            </div>
          )}

          {/* Chat with Luna about this service */}
          <button
            onClick={handleChatAboutService}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-body rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask Luna about {selectedService.title}
          </button>

          <button
            onClick={() => onSwitchTab("find")}
            className="w-full btn-outline-gold py-2.5 text-sm mt-2"
          >
            Get a Recommendation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2">
        <p className="font-body text-sm text-foreground">Explore by category</p>
        <p className="font-body text-xs text-muted-foreground">Tap to see services and pricing</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {lookCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <m.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleCategorySelect(cat.id)}
                className="flex items-center gap-2.5 px-3 py-3.5 rounded-lg border border-border bg-card text-sm font-body text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <Icon className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                <span className="flex-1 text-left">{cat.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </m.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
