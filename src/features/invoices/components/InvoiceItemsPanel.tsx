import { Fragment } from 'react';
import { t } from '@/shared/i18n/t';
import { Divider, Group, Paper, ScrollArea, Stack, Table, Text } from '@mantine/core';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { calcItemReturnedUnits, isItemFullyReturned } from '@/shared/calculations';
import { ClaimLauncher, useWarranties, validUntil, WarrantyStateDot } from '@/features/warranties';
import type { Warranty } from '@/features/warranties';

const TABULAR = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;

/** Which unit a warranty is for (its serial number, or how many units), then how long it lasts. */
const warrantyLabel = (warranty: Warranty): string => {
  if (warranty.serialNumber !== undefined) {
    return `${warranty.serialNumber} · ${validUntil(warranty)}`;
  }
  if (warranty.quantity > 1) {
    return `${warranty.quantity} ${t('units covered')} · ${validUntil(warranty)}`;
  }
  return validUntil(warranty);
};

/** What was sold, with anything returned marked in plain words, and the totals that make up the bill. */
export const InvoiceItemsPanel = ({
  invoice,
  onNestedWindowChange,
}: {
  invoice: Invoice;
  /** A claim window is open over the drawer, so the drawer must not close on Escape. */
  onNestedWindowChange: (open: boolean) => void;
}) => {
  const { data: warranties } = useWarranties({ invoiceKey: invoice.id });
  const warrantiesByLine = new Map<number, Warranty[]>();
  for (const warranty of warranties?.items ?? []) {
    const line = warrantiesByLine.get(warranty.lineIndex) ?? [];
    line.push(warranty);
    warrantiesByLine.set(warranty.lineIndex, line);
  }
  return (
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
            {invoice.items.map((item, lineIndex) => {
              const lineWarranties = warrantiesByLine.get(lineIndex);
              const alreadyReturned = calcItemReturnedUnits(item);
              const itemFullyReturned = isItemFullyReturned(item);
              return (
                <Fragment key={item.id}>
                  <Table.Tr
                    style={lineWarranties === undefined ? undefined : { borderBottom: 'none' }}
                  >
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
                      {lineWarranties === undefined && (
                        <Text size="3xs" c="dimmed" mt={4}>
                          {t('No warranty')}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                    <Table.Td style={TABULAR}>{formatMoney(item.unitPriceCents)}</Table.Td>
                    <Table.Td style={{ fontWeight: 700, ...TABULAR }}>
                      {formatMoney(item.totalCents)}
                    </Table.Td>
                  </Table.Tr>
                  {lineWarranties !== undefined && (
                    <Table.Tr>
                      <Table.Td colSpan={4} pt={0}>
                        <Stack gap={6}>
                          {lineWarranties.map((warranty) => (
                            <Group key={warranty.key} justify="space-between" gap="xs" wrap="wrap">
                              <Group gap={6} wrap="nowrap">
                                <WarrantyStateDot state={warranty.state} size="xs" />
                                <Text size="3xs" c="dimmed">
                                  {warrantyLabel(warranty)}
                                </Text>
                              </Group>
                              <ClaimLauncher
                                warranty={warranty}
                                compact
                                onNestedWindowChange={onNestedWindowChange}
                              />
                            </Group>
                          ))}
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Fragment>
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
};
