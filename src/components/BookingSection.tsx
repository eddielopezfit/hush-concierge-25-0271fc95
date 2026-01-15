import { motion } from "framer-motion";
import { Mic, Phone } from "lucide-react";

export const BookingSection = () => {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-card to-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-6">
            Reserve Your <span className="text-gold-gradient">Experience</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Two elegant paths to your next appointment. Choose what feels right.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Book with Luna */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="card-luxury rounded-lg p-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center mx-auto mb-6">
              <Mic className="w-7 h-7 text-background" />
            </div>
            <h3 className="font-display text-2xl text-cream mb-4">
              Book with Luna
            </h3>
            <p className="font-body text-muted-foreground text-sm mb-8 leading-relaxed">
              Luna will guide you through service selection and connect you 
              directly to scheduling. Effortless and personal.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-luna w-full"
            >
              Speak with Luna
            </motion.button>
          </motion.div>

          {/* Call Front Desk */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="card-luxury rounded-lg p-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-charcoal border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-7 h-7 text-gold" />
            </div>
            <h3 className="font-display text-2xl text-cream mb-4">
              Call Our Front Desk
            </h3>
            <p className="font-body text-muted-foreground text-sm mb-8 leading-relaxed">
              Prefer the warmth of a human voice? Our team is ready 
              to welcome you personally.
            </p>
            <motion.a
              href="tel:+15203276753"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold w-full inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              (520) 327-6753
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
