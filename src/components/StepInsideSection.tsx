import { ArrowDown } from "lucide-react";

const DESKTOP_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster_v3.webp";
const DESKTOP_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Desktop_v2.mp4";
const MOBILE_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Mobile.mp4";

/**
 * Slim cinematic teaser — placed between TrustBar and ExperienceFinder.
 * Pure CSS animations (no framer-motion) — keeps eager bundle small.
 */
export const StepInsideSection = () => {
  return (
    <section
      aria-label="Step inside Hush"
      className="relative w-full overflow-hidden h-[45vh] min-h-[320px] md:h-[55vh] md:min-h-[440px] max-h-[640px]"
    >
      {/* Video layer with slow Ken Burns zoom */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <div className="absolute inset-0 origin-top will-change-transform animate-ken-burns">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={DESKTOP_POSTER}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src={MOBILE_SRC} type="video/mp4" media="(max-width: 767px)" />
            <source src={DESKTOP_SRC} type="video/mp4" />
          </video>
        </div>

        {/* Cinematic overlay — left-side scrim for headline readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent md:from-background/75 md:via-background/15 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />
      </div>

      {/* Copy — animate on scroll via intersection-triggered class */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <div className="max-w-[20rem] sm:max-w-md md:max-w-lg lg:max-w-xl opacity-0 animate-fade-up [animation-delay:100ms]">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold/80">
              Step Inside
            </span>
            <h2 className="font-display text-[2rem] sm:text-4xl md:text-[2.75rem] lg:text-5xl text-cream mt-3 leading-[1.05] tracking-tight text-balance">
              Warm tones.{" "}
              <span className="text-gold-gradient italic">Good energy.</span>
            </h2>
            <p className="font-body text-cream/70 mt-4 text-sm md:text-base max-w-md text-pretty">
              Cozy corners, the right music, and a chair that feels like it was waiting for you.
            </p>
            <a
              href="#experience-finder"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("experience-finder")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group mt-6 inline-flex items-center gap-2 font-body text-sm tracking-wide text-gold hover:text-gold/80 transition-colors"
            >
              <span className="border-b border-gold/40 group-hover:border-gold pb-0.5">
                Find your experience
              </span>
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
