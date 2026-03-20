import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, CheckCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveLead } from "@/lib/saveSession";
import { supabase } from "@/integrations/supabase/client";
import { getConciergeContext } from "@/lib/conciergeStore";
import { callbackServiceOptions as serviceOptions } from "@/data/categoryData";

import { callbackTimingOptions as timingOptions } from "@/data/categoryData";

export const CallbackSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    interestedIn: [] as string[],
    timing: "",
    message: "",
  });

  const isFormValid = formData.fullName.trim().length > 0 && formData.phone.trim().length > 0;

  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(false);

    const success = await saveLead({
      name: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      category: formData.interestedIn.join(", ") || undefined,
      timing: formData.timing || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      setIsSubmitted(true);
    } else {
      setSubmitError(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleService = (value: string) => {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(value)
        ? prev.interestedIn.filter(s => s !== value)
        : [...prev.interestedIn, value],
    }));
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFieldValid = (field: string) => {
    const value = formData[field as keyof typeof formData];
    if (typeof value === "string") return value.trim().length > 0;
    return false;
  };

  return (
    <section id="callback" className="py-20 md:py-24 pb-32 md:pb-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4">
            Request a Callback
          </h2>
          <p className="font-body text-cream/60 text-base max-w-lg mx-auto">
            Drop your info and our front desk will reach out to help you personally.
          </p>
        </motion.div>

        {!isSubmitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
                  Interested In
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
          </motion.form>
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
            <button
              onClick={handleScrollToTop}
              className="btn-outline-gold"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
