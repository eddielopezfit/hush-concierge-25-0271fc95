import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Phone, Menu, X, PhoneCall } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Team", href: "#artists" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-display text-2xl md:text-3xl text-gold-gradient font-semibold">
          Hush
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm text-cream/70 hover:text-gold transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#callback"
            className="font-body text-sm text-cream/70 hover:text-gold transition-colors tracking-wide"
          >
            Request Callback
          </a>
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
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background/98 backdrop-blur-md border-t border-border"
        >
          <nav className="flex flex-col items-center gap-6 py-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-body text-lg text-cream/70 hover:text-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#callback"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-body text-lg text-cream/70 hover:text-gold transition-colors"
            >
              Request Callback
            </a>
            <a
              href="tel:+15203276753"
              className="flex items-center gap-2 bg-gold text-background font-body px-6 py-3 rounded-lg"
            >
              <PhoneCall className="w-5 h-5" />
              Call (520) 327-6753
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};
