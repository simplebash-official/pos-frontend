import type { ReactNode } from 'react';
import { Group, Paper, Stack } from '@mantine/core';
import { SectionLabel } from './SectionLabel';

export interface DrawerCardProps {
  /** The title lives inside the card so both columns start at the same height. */
  label?: string;
  icon?: ReactNode;
  /** Something at the right of the title row, such as a small button. */
  action?: ReactNode;
  children: ReactNode;
}

/** A card on the drawer canvas, optionally with its title (and an action) inside the top. */
export const DrawerCard = ({ label, icon, action, children }: DrawerCardProps) => (
  <Paper p="md" bg="var(--bg-card)" shadow="xs">
    <Stack gap="xs">
      {label !== undefined && (
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <SectionLabel icon={icon}>{label}</SectionLabel>
          {action}
        </Group>
      )}
      {children}
    </Stack>
  </Paper>
);
