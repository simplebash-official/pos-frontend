import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerDelay } from './presets';
import { useMotionPresets } from './useMotionPresets';

export interface FadeInProps {
  children: ReactNode;
  /** Position in a list; later items enter a touch later (capped). Leave out for none. */
  index?: number;
  style?: CSSProperties;
  className?: string;
}

/** Fades and rises into place on mount; with reduced motion it just appears. */
export const FadeIn = ({ children, index = 0, style, className }: FadeInProps) => {
  const { fadeUp, transition, reduced } = useMotionPresets();
  return (
    <motion.div
      className={className}
      style={style}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ ...transition, delay: reduced ? 0 : staggerDelay(index) }}
    >
      {children}
    </motion.div>
  );
};
