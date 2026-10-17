import { Group, Stack, Text } from '@mantine/core';
import { IconCalculator, IconCash } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { t } from '@/shared/i18n/t';

export type CountMode = 'total' | 'denominations';

export interface CountMethodToggleProps {
  label: string;
  value: CountMode;
  onChange: (mode: CountMode) => void;
}

const option = (value: CountMode, icon: React.ReactNode, text: string) => ({
  value,
  label: (
    <Group gap={6} justify="center" wrap="nowrap">
      {icon}
      <span>{text}</span>
    </Group>
  ),
});

/** "Quick Total / Count Denominations" choice shared by the open and close shift windows. */
export const CountMethodToggle = ({ label, value, onChange }: CountMethodToggleProps) => (
  <Stack gap={6}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
      {label}
    </Text>
    <SegmentedToggle
      fullWidth
      size="sm"
      value={value}
      onChange={(val) => onChange(val as CountMode)}
      data={[
        option('total', <IconCash size={16} />, t('Quick Total')),
        option('denominations', <IconCalculator size={16} />, t('Count Denominations')),
      ]}
    />
  </Stack>
);
