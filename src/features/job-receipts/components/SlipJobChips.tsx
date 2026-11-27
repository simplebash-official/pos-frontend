import { Box, Chip, Group, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { MAX_SLIP_JOBS } from '../lib/jobSlip';

/** A job that can be ticked onto the slip. */
export interface SlipChoice {
  id: string;
  ticketNumber: string;
  label: string;
}

export interface SlipJobChipsProps {
  choices: readonly SlipChoice[];
  selected: readonly string[];
  /** The whole selection after a tick; never empty. */
  onChange: (selected: string[]) => void;
}

/** "Jobs on this slip": the customer's open jobs, each ticked on or off. */
export const SlipJobChips = ({ choices, selected, onChange }: SlipJobChipsProps) => {
  const isMobile = useIsMobile();
  const full = selected.length >= MAX_SLIP_JOBS;
  return (
    <Box
      px={isMobile ? 'sm' : 'lg'}
      py={8}
      role="group"
      aria-label={t('Jobs on this slip')}
      style={{
        flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        maxHeight: 120,
        overflowY: 'auto',
      }}
    >
      <Group gap={8}>
        <Text size="xs" fw={700} c="dimmed">
          {t('Jobs on this slip')}
        </Text>
        <Chip.Group
          multiple
          value={[...selected]}
          onChange={(next) => {
            if (next.length > 0 && next.length <= MAX_SLIP_JOBS) onChange(next);
          }}
        >
          {choices.map((choice) => (
            <Chip
              key={choice.id}
              value={choice.id}
              size={isMobile ? 'md' : 'sm'}
              disabled={full && !selected.includes(choice.id)}
            >
              {choice.label}
            </Chip>
          ))}
        </Chip.Group>
        {full && (
          <Text size="xs" c="dimmed">
            {t('A slip lists at most 20 jobs.')}
          </Text>
        )}
      </Group>
    </Box>
  );
};
