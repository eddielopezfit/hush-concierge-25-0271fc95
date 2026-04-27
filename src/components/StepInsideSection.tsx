import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DESKTOP_POSTER = "https://ltnjxrpicsgujxvfluwz.supabase.co/storage/v1/object/public/site-assets/Hush_Step_Inside_Poster_v3.webp";
const DESKTOP_SRC = "/videos/Hush_Step_Inside_Desktop_v2.mp4";
const MOBILE_SRC = "/videos/Hush_Step_Inside_Mobile.mp4";

/**
 * Slim cinematic teaser — placed between TrustBar and ExperienceFinder.
 * Pure CSS animations (no framer-motion) — keeps eager bundle small.
 */
export const StepInsideSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoVisibleRef = useRef(false);
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
    const tryPlay = () => {
      const v = videoRef.current;
      if (v && v.paused) v.play().catch(() => {});
    };
    // Force the element to (re)load the new src and attempt play
    if (videoRef.current) {
      videoRef.current.load();
    }
    tryPlay();
    const events = ["pointerdown", "touchstart", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, tryPlay, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, tryPlay));
  }, [src]);

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

  // Only decode/play when Step Inside is visible, and recover if browser
  // autoplay timing leaves the visible video stalled.
  useEffect(() => {
    const section = sectionRef.current;
    const v = videoRef.current;
    if (!section || !v) return;

    const playVisibleVideo = () => {
      if (!isVideoVisibleRef.current) return;
      v.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVideoVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          playVisibleVideo();
        } else {
          v.pause();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(section);

    let lastTime = -1;
    let stalledTicks = 0;
    const watchdog = window.setInterval(() => {
      if (!isVideoVisibleRef.current) return;
      if (v.paused) {
        playVisibleVideo();
        return;
      }
      if (v.readyState < 2) return;
      if (Math.abs(v.currentTime - lastTime) < 0.05) {
        stalledTicks += 1;
        if (stalledTicks >= 2) {
          v.load();
          playVisibleVideo();
          stalledTicks = 0;
        }
      } else {
        stalledTicks = 0;
      }
      lastTime = v.currentTime;
    }, 1500);

    return () => {
      io.disconnect();
      window.clearInterval(watchdog);
    };
  }, [src, shouldLoadVideo]);

  return (
    <section
      ref={sectionRef}
      aria-label="Step inside Hush"
      className="relative w-full overflow-hidden h-[45vh] min-h-[320px] md:h-[55vh] md:min-h-[440px] max-h-[640px]"
    >
      {/* Video layer */}
      <div className="absolute inset-0 bg-background overflow-hidden">
        <div className="absolute inset-0 origin-top">
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
              className="absolute inset-0 w-full h-full object-cover object-center"
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
