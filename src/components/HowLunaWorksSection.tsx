import { motion } from "framer-motion";
import { MessageCircle, Users, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Tell us what you're looking for",
    subtitle: "30 seconds",
    description: "A quick refresh? A full transformation? A specific service? Just tell Luna what's on your mind."
  },
  {
    icon: Users,
    title: "Get matched to the right stylist",
    subtitle: "Personalized fit",
    description: "Luna knows our team inside and out — she'll connect you with the artist who's perfect for your goals."
  },
  {
    icon: CalendarCheck,
    title: "Book with confidence",
    subtitle: "Voice / Chat / Callback",
    description: "Know exactly what you're booking and who you're seeing. No guesswork, no surprises."
  }
];

export const HowLunaWorksSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background border-t border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-cream mb-3">
            How It Works
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-md mx-auto">
            From "I'm not sure" to "booked and excited" in three easy steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <span className="font-display text-sm text-gold">{index + 1}</span>
                </div>

                <div className="pt-8 pb-6 px-5 md:px-6 rounded-xl bg-card border border-border h-full">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/8 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>

                  <h3 className="font-display text-xl md:text-2xl text-cream mb-1">
                    {step.title}
                  </h3>
                  <span className="font-body text-xs text-gold uppercase tracking-wider">
                    {step.subtitle}
                  </span>

                  <p className="font-body text-muted-foreground text-sm mt-4 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-gold/25 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
