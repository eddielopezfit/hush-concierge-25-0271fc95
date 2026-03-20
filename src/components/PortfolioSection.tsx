import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

type Category = "all" | "color" | "cuts" | "nails" | "bridal";

interface EmbedItem {
  permalink: string;
  category: Category[];
  label: string;
}

const embeds: EmbedItem[] = [
  { permalink: "https://www.instagram.com/p/DWFQfb7AQSA/", category: ["color"], label: "Ana's Red Color Transformation" },
  { permalink: "https://www.instagram.com/reel/DVB2p00AWCe/", category: ["cuts"], label: "Fashion Friday Old Money" },
  { permalink: "https://www.instagram.com/p/DV2RbfQjp5K/", category: ["bridal"], label: "Foothills Club Gala Team" },
  { permalink: "https://www.instagram.com/p/DJKa2E6yPgZ/", category: ["color"], label: "Allison Vivid Pink/Purple" },
  { permalink: "https://www.instagram.com/p/C4wBk5lyf_j/", category: ["color"], label: "Silviya Honey Caramel Before/After" },
  { permalink: "https://www.instagram.com/p/CbIoPrOvfY5/", category: ["nails"], label: "Anita Rainbow Nail Art" },
  { permalink: "https://www.instagram.com/reel/DVXlrstDvP7/", category: ["color"], label: "Zaida Blonde Correction Before/After" },
  { permalink: "https://www.instagram.com/reel/DUkDYl1kTbL/", category: ["color"], label: "Zaida Silver Dimensional Curls" },
  { permalink: "https://www.instagram.com/reel/DU9J2f2kh-e/", category: ["cuts"], label: "Platinum Texturizing Cut" },
  { permalink: "https://www.instagram.com/reel/DVH_aVCkXnR/", category: ["bridal"], label: "Zaida Soft Glam Updo" },
];

const filters: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "color", label: "Color" },
  { id: "cuts", label: "Cuts & Styling" },
  { id: "nails", label: "Nails" },
  { id: "bridal", label: "Bridal & Events" },
];

export const PortfolioSection = () => {
  const [active, setActive] = useState<Category>("all");
  const gridRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const filtered = active === "all" ? embeds : embeds.filter(e => e.category.includes(active));

  // Load Instagram embed script once
  useEffect(() => {
    if (scriptLoaded.current) return;
    const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }
    scriptLoaded.current = true;
  }, []);

  // Re-process embeds when filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).instgrm?.Embeds?.process) {
        (window as any).instgrm.Embeds.process();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <section id="portfolio" className="py-20 md:py-28 px-6 bg-gradient-to-b from-card to-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4" style={{ lineHeight: "1.1" }}>
            Real Results from <span className="text-gold-gradient">Real Clients</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Browse transformations by category and artist.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-5 py-2 rounded-full font-body text-sm transition-all duration-300 border ${
                active === f.id
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_18px_hsl(var(--gold)/0.25)]"
                  : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Instagram embed grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.permalink}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-lg overflow-hidden border border-border bg-card"
            >
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={item.permalink}
                data-instgrm-version="14"
                style={{ margin: 0, width: "100%", minWidth: 0, maxWidth: "100%" }}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-12 space-y-3"
        >
          <a
            href="https://www.instagram.com/hushsalonaz/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold inline-flex items-center gap-2"
          >
            <Instagram className="w-4 h-4" />
            Follow @hushsalonaz
          </a>
          <p className="font-body text-sm text-muted-foreground">
            Follow the journey — new transformations posted daily.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
