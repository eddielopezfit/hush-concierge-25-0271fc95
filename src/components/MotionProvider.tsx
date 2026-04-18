import { LazyMotion, domMax } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps children in framer-motion's LazyMotion provider.
 * Uses domMax to support whileHover/whileTap/drag gestures across the app.
 * Lazy-imported via React.lazy so framer-motion stays out of the eager bundle.
 */
export const MotionProvider = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domMax}>
    {children}
  </LazyMotion>
);
