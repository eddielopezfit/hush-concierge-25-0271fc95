import { motion } from "framer-motion";
import { Mic, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: "var(--gradient-glow)" }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-8">
            Begin Your <span className="text-gold-gradient">Experience</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-luna flex items-center gap-3"
            >
              <Mic className="w-5 h-5" />
              Speak with Luna
            </motion.button>
            
            <motion.a
              href="tel:+15203276753"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold flex items-center gap-3"
            >
              <Phone className="w-5 h-5" />
              Call Front Desk
            </motion.a>
          </div>
        </motion.div>
      </section>

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
                Tucson's sanctuary of beauty since 2002.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-lg text-cream mb-4">Visit Us</h4>
              <div className="space-y-3 font-body text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    Tucson, Arizona<br />
                    <a href="#" className="text-gold hover:underline">Get Directions</a>
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
                    Tue - Sat: 9am - 7pm<br />
                    Sun - Mon: Closed
                  </span>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-display text-lg text-cream mb-4">Connect</h4>
              <div className="flex items-center gap-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold/10 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gold" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold/10 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-gold" />
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground font-body">
                Follow us for beauty inspiration and exclusive offers.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-body">
              © {new Date().getFullYear()} Hush Salon & Day Spa. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground font-body">
              Powered by <span className="text-gold">Luna AI Concierge</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
