import { motion } from "framer-motion";
import foundersPhoto from "@/assets/Founders_Hush.jpg";

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-24 px-6 relative overflow-hidden">
      {/* Subtle ambient glow — mobile only */}

      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-15 pointer-events-none blur-3xl md:hidden"
        style={{ background: "radial-gradient(circle, hsl(38 50% 55% / 0.25), transparent 70%)" }}
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
              The <span className="text-gold-gradient">Hush</span> Story
            </h2>
            
            <div className="space-y-5 font-body text-cream/75 leading-relaxed">
              <p className="text-lg">
                In 2002, Sheri Turner, Danielle Colucci, and Kathy Crawford opened 
                Hush with a simple idea: build a place where people feel taken care of.
              </p>
              <p>
                24 years later, all three founders are still here — still behind the chair, 
                still setting the standard, still building relationships that last. 
                That consistency is rare. And it's what makes Hush different.
              </p>
              <p>
                Locally owned, fiercely independent, and powered by a team that genuinely 
                loves what they do. This is beauty with heart.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              <div className="text-center">
                <div className="font-display text-4xl text-gold mb-1">24+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Years</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl text-gold mb-1">3</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Founders Active</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl text-gold mb-1">20+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Team Members</div>
              </div>
            </div>
          </motion.div>

          {/* Image placeholder — designed for real salon photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-lg overflow-hidden glow-gold-subtle">
              <img
                src={foundersPhoto}
                alt="Hush Salon Founders — Sheri Turner, Danielle Colucci, and Kathy Crawford"
                className="w-full h-[500px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-xl text-cream italic">
                  "We built Hush to be the place we'd want to go."
                </p>
                <p className="font-body text-sm text-gold/70 mt-2">— The Founders</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
