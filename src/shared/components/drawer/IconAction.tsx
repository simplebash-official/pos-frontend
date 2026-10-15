import type { ReactNode } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export type IconActionKind = 'edit' | 'danger' | 'neutral';

const COLOR: Record<IconActionKind, string> = { edit: 'blue', danger: 'red', neutral: 'gray' };

export interface IconActionProps {
  kind: IconActionKind;
  /** Used for the tooltip and the accessible name, so it must say what the button does. */
  label: string;
  icon: ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * The drawer family's icon button: a tinted square, 32px (44px on a phone), blue
 * to edit, red to remove. Sit several together with a 6px gap.
 */
export const IconAction = ({ kind, label, icon, onClick, loading, disabled }: IconActionProps) => {
  const isMobile = useIsMobile();
  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="light"
        color={COLOR[kind]}
        size={isMobile ? 44 : 32}
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
};
