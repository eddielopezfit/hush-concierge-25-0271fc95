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

  // Resolve hash anchors after lazy sections mount (initial load + nav clicks)
  useEffect(() => {
    const scrollToHash = (smooth: boolean) => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(hash);
        if (el) {
          // Use rAF to ensure layout is settled
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
          });
        } else if (tries++ < 30) {
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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg font-body text-sm">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content">
        <HeroSection />
        <TrustBar />
        <Suspense fallback={<SectionFallback />}>
          <ExperienceFinderSection />
          <StepInsideSection />
          <PersonalizedPlanSection />
          <ServicesSection />
          <InlineCallbackCTA />
          <ArtistsSection />
          <TestimonialsSection />
          <AboutSection />
          <JoinHushSection />
          <BookingCallbackSection />
          <FooterSection />
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
