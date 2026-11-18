import type { ReactNode } from 'react';
import { Box, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export type ItemActionTone = 'none' | 'teal' | 'orange' | 'red';

const TONE: Record<ItemActionTone, { bg: string; border: string; value: string }> = {
  none: {
    bg: 'var(--bg-card)',
    border: 'var(--border-strong)',
    value: 'var(--text-secondary)',
  },
  teal: {
    bg: 'light-dark(var(--mantine-color-teal-0), rgba(18, 184, 134, 0.12))',
    border: 'var(--mantine-color-teal-6)',
    value: 'light-dark(var(--mantine-color-teal-9), var(--mantine-color-teal-3))',
  },
  orange: {
    bg: 'light-dark(var(--mantine-color-orange-0), rgba(253, 126, 20, 0.12))',
    border: 'var(--mantine-color-orange-6)',
    value: 'light-dark(var(--mantine-color-orange-9), var(--mantine-color-orange-3))',
  },
  red: {
    bg: 'light-dark(var(--mantine-color-red-0), rgba(250, 82, 82, 0.12))',
    border: 'var(--mantine-color-red-6)',
    value: 'light-dark(var(--mantine-color-red-9), var(--mantine-color-red-3))',
  },
};

export interface ItemActionButtonProps {
  /** What the button is about ("Warranty", "Discount"), small, above the value. */
  label: string;
  /** What is set now, in bold ("3 months", "-10% · -Rs. 250.00", "Add discount"). */
  value: string;
  icon: ReactNode;
  tone: ItemActionTone;
  /** A finished job shows the value only: no click, no chevron. */
  readOnly: boolean;
  /** Needed on a button that opens a window; not on a read-only one. */
  onClick?: () => void;
  'aria-label'?: string;
}

/**
 * The one face of the two per-item buttons (warranty and discount), so they are always the same
 * size: a label above a bold value, 44px tall on a phone and 40px on a computer.
 */
export const ItemActionButton = ({
  label,
  value,
  icon,
  tone,
  readOnly,
  onClick,
  'aria-label': ariaLabel,
}: ItemActionButtonProps) => {
  const isMobile = useIsMobile();
  const look = TONE[tone];
  const face = (
    <>
      <Box style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
        <Text
          size="xs"
          c="dimmed"
          lh={1.2}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {icon}
          {label}
        </Text>
        <Text size="sm" fw={600} lh={1.3} truncate="end" style={{ color: look.value }}>
          {value}
        </Text>
      </Box>
      {!readOnly && <IconChevronDown size={16} style={{ flexShrink: 0, opacity: 0.6 }} />}
    </>
  );
  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minHeight: isMobile ? 48 : 44,
    padding: '6px 12px',
    borderRadius: 'var(--mantine-radius-default)',
    border: `1px solid ${look.border}`,
    background: look.bg,
  } as const;
  if (readOnly) return <Box style={style}>{face}</Box>;
  return (
    <UnstyledButton onClick={onClick} aria-label={ariaLabel} style={style}>
      {face}
    </UnstyledButton>
  );
};
