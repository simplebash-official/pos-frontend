import { t } from '@/shared/i18n/t';
import { Divider, Group, Paper, ScrollArea, Stack, Table, Text } from '@mantine/core';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { calcItemReturnedUnits, isItemFullyReturned } from '@/shared/calculations';

const TABULAR = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;

/** What was sold, with anything returned marked in plain words, and the totals that make up the bill. */
export const InvoiceItemsPanel = ({ invoice }: { invoice: Invoice }) => (
  <Stack gap="md">
    <ScrollArea.Autosize
      mah="40dvh"
      offsetScrollbars
      classNames={{ viewport: 'scrollarea-fluid-content' }}
    >
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('Item')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{t('Qty')}</Table.Th>
            <Table.Th>{t('Price')}</Table.Th>
            <Table.Th>{t('Total')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {invoice.items.map((item) => {
            const alreadyReturned = calcItemReturnedUnits(item);
            const itemFullyReturned = isItemFullyReturned(item);
            return (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text size="xs" fw={600}>
                    {item.name}
                  </Text>
                  <Text size="3xs" c="dimmed" ff="monospace">
                    {item.sku ? `${t('SKU:')} ${item.sku}` : null}
                    {alreadyReturned > 0 ? (
                      <Text
                        span
                        inherit
                        fw={700}
                        c={itemFullyReturned ? 'dimmed' : 'orange'}
                        ff="inherit"
                      >
                        {item.sku ? ' · ' : ''}
                        {itemFullyReturned
                          ? t('Fully Returned')
                          : `${t('Returned:')} ${alreadyReturned}`}
                      </Text>
                    ) : null}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                <Table.Td style={TABULAR}>{formatMoney(item.unitPriceCents)}</Table.Td>
                <Table.Td style={{ fontWeight: 700, ...TABULAR }}>
                  {formatMoney(item.totalCents)}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>

    <Paper p="sm" bg="var(--bg-app)">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {t('Subtotal')}
          </Text>
          <Text size="xs" fw={600} style={TABULAR}>
            {formatMoney(invoice.subtotalCents)}
          </Text>
        </Group>

        {invoice.discountCents > 0 && (
          <Group justify="space-between">
            <Text size="xs" c="red">
              {t('Discount')}
            </Text>
            <Text size="xs" fw={600} c="red" style={TABULAR}>
              -{formatMoney(invoice.discountCents)}
            </Text>
          </Group>
        )}

        <Divider my={4} />

        <Group justify="space-between">
          <Text size="sm" fw={700}>
            {t('Grand Total')}
          </Text>
          <Text size="md" fw={800} c="blue" style={TABULAR}>
            {formatMoney(invoice.totalCents)}
          </Text>
        </Group>
      </Stack>
    </Paper>
  </Stack>
);
