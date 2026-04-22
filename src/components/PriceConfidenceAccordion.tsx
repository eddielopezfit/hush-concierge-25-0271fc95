import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface PriceConfidenceAccordionProps {
  /** Optional category-tailored summary line. Defaults to the color/hair line. */
  summary?: string;
  /** Optional category-tailored bullets. Defaults to hair/color factors. */
  factors?: string[];
}

const DEFAULT_FACTORS = [
  "Hair length and thickness",
  "Your starting color and condition",
  "The technique needed to achieve your goal",
];

const DEFAULT_SUMMARY =
  "Most color visits typically fall between $130–$280, and your stylist will confirm everything during your complimentary consultation.";

export const PriceConfidenceAccordion = ({
  summary = DEFAULT_SUMMARY,
  factors = DEFAULT_FACTORS,
}: PriceConfidenceAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gold/15 bg-secondary/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-3.5 text-left hover:bg-gold/5 transition-colors"
      >
        <span className="font-body text-sm text-cream/85">
          What affects your price?
        </span>
        <m.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="text-gold flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </m.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 md:px-5 md:pb-5 space-y-3">
              <ul className="space-y-1.5">
                {factors.map((f) => (
                  <li
                    key={f}
                    className="flex gap-2 font-body text-xs md:text-sm text-cream/70 leading-relaxed"
                  >
                    <span className="text-gold mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="font-body text-xs md:text-sm text-cream/60 italic leading-relaxed pt-1 border-t border-gold/10">
                {summary}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
