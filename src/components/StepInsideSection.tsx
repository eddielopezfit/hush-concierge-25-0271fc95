import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const DESKTOP_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster_v2.jpg";
const MOBILE_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster.jpg";
const DESKTOP_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Desktop_v2.mp4";
const MOBILE_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Mobile.mp4";

/**
 * Slim cinematic teaser — placed between TrustBar and ExperienceFinder.
 * Lets guests *feel* the space before they engage with the quiz.
 */
export const StepInsideSection = () => {
  return (
    <section
      aria-label="Step inside Hush"
      className="relative w-full overflow-hidden h-[45vh] min-h-[320px] md:h-[55vh] md:min-h-[440px] max-h-[640px]"
    >
      {/* Video layer with slow Ken Burns zoom */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 will-change-transform"
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
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
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
      </div>

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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
