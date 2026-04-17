import { motion } from "framer-motion";
import foundersImage from "@/assets/founders-champagne.jpg";

/**
 * Cinematic teaser placed BEFORE the ArtistsSection.
 * Uses a real photo of the three founders (Sheri, Danielle, Kathy)
 * to give visual variety from the Hero video and directly preview
 * "the Rockstars" before the artist grid.
 */
export const RockstarsTeaserSection = () => {
  return (
    <section
      aria-label="Meet the Rockstars"
      className="relative w-full overflow-hidden h-[60vh] min-h-[420px] md:h-[70vh] md:min-h-[520px] max-h-[760px]"
    >
      {/* Image layer with slow Ken Burns zoom — anchored to founders (lower-center of frame) */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 will-change-transform origin-bottom"
        >
          <img
            src={foundersImage}
            alt="Hush founders Sheri, Danielle, and Kathy at the salon's champagne bar"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover [object-position:center_70%]"
          />
        </motion.div>

        {/* Cinematic overlay — softer to match Step Inside, focused left scrim for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent md:from-background/80 md:via-background/20 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/50" />
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
