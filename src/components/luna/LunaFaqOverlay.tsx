import { m, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItems = [
  {
    value: "pricing",
    question: "How does pricing work?",
    answer:
      "Prices can vary by service, timing, and the level of customization involved. If you're unsure, Luna can help narrow the right starting point before you book.",
  },
  {
    value: "timing",
    question: "How long should I plan for?",
    answer:
      "Quick maintenance visits may be under an hour, while color and transformation appointments can take a few hours. If you tell Luna what you're after, she can guide you toward the right time expectation.",
  },
  {
    value: "parking",
    question: "Is parking easy?",
    answer:
      "Yes — Hush has free lot parking right outside the door at 4635 E Fort Lowell Rd in the Glenn & Swan area, so arriving is simple.",
  },
  {
    value: "first-visit",
    question: "What should I expect on my first visit?",
    answer:
      "New guests can start with a free consultation, plus a warm welcome, a beverage, and time with a stylist who actually listens. If plans change, 24-hour notice is appreciated for cancellations or reschedules.",
  },
];

interface LunaFaqOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const LunaFaqOverlay = ({ open, onClose }: LunaFaqOverlayProps) => {
  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm p-3 md:p-4"
        >
          <div className="flex h-full items-start justify-center pt-16 md:pt-20">
            <m.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-elegant)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
                <div>
                  <p className="font-display text-lg text-foreground">Quick Answers</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    The details guests ask most before they book.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close FAQ"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[min(70dvh,32rem)] overflow-y-auto px-4 py-2">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item) => (
                    <AccordionItem key={item.value} value={item.value} className="border-border last:border-b-0">
                      <AccordionTrigger className="py-3 text-left font-body text-sm text-foreground hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pt-0">
                        <p className="font-body text-sm leading-relaxed text-muted-foreground">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};