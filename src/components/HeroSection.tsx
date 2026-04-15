import { motion } from "framer-motion";
import { ArrowDown, Sparkles, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-salon.jpg";
import { useLuna } from "@/contexts/LunaContext";

export const HeroSection = () => {
  const { openChatWidget } = useLuna();

  const handleDiscoverClick = () => {
    const finder = document.getElementById("experience-finder");
    if (finder) finder.scrollIntoView({ behavior: "smooth" });
  };

  const handleTalkToLuna = () => {
    openChatWidget();
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
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            poster={heroImage}
          >
            <source src="https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets//Hush_Hero_Cinematic.mp4" type="video/mp4" />
          </video>

          {/* Mobile — static image (saves bandwidth) */}
          <img
            src={heroImage}
            alt="Hush Salon interior"
            className="md:hidden absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 md:pt-0">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream mb-4"
        >
          Welcome to <span className="text-gold-gradient">Hush</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="font-display text-xl md:text-2xl text-cream/70 italic mb-3"
        >
          Where Tucson Comes to Feel Legendary
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-body text-sm md:text-base text-cream/50 mb-10 tracking-wide"
        >
          Five departments · Three founders still behind the chair · 24 years of transformations
        </motion.p>

        {/* CTAs — hidden on mobile (sticky bar handles it) */}
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

          {/* Secondary CTA — chat with Luna */}
          <motion.button
            onClick={handleTalkToLuna}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-outline-gold py-4 px-8 hidden sm:flex items-center gap-3"
          >
            <MessageSquare className="w-5 h-5" />
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
              if (day === 3 || day === 5) return "Open Today · 9 AM – 5 PM";
              return "Open Today · 9 AM – 7 PM";
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
