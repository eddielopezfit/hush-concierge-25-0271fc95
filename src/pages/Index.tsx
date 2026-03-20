import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ExperienceFinderSection } from "@/components/ExperienceFinderSection";
import { HowLunaWorksSection } from "@/components/HowLunaWorksSection";
import { ServicesSection } from "@/components/ServicesSection";
import { ArtistsSection } from "@/components/ArtistsSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { GuidesSection } from "@/components/GuidesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CommunitySection } from "@/components/CommunitySection";
import { AboutSection } from "@/components/AboutSection";
import { BookingSection } from "@/components/BookingSection";
import { CallbackSection } from "@/components/CallbackSection";
import { FooterSection } from "@/components/FooterSection";
import { MobileStickyBar } from "@/components/MobileStickyBar";

const Index = () => {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <Navigation />
      {/* 1. Hero — value prop + dual CTA */}
      <HeroSection />
      {/* 2. Experience Finder — guided discovery (central feature) */}
      <ExperienceFinderSection />
      {/* 3. How it works — quick explainer */}
      <HowLunaWorksSection />
      {/* 4. Services — what we do */}
      <ServicesSection />
      {/* 5. Team — stylist trust + matching */}
      <ArtistsSection />
      {/* 6. Portfolio — real work proof */}
      <PortfolioSection />
      {/* 7. Guides — pathways for uncertain users */}
      <GuidesSection />
      {/* 8. Testimonials — social proof */}
      <TestimonialsSection />
      {/* 9. Community — loyalty / belonging */}
      <CommunitySection />
      {/* 10. About — the Hush story */}
      <AboutSection />
      {/* 11. Booking — action paths */}
      <BookingSection />
      {/* 12. Callback — lead capture */}
      <CallbackSection />
      {/* 13. Footer */}
      <FooterSection />
      <MobileStickyBar />
    </main>
  );
};

export default Index;
