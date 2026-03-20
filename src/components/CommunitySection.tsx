import { motion } from "framer-motion";
import { Heart, Gift, Crown } from "lucide-react";

const perks = [
  {
    icon: Crown,
    title: "Priority Booking",
    description: "Get first access to new openings and peak-time slots."
  },
  {
    icon: Gift,
    title: "Insider Offers",
    description: "Exclusive promotions, seasonal deals, and early product access."
  },
  {
    icon: Heart,
    title: "Community",
    description: "Be part of the Hush family — events, sneak peeks, and VIP treatment."
  },
];

export const CommunitySection = () => {
  return (
    <section className="py-20 md:py-24 px-6 bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(38 50% 55%) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            The Hush <span className="text-gold-gradient">Inner Circle</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Our most loyal guests get treated like family. Because at Hush, you are.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {perks.map((perk, index) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="card-luxury rounded-lg p-8 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl text-cream mb-3">{perk.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{perk.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="font-body text-sm text-cream/50 mb-4">
            Ask Luna or the front desk about joining the Inner Circle.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
