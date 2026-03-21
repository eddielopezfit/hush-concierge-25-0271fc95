import { motion } from "framer-motion";
import { Sparkles, Scissors, Hand, Eye, Heart, ArrowRight } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";
import { ServiceCategoryId } from "@/types/concierge";

const combos = [
  {
    icons: [Scissors, Hand],
    label: "Hair + Nails",
    vibe: "Full refresh day",
    categories: ["hair", "nails"] as ServiceCategoryId[],
  },
  {
    icons: [Sparkles, Heart],
    label: "Skincare + Massage",
    vibe: "Relaxation package",
    categories: ["skincare", "massage"] as ServiceCategoryId[],
  },
  {
    icons: [Scissors, Eye],
    label: "Hair + Lashes",
    vibe: "Event-ready glam",
    categories: ["hair", "lashes"] as ServiceCategoryId[],
  },
];

export const BuildExperienceSection = () => {
  const { openModal } = useLuna();

  const handleComboClick = (categories: ServiceCategoryId[]) => {
    openModal({
      source: "build_experience",
      categories,
      goal: null,
      timing: null,
      is_multi_service: true,
      multi_service_mode: "bundle_guidance",
    });
  };

  const handleOpenDesigner = () => {
    openModal({
      source: "build_experience",
      categories: [],
      goal: null,
      timing: null,
      is_multi_service: true,
      multi_service_mode: "bundle_guidance",
    });
  };

  return (
    <section className="py-20 md:py-24 px-6 bg-gradient-to-b from-background to-card relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gold/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-rose/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Build Your <span className="text-gold-gradient">Experience</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-xl mx-auto">
            Luna can combine services into a custom experience — tailored to your goals, your timeline, and your artists.
          </p>
        </motion.div>

        {/* Combo inspiration cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {combos.map((combo, i) => (
            <motion.button
              key={combo.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleComboClick(combo.categories)}
              className="card-luxury rounded-lg p-8 text-center group cursor-pointer"
            >
              <div className="flex items-center justify-center gap-3 mb-5">
                {combo.icons.map((Icon, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                ))}
              </div>
              <p className="font-display text-lg text-cream mb-2">{combo.label}</p>
              <p className="font-body text-sm text-muted-foreground">{combo.vibe}</p>
              <div className="mt-4 flex items-center justify-center gap-1 text-gold/60 group-hover:text-gold transition-colors">
                <span className="font-body text-xs">Design this</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.button
            onClick={handleOpenDesigner}
            className="btn-gold py-4 px-10 text-base inline-flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5" />
            Let Luna design your experience
          </motion.button>
          <p className="font-body text-xs text-cream/35 mt-4">
            No fixed packages — every experience is built around you.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
