import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Hush is my sanctuary. After 15 years, I couldn't imagine trusting anyone else with my hair.",
    author: "Michelle R.",
    service: "Hair Client"
  },
  {
    text: "The attention to detail is extraordinary. Every visit feels like a luxury escape.",
    author: "Sarah T.",
    service: "Spa Guest"
  },
  {
    text: "From the moment you walk in, you feel the difference. This isn't just a salon—it's an experience.",
    author: "Jennifer L.",
    service: "Loyal Guest Since 2005"
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-6">
            Voices of <span className="text-gold-gradient">Trust</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold fill-gold" />
            ))}
          </div>
          <p className="font-body text-muted-foreground">
            Over 500 five-star reviews across platforms
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="card-luxury rounded-lg p-8 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-gold/20" />
              <p className="font-body text-cream/90 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              <div>
                <div className="font-display text-lg text-cream">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gold">
                  {testimonial.service}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
