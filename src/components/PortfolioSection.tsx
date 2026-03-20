import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const portfolioCategories = [
  { id: "color", label: "Color Transformations", count: "Coming Soon" },
  { id: "cuts", label: "Cuts & Styling", count: "Coming Soon" },
  { id: "extensions", label: "Extensions", count: "Coming Soon" },
  { id: "nails", label: "Nail Art", count: "Coming Soon" },
  { id: "skin", label: "Skincare Results", count: "Coming Soon" },
  { id: "events", label: "Bridal & Events", count: "Coming Soon" },
];

export const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-20 md:py-24 px-6 bg-gradient-to-b from-card to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            See the <span className="text-gold-gradient">Work</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Real results from real clients. Browse transformations by category and artist.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {portfolioCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-secondary cursor-pointer hover:border-gold/30 transition-all duration-500"
            >
              {/* Placeholder for real gallery images */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                  <Camera className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors">
                  {cat.label}
                </h3>
                <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                  {cat.count}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.instagram.com/hushsalonaz"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
          >
            See more on Instagram →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
