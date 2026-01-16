import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Scissors, Sparkles, Eye, Droplets, Heart, ChevronRight } from "lucide-react";
import { LunaModal, useLunaModal, LunaContext } from "./LunaModal";

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  subcategories: string[];
}

const categories: Category[] = [
  {
    id: "hair",
    name: "Hair",
    icon: Scissors,
    subcategories: ["Haircut & Style", "Lived-in Color", "Blonde", "Extensions", "Corrective / Refresh", "Event & Bridal"]
  },
  {
    id: "nails",
    name: "Nails",
    icon: Sparkles,
    subcategories: ["Classic Manicure", "Gel Manicure", "Classic Pedicure", "Gel Pedicure", "Nail Art", "Dip Powder"]
  },
  {
    id: "lashes",
    name: "Lashes",
    icon: Eye,
    subcategories: ["Classic Full Set", "Volume Full Set", "Hybrid Set", "Lash Fill", "Lash Lift & Tint", "Brow Lamination"]
  },
  {
    id: "skincare",
    name: "Skincare & Spray Tan",
    icon: Droplets,
    subcategories: ["Signature Facial", "HydraFacial", "Chemical Peel", "Dermaplaning", "Spray Tan", "LED Therapy"]
  },
  {
    id: "massage",
    name: "Massage",
    icon: Heart,
    subcategories: ["Swedish Massage", "Deep Tissue", "Hot Stone", "Aromatherapy", "Couples Massage", "Prenatal"]
  }
];

export const ExperienceCategoriesSection = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (category: Category, subcategory: string) => {
    const lunaContext: LunaContext = {
      source: "Choose Your Experience",
      categories: [category.name.toLowerCase() as any],
      goal: subcategory,
      timing: null
    };
    openModal(lunaContext);
  };

  return (
    <>
      <section id="experience-categories" className="py-20 md:py-28 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-4">
              Choose Your Experience
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Explore by category. Luna will guide you to the perfect fit.
            </p>
          </motion.div>

          {/* Categories Grid */}
          <div className="space-y-3 md:space-y-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full flex items-center justify-between p-5 md:p-6 rounded-lg border transition-all duration-400 ${
                      isActive
                        ? "bg-gold/10 border-gold/40 shadow-[0_0_30px_-10px_hsl(43_45%_58%/0.3)]"
                        : "bg-background border-border hover:border-gold/30 hover:bg-gold/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        isActive ? "bg-gold/20" : "bg-charcoal"
                      }`}>
                        <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? "text-gold" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`font-display text-xl md:text-2xl transition-colors duration-300 ${isActive ? "text-gold" : "text-cream"}`}>
                        {category.name}
                      </span>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isActive ? "rotate-90 text-gold" : ""}`} />
                  </button>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pb-2 px-2 md:px-4 flex flex-wrap gap-2 md:gap-3">
                          {category.subcategories.map((subcategory) => (
                            <motion.button
                              key={subcategory}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => handleSubcategoryClick(category, subcategory)}
                              className="font-body text-sm text-cream bg-charcoal border border-border px-4 py-2.5 rounded-full hover:border-gold/50 hover:bg-gold/10 hover:text-gold transition-all duration-300"
                            >
                              {subcategory}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Luna Modal */}
      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
