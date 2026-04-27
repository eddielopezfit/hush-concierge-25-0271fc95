import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSeamlessVideoPlayback } from "@/hooks/useSeamlessVideoPlayback";

const DESKTOP_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster_v3.webp";
const DESKTOP_SRC = "/videos/hush-interior.mp4";
const MOBILE_SRC = "/videos/Hush_Step_Inside_Mobile.mp4";

/**
 * Slim cinematic teaser — placed between TrustBar and ExperienceFinder.
 * Pure CSS animations (no framer-motion) — keeps eager bundle small.
 */
export const StepInsideSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [src, setSrc] = useState<string>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
      ? MOBILE_SRC
      : DESKTOP_SRC
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setSrc(mq.matches ? MOBILE_SRC : DESKTOP_SRC);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "350px 0px" }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const isVideoActive = useSeamlessVideoPlayback({
    sectionRef,
    videoRef,
    sourceKey: src,
    enabled: shouldLoadVideo,
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Step inside Hush"
      className="relative w-full overflow-hidden h-[45vh] min-h-[320px] md:h-[55vh] md:min-h-[440px] max-h-[640px]"
    >
      {/* Video layer */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <div className={isVideoActive ? "absolute inset-0 origin-top animate-ken-burns" : "absolute inset-0 origin-top"}>
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              key={src}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={DESKTOP_POSTER}
              aria-hidden="true"
              onCanPlay={(e) => { e.currentTarget.play().catch(() => {}); }}
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.08]"
            />
          )}
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
