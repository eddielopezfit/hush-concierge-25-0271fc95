import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { ExperienceFinderSection } from "@/components/ExperienceFinderSection";
import { ServicesSection } from "@/components/ServicesSection";
import { InlineCallbackCTA } from "@/components/InlineCallbackCTA";
import { ArtistsSection } from "@/components/ArtistsSection";
import { PersonalizedPlanSection } from "@/components/PersonalizedPlanSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { AboutSection } from "@/components/AboutSection";
import { CommunitySection } from "@/components/CommunitySection";
import { BookingCallbackSection } from "@/components/BookingCallbackSection";
import { FooterSection } from "@/components/FooterSection";
import { MobileStickyBar } from "@/components/MobileStickyBar";
import { LunaModal } from "@/components/LunaModal";
import { useLuna } from "@/contexts/LunaContext";
import { initJourneyTracking } from "@/lib/journeyTracker";

const Index = () => {
  const { isModalOpen, context, closeModal } = useLuna();

  // Initialize journey tracking
  useEffect(() => {
    initJourneyTracking();
  }, []);

  return (
    <main className="bg-background min-h-screen overflow-x-hidden pb-24 md:pb-0">
      {/* Skip navigation for accessibility */}
      <a href="#experience-finder" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg font-body text-sm">
        Skip to main content
      </a>
      <Navigation />
      {/* 1. Hero — value prop + dual CTA */}
      <HeroSection />
      {/* Trust bar — social proof before quiz */}
      <TrustBar />
      {/* 2. Experience Finder — guided discovery */}
      <ExperienceFinderSection />
      {/* 3. Personalized Plan — immediately after quiz reveal */}
      <PersonalizedPlanSection />
      {/* 4. Services — what we do */}
      <ServicesSection />
      {/* Conversion touchpoint */}
      <InlineCallbackCTA />
      {/* 5. Team — stylist trust + matching */}
      <ArtistsSection />
      {/* 6. Testimonials — social proof */}
      <TestimonialsSection />
      {/* 7. About — the Hush story */}
      <AboutSection />
      {/* 8. Community — loyalty / belonging */}
      <CommunitySection />
      {/* 9. Booking + Callback — unified conversion */}
      <BookingCallbackSection />
      {/* 10. Footer */}
      <FooterSection />
      <MobileStickyBar />

      {/* Single global LunaModal */}
      <LunaModal isOpen={isModalOpen} onClose={closeModal} context={context} />
    </main>
  );
};

export default Index;
