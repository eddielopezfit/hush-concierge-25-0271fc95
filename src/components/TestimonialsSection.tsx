import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const testimonials = [
  {
    text: "Whitney is the best with blondes!! I asked for 'beige' hair, not golden, not ashy. And she nailed it.",
    author: "Andrea Mitchell",
    source: "Facebook Review",
    tag: "Color"
  },
  {
    text: "Once Michelle took me back to her station we started talking about it and she reassured me it would look great... I'm glad I've found my new hair salon!",
    author: "Cara B Foster",
    source: "Facebook Review",
    tag: "Transformation"
  },
  {
    text: "Allison G is magical. I've gotten nonstop compliments on my hair since seeing her.",
    author: "Megan Petersen",
    source: "Google Review · Jan 2026",
    tag: "Cut & Style"
  },
  {
    text: "I've been going to Hush for over 10 years. The vibe, the people, the results — nowhere else compares in Tucson.",
    author: "Samantha R.",
    source: "Google Review",
    tag: "Loyalty"
  },
  {
    text: "Got a full balayage and it took about 3 hours but it was SO worth it. Whitney is a perfectionist and it shows.",
    author: "Jess M.",
    source: "Facebook Review",
    tag: "Balayage"
  },
  {
    text: "Best spa day I've ever had. The massage was incredible and the whole atmosphere just melts your stress away.",
    author: "Diana K.",
    source: "Google Review · Dec 2025",
    tag: "Spa"
  },
  {
    text: "Came in for lash extensions and left feeling like a whole new person. The attention to detail is unreal.",
    author: "Taylor W.",
    source: "Facebook Review",
    tag: "Lashes"
  },
  {
    text: "My nails have never looked this good. Clean, precise, and they actually last. Found my new nail artist!",
    author: "Brianna L.",
    source: "Google Review · Feb 2026",
    tag: "Nails"
  },
  {
    text: "I was terrified to go short but my stylist walked me through every step. I cried happy tears when I saw it. Life-changing.",
    author: "Monica T.",
    source: "Facebook Review",
    tag: "Transformation"
  },
  {
    text: "They remembered my name on my second visit. That's the Hush difference — you're not a number, you're family.",
    author: "Kristin P.",
    source: "Google Review · Mar 2026",
    tag: "Experience"
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-scroll on mobile
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    // Resume after 10s of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

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
            4.7 stars on Google · 315+ Facebook reviews · 10 real voices below
          </p>
        </motion.div>

        {/* Desktop: 2x3 grid showing 6 reviews at once */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-luxury rounded-lg p-8 relative"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-gold/15" />
                <span className="inline-block text-[10px] font-body uppercase tracking-wider bg-gold/10 text-gold border border-gold/20 px-2.5 py-1 rounded-full mb-4">
                  {testimonial.tag}
                </span>
                <p className="font-body text-cream/85 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-display text-lg text-cream">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gold/80">
                    {testimonial.source}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* See all link */}
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/place/Hush+Salon+%26+Day+Spa"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
            >
              See all 315+ reviews →
            </a>
          </div>
        </div>

        {/* Mobile: single-card carousel with swipe feel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="card-luxury rounded-lg p-8 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-gold/15" />
              <span className="inline-block text-[10px] font-body uppercase tracking-wider bg-gold/10 text-gold border border-gold/20 px-2.5 py-1 rounded-full mb-4">
                {testimonials[currentIndex].tag}
              </span>
              <p className="font-body text-cream/85 leading-relaxed mb-6 italic">
                "{testimonials[currentIndex].text}"
              </p>
              <div>
                <div className="font-display text-lg text-cream">
                  {testimonials[currentIndex].author}
                </div>
                <div className="text-sm text-gold/80">
                  {testimonials[currentIndex].source}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile nav */}
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              onClick={() => { prevSlide(); handleInteraction(); }}
              className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/40 transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIndex(i); handleInteraction(); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === i
                      ? "bg-gold w-4"
                      : "bg-gold/25"
                  }`}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => { nextSlide(); handleInteraction(); }}
              className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/40 transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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
