import { useState } from 'react';
import { Box, Collapse, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconShieldCheck } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { coverageLabel, endsOnIfStartedToday } from '../lib/warrantyView';
import type { WarrantyCoverage } from '../types';

export interface WarrantySummaryLine {
  id: string;
  name: string;
  quantity: number;
  coverage: WarrantyCoverage;
}

/**
 * Before payment, the warranties this sale gives: each covered line with how long and the end
 * date it will get today, so the cashier can say it to the customer. Hidden when nothing in the
 * cart is covered; folded by default to keep the payment panel short.
 */
export const WarrantySummarySection = ({ lines }: { lines: WarrantySummaryLine[] }) => {
  const [open, setOpen] = useState(false);
  const covered = lines.filter((line) => line.coverage.kind !== 'none');
  if (covered.length === 0) return null;

  return (
    <Box
      p="xs"
      style={{
        borderRadius: 'var(--mantine-radius-default)',
        border: '1px solid var(--border)',
        background: 'var(--status-ok-bg)',
      }}
    >
      <UnstyledButton
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        style={{ width: '100%', minHeight: 32 }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <IconShieldCheck size={16} color="var(--status-ok)" />
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('Warranty on this sale')}
            </Text>
          </Group>
          <Group gap={6} wrap="nowrap">
            <Text size="xs" c="dimmed">
              {covered.length} {covered.length === 1 ? t('item covered') : t('items covered')}
            </Text>
            <IconChevronDown
              size={14}
              style={{
                transform: open ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            />
          </Group>
        </Group>
      </UnstyledButton>
      <Collapse expanded={open}>
        <Stack gap={4} mt="xs">
          {covered.map((line) => {
            const endsOn = endsOnIfStartedToday(line.coverage);
            return (
              <Group key={line.id} justify="space-between" wrap="nowrap" gap="xs">
                <Text size="xs" lineClamp={1} style={{ minWidth: 0 }}>
                  {line.quantity > 1 ? `${line.quantity} × ` : ''}
                  {line.name}
                </Text>
                <Text size="xs" fw={700} style={{ whiteSpace: 'nowrap' }}>
                  {endsOn === null
                    ? coverageLabel(line.coverage)
                    : `${coverageLabel(line.coverage)} · ${t('until')} ${formatDate(endsOn)}`}
                </Text>
              </Group>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
};
