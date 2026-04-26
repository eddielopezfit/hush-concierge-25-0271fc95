import { useState, useEffect, useRef } from "react";
import { Menu, X, PhoneCall, Sparkles } from "lucide-react";
import { useStartLuna } from "@/hooks/useStartLuna";

const navLinks = [
  { label: "Menu", href: "#services" },
  { label: "Team", href: "#artists" },
  { label: "About", href: "#about" },
  { label: "Join", href: "#join" },
  { label: "Contact", href: "#callback" },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const startLuna = useStartLuna();

  // Smooth-scroll + re-trigger :target reveal animation on nav clicks
  const handleAnchorJump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.replaceState(null, "", href);
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Reveal animation fires only after the section is fully in view.
    // Clear any prior reveal so the animation can re-play on repeat jumps.
    el.classList.remove("section-revealed");
    // Force reflow so removing + re-adding the class restarts the animation.
    void (el as HTMLElement).offsetWidth;

    const reveal = () => {
      el.classList.add("section-revealed");
    };

    // Observe until the section's top is at/above the viewport top
    // (i.e. fully scrolled into place), then trigger the reveal once.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            reveal();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.6, 1], rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(el);

    // Safety net: if the browser settles scroll without crossing the
    // threshold (very tall sections, reduced motion), reveal after a
    // short delay so the animation never gets stuck unfired.
    window.setTimeout(() => {
      if (!el.classList.contains("section-revealed")) {
        reveal();
        observer.disconnect();
      }
    }, 1200);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for active nav state
  useEffect(() => {
    const sectionIds = ["services", "artists", "about", "join", "callback"];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const best = visible.reduce((a, b) => a.intersectionRatio > b.intersectionRatio ? a : b);
          setActiveSection(`#${best.target.id}`);
        }
      },
      { threshold: 0.3, rootMargin: "-80px 0px -20% 0px" }
    );

    const timer = setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observerRef.current?.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, []);

  // Focus trap for mobile menu
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobileMenuOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const focusable = menu.querySelectorAll<HTMLElement>('a, button');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsMobileMenuOpen(false); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    first.focus();
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 opacity-0 animate-fade-in-down transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-2xl md:text-3xl text-gold-gradient font-semibold bg-transparent border-none cursor-pointer"
        >
          Hush
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorJump(e, link.href)}
              className={`font-body text-sm tracking-wide transition-colors ${
                activeSection === link.href
                  ? "text-gold"
                  : "text-cream/70 hover:text-gold"
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={startLuna}
            className="flex items-center gap-1.5 border border-gold/40 hover:bg-gold/10 text-gold font-body text-sm px-4 py-2.5 rounded-lg transition-all duration-300"
            aria-label="Start Luna concierge chat"
          >
            <Sparkles className="w-4 h-4" />
            Start Luna
          </button>
          <a
            href="tel:+15203276753"
            className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-background font-body text-sm px-5 py-2.5 rounded-lg transition-all duration-300"
          >
            <PhoneCall className="w-4 h-4" />
            (520) 327-6753
          </a>
        </nav>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-cream"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu — pure CSS slide-down via grid-rows trick (no framer) */}
      <div
        className={`md:hidden grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isMobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="min-h-0 bg-background/98 backdrop-blur-md border-t border-border">
          <nav ref={menuRef} className="flex flex-col items-center gap-6 py-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => { handleAnchorJump(e, link.href); setIsMobileMenuOpen(false); }}
                tabIndex={isMobileMenuOpen ? 0 : -1}
                className={`font-body text-lg transition-colors ${
                  activeSection === link.href ? "text-gold" : "text-cream/70 hover:text-gold"
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setIsMobileMenuOpen(false); startLuna(); }}
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className="flex items-center gap-2 border border-gold/40 text-gold font-body px-6 py-3 rounded-lg"
            >
              <Sparkles className="w-5 h-5" />
              Start Luna
            </button>
            <a
              href="tel:+15203276753"
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className="flex items-center gap-2 bg-gold text-background font-body px-6 py-3 rounded-lg"
            >
              <PhoneCall className="w-5 h-5" />
              Call (520) 327-6753
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
