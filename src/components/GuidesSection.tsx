import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Scissors, MapPin, Calendar, Heart } from "lucide-react";
import { LunaModal, useLunaModal, type LunaContext } from "./LunaModal";

const guides = [
  {
    icon: Sparkles,
    title: "Find Your Perfect Facial",
    description: "Answer a few questions and Luna will recommend the ideal treatment for your skin.",
    service: "skincare",
  },
  {
    icon: Scissors,
    title: "Design Your Hair Transformation",
    description: "Whether subtle refresh or dramatic change, discover your next signature look.",
    service: "hair",
  },
  {
    icon: MapPin,
    title: "Prepare for Your First Visit",
    description: "Everything you need to know before stepping through our doors.",
    service: null,
  },
  {
    icon: Calendar,
    title: "Build Your Day of Self-Care",
    description: "Curate a full spa experience tailored to your time and desires.",
    service: null,
  },
  {
    icon: Heart,
    title: "Build Your Massage Escape",
    description: "Stress relief, recovery, and deep reset — Luna will match you to the right experience.",
    service: "massage",
  },
];

export const GuidesSection = () => {
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleBeginWithLuna = (guide: typeof guides[0]) => {
    const lunaContext: LunaContext = {
      source: `Journey: ${guide.title}`,
      categories: guide.service ? [guide.service as any] : [],
      goal: null,
      timing: null,
    };
    openModal(lunaContext);
  };

  return (
    <>
      <section className="py-16 md:py-20 px-6 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(43 45% 58%) 1px, transparent 0)`,
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
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-6">
              Your Beauty <span className="text-gold-gradient">Journey</span>
            </h2>
            <p className="font-display text-xl text-muted-foreground italic">
              Begins Here
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <motion.button
                key={guide.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleBeginWithLuna(guide)}
                className="group card-luxury rounded-lg p-8 flex items-start gap-6 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <guide.icon className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-cream mb-2 group-hover:text-gold transition-colors">
                    {guide.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
                    {guide.description}
                  </p>
                  <span className="text-gold text-sm font-body tracking-wide group-hover:underline">
                    Begin with Luna →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Luna Modal */}
      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
