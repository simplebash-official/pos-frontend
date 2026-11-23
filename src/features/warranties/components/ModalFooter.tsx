import type { ReactNode } from 'react';
import { Group, Stack, Text } from '@mantine/core';

/**
 * The buttons of a window that can grow longer than the screen. They stay at the bottom edge while
 * the window scrolls, with the reason a send did not work right above them, so neither is ever out
 * of sight.
 */
export const ModalFooter = ({ note, children }: { note: string | null; children: ReactNode }) => (
  <Stack
    gap="xs"
    mx="calc(var(--mantine-spacing-md) * -1)"
    px="md"
    py="sm"
    style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 2,
      background: 'var(--mantine-color-body)',
      borderTop: '1px solid var(--mantine-color-default-border)',
    }}
  >
    {note !== null && (
      <Text size="sm" c="red" role="alert">
        {note}
      </Text>
    )}
    <Group justify="flex-end" gap="sm">
      {children}
    </Group>
  </Stack>
);
