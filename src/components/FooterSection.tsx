import { m } from "framer-motion";
import { Phone, MapPin, Clock, Instagram, Facebook, Calendar, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useStartLuna } from "@/hooks/useStartLuna";

export const FooterSection = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const startLuna = useStartLuna();

  const handleBookClick = () => {
    const el = document.getElementById("callback");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* Book CTA banner */}
      <div className="border-t border-border bg-gradient-to-b from-background to-card/40 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-display text-2xl md:text-3xl text-cream mb-3">
            Ready to book your visit?
          </h3>
          <p className="font-body text-muted-foreground text-sm md:text-base mb-6 max-w-xl mx-auto">
            Request a callback and our front desk will help you find the perfect time and artist.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <m.button
              onClick={handleBookClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold py-3 px-8 inline-flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Reserve My Visit
            </m.button>
            <button
              onClick={startLuna}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-5 py-3 font-body text-sm text-primary transition-colors hover:bg-primary/10"
            >
              <MessageCircle className="w-4 h-4" />
              Resume my plan
            </button>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="border-t border-border py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="font-display text-3xl text-gold-gradient mb-4">
                Hush
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                Salon & Day Spa<br />
                Tucson's trusted beauty destination since 2002.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-lg text-cream mb-4">Visit Us</h4>
              <div className="space-y-3 font-body text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    4635 E Fort Lowell Rd<br />
                    Tucson, AZ 85712<br />
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=4635+E+Fort+Lowell+Rd+Tucson+AZ+85712" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      Get Directions
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold" />
                  <a href="tel:+15203276753" className="hover:text-gold transition-colors">
                    (520) 327-6753
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    Tue & Thu: 9 AM – 7 PM<br />
                    Wed & Fri: 9 AM – 5 PM<br />
                    Sat: 9 AM – 4 PM<br />
                    Sun & Mon: Closed
                  </span>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-display text-lg text-cream mb-4">Connect</h4>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.instagram.com/hushsalonaz" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Hush Salon on Instagram"
                  className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center hover:bg-gold/10 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gold" aria-hidden="true" />
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=100063717333500" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Hush Salon on Facebook"
                  className="w-10 h-10 rounded-full border border-gold/25 flex items-center justify-center hover:bg-gold/10 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-gold" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground font-body">
                Follow us for real transformations and behind-the-scenes looks.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground font-body">
                © {new Date().getFullYear()} Hush Salon & Day Spa. All rights reserved.
              </p>
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-sm text-muted-foreground hover:text-gold font-body transition-colors underline underline-offset-2"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
          onClick={() => setShowPrivacy(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
        >
          <div 
            className="relative w-full max-w-lg p-8 rounded-xl border border-gold/25 bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-cream transition-colors text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h3 id="privacy-title" className="font-display text-2xl text-gold-gradient mb-4">Privacy Policy</h3>
            <p className="font-body text-cream/70 text-sm leading-relaxed">
              Hush Salon & Day Spa respects your privacy. Information submitted through our website 
              is used solely to contact you regarding salon services and appointments. We do not sell 
              or share your personal information with third parties. For TCPA compliance, by submitting 
              your phone number you consent to be contacted by our team. Contact us at{" "}
              <a href="tel:+15203276753" className="text-gold hover:underline">(520) 327-6753</a>{" "}
              with any privacy questions.
            </p>
          </div>
        </div>
      )}
    </footer>
  );
};
