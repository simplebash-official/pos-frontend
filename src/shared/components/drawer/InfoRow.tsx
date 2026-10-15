import type { ReactNode } from 'react';
import { Group, Stack, Text } from '@mantine/core';

export interface InfoRowProps {
  icon: ReactNode;
  label: string;
  /** Plain text, or something richer such as a value with a copy button. */
  children: ReactNode;
  /** Set for values that are long codes; they use a monospace face and may break anywhere. */
  mono?: boolean;
  /** Put the value on its own line under the label, for long text such as an address or an email. */
  stacked?: boolean;
}

/** One line in a card: icon and label on the left, the value on the right. */
export const InfoRow = ({ icon, label, children, mono, stacked }: InfoRowProps) =>
  stacked ? (
    <Stack gap={4}>
      <Group gap="xs" wrap="nowrap">
        <span style={{ opacity: 0.6, display: 'inline-flex' }}>{icon}</span>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text
        component="div"
        size="xs"
        fw={700}
        ff={mono ? 'monospace' : undefined}
        style={{ overflowWrap: 'anywhere', paddingLeft: 26 }}
      >
        {children}
      </Text>
    </Stack>
  ) : (
    <Group justify="space-between" wrap="nowrap" gap="sm" align="flex-start">
      <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
        <span style={{ opacity: 0.6, display: 'inline-flex' }}>{icon}</span>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text
        component="div"
        size="xs"
        fw={700}
        ta="right"
        ff={mono ? 'monospace' : undefined}
        style={{ minWidth: 0, wordBreak: mono ? 'break-all' : 'break-word' }}
      >
        {children}
      </Text>
    </Group>
  );
