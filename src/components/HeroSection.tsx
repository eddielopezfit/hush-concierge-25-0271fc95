import { ArrowDown, Sparkles, MessageSquare, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLuna } from "@/contexts/LunaContext";
import { useStartLuna } from "@/hooks/useStartLuna";
import { useSeamlessVideoPlayback } from "@/hooks/useSeamlessVideoPlayback";
import { getConciergeContext } from "@/lib/conciergeStore";
import { TryOnEntryButton } from "@/components/tryon/TryOnEntryButton";

/**
 * Hero — pure CSS animations (no framer-motion) so the eager bundle stays small.
 * Custom keyframes (fade-up, fade-only, ken-burns, scroll-bob) live in tailwind.config.ts.
 */
export const HeroSection = () => {
  const { openChatWidget } = useLuna();
  const startLuna = useStartLuna();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Only show "Resume my plan" if a saved concierge context actually exists.
  // First-time visitors should see a clean 2-CTA hero, not a dead-end link.
  const [hasPlan, setHasPlan] = useState(false);
  useEffect(() => { setHasPlan(!!getConciergeContext()); }, []);
  // Pick ONE viewport-appropriate video so we never download both masters
  // and compete with first paint. SSR-safe default = desktop.
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const videoSrc = isMobile
    ? "/videos/Hush_Hero_v2_Mobile.mp4"
    : "/videos/Hush_Hero_v2_Desktop.mp4";
  const videoPoster = isMobile
    ? "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Hero_v2_Mobile_Poster.jpg"
    : "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Hero_v2_Desktop_Poster.jpg";
  const isVideoActive = useSeamlessVideoPlayback({ sectionRef, videoRef, sourceKey: videoSrc });

  const handleDiscoverClick = () => {
    document.getElementById("experience-finder")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-charcoal">
        <div className={isVideoActive ? "absolute inset-0 overflow-hidden animate-ken-burns" : "absolute inset-0 overflow-hidden"}>
          <video
            ref={videoRef}
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={videoPoster}
            aria-hidden="true"
            src={videoSrc}
            onCanPlay={(e) => { e.currentTarget.play().catch(() => {}); }}
            className={
              isMobile
                ? "absolute inset-0 w-full h-full object-cover [object-position:center_top]"
                : "absolute inset-0 w-full h-full object-cover object-center scale-[1.08]"
            }
          />
        </div>

        {/* Gradient overlays — vertical for legibility + horizontal vignette
            to soften the desktop video's narrower framing on widescreen.
            Vignette kept very subtle (/25) so it never reads as black bars. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/90" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-background/25 via-transparent to-background/25" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 md:pt-0">
        <h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream mb-4 opacity-0 animate-fade-up hero-text-glow"
          style={{ animationDelay: "0.15s" }}
        >
          Welcome to <span className="text-gold-gradient">Hush</span>
        </h1>

        <p
          className="font-display text-xl md:text-2xl text-cream/70 italic mb-3 opacity-0 animate-fade-up-sm hero-text-glow-soft"
          style={{ animationDelay: "0.3s" }}
        >
          Where Tucson Comes to Feel Legendary
        </p>

        <p
          className="font-body text-sm md:text-base text-cream/50 mb-10 tracking-wide opacity-0 animate-fade-up-sm hero-text-glow-soft"
          style={{ animationDelay: "0.45s" }}
        >
          Five departments · Three founders still behind the chair · 24 years of transformations
        </p>

        {/* CTAs — single dominant primary, secondary as ghost links.
            Visible on every viewport so mobile users have an in-hero
            entry point (not just the bottom sticky bar). */}
        <div
          className="flex flex-col items-center justify-center gap-3 mb-8 px-4 opacity-0 animate-fade-up-sm"
          style={{ animationDelay: "0.6s" }}
        >
          {/* Above-the-fold social proof — minimal, link to Google reviews */}
          <a
            href="https://www.google.com/maps/place/Hush+Salon+%26+Day+Spa/@32.2537155,-110.8837433,17z/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cream/70 hover:text-gold transition-colors mb-1"
            aria-label="4.7 stars from 315 plus Google reviews"
          >
            <Star className="w-3.5 h-3.5 text-gold fill-gold" aria-hidden="true" />
            <span className="font-body text-xs tracking-wide">
              4.7★ <span className="text-cream/40">·</span> 315+ reviews
            </span>
          </a>

          <button
            onClick={handleDiscoverClick}
            className="btn-gold py-3.5 px-8 sm:py-4 sm:px-10 text-sm sm:text-base flex items-center gap-2.5 sm:gap-3 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
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

          {/* Persistent Try-On entry — fixes the audit's "appears on first
              video frame only" perception. Ghost variant stays quieter than
              the gold primary so "Find Your Experience" remains dominant. */}
          <TryOnEntryButton variant="ghost" source="Hero" />

          {hasPlan && (
            <button
              onClick={startLuna}
              className="group inline-flex items-center gap-2 text-cream/60 hover:text-gold font-body text-sm transition-colors duration-200"
            >
              <MessageSquare className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="border-b border-transparent group-hover:border-gold/40 transition-colors">
                Resume my plan
              </span>
            </button>
          )}
        </div>

        {/* Dynamic hours badge */}
        <div
          className="flex justify-center opacity-0 animate-fade-only"
          style={{ animationDelay: "0.8s" }}
        >
          {(() => {
            const day = new Date().getDay();
            const closed = day === 0 || day === 1;
            const label = closed
              ? "Closed Today"
              : day === 6
                ? "Open Today · 9 AM – 4 PM"
                : day === 3 || day === 5
                  ? "Open Today · 9 AM – 5 PM"
                  : "Open Today · 9 AM – 7 PM";
            const expectation = day === 0
              ? "We open Tuesday at 9 AM — Kendell at our front desk will have your plan ready."
              : day === 1
                ? "We open Tuesday at 9 AM — Kendell at our front desk will reach out first thing."
                : null;
            return (
              <div className="flex flex-col items-center gap-2">
                <span className="font-body text-xs text-cream/40 bg-card/60 border border-border px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {label}
                </span>
                {expectation && (
                  <span className="font-body text-[11px] text-cream/45 italic max-w-xs text-center px-2">
                    {expectation}
                  </span>
                )}
              </div>
            );
          })()}
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
