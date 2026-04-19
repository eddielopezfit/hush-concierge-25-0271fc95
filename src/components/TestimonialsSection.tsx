import { m } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

const testimonials = [
  {
    text: "Whitney is the best with blondes!! I asked for 'beige' hair, not golden, not ashy. And she nailed it!!!",
    author: "Andrea Mitchell",
    source: "Facebook Review",
    tag: "Color"
  },
  {
    text: "Once Michelle took me back to her station we started talking about it and she reassured me it would look great. I highly recommend this hair salon! All the ladies here was very welcoming and professional. I'm glad I've found my new hair salon!",
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
    text: "Allison has so many tips and tricks. She really listens to what you want and even recommends certain hair coloring tips to personalize it. She knew I wear ponytails a lot so she dyed the back of my hair so it shows when I pull my hair up!",
    author: "Kassandra Estrada",
    source: "Facebook Review",
    tag: "Color"
  },
  {
    text: "I have not cut my hair in 4 years!!! Blonde highlights and bangs later!! I have to say I am looking hot as hell!! Thank you to Sherry for helping me get a better look!! I will be back soon 😘",
    author: "Brittie King",
    source: "Facebook Review",
    tag: "Transformation"
  },
  {
    text: "FINALLY! I have found a great stylist in Arizona! Kathy is AMAZING! She is very skilled and knew exactly how to cut my thick, but fine hair. I am very pleased and will be screaming from the rooftops about how fabulous Hush is!",
    author: "Alicia Robinson",
    source: "Facebook Review",
    tag: "Cut & Style"
  },
  {
    text: "Absolutely LOVE Hush Salon and my stylist Silviya!!!",
    author: "Amber Eghtesadi",
    source: "Facebook Review",
    tag: "Loyalty"
  },
  {
    text: "Everyone in this salon is sooo nice! Bria did my nails and I am way above satisfied!",
    author: "Kelly N Gilbert Rodriguez",
    source: "Facebook Review",
    tag: "Nails"
  },
  {
    text: "All of the women are so friendly!! Sheri has done my hair for many years and ALWAYS knows just what to do. Susie cuts my hair when Sheri can't and she is just as amazing!!",
    author: "Janette Lleonart",
    source: "Facebook Review",
    tag: "Loyalty"
  },
  {
    text: "Priscilla is such a sweet soul. She made me feel so comfortable and my hair turned out beautiful. I will definitely be coming back!",
    author: "Megan Petersen",
    source: "Google Review · Jan 2026",
    tag: "Experience"
  },
];

export const TestimonialsSection = () => {
  const [, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const _prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-scroll on mobile
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _handleInteraction = () => {
    setIsAutoPlaying(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    return () => { if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); };
  }, []);

  return (
    <section className="py-20 md:py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <m.div
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
            4.7 stars · 315+ verified reviews across Google & Facebook
          </p>
        </m.div>

        {/* Desktop: 2x3 grid showing 6 reviews at once */}
        <div className="hidden md:block" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <m.div
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
              </m.div>
            ))}
          </div>

          {/* See all link */}
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/place/Hush+Salon+%26+Day+Spa/reviews/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
            >
              See all 315+ reviews →
            </a>
          </div>
        </div>

        {/* Review CTA — mobile only (desktop has its own link above) */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 md:hidden"
        >
          <a
            href="https://www.google.com/maps/place/Hush+Salon+%26+Day+Spa/reviews/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
          >
            Read more reviews on Google →
          </a>
        </m.div>
      </div>
    </section>
  );
};
