import { useState } from "react";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Heart, Eye, Hand } from "lucide-react";
import { ServiceMenuModal } from "./ServiceMenuModal";
import { getCategoryById } from "@/data/servicesMenuData";
import hairHero from "@/assets/hair-hero.jpg";
import lashesHero from "@/assets/lashes-hero.jpg";

const services = [
  {
    icon: Scissors,
    id: "hair",
    title: "Hair",
    description: "Precision cuts, lived-in color, blonding, extensions — whatever your vision, we'll bring it to life.",
    image: hairHero,
    testimonial: { text: "Whitney is the best with blondes!! She nailed it.", author: "Andrea Mitchell" },
  },
  {
    icon: Hand,
    id: "nails",
    title: "Nails",
    description: "From clean classics to creative nail art. Walk out feeling polished and put-together.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    testimonial: { text: "Bria did my nails and I am way above satisfied!", author: "Kelly N Gilbert Rodriguez" },
  },
  {
    icon: Sparkles,
    id: "skincare",
    title: "Skincare & Spray Tan",
    description: "Results-driven facials, peels, and a sun-kissed glow — your skin will thank you.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    testimonial: null,
  },
  {
    icon: Eye,
    id: "lashes",
    title: "Lashes",
    description: "Subtle enhancement or full drama — lash extensions and lifts tailored to your eye shape.",
    image: lashesHero,
    testimonial: null,
  },
  {
    icon: Heart,
    id: "massage",
    title: "Massage",
    description: "Deep tissue, Swedish, therapeutic, and relaxation — leave feeling reset and completely renewed.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    testimonial: null,
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


  const handleViewMenu = (serviceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCategory(serviceId);
    setIsMenuModalOpen(true);
  };

  const handleCardClick = (serviceId: string) => {
    handleViewMenu(serviceId);
  };

  const getPricePreview = (serviceId: string): string => {
    const category = getCategoryById(serviceId);
    return category?.pricePreview || "";
  };

  return (
    <>
      <section id="services" className="py-20 md:py-24 px-6 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
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
          </motion.div>

          {/* Top row: 3 cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          >
            {services.slice(0, 3).map((service) => renderCard(service))}
          </motion.div>

          {/* Bottom row: 2 cards centered */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:max-w-[calc(66.666%+0.75rem)] mx-auto"
          >
            {services.slice(3).map((service) => renderCard(service))}
          </motion.div>
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
