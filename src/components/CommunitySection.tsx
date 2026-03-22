import { motion } from "framer-motion";
import { Heart, Gift, Crown, Mail } from "lucide-react";
import { useState } from "react";
import { saveLead } from "@/lib/saveSession";

const perks = [
  {
    icon: Gift,
    title: "Refer & Earn $10",
    description: "Refer a friend — when they book, you both receive $10 off your next purchase. The original Groupies deal, still going strong."
  },
  {
    icon: Crown,
    title: "Priority Booking",
    description: "Inner Circle members get early access to new openings and peak-time slots. Coming soon."
  },
  {
    icon: Heart,
    title: "Personalized Experience",
    description: "Luna remembers your preferences, past services, and favorite artists — so every visit feels like coming home."
  },
];

export const CommunitySection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setHasError(false);

    const success = await saveLead({
      name: "Inner Circle Signup",
      phone: "—",
      email: email.trim(),
      category: "inner-circle",
      goal: "loyalty",
    });

    setIsSubmitting(false);
    if (success) {
      setIsSubmitted(true);
    } else {
      setHasError(true);
    }
  };

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
            Hush <span className="text-gold-gradient">Inner Circle</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-xl mx-auto">
            Built on the original Hush Groupies referral program — now enhanced for a more personalized experience.
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
          {!isSubmitted ? (
            <>
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <div className="relative flex-1 w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full h-12 pl-10 pr-4 rounded-lg bg-background/50 border border-gold/15 text-cream placeholder:text-cream/35 font-body text-sm focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/15 transition-all"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold py-3 px-6 whitespace-nowrap text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Joining..." : "Join the Inner Circle"}
                </motion.button>
              </form>
              {hasError && (
                <p className="font-body text-xs text-destructive mt-2">
                  Something went wrong. Please try again or call us at (520) 327-6753.
                </p>
              )}
            </>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-body text-gold text-sm"
            >
              You're in! We'll be in touch with exclusive perks soon.
            </motion.p>
          )}
          <p className="font-body text-xs text-cream/35 mt-3">
            No spam. Just insider access.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
