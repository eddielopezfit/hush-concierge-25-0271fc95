import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Mic } from "lucide-react";
import heroImage from "@/assets/hero-salon.jpg";
import { requestVoiceStart } from "@/lib/lunaVoiceBus";

export const HeroSection = () => {
  const handleDiscoverClick = () => {
    const finder = document.getElementById("experience-finder");
    if (finder) finder.scrollIntoView({ behavior: "smooth" });
  };

  const handleSpeakWithLuna = () => {
    requestVoiceStart("hero");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video (desktop/tablet) + Image fallback (mobile) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-background">
        {/* Ken Burns slow zoom wrapper */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          {/* Desktop/tablet — full-res video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={heroImage}
            className="absolute inset-0 h-full w-full object-cover object-[center_30%] hidden sm:block"
          >
            <source src="/videos/hero-backdrop.mp4" type="video/mp4" />
          </video>
          {/* Mobile — compressed smaller video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={heroImage}
            className="absolute inset-0 h-full w-full object-cover object-[center_30%] sm:hidden"
          >
            <source src="/videos/hero-backdrop-mobile.mp4" type="video/mp4" />
          </video>
        </motion.div>
        {/* Multi-layer overlay for text readability */}
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-4 text-cream">
            Welcome to{" "}
            <span className="text-gold-gradient">Hush</span>
          </h1>
          <p className="font-display text-xl md:text-2xl text-cream/70 mb-2 italic">
            Where Tucson Comes to Feel Legendary
          </p>
          <p className="font-body text-sm text-cream/45 tracking-wide">
            Five departments · Three founders still behind the chair · 24 years of transformations
          </p>
        </motion.div>


        {/* Spacer — redundant copy removed (P1 #6) */}
        <div className="mb-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="hidden sm:flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 px-4"
        >
          {/* Primary CTA — guided discovery */}
          <motion.button
            onClick={handleDiscoverClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-gold py-4 px-10 flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            Find Your Experience
          </motion.button>

          {/* Secondary CTA — speak with Luna (hidden on mobile, sticky bar handles it) */}
          <motion.button
            onClick={handleSpeakWithLuna}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-outline-gold py-4 px-8 hidden sm:flex items-center gap-3"
          >
            <Mic className="w-5 h-5" />
            Talk to Our AI Concierge
          </motion.button>
        </motion.div>

        {/* Mobile hours badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="hidden"
        >
          <span className="font-body text-xs text-cream/40 bg-card/60 border border-border px-3 py-1.5 rounded-full backdrop-blur-sm">
            {(() => {
              const day = new Date().getDay();
              if (day === 0 || day === 1) return "Closed Today";
              if (day === 6) return "Open Today · 9 AM – 4 PM";
              return "Open Today · 9 AM – 6 PM";
            })()}
          </span>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <ArrowDown className="w-5 h-5 text-gold/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};
