import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { MeetLunaSection } from "@/components/MeetLunaSection";
import { ServicesSection } from "@/components/ServicesSection";
import { GuidesSection } from "@/components/GuidesSection";
import { BookingSection } from "@/components/BookingSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FooterSection } from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <MeetLunaSection />
      <ServicesSection />
      <GuidesSection />
      <BookingSection />
      <AboutSection />
      <TestimonialsSection />
      <FooterSection />
    </main>
  );
};

export default Index;
