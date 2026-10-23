import { Button, Group, Text } from '@mantine/core';

export interface ShortcutPill {
  key: string;
  label: string;
  onSelect: () => void;
  dataLogId?: string;
}

export interface ShortcutPillsProps {
  /** Grey words before the pills saying what they do, e.g. "Quick amounts". */
  caption: string;
  pills: ShortcutPill[];
  tall: boolean;
}

/**
 * Taps that fill in the field above for you. They are tinted text pills, never outlined cards,
 * so they cannot be mistaken for a choice.
 */
export const ShortcutPills = ({ caption, pills, tall }: ShortcutPillsProps) => (
  <Group gap="xs" align="center">
    <Text size="xs" c="dimmed">
      {caption}
    </Text>
    {pills.map((pill) => (
      <Button
        key={pill.key}
        size="compact-sm"
        variant="light"
        h={tall ? 44 : undefined}
        onClick={pill.onSelect}
        data-log-id={pill.dataLogId}
      >
        {pill.label}
      </Button>
    ))}
  </Group>
);
