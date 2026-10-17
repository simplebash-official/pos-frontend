import { useReducedMotion } from 'framer-motion';
import { resolvePresets, type MotionPresets } from './presets';

/** The shared presets, already resolved for the user's reduced-motion setting. */
export const useMotionPresets = (): MotionPresets => resolvePresets(useReducedMotion() ?? false);
