import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

const miniReviews = [
  { text: "Once Michelle took me back, she reassured me it would look great. Found my new salon!", author: "Cara B Foster" },
  { text: "Whitney is the best with blondes!! She nailed it.", author: "Andrea Mitchell" },
  { text: "Allison G is magical. I've gotten nonstop compliments on my hair.", author: "Megan Petersen" },
  { text: "Kathy is AMAZING! She knew exactly how to cut my thick, but fine hair.", author: "Alicia Robinson" },
  { text: "Absolutely LOVE Hush Salon and my stylist Silviya!!!", author: "Amber Eghtesadi" },
];

export const TrustBar = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % miniReviews.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const review = miniReviews[index];

  return (
    <section className="py-6 px-6 bg-card/50 border-y border-border">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        {/* Rating badge */}
        <a
          href="https://www.google.com/search?q=Hush+Salon+%26+Day+Spa+Tucson+reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="font-body text-sm text-cream/80 font-medium">4.7★</span>
          <span className="text-border">·</span>
          <span className="font-body text-sm text-muted-foreground">315+ reviews</span>
        </a>

        {/* Rotating mini review */}
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="font-body text-sm text-cream/60 italic text-center sm:text-left"
        >
          "{review.text}" — <span className="text-gold/70 not-italic">{review.author}</span>
        </motion.p>
      </div>
    </section>
  );
};
