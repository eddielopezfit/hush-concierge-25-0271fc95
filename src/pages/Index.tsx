import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { MeetLunaSection } from "@/components/MeetLunaSection";
import { HowLunaWorksSection } from "@/components/HowLunaWorksSection";
import { ServicesSection } from "@/components/ServicesSection";
import { ExperienceFinderSection } from "@/components/ExperienceFinderSection";
import { ExperienceCategoriesSection } from "@/components/ExperienceCategoriesSection";
import { ArtistsSection } from "@/components/ArtistsSection";
import { GuidesSection } from "@/components/GuidesSection";
import { BookingSection } from "@/components/BookingSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CallbackSection } from "@/components/CallbackSection";
import { FooterSection } from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <MeetLunaSection />
      <HowLunaWorksSection />
      <ServicesSection />
      <ExperienceFinderSection />
      <ExperienceCategoriesSection />
      <ArtistsSection />
      <GuidesSection />
      <BookingSection />
      <AboutSection />
      <TestimonialsSection />
      <CallbackSection />
      <FooterSection />
    </main>
  );
};

export default Index;
