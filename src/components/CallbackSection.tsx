import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serviceOptions = [
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "lashes", label: "Lashes" },
  { value: "massage", label: "Massage" },
  { value: "bridal", label: "Bridal / Group" },
  { value: "not-sure", label: "Not sure yet" },
];

const timingOptions = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This week" },
  { value: "planning", label: "Planning ahead" },
];

export const CallbackSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    interestedIn: "",
    timing: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="callback" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 opacity-5">
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
            Request a Concierge Callback
          </h2>
          <p className="font-body text-cream/70 text-lg max-w-2xl mx-auto">
            Share your details below and our front desk will reach out to assist you personally.
          </p>
        </motion.div>

        {!isSubmitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-charcoal/50 backdrop-blur-sm border border-gold/10 rounded-2xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="font-body text-sm text-cream/80 block">
                  Full Name <span className="text-gold">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Your name"
                  className="bg-background/50 border-gold/20 text-cream placeholder:text-cream/40 h-12 text-base focus:border-gold/50 focus:ring-gold/20"
                  maxLength={100}
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-2">
                <label className="font-body text-sm text-cream/80 block">
                  Mobile Phone <span className="text-gold">*</span>
                </label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(520) 000-0000"
                  className="bg-background/50 border-gold/20 text-cream placeholder:text-cream/40 h-12 text-base focus:border-gold/50 focus:ring-gold/20"
                  maxLength={20}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="font-body text-sm text-cream/80 block">
                  Email <span className="text-cream/40">(optional)</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="you@email.com"
                  className="bg-background/50 border-gold/20 text-cream placeholder:text-cream/40 h-12 text-base focus:border-gold/50 focus:ring-gold/20"
                  maxLength={255}
                />
              </div>

              {/* Interested In */}
              <div className="space-y-2">
                <label className="font-body text-sm text-cream/80 block">
                  Interested In
                </label>
                <Select
                  value={formData.interestedIn}
                  onValueChange={(value) => handleInputChange("interestedIn", value)}
                >
                  <SelectTrigger className="bg-background/50 border-gold/20 text-cream h-12 text-base focus:border-gold/50 focus:ring-gold/20">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-gold/20 z-50">
                    {serviceOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-cream hover:bg-gold/10 focus:bg-gold/10 focus:text-cream cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* How Soon */}
              <div className="space-y-2 md:col-span-2">
                <label className="font-body text-sm text-cream/80 block">
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
                          ? "bg-gold/20 border-gold text-gold"
                          : "bg-background/30 border-gold/20 text-cream/70 hover:border-gold/40 hover:text-cream"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2 mb-8">
              <label className="font-body text-sm text-cream/80 block">
                Message <span className="text-cream/40">(optional)</span>
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Tell us about your ideal experience..."
                className="bg-background/50 border-gold/20 text-cream placeholder:text-cream/40 min-h-[120px] text-base resize-none focus:border-gold/50 focus:ring-gold/20"
                maxLength={1000}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.fullName.trim() || !formData.phone.trim()}
                className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-background font-body text-base px-10 py-6 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Request Callback"}
              </Button>
              <span className="text-cream/50 text-sm">or</span>
              <a
                href="tel:+15203276753"
                className="flex items-center gap-2 text-gold hover:text-gold/80 font-body transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Now: (520) 327-6753
              </a>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-charcoal/50 backdrop-blur-sm border border-gold/20 rounded-2xl p-12 md:p-16 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-gold" />
            </motion.div>
            <h3 className="font-display text-2xl md:text-3xl text-gold-gradient mb-4">
              Thank You
            </h3>
            <p className="font-body text-cream/70 text-lg max-w-md mx-auto mb-8">
              The front desk will reach out as soon as possible during business hours.
            </p>
            <div className="pt-6 border-t border-gold/10">
              <p className="font-body text-cream/50 text-sm mb-3">
                Need immediate assistance?
              </p>
              <a
                href="tel:+15203276753"
                className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-body text-lg transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (520) 327-6753
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
