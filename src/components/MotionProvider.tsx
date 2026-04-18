import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps children in framer-motion's LazyMotion provider.
 * Lazy-imported via React.lazy so framer-motion stays out of the eager bundle.
 */
export const MotionProvider = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);
