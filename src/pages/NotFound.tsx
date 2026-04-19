import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, MessageSquare, Phone } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useLuna } from "@/contexts/LunaContext";

const NotFound = () => {
  const location = useLocation();
  const { openChatWidget } = useLuna();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-gold/70 mb-4">404 · Lost the beat</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
            Looks like this page <span className="text-gold-gradient">stepped out.</span>
          </h1>
          <p className="font-body text-base text-muted-foreground mb-10 max-w-md mx-auto">
            Let's get you back where the magic happens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/#experience-finder" className="btn-gold py-3 px-6 inline-flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              Find Your Experience
            </a>
            <button
              onClick={openChatWidget}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 font-body text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Talk to Luna
            </button>
            <a
              href="tel:+15203276753"
              className="inline-flex items-center gap-2 text-cream/60 hover:text-gold font-body text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              (520) 327-6753
            </a>
          </div>
          <a
            href="/"
            className="mt-10 inline-block font-body text-xs text-muted-foreground hover:text-gold underline underline-offset-4 transition-colors"
          >
            ← Return home
          </a>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
