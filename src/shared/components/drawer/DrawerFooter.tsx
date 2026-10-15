import type { ReactNode } from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { IconAction } from './IconAction';

export interface DrawerFooterProps {
  /** At the left: a destructive action such as Delete (red, light). */
  start?: ReactNode;
  /** At the right: Close (default) then the primary action (blue). */
  children: ReactNode;
}

/** The pinned bar under a drawer's content. */
export const DrawerFooter = ({ start, children }: DrawerFooterProps) => (
  <Group
    justify={start === undefined ? 'flex-end' : 'space-between'}
    gap="sm"
    wrap="wrap"
    className="rich-drawer-footer"
  >
    {start}
    <Group gap="sm" wrap="wrap" justify="flex-end">
      {children}
    </Group>
  </Group>
);

export interface FooterDeleteProps {
  /** The visible word, for example "Delete". */
  label: string;
  /** What it deletes, for the tooltip and accessible name when it shows as an icon only. */
  hint: string;
  onClick: () => void;
}

/** The destructive footer action: a red light button, shrinking to a red icon on a phone so the row still fits. */
export const FooterDelete = ({ label, hint, onClick }: FooterDeleteProps) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <IconAction kind="danger" label={hint} icon={<IconTrash size={16} />} onClick={onClick} />
    );
  }
  return (
    <Tooltip label={hint} withArrow>
      <Button
        variant="light"
        color="red"
        size="sm"
        leftSection={<IconTrash size={16} />}
        onClick={onClick}
      >
        {label}
      </Button>
    </Tooltip>
  );
};
