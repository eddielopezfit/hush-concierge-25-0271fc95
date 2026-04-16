import { motion } from "framer-motion";
import { servicesMenuData } from "@/data/servicesMenuData";
import { ChevronRight, ArrowLeft, Sun, Heart, Palette, Scissors, Eye, Hand, Sparkles, Flower2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useLuna } from "@/contexts/LunaContext";
import { trackServiceClick } from "@/lib/journeyTracker";

const lookCategories = [
  { id: "blonde", label: "Blonde", icon: Sun, serviceId: "hair" },
  { id: "brunette", label: "Brunette", icon: Heart, serviceId: "hair" },
  { id: "bold-color", label: "Bold Color", icon: Palette, serviceId: "hair" },
  { id: "extensions", label: "Extensions", icon: Scissors, serviceId: "hair" },
  { id: "lashes", label: "Lashes", icon: Eye, serviceId: "lashes" },
  { id: "nails", label: "Nails", icon: Hand, serviceId: "nails" },
  { id: "skincare", label: "Skincare", icon: Sparkles, serviceId: "skincare" },
  { id: "massage", label: "Massage", icon: Flower2, serviceId: "massage" },
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
        categories: [cat.serviceId as any],
        category: cat.serviceId as any,
      });
      trackServiceClick(cat.label, cat.serviceId);
    }
  };

  const handleChatAboutService = () => {
    if (selectedService) {
      onSwitchTab("chat");
    }
  };

  if (selectedCategory && selectedService) {
    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 px-4 pt-3 pb-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="px-4 pt-2 pb-2">
          <h3 className="font-display text-lg text-foreground">{selectedService.title}</h3>
          <p className="text-xs text-muted-foreground font-body">{selectedService.pricePreview}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {selectedService.groups.map(group => (
            <div key={group.name}>
              <p className="text-[10px] font-body text-primary uppercase tracking-wider mb-2">{group.name}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div key={item.name} className="flex justify-between items-center py-2 px-3 rounded-lg bg-card border border-border text-sm font-body">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-primary text-xs">{item.price}</span>
                  </div>
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
              <motion.button
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
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
