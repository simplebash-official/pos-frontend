import React, { useMemo } from 'react';
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
import { SRI_LANKA_DENOMINATIONS } from './constants';

export interface DenominationCounterProps {
  value?: Record<string, number>;
  onChange: (denominations: Record<string, number>, totalCents: number) => void;
}

export const DenominationCounter: React.FC<DenominationCounterProps> = ({
  value = {},
  onChange,
}) => {
  const counts = value;

  const totalCents = useMemo(() => {
    let sum = 0;
    for (const denom of SRI_LANKA_DENOMINATIONS) {
      const count = counts[denom.id] ?? 0;
      sum += denom.valueRupees * count * 100;
    }
    return sum;
  }, [counts]);

  const handleCountChange = (denomId: string, count: number | string) => {
    const parsed = typeof count === 'number' ? Math.max(0, Math.floor(count)) : 0;
    const next = { ...counts, [denomId]: parsed };
    let sum = 0;
    for (const d of SRI_LANKA_DENOMINATIONS) {
      sum += d.valueRupees * (next[d.id] ?? 0) * 100;
    }
    onChange(next, sum);
  };

  const handleReset = () => {
    const next: Record<string, number> = {};
    for (const denom of SRI_LANKA_DENOMINATIONS) {
      next[denom.id] = 0;
    }
    onChange(next, 0);
  };

  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>
            {t('Denomination Breakdown')}
          </Text>
          <Group gap="xs">
            <Badge size="lg" variant="light" color="blue">
              {t('Total:')} <AnimatedNumber value={totalCents} format={formatMoney} />
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

        <Grid gap="xs">
          {SRI_LANKA_DENOMINATIONS.map((denom) => {
            const count = counts[denom.id] ?? 0;
            const lineSubtotalCents = denom.valueRupees * count * 100;

            return (
              <Grid.Col span={{ base: 12, sm: 6 }} key={denom.id}>
                <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                  <Text size="xs" fw={500} style={{ minWidth: 65 }}>
                    {denom.label}
                  </Text>
                  <NumberInput
                    size="xs"
                    min={0}
                    step={1}
                    startValue={1}
                    allowDecimal={false}
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(val) => handleCountChange(denom.id, val)}
                    styles={{ input: { textAlign: 'center', width: 96 } }}
                  />
                  <Text size="xs" c="dimmed" style={{ minWidth: 80, textAlign: 'right' }}>
                    <AnimatedNumber
                      value={lineSubtotalCents}
                      format={formatMoney}
                      duration={0.25}
                    />
                  </Text>
                </Group>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>
    </Card>
  );
};
