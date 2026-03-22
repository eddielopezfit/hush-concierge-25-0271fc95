import { motion } from "framer-motion";
import { Mic, Phone, MessageCircle, CheckCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useLuna } from "@/contexts/LunaContext";
import { ConciergeContext } from "@/types/concierge";
import { setConciergeContext, setGuestFirstName } from "@/lib/conciergeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveCallbackRequest } from "@/lib/saveSession";
import { callbackServiceOptions as serviceOptions, callbackTimingOptions as timingOptions } from "@/data/categoryData";

const buildPrefillFromContext = () => {
  const ctx = getConciergeContext();
  const interestedIn: string[] = [];
  let timing = "";

  if (ctx) {
    if (ctx.categories?.length) {
      ctx.categories.forEach((cat: string) => {
        const match = serviceOptions.find(o => o.value === cat);
        if (match && interestedIn.length < 3) interestedIn.push(match.value);
      });
      if (ctx.categories.length > 1 && !interestedIn.includes("multiple") && interestedIn.length < 3) {
        interestedIn.push("multiple");
      }
    }
    if (ctx.timing) {
      const timingMatch = timingOptions.find(o => o.value === ctx.timing);
      if (timingMatch) timing = timingMatch.value;
    }
  }

  return { interestedIn, timing };
};

export const BookingCallbackSection = () => {
  const { openModal, openChatWidget } = useLuna();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const [formData, setFormData] = useState(() => {
    const prefill = buildPrefillFromContext();
    return {
      fullName: "",
      phone: "",
      email: "",
      interestedIn: prefill.interestedIn,
      timing: prefill.timing,
      message: "",
    };
  });

  // Re-sync from context when section scrolls into view (e.g. user finishes finder then scrolls down)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const prefill = buildPrefillFromContext();
          setFormData(prev => ({
            ...prev,
            interestedIn: prev.interestedIn.length > 0 ? prev.interestedIn : prefill.interestedIn,
            timing: prev.timing || prefill.timing,
          }));
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById("callback");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isFormValid = formData.fullName.trim().length > 0 && formData.phone.trim().length > 0;

  const handleSpeakWithLuna = () => {
    const ctx: ConciergeContext = {
      source: "Booking Section",
      categories: [],
      goal: null,
      timing: null,
    };
    setConciergeContext(ctx);
    openModal(ctx);
  };

  const handleChatWithLuna = () => {
    openChatWidget();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Capture first name for Luna context
    if (field === "fullName" && value.trim()) {
      setGuestFirstName(value);
    }
  };

  const toggleService = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(value)
        ? prev.interestedIn.filter(s => s !== value)
        : prev.interestedIn.length >= 3
          ? prev.interestedIn
          : [...prev.interestedIn, value],
    }));
  };

  const isFieldValid = (field: string) => {
    const value = formData[field as keyof typeof formData];
    if (typeof value === "string") return value.trim().length > 0;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(false);

    const success = await saveCallbackRequest({
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      interested_in: formData.interestedIn.join(", ") || undefined,
      timing: formData.timing || undefined,
      message: formData.message || undefined,
      source: "callback_form",
      concierge_context: getConciergeContext() || {},
    });

    setIsSubmitting(false);
    if (success) {
      setIsSubmitted(true);
    } else {
      setSubmitError(true);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="callback" className="py-20 md:py-28 px-6 bg-gradient-to-b from-card to-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-cream mb-4">
            Ready to <span className="text-gold-gradient">Book?</span>
          </h2>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto">
            Choose what works for you. Luna can guide you, or reach out directly.
          </p>
        </motion.div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Luna Voice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-luxury rounded-lg p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center mx-auto mb-5">
              <Mic className="w-6 h-6 text-background" />
            </div>
            <h3 className="font-display text-xl text-cream mb-3">Talk to Luna</h3>
            <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
              Tell Luna what you need. She'll match you to the right service and stylist.
            </p>
            <motion.button
              onClick={handleSpeakWithLuna}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-luna w-full text-xs"
            >
              Speak with Luna
            </motion.button>
          </motion.div>

          {/* Luna Chat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-luxury rounded-lg p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-secondary border border-gold/25 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-display text-xl text-cream mb-3">Chat with Luna</h3>
            <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
              Prefer typing? Get the same expert guidance through our chat widget.
            </p>
            <motion.button
              onClick={handleChatWithLuna}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold w-full text-xs"
            >
              Start a Chat
            </motion.button>
          </motion.div>

          {/* Call */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-luxury rounded-lg p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-secondary border border-gold/25 flex items-center justify-center mx-auto mb-5">
              <Phone className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-display text-xl text-cream mb-3">Call the Front Desk</h3>
            <p className="font-body text-muted-foreground text-sm mb-6 leading-relaxed">
              Want the warmth of a human voice? Our team is ready to help you.
            </p>
            <motion.a
              href="tel:+15203276753"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-outline-gold w-full inline-flex items-center justify-center gap-2 text-xs"
            >
              <Phone className="w-4 h-4" />
              (520) 327-6753
            </motion.a>
          </motion.div>
        </div>

        {/* Callback Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h3 className="font-display text-2xl md:text-3xl text-cream mb-2">
              Request a Callback
            </h3>
            <p className="font-body text-cream/60 text-sm">
              Drop your info and our front desk will reach out personally.
            </p>
          </div>

          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="bg-charcoal/50 backdrop-blur-sm border border-gold/8 rounded-2xl p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="font-body text-sm text-cream/75 block">
                    Full Name <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Your name"
                      className={`bg-background/50 border-gold/15 text-cream placeholder:text-cream/35 h-12 text-base transition-all duration-300 pr-10 ${
                        isFieldValid("fullName") ? "border-gold/40 shadow-[0_0_8px_hsl(38_50%_55%/0.1)]" : "focus:border-gold/40 focus:ring-gold/15"
                      }`}
                      maxLength={100}
                    />
                    {isFieldValid("fullName") && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-body text-sm text-cream/75 block">
                    Mobile Phone <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(520) 000-0000"
                      className={`bg-background/50 border-gold/15 text-cream placeholder:text-cream/35 h-12 text-base transition-all duration-300 pr-10 ${
                        isFieldValid("phone") ? "border-gold/40 shadow-[0_0_8px_hsl(38_50%_55%/0.1)]" : "focus:border-gold/40 focus:ring-gold/15"
                      }`}
                      maxLength={20}
                    />
                    {isFieldValid("phone") && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-body text-sm text-cream/75 block">
                    Email <span className="text-cream/35">(optional)</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@email.com"
                    className="bg-background/50 border-gold/15 text-cream placeholder:text-cream/35 h-12 text-base focus:border-gold/40 focus:ring-gold/15"
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="font-body text-sm text-cream/75 block">
                    Interested In <span className="text-cream/35">(select up to 3)</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {serviceOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleService(option.value)}
                        className={`px-5 py-3 rounded-lg border text-sm font-body transition-all duration-300 ${
                          formData.interestedIn.includes(option.value)
                            ? "bg-gold/15 border-gold text-gold"
                            : "bg-background/30 border-gold/15 text-cream/60 hover:border-gold/30 hover:text-cream"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="font-body text-sm text-cream/75 block">
                    How soon are you looking to book?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {timingOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("timing", option.value)}
                        className={`px-5 py-3 rounded-lg border text-sm font-body transition-all duration-300 ${
                          formData.timing === option.value
                            ? "bg-gold/15 border-gold text-gold"
                            : "bg-background/30 border-gold/15 text-cream/60 hover:border-gold/30 hover:text-cream"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="font-body text-sm text-cream/75 block">
                  Message <span className="text-cream/35">(optional)</span>
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Tell us what you have in mind..."
                  className="bg-background/50 border-gold/15 text-cream placeholder:text-cream/35 min-h-[120px] text-base resize-none focus:border-gold/40 focus:ring-gold/15"
                  maxLength={1000}
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full sm:w-auto font-body text-base px-10 py-4 rounded-lg transition-all duration-300 ${
                      isFormValid
                        ? "bg-gold hover:bg-gold/90 text-background shadow-[0_0_18px_hsl(38_50%_55%/0.25)]"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                    whileHover={isFormValid ? { scale: 1.02 } : {}}
                    whileTap={isFormValid ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? "Submitting..." : "Request Callback"}
                  </motion.button>
                  <span className="text-cream/40 text-sm">or</span>
                  <a
                    href="tel:+15203276753"
                    className="flex items-center gap-2 text-gold hover:text-gold/80 font-body transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now: (520) 327-6753
                  </a>
                </div>

                {!isFormValid && (
                  <p className="font-body text-xs text-muted-foreground">
                    Name and phone number required
                  </p>
                )}

                {submitError && (
                  <p className="font-body text-xs text-destructive">
                    Something went wrong. Please try again or call us at (520) 327-6753.
                  </p>
                )}

                <p className="font-body text-xs text-cream/35 text-center max-w-lg mt-2">
                  By submitting, you agree to be contacted by Hush Salon & Day Spa.
                  Standard message rates may apply.
                </p>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-charcoal/50 backdrop-blur-sm border border-gold/15 rounded-2xl p-12 md:p-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/15 flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-gold" />
              </motion.div>
              <h3 className="font-display text-2xl md:text-3xl text-gold-gradient mb-4">
                We'll be in touch soon.
              </h3>
              <p className="font-body text-cream/60 text-base max-w-md mx-auto mb-8">
                Someone from our team will call you within 1 business day. You can also reach us at{" "}
                <a href="tel:+15203276753" className="text-gold hover:underline">(520) 327-6753</a>.
              </p>
              <button onClick={handleScrollToTop} className="btn-outline-gold">
                Back to Home
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
