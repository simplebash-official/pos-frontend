import { Box, Group, SimpleGrid, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useNow } from '@/shared/hooks/useNow';
import { t } from '@/shared/i18n/t';
import { formatShiftStart, splitElapsed } from '../../lib/shiftElapsed';

const twoDigits = (value: number): string => String(value).padStart(2, '0');

interface TimeTileProps {
  value: number;
  label: string;
  valueColor: string;
}

/** One unit of the running time: digits over a small caption. */
const TimeTile = ({ value, label, valueColor }: TimeTileProps) => (
  <Box
    py={6}
    style={{
      background: 'var(--bg-app)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--mantine-radius-default)',
      textAlign: 'center',
    }}
  >
    <Text
      ff="monospace"
      fw={600}
      c={valueColor}
      style={{ fontSize: 20, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}
    >
      {twoDigits(value)}
    </Text>
    <Text
      c="dimmed"
      fw={600}
      tt="uppercase"
      mt={2}
      style={{ fontSize: 10, letterSpacing: '0.06em' }}
    >
      {label}
    </Text>
  </Box>
);

/**
 * How long the shift has been open, counting live, and when it started.
 * It lives inside the menu, which is only mounted while open, so the one-second clock
 * stops as soon as the menu closes.
 */
export const ShiftOpenFor = ({ openedAt }: { openedAt: string }) => {
  const now = useNow(true);
  const { days, hours, minutes, seconds } = splitElapsed(openedAt, now);

  return (
    <Box mb="md">
      <Group gap={6} mb={6}>
        <IconClock size={14} color="var(--text-muted)" aria-hidden />
        <Text size="xs" c="dimmed">
          {t('Open for')}
        </Text>
      </Group>
      {/* Read out without the seconds, so a screen reader is not interrupted every second. */}
      <SimpleGrid
        cols={4}
        spacing={6}
        role="group"
        aria-label={`${days} ${t('Days')}, ${hours} ${t('Hrs')}, ${minutes} ${t('Min')}`}
      >
        <TimeTile value={days} label={t('Days')} valueColor="var(--text-primary)" />
        <TimeTile value={hours} label={t('Hrs')} valueColor="var(--text-primary)" />
        <TimeTile value={minutes} label={t('Min')} valueColor="var(--text-primary)" />
        <TimeTile value={seconds} label={t('Sec')} valueColor="var(--status-ok)" />
      </SimpleGrid>
      <Text size="xs" c="dimmed" mt={10}>
        {t('Since')}{' '}
        <Text span fw={700} c="var(--text-primary)">
          {formatShiftStart(openedAt)}
        </Text>
      </Text>
    </Box>
  );
};
