import { motion } from "framer-motion";

export const AboutSection = () => {
  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(43 45% 58% / 0.3), transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-8">
              The <span className="text-gold-gradient">Hush</span> Legacy
            </h2>
            
            <div className="space-y-6 font-body text-cream/80 leading-relaxed">
              <p className="text-lg">
                Since 2002, Hush Salon & Day Spa has been Tucson's sanctuary of 
                beauty, wellness, and authentic care.
              </p>
              <p>
                What began as a vision shared by three passionate founders has 
                grown into a beloved institution—yet remarkably, all three 
                original founders remain active today, their commitment as 
                unwavering as it was over two decades ago.
              </p>
              <p>
                Locally owned. Fiercely independent. Built on relationships that 
                span generations of families and friendships.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              <div className="text-center">
                <div className="font-display text-4xl text-gold mb-1">20+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Years</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl text-gold mb-1">3</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Founders Still Active</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl text-gold mb-1">∞</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Commitment</div>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-lg overflow-hidden glow-gold-subtle">
              <img
                src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=800&q=80"
                alt="Hush Salon Interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-2xl text-cream italic">
                  "Beauty, professionalism, and trust."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
