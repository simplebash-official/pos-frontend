import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Text } from '@mantine/core';
import { IconCheck, IconLock } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useMotionPresets } from '@/shared/motion';

export interface ChoiceGroupProps {
  /** Said by screen readers as the name of the group, e.g. "Kind of cash movement". */
  label: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A "choose one" group. The arrow keys move between the options and choose the one they land
 * on, like any radio group; Tab enters and leaves the group once.
 */
export const ChoiceGroup = ({ label, children, className, style }: ChoiceGroupProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !back) return;
    const options = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? []
    );
    const at = options.indexOf(document.activeElement as HTMLButtonElement);
    if (at === -1) return;
    event.preventDefault();
    const next = options[(at + (forward ? 1 : -1) + options.length) % options.length];
    next.focus();
    next.click();
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
};

export interface ChoiceCardProps {
  label: string;
  /** One line saying what the option is for. Left out for short options such as a category. */
  hint?: string;
  icon?: ReactNode;
  selected: boolean;
  /** When false the option is shown but cannot be chosen, with a small lock. */
  allowed: boolean;
  onSelect: () => void;
  /** Extra content after the name, such as a "New" badge. */
  trailing?: ReactNode;
  /** Taller on a phone so a finger can hit it. */
  tall: boolean;
}

/** One option of a `ChoiceGroup`. The tick pops in when it is chosen. */
export const ChoiceCard = ({
  label,
  hint,
  icon,
  selected,
  allowed,
  onSelect,
  trailing,
  tall,
}: ChoiceCardProps) => {
  const { pop, transition } = useMotionPresets();
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      disabled={!allowed}
      className="choice-card"
      style={{ minHeight: tall ? 56 : 44 }}
      onClick={onSelect}
    >
      {icon && (
        <span aria-hidden style={{ display: 'flex', color: 'var(--text-secondary)' }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={600} component="span" style={{ display: 'block' }}>
          {label}
          {trailing}
        </Text>
        {hint && (
          <Text
            size="xs"
            c="dimmed"
            component="span"
            style={{ display: 'block', lineHeight: 1.35 }}
          >
            {hint}
          </Text>
        )}
      </span>
      {!allowed && <IconLock size={16} aria-hidden color="var(--text-muted)" />}
      {selected && (
        <motion.span
          aria-hidden
          initial={pop.initial}
          animate={pop.animate}
          transition={transition}
          style={{
            display: 'flex',
            color: 'var(--mantine-primary-color-filled)',
            flexShrink: 0,
          }}
        >
          <IconCheck size={18} />
        </motion.span>
      )}
    </button>
  );
};
