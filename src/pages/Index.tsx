import { useEffect, lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { StepInsideSection } from "@/components/StepInsideSection";
import { useLuna } from "@/contexts/LunaContext";
import { initJourneyTracking } from "@/lib/journeyTracker";

// Below-the-fold sections — lazy loaded to shrink initial bundle
const ExperienceFinderSection = lazy(() => import("@/components/ExperienceFinderSection").then(m => ({ default: m.ExperienceFinderSection })));
const PersonalizedPlanSection = lazy(() => import("@/components/PersonalizedPlanSection").then(m => ({ default: m.PersonalizedPlanSection })));
const ServicesSection = lazy(() => import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection })));
const InlineCallbackCTA = lazy(() => import("@/components/InlineCallbackCTA").then(m => ({ default: m.InlineCallbackCTA })));
const ArtistsSection = lazy(() => import("@/components/ArtistsSection").then(m => ({ default: m.ArtistsSection })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const AboutSection = lazy(() => import("@/components/AboutSection").then(m => ({ default: m.AboutSection })));
const JoinHushSection = lazy(() => import("@/components/JoinHushSection").then(m => ({ default: m.JoinHushSection })));
const BookingCallbackSection = lazy(() => import("@/components/BookingCallbackSection").then(m => ({ default: m.BookingCallbackSection })));
const FooterSection = lazy(() => import("@/components/FooterSection").then(m => ({ default: m.FooterSection })));
const MobileStickyBar = lazy(() => import("@/components/MobileStickyBar").then(m => ({ default: m.MobileStickyBar })));
const LunaModal = lazy(() => import("@/components/LunaModal").then(m => ({ default: m.LunaModal })));

// Reserve realistic vertical space per section to prevent cumulative layout shift
// as lazy chunks hydrate. Heights are eyeballed to actual rendered section sizes
// so the page doesn't "jump" as content streams in.
const Skeleton = ({ h }: { h: string }) => (
  <div className={`${h} w-full`} aria-hidden="true" style={{ background: "transparent" }} />
);

const Index = () => {
  const { isModalOpen, context, closeModal } = useLuna();

  useEffect(() => {
    initJourneyTracking();
  }, []);

  // Resolve hash anchors after lazy sections mount (initial load + nav clicks).
  // Lazy chunks + image decode can exceed 3s on slower networks, so we keep
  // polling for ~6s and schedule a second scroll after layout settles to
  // correct for late-shifting Suspense fallbacks (audit P1 #5).
  useEffect(() => {
    const scrollToHash = (smooth: boolean) => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(hash);
        if (el) {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
          });
          // Second pass once the browser is idle — corrects for sections
          // below the target hydrating and shifting layout downward.
          const idle =
            (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
              .requestIdleCallback || ((cb: () => void) => setTimeout(cb, 400));
          idle(() => {
            const target = document.getElementById(hash);
            if (target) target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
          });
        } else if (tries++ < 60) {
          setTimeout(tick, 100);
        }
      };
      tick();
    };
    // Initial load: jump (no smooth) so we don't fight the browser's anchor reset
    scrollToHash(false);
    const onHashChange = () => scrollToHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="bg-background min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-20 md:focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg font-body text-sm">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content">
        <HeroSection />
        <TrustBar />
        <Suspense fallback={<Skeleton h="min-h-[640px]" />}>
          <ExperienceFinderSection />
        </Suspense>
        <StepInsideSection />
        {/* PersonalizedPlanSection returns null for fresh visitors, so reserving
            520px would leave a dead gap on first paint (audit P1 #6). Use min-h-0
            and accept a tiny shift only for users who completed the Experience Finder. */}
        <Suspense fallback={<Skeleton h="min-h-0" />}>
          <PersonalizedPlanSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[900px]" />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[180px]" />}>
          <InlineCallbackCTA />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[760px]" />}>
          <ArtistsSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[680px]" />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[560px]" />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[480px]" />}>
          <JoinHushSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[720px]" />}>
          <BookingCallbackSection />
        </Suspense>
        <Suspense fallback={<Skeleton h="min-h-[320px]" />}>
          <FooterSection />
        </Suspense>
        <Suspense fallback={null}>
          <MobileStickyBar />
          {isModalOpen && (
            <LunaModal isOpen={isModalOpen} onClose={closeModal} context={context} />
          )}
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
