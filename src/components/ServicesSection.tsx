import { useState } from "react";
import { m } from "framer-motion";
import { Scissors, Sparkles, Heart, Eye, Hand, MessageCircle } from "lucide-react";
import { ServiceMenuModal } from "./ServiceMenuModal";
import { getCategoryById } from "@/data/servicesMenuData";
import { useLuna } from "@/contexts/LunaContext";
import type { ServiceCategoryId } from "@/types/concierge";
import { TryOnEntryButton } from "@/components/tryon/TryOnEntryButton";
import hairHero from "@/assets/hair-hero.jpg";
import lashesHero from "@/assets/lashes-hero.jpg";

const services = [
  {
    icon: Scissors,
    id: "hair",
    title: "Hair",
    description: "Precision cuts, lived-in color, blonding, extensions — whatever your vision, we'll bring it to life.",
    image: hairHero,
  },
  {
    icon: Hand,
    id: "nails",
    title: "Nails",
    description: "From clean classics to creative nail art. Walk out feeling polished and put-together.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Sparkles,
    id: "skincare",
    title: "Skincare & Spray Tan",
    description: "Results-driven facials, peels, and a sun-kissed glow — your skin will thank you.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Eye,
    id: "lashes",
    title: "Lashes",
    description: "Subtle enhancement or full drama — lash extensions and lifts tailored to your eye shape.",
    image: lashesHero,
  },
  {
    icon: Heart,
    id: "massage",
    title: "Massage",
    description: "Deep tissue, Swedish, therapeutic, and relaxation — leave feeling reset and completely renewed.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export const ServicesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const { mergeConcierge, openChatWidget } = useLuna();


  const handleViewMenu = (serviceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCategory(serviceId);
    setIsMenuModalOpen(true);
  };

  const handleCardClick = (serviceId: string) => {
    handleViewMenu(serviceId);
  };

  const handleStartLuna = (serviceId: ServiceCategoryId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    mergeConcierge({
      source: `Services Section: ${serviceId}`,
      categories: [serviceId],
      primary_category: serviceId,
      category: serviceId,
    });
    // Open directly into Chat so Luna guides the guest for THIS service,
    // instead of dumping them on the generic Explore category list.
    openChatWidget("chat");
  };

  const getPricePreview = (serviceId: string): string => {
    const category = getCategoryById(serviceId);
    return category?.pricePreview || "";
  };

  const renderCard = (service: typeof services[0]) => (
    <m.div
      key={service.title}
      variants={cardVariants}
      onClick={() => handleCardClick(service.id)}
      className="group card-luxury rounded-lg overflow-hidden cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute bottom-4 left-4">
          <service.icon className="w-7 h-7 text-gold" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl text-cream mb-2 group-hover:text-gold transition-colors">
          {service.title}
        </h3>
        <p className="font-body text-sm text-gold/70 mb-3">
          {getPricePreview(service.id)}
        </p>
        <p className="font-body text-muted-foreground text-sm leading-relaxed mb-3">
          {service.description}
        </p>
        <p className="font-body text-[11px] text-gold/60 leading-relaxed mb-3">
          Loved by 315+ guests · 4.7★ on Google
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {/* Hair-only primary: full-width gold CTA on its own row so it
              never wraps awkwardly or competes with the secondary actions
              for horizontal space on narrow cards (mobile + 3-col desktop). */}
          {service.id === "hair" && (
            <div onClick={(e) => e.stopPropagation()}>
              <TryOnEntryButton
                variant="primary"
                label="Preview a New Hairstyle"
                source="Services Card"
                className="!w-full !py-2.5 !px-3 text-sm whitespace-nowrap"
              />
            </div>
          )}
          {/* Secondary actions — always 2-up so labels stay on one line. */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={(e) => handleStartLuna(service.id as ServiceCategoryId, e)}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center font-body text-sm text-primary transition-colors hover:bg-primary/10 whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">Let Luna guide you</span>
            </button>
            <button
              onClick={(e) => handleViewMenu(service.id, e)}
              className="min-h-[42px] font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4 w-full text-center block"
            >
              View full menu
            </button>
          </div>
        </div>
      </div>
    </m.div>
  );

  return (
    <>
      <section id="services" className="py-20 md:py-24 px-6 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
              What We <span className="text-gold-gradient">Do</span>
            </h2>
            <p className="font-body text-base text-muted-foreground max-w-lg mx-auto mb-4">
              Five departments. One team. Everything you need to look and feel your best.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("hair");
                setIsMenuModalOpen(true);
              }}
              className="font-body text-sm text-gold hover:text-gold/80 transition-colors underline underline-offset-4"
            >
              View All Services & Pricing
            </button>
          </m.div>

          {/* Top row: 3 cards */}
          <m.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          >
            {services.slice(0, 3).map((service) => renderCard(service))}
          </m.div>

          {/* Bottom row: 2 cards centered */}
          <m.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:max-w-[calc(66.666%+0.75rem)] mx-auto"
          >
            {services.slice(3).map((service) => renderCard(service))}
          </m.div>
        </div>
      </section>

      <ServiceMenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        category={selectedCategory ? getCategoryById(selectedCategory) || null : null}
      />
    </>
  );
};
