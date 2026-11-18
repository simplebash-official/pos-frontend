import { useId } from 'react';
import { motion } from 'framer-motion';
import { Box, UnstyledButton } from '@mantine/core';
import { SPRING, useMotionPresets } from '@/shared/motion';

export interface PillSwitchOption<V extends string> {
  value: V;
  label: string;
  /** Shown as a small number beside the label when above zero. */
  count?: number;
}

interface PillSwitchProps<V extends string> {
  options: PillSwitchOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Screen-reader name of the whole switch. */
  label: string;
  /** Fill the row with equal-width options. */
  grow: boolean;
}

/** A small segmented switch whose highlight glides to the chosen option. */
export const PillSwitch = <V extends string>({
  options,
  value,
  onChange,
  label,
  grow,
}: PillSwitchProps<V>) => {
  const pillId = useId();
  const { reduced } = useMotionPresets();
  return (
    <Box role="radiogroup" aria-label={label} className="ntf-switch" data-grow={grow || undefined}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <UnstyledButton
            key={option.value}
            role="radio"
            aria-checked={active}
            className="ntf-switch-option"
            data-active={active || undefined}
            onClick={() => onChange(option.value)}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                className="ntf-switch-pill"
                transition={reduced ? { duration: 0 } : SPRING}
              />
            )}
            <span className="ntf-switch-label">
              {option.label}
              {option.count !== undefined && option.count > 0 && (
                <span className="ntf-switch-count">{option.count > 99 ? '99+' : option.count}</span>
              )}
            </span>
          </UnstyledButton>
        );
      })}
    </Box>
  );
};
