/**
 * Shared design tokens for service description rendering.
 *
 * Used by:
 *  - ServiceMenuModal (compact accordion, expand/collapse)
 *  - LunaChatWidget Explore tab (compact list, line-clamped)
 *  - ServicesKnowledgeBase page (full editorial card)
 *
 * Keep typography, color, ornament, and motion in sync here so the
 * three surfaces never drift visually.
 */

/** Base typography shared by every variant. */
const BASE =
  "font-body font-light text-cream/60 leading-[1.6] tracking-[0.005em] " +
  "max-w-prose before:content-['—'] before:mr-1.5 before:text-gold/60";

/** Compact = ServiceMenuModal accordion + Luna Explore list. */
const COMPACT_SIZE = "text-[12.5px] md:text-[13.5px]";

/** Editorial = full Knowledge Base cards. */
const EDITORIAL_SIZE = "text-[13px] md:text-[14px] leading-[1.65] before:mr-2";

export const serviceDescriptionClass = {
  /** Used inside ServiceMenuModal expand/collapse. */
  compact: `${BASE} ${COMPACT_SIZE} mt-1.5`,
  /** Used inline in Luna Explore tab list (clamped to 2 lines). */
  inline: `${BASE} ${COMPACT_SIZE} mt-1.5 line-clamp-2`,
  /** Used as full body copy in Knowledge Base cards. */
  editorial: `${BASE} ${EDITORIAL_SIZE} mb-4`,
} as const;

/** Framer Motion presets for description reveal/transitions. */
export const serviceDescriptionMotion = {
  /** Height + opacity reveal for expand/collapse accordions. */
  reveal: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
  /** Subtle slide-in for inline lists (no height animation). */
  inline: {
    initial: { opacity: 0, y: 2 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  /** Editorial fade-up for full cards. */
  editorial: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
} as const;