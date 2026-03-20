import { motion } from "framer-motion";
import { Sparkles, Scissors, MapPin, Calendar, Heart } from "lucide-react";
import { LunaModal, useLunaModal, type LunaContext } from "./LunaModal";

const guides = [
  {
    icon: Sparkles,
    title: "Find Your Perfect Facial",
    description: "Not sure which skincare treatment is right for you? Luna will figure it out.",
    service: "skincare",
  },
  {
    icon: Scissors,
    title: "Plan Your Hair Transformation",
    description: "Whether it's a subtle refresh or a total change — let's talk through it.",
    service: "hair",
  },
  {
    icon: MapPin,
    title: "First Visit? Start Here",
    description: "Everything you need to know before your first appointment at Hush.",
    service: null,
  },
  {
    icon: Calendar,
    title: "Build a Self-Care Day",
    description: "Combine services for the ultimate head-to-toe experience.",
    service: null,
  },
  {
    icon: Heart,
    title: "Find Your Massage",
    description: "Stress relief, recovery, deep relaxation — Luna will match you.",
    service: "massage",
  },
];

export const GuidesSection = () => {
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleBeginWithLuna = (guide: typeof guides[0]) => {
    const lunaContext: LunaContext = {
      source: `Guide: ${guide.title}`,
      categories: guide.service ? [guide.service as any] : [],
      goal: null,
      timing: null,
    };
    openModal(lunaContext);
  };

  return (
    <>
      <section className="py-16 md:py-20 px-6 relative">
        <div className="absolute inset-0 opacity-[0.03]">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(38 50% 55%) 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
              Not Sure Where to <span className="text-gold-gradient">Start?</span>
            </h2>
            <p className="font-body text-base text-muted-foreground">
              Pick a path. Luna will take it from there.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {guides.map((guide, index) => (
              <motion.button
                key={guide.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleBeginWithLuna(guide)}
                className="group card-luxury rounded-lg p-7 flex items-start gap-5 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/8 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                  <guide.icon className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-cream mb-2 group-hover:text-gold transition-colors">
                    {guide.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-3">
                    {guide.description}
                  </p>
                  <span className="text-gold text-sm font-body tracking-wide group-hover:underline">
                    Start with Luna →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
