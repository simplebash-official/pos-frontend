import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE } from './presets';
import { useMotionPresets } from './useMotionPresets';

export interface StepSwitchProps {
  /** The step number showing; a higher number slides in from the right, a lower one from the left. */
  step: number;
  children: ReactNode;
}

/** Swaps the body of a multi-step flow with a short slide + fade (transform and opacity only). */
export const StepSwitch = ({ step, children }: StepSwitchProps) => {
  const { reduced } = useMotionPresets();
  // Worked out while rendering so the exiting and entering panels agree on the direction.
  const [seen, setSeen] = useState({ step, direction: 1 });
  if (seen.step !== step) setSeen({ step, direction: step > seen.step ? 1 : -1 });
  const { direction } = seen;
  const offset = reduced ? 0 : 24 * direction;
  const transition = reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
