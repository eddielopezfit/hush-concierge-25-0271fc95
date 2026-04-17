import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";

const DESKTOP_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster_v2.jpg";
const MOBILE_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster.jpg";
const DESKTOP_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Desktop_v2.mp4";
const MOBILE_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Mobile.mp4";

/**
 * Slim cinematic teaser — placed between TrustBar and ExperienceFinder.
 * Lets guests *feel* the space before they engage with the quiz.
 */
export const StepInsideSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Parallax: video translates slower than page (-15% to +15% over scroll range)
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={sectionRef}
      aria-label="Step inside Hush"
      className="relative w-full overflow-hidden h-[45vh] min-h-[320px] md:h-[55vh] md:min-h-[440px] max-h-[640px]"
    >
      {/* Video layer with parallax + slow Ken Burns zoom */}
      <motion.div style={{ y }} className="absolute inset-0 bg-background overflow-hidden will-change-transform" >
        <motion.div
          initial={{ scale: 1.02 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 will-change-transform origin-top"
        >
          {/* Desktop / tablet */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={DESKTOP_POSTER}
            aria-hidden="true"
            className="hidden md:block absolute inset-0 w-full h-full object-cover object-top"
          >
            <source src={DESKTOP_SRC} type="video/mp4" />
          </video>

          {/* Mobile — lighter file */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={MOBILE_POSTER}
            aria-hidden="true"
            className="md:hidden absolute inset-0 w-full h-full object-cover"
          >
            <source src={MOBILE_SRC} type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic overlay — readable + on-brand (sits ABOVE the zoom layer) */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />
      </motion.div>

      {/* Copy */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-xl"
          >
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold/80">
              Step Inside
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-cream mt-3 leading-tight">
              Warm tones. <span className="text-gold-gradient italic">Good energy.</span>
            </h2>
            <p className="font-body text-cream/70 mt-4 text-sm md:text-base max-w-md">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
