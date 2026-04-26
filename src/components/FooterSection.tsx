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
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 rounded-xl border border-gold/25 bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-cream transition-colors text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h3 id="privacy-title" className="font-display text-2xl text-gold-gradient mb-1">Privacy Policy</h3>
            <p className="font-body text-xs text-muted-foreground mb-6">Effective April 1, 2026</p>
            <div className="space-y-5 font-body text-cream/75 text-sm leading-relaxed">
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Who we are</h4>
                <p>
                  Hush Salon &amp; Day Spa, located at 4635 E Fort Lowell Rd, Tucson, AZ 85712, operates this
                  website. Questions about this policy can be sent to{" "}
                  <a href="tel:+15203276753" className="text-gold hover:underline">(520) 327-6753</a> or{" "}
                  <a href="mailto:hello@hushsalonandspa.com" className="text-gold hover:underline">hello@hushsalonandspa.com</a>.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Information we collect</h4>
                <p>
                  When you submit a callback request or chat with our concierge, we collect only what you give us:
                  your name, phone number, email (optional), the services you’re interested in, your preferred timing,
                  and any message you include. We also collect basic, non-identifying analytics about how the site is used
                  (page views, device type) so we can improve the experience.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">How we use your information</h4>
                <p>
                  We use the information you provide solely to respond to your inquiry, schedule appointments, match you
                  with the right artist, and follow up about your visit. We do not use your information for advertising,
                  and we do not sell or rent it to anyone.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Phone &amp; text messages (TCPA)</h4>
                <p>
                  By submitting your phone number, you consent to be contacted by Hush Salon &amp; Day Spa by phone or
                  text message regarding your inquiry, appointments, and service follow-ups. Message and data rates may
                  apply. Reply STOP at any time to opt out of text messages, or call us to be removed from contact.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Service providers</h4>
                <p>
                  We rely on a small number of trusted service providers to run the site (hosting, secure database
                  storage, and our internal team-notification tool). These providers process information only on our
                  behalf and only to deliver the service you requested.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Cookies &amp; analytics</h4>
                <p>
                  This site uses essential cookies and local browser storage to remember your concierge preferences
                  during your visit and to keep the experience consistent across pages. We do not use third-party
                  advertising or tracking cookies.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Data retention</h4>
                <p>
                  Callback and inquiry information is retained only as long as needed to serve you and maintain a
                  reasonable client history. You may request that we delete your information at any time by contacting us.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Your choices</h4>
                <p>
                  You can request a copy of the information we have on file, ask us to correct it, or ask us to delete
                  it by calling{" "}
                  <a href="tel:+15203276753" className="text-gold hover:underline">(520) 327-6753</a> or emailing{" "}
                  <a href="mailto:hello@hushsalonandspa.com" className="text-gold hover:underline">hello@hushsalonandspa.com</a>.
                </p>
              </section>
              <section>
                <h4 className="font-display text-base text-cream mb-1.5">Updates</h4>
                <p>
                  We may update this policy from time to time. The effective date above will always reflect the most
                  recent version.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
