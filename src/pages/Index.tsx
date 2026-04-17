import { useEffect, lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { ExperienceFinderSection } from "@/components/ExperienceFinderSection";
import { useLuna } from "@/contexts/LunaContext";
import { initJourneyTracking } from "@/lib/journeyTracker";

// Below-the-fold sections — lazy loaded to shrink initial bundle
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

const SectionFallback = () => <div className="min-h-[200px]" aria-hidden="true" />;

const Index = () => {
  const { isModalOpen, context, closeModal } = useLuna();

  useEffect(() => {
    initJourneyTracking();
  }, []);

  // Resolve hash anchors after lazy sections mount (initial load + nav clicks)
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      // Retry: lazy chunks may not have rendered yet
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tries++ < 20) {
          setTimeout(tick, 100);
        }
      };
      tick();
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <main className="bg-background min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <a href="#experience-finder" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg font-body text-sm">
        Skip to main content
      </a>
      <Navigation />
      <HeroSection />
      <TrustBar />
      <ExperienceFinderSection />
      <Suspense fallback={<SectionFallback />}>
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
  );
};

export default Index;
