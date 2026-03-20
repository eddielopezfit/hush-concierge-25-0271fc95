import { motion } from "framer-motion";
import { Mic, Phone, MessageCircle } from "lucide-react";

export const BookingSection = () => {
  return (
    <section className="py-20 md:py-24 px-6 bg-gradient-to-b from-card to-background">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Ready to <span className="text-gold-gradient">Book?</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Choose what works for you. Luna can guide you, or call our team directly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Luna Voice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-luxury rounded-lg p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center mx-auto mb-5">
              <Mic className="w-6 h-6 text-background" />
            </div>
            <h3 className="font-display text-xl text-cream mb-3">
              Talk to Luna
            </h3>
            <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
              Tell Luna what you need. She'll match you to the right service and stylist.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-luna w-full text-xs"
            >
              Speak with Luna
            </motion.button>
          </motion.div>

          {/* Luna Chat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-luxury rounded-lg p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-secondary border border-gold/25 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-display text-xl text-cream mb-3">
              Chat with Luna
            </h3>
            <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
              Prefer typing? Get the same expert guidance through our chat widget.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold w-full text-xs"
            >
              Start a Chat
            </motion.button>
          </motion.div>

          {/* Call */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-luxury rounded-lg p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-secondary border border-gold/25 flex items-center justify-center mx-auto mb-5">
              <Phone className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-display text-xl text-cream mb-3">
              Call the Front Desk
            </h3>
            <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
              Want the warmth of a human voice? Our team is ready to help you.
            </p>
            <motion.a
              href="tel:+15203276753"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold w-full inline-flex items-center justify-center gap-2 text-xs"
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
