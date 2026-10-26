import React from 'react';
import {
  ActionIcon,
  Badge,
  Card,
  Grid,
  Group,
  NumberInput,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { AnimatedNumber } from '@/shared/motion';
import type { LiveCalc } from '@/shared/hooks/useCalc';
import type { CalcCashCountReply } from '../../types';

export interface DenominationCounterProps {
  /** How many of each note or coin has been typed, keyed by its rupee value. */
  counts: Record<string, number>;
  onChange: (counts: Record<string, number>) => void;
  /** The server's total for `counts`; each row's subtotal comes from it too. */
  count: LiveCalc<CalcCashCountReply>;
}

export const DenominationCounter: React.FC<DenominationCounterProps> = ({
  counts,
  onChange,
  count,
}) => {
  const handleCountChange = (denomId: string, value: number | string) => {
    const parsed = typeof value === 'number' ? Math.max(0, Math.floor(value)) : 0;
    onChange({ ...counts, [denomId]: parsed });
  };

  const handleReset = () => onChange({});

  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>
            {t('Denomination Breakdown')}
          </Text>
          <Group gap="xs">
            <Badge size="lg" variant="light" color="blue">
              {t('Total:')}{' '}
              {count.data === undefined ? (
                '…'
              ) : (
                <AnimatedNumber value={count.data.totalCents} format={formatMoney} />
              )}
            </Badge>
            <Tooltip label={t('Clear all counts')}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleReset}
                aria-label={t('Clear all')}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {count.data === undefined ? (
          <Text size="sm" c="dimmed">
            {count.error === null
              ? t('Working out the figures...')
              : t('Could not work out the figures. Check the connection and try again.')}
          </Text>
        ) : (
          <Grid gap="xs">
            {count.data.lines.map((line) => {
              const typed = counts[line.id];
              return (
                <Grid.Col span={{ base: 12, sm: 6 }} key={line.id}>
                  <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                    <Text size="xs" fw={500} style={{ minWidth: 65 }}>
                      {formatMoney(line.valueCents)}
                    </Text>
                    <NumberInput
                      size="xs"
                      min={0}
                      step={1}
                      startValue={1}
                      allowDecimal={false}
                      value={typed === undefined || typed === 0 ? '' : typed}
                      placeholder="0"
                      onChange={(val) => handleCountChange(line.id, val)}
                      styles={{ input: { textAlign: 'center', width: 96 } }}
                    />
                    <Text size="xs" c="dimmed" style={{ minWidth: 80, textAlign: 'right' }}>
                      <AnimatedNumber
                        value={line.subtotalCents}
                        format={formatMoney}
                        duration={0.25}
                      />
                    </Text>
                  </Group>
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Stack>
    </Card>
  );
};
