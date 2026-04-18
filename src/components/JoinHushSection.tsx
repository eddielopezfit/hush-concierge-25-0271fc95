import { m } from "framer-motion";
import { Mic, Heart, ArrowRight, Phone } from "lucide-react";

/**
 * JoinHushSection — combined "Be a Rockstar" (careers) + "Groupies Only" (referrals).
 * Carries forward legacy Hush brand equity from hushsalonandspa.com while
 * keeping the homepage narrative tight.
 */
export const JoinHushSection = () => {
  return (
    <section
      id="join"
      className="py-20 md:py-24 px-6 relative overflow-hidden border-t border-border/40"
    >
      {/* Ambient accent */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] opacity-10 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(38 50% 55% / 0.35), transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 md:mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold/80 mb-4">
            The Hush Family
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Join the <span className="text-gold-gradient">band</span>.
          </h2>
          <p className="font-body text-cream/70 max-w-xl mx-auto">
            Two ways into the Hush story — bring a friend, or bring your craft.
          </p>
        </m.div>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Groupies Only — Referral */}
          <m.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="group relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 md:p-10 hover:border-gold/40 transition-all duration-500"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Heart className="w-5 h-5 text-gold" />
              </div>
              <span className="font-body text-xs tracking-[0.25em] uppercase text-gold/80">
                Referral Program
              </span>
            </div>

            <h3 className="font-display text-3xl md:text-4xl text-cream mb-3">
              Groupies Only
            </h3>
            <p className="font-body text-cream/75 leading-relaxed mb-6">
              Send a friend our way. When they book their first service, you both get{" "}
              <span className="text-gold font-medium">$10 off</span> your next visit. No cards,
              no codes — just tell us who sent you.
            </p>

            <ul className="space-y-2 mb-8 font-body text-sm text-cream/65">
              <li className="flex gap-2"><span className="text-gold">·</span> $10 off for you</li>
              <li className="flex gap-2"><span className="text-gold">·</span> $10 off for them</li>
              <li className="flex gap-2"><span className="text-gold">·</span> Unlimited referrals</li>
            </ul>

            <a
              href="tel:+15203276753"
              className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80 transition-colors group/cta"
            >
              <Phone className="w-4 h-4" />
              Mention a friend at booking
              <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
            </a>
          </m.article>

          {/* Be a Rockstar — Careers */}
          <m.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="group relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 md:p-10 hover:border-gold/40 transition-all duration-500"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Mic className="w-5 h-5 text-gold" />
              </div>
              <span className="font-body text-xs tracking-[0.25em] uppercase text-gold/80">
                Careers & Apprenticeships
              </span>
            </div>

            <h3 className="font-display text-3xl md:text-4xl text-cream mb-3">
              Be a Rockstar
            </h3>
            <p className="font-body text-cream/75 leading-relaxed mb-6">
              Stylists, estheticians, nail techs, massage therapists, apprentices — if you
              love the craft and you love people, we want to meet you. Hush has been a home
              for working artists since 2002.
            </p>

            <ul className="space-y-2 mb-8 font-body text-sm text-cream/65">
              <li className="flex gap-2"><span className="text-gold">·</span> Education-first culture</li>
              <li className="flex gap-2"><span className="text-gold">·</span> Pureology Pure 100 salon</li>
              <li className="flex gap-2"><span className="text-gold">·</span> Apprenticeship pathway</li>
            </ul>

            <a
              href="mailto:hello@hushsalonandspa.com?subject=Be%20a%20Rockstar%20%E2%80%94%20Career%20Inquiry"
              className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80 transition-colors group/cta"
            >
              Send your story
              <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
            </a>
          </m.article>
        </div>
      </div>
    </section>
  );
};
