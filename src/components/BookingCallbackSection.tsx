import { motion } from "framer-motion";
import { Phone, CheckCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useLuna } from "@/contexts/LunaContext";
import { setGuestFirstName } from "@/lib/conciergeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveCallbackRequest } from "@/lib/saveSession";
import { callbackServiceOptions as serviceOptions, callbackTimingOptions as timingOptions } from "@/data/categoryData";

export const BookingCallbackSection = () => {
  const { conciergeContext } = useLuna();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    interestedIn: [] as string[],
    timing: "",
    message: "",
  });

  // Prefill from concierge context reactively — only fill empty fields, never overwrite user input
  useEffect(() => {
    if (userTouched) return;
    if (!conciergeContext) return;

    setFormData(prev => {
      const interestedIn = prev.interestedIn.length > 0 ? prev.interestedIn : (() => {
        const result: string[] = [];
        conciergeContext.categories?.forEach((cat: string) => {
          const match = serviceOptions.find(o => o.value === cat);
          if (match && result.length < 3) result.push(match.value);
        });
        if ((conciergeContext.categories?.length ?? 0) > 1 && !result.includes("multiple") && result.length < 3) {
          result.push("multiple");
        }
        return result;
      })();

      const timing = prev.timing || (() => {
        if (!conciergeContext.timing) return "";
        const match = timingOptions.find(o => o.value === conciergeContext.timing);
        return match ? match.value : "";
      })();

      return { ...prev, interestedIn, timing };
    });
  }, [conciergeContext, userTouched]);

  const phoneDigits = formData.phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 10;
  const isFormValid = formData.fullName.trim().length > 0 && isPhoneValid;


  const handleInputChange = (field: string, value: string) => {
    setUserTouched(true);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "fullName" && value.trim()) {
      setGuestFirstName(value);
    }
  };

  const toggleService = (value: string) => {
    setUserTouched(true);
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
      concierge_context: conciergeContext || {},
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
            Drop your info and we'll reach out personally — or call us anytime.
          </p>
        </motion.div>

        {/* First-Visit Reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="bg-charcoal/30 border border-gold/8 rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
            <h3 className="font-display text-xl md:text-2xl text-cream mb-6 text-center">
              Your First Visit at <span className="text-gold-gradient">Hush</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: "Free consultations", detail: "Every new client gets a one-on-one with their artist before we start — no charge, no pressure." },
                { label: "Flexible cancellation", detail: "24-hour notice to cancel or reschedule. Life happens — we get it." },
                { label: "Easy parking", detail: "Free lot parking right outside the door. No meters, no stress." },
                { label: "What to expect", detail: "Plan for a warm welcome, a beverage, and a stylist who actually listens. That's the Hush standard." },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <Check className="w-4 h-4 text-gold mt-1 shrink-0" />
                  <div>
                    <span className="font-body text-sm text-cream font-medium">{item.label}</span>
                    <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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
              Request follow-up
            </h3>
            <p className="font-body text-cream/60 text-sm">
              Drop your name and number — our front desk will reach out personally.
            </p>
          </div>

          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="bg-charcoal/50 backdrop-blur-sm border border-gold/8 rounded-2xl p-8 md:p-12"
            >
              {/* Auto-populated context line */}
              {(() => {
                const ctxParts: string[] = [];
                if (conciergeContext?.categories?.length) {
                  ctxParts.push(
                    conciergeContext.categories
                      .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                      .join(" + ")
                  );
                }
                if (conciergeContext?.service_subtype && conciergeContext.service_subtype !== "unsure") {
                  const sub = conciergeContext.service_subtype.replace(/_/g, " ");
                  ctxParts.push(sub.charAt(0).toUpperCase() + sub.slice(1));
                }
                if (conciergeContext?.timing) {
                  const tlabel = conciergeContext.timing === "today" ? "Same day" : conciergeContext.timing === "week" ? "This week" : conciergeContext.timing.charAt(0).toUpperCase() + conciergeContext.timing.slice(1);
                  ctxParts.push(tlabel);
                }
                if (ctxParts.length === 0) return null;
                return (
                  <div className="mb-6 px-4 py-3 rounded-lg bg-gold/8 border border-gold/20">
                    <p className="font-body text-[11px] uppercase tracking-wider text-gold/70 mb-1">You're booking</p>
                    <p className="font-body text-sm text-cream">{ctxParts.join(" · ")}</p>
                  </div>
                );
              })()}

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
                    {isPhoneValid && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    )}
                  </div>
                  {formData.phone.trim().length > 0 && !isPhoneValid && (
                    <p className="font-body text-xs text-destructive mt-1">Please enter a valid 10-digit phone number</p>
                  )}
                </div>
              </div>

              {/* Optional note toggle */}
              <div className="mb-8">
                {!showNote ? (
                  <button
                    type="button"
                    onClick={() => setShowNote(true)}
                    className="font-body text-xs text-gold/70 hover:text-gold transition-colors underline underline-offset-4"
                  >
                    + Add a note (optional)
                  </button>
                ) : (
                  <div className="space-y-2">
                    <label className="font-body text-sm text-cream/75 block">
                      Note <span className="text-cream/35">(optional)</span>
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Anything else we should know?"
                      className="bg-background/50 border-gold/15 text-cream placeholder:text-cream/35 min-h-[100px] text-base resize-none focus:border-gold/40 focus:ring-gold/15"
                      maxLength={1000}
                    />
                  </div>
                )}
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
                    {isSubmitting ? "Sending..." : "Send request"}
                  </motion.button>
                  <span className="text-cream/40 text-sm">or</span>
                  <a
                    href="tel:+15203276753"
                    className="flex items-center gap-2 text-gold hover:text-gold/80 font-body transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call now: (520) 327-6753
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
                ✅ Your request was sent.
              </h3>
              <p className="font-body text-cream/70 text-base max-w-md mx-auto mb-2">
                The Hush team will follow up during business hours.
              </p>
              <p className="font-body text-cream/50 text-sm max-w-md mx-auto mb-8">
                You can also reach us at{" "}
                <a href="tel:+15203276753" className="text-gold hover:underline">(520) 327-6753</a>.
              </p>
              <button onClick={handleScrollToTop} className="btn-outline-gold">
                Back to home
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
