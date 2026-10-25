import { Anchor, Group, Paper, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle, IconCalendarDue, IconTruckDelivery } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import type { Payables } from '../types';

// What the shop still has to pay today: bills not paid in full (soonest due first) and what it owes
// suppliers. Not tied to the period picked above.
export const PayablesPanel = ({
  report,
  loading,
}: {
  report: Payables | undefined;
  loading: boolean;
}) => {
  if (loading || report === undefined) return <Skeleton h={320} />;
  return (
    <Stack gap="md">
      <MetricCardRow
        cards={[
          {
            key: 'total',
            label: 'Still to pay',
            value: formatMoney(report.totalCents),
            color: 'orange',
            icon: <IconCalendarDue size={20} />,
          },
          {
            key: 'overdue',
            label: 'Overdue bills',
            value: formatMoney(report.overdueCents),
            color: report.overdueCents > 0 ? 'red' : 'gray',
            icon: <IconAlertTriangle size={20} />,
          },
          {
            key: 'suppliers',
            label: 'Owed to suppliers',
            value: formatMoney(report.suppliersCents),
            color: 'blue',
            icon: <IconTruckDelivery size={20} />,
          },
        ]}
      />

      <Paper withBorder p="md" bg="var(--bg-card)">
        <Stack gap="sm">
          <Text fw={700}>{t('Bills to pay')}</Text>
          {report.bills.length === 0 ? (
            <EmptyState
              icon={<IconCalendarDue size={28} />}
              title={t('No unpaid bills.')}
              description={t('Bills you have not paid in full will be listed here.')}
              withBorder={false}
              p="md"
              py="sm"
            />
          ) : (
            <Table.ScrollContainer minWidth={460}>
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('Due')}</Table.Th>
                    <Table.Th>{t('What for')}</Table.Th>
                    <Table.Th>{t('Pay to')}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>{t('Still to pay')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {report.bills.map((b) => (
                    <Table.Tr key={b.key}>
                      <Table.Td>
                        <Text
                          size="sm"
                          c={b.isOverdue ? 'red' : undefined}
                          fw={b.isOverdue ? 600 : 400}
                        >
                          {b.dueDate === undefined
                            ? t('No due date')
                            : b.isOverdue
                              ? `${formatDate(b.dueDate)} · ${t('Overdue')}`
                              : formatDate(b.dueDate)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{b.categoryName}</Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {b.number}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {b.payeeName === undefined ? '' : b.payeeName}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(b.balanceCents)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
          <Anchor component={Link} to={ROUTES.EXPENSES} size="sm">
            {t('Pay or add bills on the Expenses page')}
          </Anchor>
        </Stack>
      </Paper>

      <Paper withBorder p="md" bg="var(--bg-card)">
        <Stack gap="sm">
          <Text fw={700}>{t('Owed to suppliers')}</Text>
          {report.suppliers.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('No supplier is owed money right now.')}
            </Text>
          ) : (
            report.suppliers.map((s) => (
              <Group key={s.supplierKey} justify="space-between" wrap="nowrap" gap="md">
                <Text size="sm">{s.name}</Text>
                <Text
                  size="sm"
                  style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                >
                  {formatMoney(s.balanceCents)}
                </Text>
              </Group>
            ))
          )}
          <Text size="xs" c="dimmed">
            {t(
              'A supplier you have set an opening balance for is listed by what you owe in total. Any other supplier is listed by the bills from them that are still unpaid.'
            )}
          </Text>
          <Anchor component={Link} to={ROUTES.BALANCES} size="sm">
            {t('Open Balances')}
          </Anchor>
        </Stack>
      </Paper>
    </Stack>
  );
};
