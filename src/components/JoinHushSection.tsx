import { useState } from "react";
import { m } from "framer-motion";
import { Mic, Heart, ArrowRight, Phone, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CAREER_ROLES = [
  "Stylist",
  "Esthetician",
  "Nail Tech",
  "Massage Therapist",
  "Apprentice",
  "Other",
] as const;

/**
 * JoinHushSection — combined "Be a Rockstar" (careers) + "Groupies Only" (referrals).
 * Carries forward legacy Hush brand equity from hushsalonandspa.com while
 * keeping the homepage narrative tight.
 */
export const JoinHushSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "", story: "" });

  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  const [referralSubmitted, setReferralSubmitted] = useState(false);
  const [referralForm, setReferralForm] = useState({
    yourName: "",
    yourPhone: "",
    friendName: "",
    friendPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please share your name and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("request-callback", {
        body: {
          guest_name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          service_category: "careers",
          service_name: form.role.trim() || "Career inquiry",
          timing: "planning",
          urgency: "low",
          call_summary: `Career inquiry — Role: ${form.role || "unspecified"}. Story: ${form.story || "(none provided)"}`,
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Story received — Kendell will be in touch.");
    } catch (err) {
      console.error("[JoinHushSection] career submit failed:", err);
      toast.error("Couldn't send right now. Please call (520) 327-6753.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralForm.yourName.trim() || !referralForm.yourPhone.trim() || !referralForm.friendName.trim()) {
      toast.error("Please share your name, phone, and your friend's name.");
      return;
    }
    setReferralSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("request-callback", {
        body: {
          guest_name: referralForm.yourName.trim(),
          phone: referralForm.yourPhone.trim(),
          service_category: "referral",
          service_name: "Groupies Only referral",
          timing: "planning",
          urgency: "low",
          call_summary: `Referral — ${referralForm.yourName} is referring ${referralForm.friendName}${referralForm.friendPhone ? ` (${referralForm.friendPhone})` : ""}. Apply $10 off to both on next visit.`,
        },
      });
      if (error) throw error;
      setReferralSubmitted(true);
      toast.success("Referral logged — $10 off waiting for both of you.");
    } catch (err) {
      console.error("[JoinHushSection] referral submit failed:", err);
      toast.error("Couldn't send right now. Please call (520) 327-6753.");
    } finally {
      setReferralSubmitting(false);
    }
  };

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

            {!showReferralForm && !referralSubmitted && (
              <button
                type="button"
                onClick={() => setShowReferralForm(true)}
                className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80 transition-colors group/cta"
              >
                <Phone className="w-4 h-4" />
                Mention a friend at booking
                <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
              </button>
            )}

            {showReferralForm && !referralSubmitted && (
              <form onSubmit={handleReferralSubmit} className="space-y-3 mt-2">
                <Input
                  required
                  placeholder="Your name"
                  value={referralForm.yourName}
                  onChange={(e) => setReferralForm({ ...referralForm, yourName: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <Input
                  required
                  type="tel"
                  placeholder="Your phone number"
                  value={referralForm.yourPhone}
                  onChange={(e) => setReferralForm({ ...referralForm, yourPhone: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <Input
                  required
                  placeholder="Friend's name"
                  value={referralForm.friendName}
                  onChange={(e) => setReferralForm({ ...referralForm, friendName: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <Input
                  type="tel"
                  placeholder="Friend's phone (optional)"
                  value={referralForm.friendPhone}
                  onChange={(e) => setReferralForm({ ...referralForm, friendPhone: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={referralSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gold/50 bg-gold/10 text-gold hover:bg-gold/20 transition-colors font-body text-sm disabled:opacity-60"
                  >
                    {referralSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {referralSubmitting ? "Sending…" : "Send referral"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReferralForm(false)}
                    className="font-body text-sm text-cream/60 hover:text-cream/90 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {referralSubmitted && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-gold/30 bg-gold/5">
                <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm text-cream/85">
                  <span className="text-cream font-medium">Thanks, {referralForm.yourName.split(" ")[0]}!</span>{" "}
                  We've logged your referral for {referralForm.friendName}. You'll both get $10 off your next visit.
                </div>
              </div>
            )}
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

            {!showForm && !submitted && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80 transition-colors group/cta"
              >
                Send your story
                <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
              </button>
            )}

            {showForm && !submitted && (
              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                <Input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <Input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream"
                />
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value })}
                >
                  <SelectTrigger className="bg-background/40 border-border/60 text-cream">
                    <SelectValue placeholder="Role you're interested in" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Tell us a little about yourself (optional)"
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  className="bg-background/40 border-border/60 text-cream min-h-[80px]"
                />
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gold/50 bg-gold/10 text-gold hover:bg-gold/20 transition-colors font-body text-sm disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {submitting ? "Sending…" : "Send your story"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="font-body text-sm text-cream/60 hover:text-cream/90 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {submitted && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-gold/30 bg-gold/5">
                <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm text-cream/85">
                  <span className="text-cream font-medium">Thank you, {form.name.split(" ")[0]}.</span>{" "}
                  Kendell will reach out about joining the Hush team. You can also call{" "}
                  <a href="tel:+15203276753" className="text-gold hover:underline">(520) 327-6753</a>.
                </div>
              </div>
            )}
          </m.article>
        </div>
      </div>
    </section>
  );
};
