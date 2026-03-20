import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Whitney is the best with blondes!! I asked for 'beige' hair, not golden, not ashy. And she nailed it.",
    author: "Andrea Mitchell",
    service: "Facebook Review"
  },
  {
    text: "Once Michelle took me back to her station we started talking about it and she reassured me it would look great... I'm glad I've found my new hair salon!",
    author: "Cara B Foster",
    service: "Facebook Review"
  },
  {
    text: "Allison G is magical. I've gotten nonstop compliments on my hair since seeing her.",
    author: "Megan Petersen",
    service: "Google Review · Jan 2026"
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
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Real People. <span className="text-gold-gradient">Real Trust.</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold fill-gold" />
            ))}
          </div>
          <p className="font-body text-muted-foreground">
            4.7 stars on Google · 315+ Facebook reviews
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="card-luxury rounded-lg p-8 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-gold/15" />
              <p className="font-body text-cream/85 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              <div>
                <div className="font-display text-lg text-cream">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gold/80">
                  {testimonial.service}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Review CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.google.com/maps/place/Hush+Salon+%26+Day+Spa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
          >
            Read more reviews on Google →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
