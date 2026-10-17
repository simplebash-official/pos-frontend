import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATION } from './presets';
import { useMotionPresets } from './useMotionPresets';

export interface PresenceSwitchProps {
  /** Identifies what is showing (e.g. 'loading' | 'empty' | 'list'); a change cross-fades. */
  stateKey: string;
  children: ReactNode;
}

/** Cross-fades between states such as loading → content → empty. Opacity only. */
export const PresenceSwitch = ({ stateKey, children }: PresenceSwitchProps) => {
  const { reduced } = useMotionPresets();
  const t = { duration: reduced ? 0 : DURATION.fast };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stateKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={t}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
