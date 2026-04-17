import { motion } from "framer-motion";

const DESKTOP_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Rockstars_Poster_Desktop.jpg";
const MOBILE_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Rockstars_Poster_Mobile.jpg";
const DESKTOP_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Rockstars_Desktop.mp4";
const MOBILE_SRC = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Rockstars_Mobile.mp4";

/**
 * Cinematic teaser placed BEFORE the ArtistsSection.
 * Layout matches StepInsideSection across all breakpoints (copy left, strong left gradient).
 */
export const RockstarsTeaserSection = () => {
  return (
    <section
      aria-label="Meet the Rockstars"
      className="relative w-full overflow-hidden h-[45vh] min-h-[320px] md:h-[55vh] md:min-h-[440px] max-h-[640px]"
    >
      {/* Video layer with slow Ken Burns zoom */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <motion.div
          initial={{ scale: 1.02 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 will-change-transform origin-top"
        >
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

        {/* Cinematic overlay — strong on the left for headline readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/40 md:from-background/90 md:via-background/30 md:to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/60" />
      </div>

      {/* Copy — anchored left at every breakpoint to match Step Inside */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-[20rem] sm:max-w-md md:max-w-lg lg:max-w-xl"
          >
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold/80">
              Meet the Rockstars
            </span>
            <h2 className="font-display text-[2rem] sm:text-4xl md:text-[2.75rem] lg:text-5xl text-cream mt-3 leading-[1.05] tracking-tight text-balance">
              Tailored fits.{" "}
              <span className="text-gold-gradient italic">Effortless edge.</span>
            </h2>
            <p className="font-body text-cream/70 mt-4 text-sm md:text-base max-w-md text-pretty">
              The artists behind every transformation — three founders still behind the chair, plus the crew that makes it look easy.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
