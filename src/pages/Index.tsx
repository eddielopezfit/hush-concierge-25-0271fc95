import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ExperienceFinderSection } from "@/components/ExperienceFinderSection";
import { ServicesSection } from "@/components/ServicesSection";
import { ArtistsSection } from "@/components/ArtistsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { AboutSection } from "@/components/AboutSection";
import { CommunitySection } from "@/components/CommunitySection";
import { BookingCallbackSection } from "@/components/BookingCallbackSection";
import { FooterSection } from "@/components/FooterSection";
import { MobileStickyBar } from "@/components/MobileStickyBar";
import { LunaModal } from "@/components/LunaModal";
import { useLuna } from "@/contexts/LunaContext";

const Index = () => {
  const { isModalOpen, context, closeModal } = useLuna();

  return (
    <main className="bg-background min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <Navigation />
      {/* 1. Hero — value prop + dual CTA */}
      <HeroSection />
      {/* 2. Experience Finder — guided discovery (central feature) */}
      <ExperienceFinderSection />
      {/* 3. Services — what we do */}
      <ServicesSection />
      {/* 4. Team — stylist trust + matching */}
      <ArtistsSection />
      {/* 5. Testimonials — social proof */}
      <TestimonialsSection />
      {/* 6. About — the Hush story */}
      <AboutSection />
      {/* 7. Community — loyalty / belonging */}
      <CommunitySection />
      {/* 8. Booking + Callback — unified conversion */}
      <BookingCallbackSection />
      {/* 9. Footer */}
      <FooterSection />
      <MobileStickyBar />

      {/* Single global LunaModal */}
      <LunaModal isOpen={isModalOpen} onClose={closeModal} context={context} />
    </main>
  );
};

export default Index;
