import { ArrowDown, Sparkles, MessageSquare } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";

/**
 * Hero — pure CSS animations (no framer-motion) so the eager bundle stays small.
 * Custom keyframes (fade-up, fade-only, ken-burns, scroll-bob) live in tailwind.config.ts.
 */
export const HeroSection = () => {
  const { openChatWidget } = useLuna();

  const handleDiscoverClick = () => {
    document.getElementById("experience-finder")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video — Ken Burns slow zoom via CSS */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-background">
        <div className="absolute inset-0 animate-ken-burns will-change-transform">
          {/* Desktop / tablet */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Hero_v2_Desktop_Poster.jpg"
            aria-hidden="true"
            className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"
          >
            <source
              src="https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Hero_v2_Desktop.mp4"
              type="video/mp4"
            />
          </video>

          {/* Mobile — portrait master, top-anchored so faces never crop */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Hero_v2_Mobile_Poster.jpg"
            aria-hidden="true"
            className="md:hidden absolute inset-0 w-full h-full object-cover [object-position:center_top]"
          >
            <source
              src="https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Hero_v2_Mobile.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 md:pt-0">
        <h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream mb-4 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Welcome to <span className="text-gold-gradient">Hush</span>
        </h1>

        <p
          className="font-display text-xl md:text-2xl text-cream/70 italic mb-3 opacity-0 animate-fade-up-sm"
          style={{ animationDelay: "0.35s" }}
        >
          Where Tucson Comes to Feel Legendary
        </p>

        <p
          className="font-body text-sm md:text-base text-cream/50 mb-10 tracking-wide opacity-0 animate-fade-only"
          style={{ animationDelay: "0.5s" }}
        >
          Five departments · Three founders still behind the chair · 24 years of transformations
        </p>

        {/* CTAs — single dominant primary, secondary as ghost link */}
        <div
          className="hidden sm:flex flex-col items-center justify-center gap-3 mb-8 px-4 opacity-0 animate-fade-up-sm"
          style={{ animationDelay: "0.6s" }}
        >
          <button
            onClick={handleDiscoverClick}
            className="btn-gold py-4 px-10 flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Find Your Experience
          </button>

          <button
            onClick={openChatWidget}
            className="group inline-flex items-center gap-2 text-cream/60 hover:text-gold font-body text-sm transition-colors duration-200"
          >
            <MessageSquare className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="border-b border-transparent group-hover:border-gold/40 transition-colors">
              or talk to our AI concierge
            </span>
          </button>
        </div>

        {/* Dynamic hours badge */}
        <div
          className="flex justify-center opacity-0 animate-fade-only"
          style={{ animationDelay: "0.8s" }}
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
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-fade-only"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex flex-col items-center gap-2 animate-scroll-bob">
          <ArrowDown className="w-5 h-5 text-gold/40" />
        </div>
      </div>
    </section>
  );
};
