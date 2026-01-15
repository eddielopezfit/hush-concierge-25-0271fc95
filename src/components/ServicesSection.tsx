import { motion } from "framer-motion";
import { Scissors, Sparkles, Heart, Eye, Hand } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Hair",
    description: "Precision cuts, transformative color, and styling that speaks to who you are.",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: Hand,
    title: "Nails",
    description: "Artistry meets elegance. From classic manicures to avant-garde nail design.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: Sparkles,
    title: "Skincare",
    description: "Clinical expertise meets indulgent relaxation. Reveal your luminous best.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: Eye,
    title: "Lashes",
    description: "From subtle enhancement to dramatic transformation. Eyes that captivate.",
    image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80"
  },
  {
    icon: Heart,
    title: "Massage",
    description: "Therapeutic touch that restores balance, releases tension, and renews spirit.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  },
};

export const ServicesSection = () => {
  return (
    <section id="services" className="py-32 px-6 bg-gradient-to-b from-background to-card">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-6">
            Discover Our <span className="text-gold-gradient">Services</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Each experience is crafted with intention. Let Luna guide you to the perfect service.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className="group card-luxury rounded-lg overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <service.icon className="w-8 h-8 text-gold" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-2xl text-cream mb-3 group-hover:text-gold transition-colors">
                  {service.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                <button className="btn-outline-gold text-xs py-3 px-6 w-full group-hover:bg-gold/10">
                  Let Luna Guide You
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
