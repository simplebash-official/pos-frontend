import { Group, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconBuildingBank, IconCash, IconCreditCard, IconWorld } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { accountLabel } from '@/features/money-accounts/lib/accountView';
import type { AccountKind } from '@/features/money-accounts/types';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { cashFlowLabel } from '../lib/reportView';
import type { CashFlow } from '../types';

const ICONS: Record<AccountKind, ReactNode> = {
  drawer: <IconCash size={20} />,
  bank: <IconBuildingBank size={20} />,
  card: <IconCreditCard size={20} />,
  online: <IconWorld size={20} />,
};

// Money that came in and went out of each account over the period, with the reasons. A cash drop
// to the bank is out of the drawer and into the bank, so it shows on both.
export const CashFlowPanel = ({
  report,
  loading,
}: {
  report: CashFlow | undefined;
  loading: boolean;
}) => {
  if (loading || report === undefined) return <Skeleton h={320} />;
  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {report.accounts.map((a) => (
          <Paper key={a.kind} withBorder p="md" bg="var(--bg-card)">
            <Stack gap="sm">
              <Group gap="sm" wrap="nowrap">
                {ICONS[a.kind]}
                <Text fw={700}>{accountLabel(a.kind)}</Text>
              </Group>
              <div>
                <Text size="xs" c="dimmed">
                  {a.netCents < 0 ? t('Went down by') : t('Went up by')}
                </Text>
                <Text
                  size="xl"
                  fw={700}
                  c={a.netCents < 0 ? 'red' : undefined}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatMoney(Math.abs(a.netCents))}
                </Text>
                <Text size="xs" c="dimmed">
                  {`${t('In')} ${formatMoney(a.inCents)} · ${t('Out')} ${formatMoney(a.outCents)}`}
                </Text>
              </div>
              {a.lines.length === 0 ? (
                <Text size="sm" c="dimmed">
                  {t('Nothing moved in this period.')}
                </Text>
              ) : (
                <Stack gap={4}>
                  {a.lines.map((l) => (
                    <Group key={l.code} justify="space-between" wrap="nowrap" gap="md">
                      <Text size="sm">{cashFlowLabel(l.code)}</Text>
                      <Text
                        size="sm"
                        c={l.inCents > 0 ? 'green' : 'red'}
                        style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                      >
                        {l.inCents > 0
                          ? `+ ${formatMoney(l.inCents)}`
                          : `− ${formatMoney(l.outCents)}`}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
      <Text size="xs" c="dimmed">
        {t(
          'Card and online sales stay in their own accounts. When the money reaches the bank, record it as income into the bank.'
        )}
      </Text>
    </Stack>
  );
};
