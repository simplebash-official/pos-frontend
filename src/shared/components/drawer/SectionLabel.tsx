import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';

/** The small uppercase title that sits inside the top of a drawer card. */
export const SectionLabel = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <Group gap={6} wrap="nowrap" c="dimmed">
    {icon}
    <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
      {children}
    </Text>
  </Group>
);
