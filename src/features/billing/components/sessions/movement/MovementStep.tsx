import type { ReactNode } from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';

export interface MovementStepProps {
  number: number;
  /** A short plain question or instruction, e.g. "How much?". */
  title: string;
  /** Shows the red star after the title: the step cannot be skipped. */
  required: boolean;
  children: ReactNode;
}

/** One numbered step of the form, so the order of things to fill in is never a guess. */
export const MovementStep = ({ number, title, required, children }: MovementStepProps) => (
  <Stack gap="xs" role="group" aria-label={title}>
    <Group gap="xs" wrap="nowrap">
      <Box
        aria-hidden
        style={{
          width: 22,
          height: 22,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--mantine-primary-color-filled)',
          background: 'var(--mantine-primary-color-light)',
        }}
      >
        {number}
      </Box>
      <Text fw={700} size="sm">
        {title}
        {required && (
          <Text span c="red" ml={4}>
            *
          </Text>
        )}
      </Text>
    </Group>
    {children}
  </Stack>
);
