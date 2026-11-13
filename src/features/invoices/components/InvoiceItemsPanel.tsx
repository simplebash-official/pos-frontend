import { Fragment, useState } from 'react';
import { t } from '@/shared/i18n/t';
import {
  Box,
  Checkbox,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { calcItemReturnedUnits, isItemFullyReturned } from '@/shared/calculations';
import {
  BatchClaimBar,
  canStartClaim,
  ClaimLauncher,
  useWarranties,
  validUntil,
  WarrantyStateDot,
} from '@/features/warranties';
import type { Warranty } from '@/features/warranties';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';

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

/** The warranty's state, and under it which unit it is for and how long it lasts. */
const WarrantyRowInfo = ({ warranty }: { warranty: Warranty }) => (
  <Stack gap={0} style={{ minWidth: 0 }}>
    <WarrantyStateDot state={warranty.state} size="xs" />
    <Text size="3xs" c="dimmed" lineClamp={2} title={warrantyLabel(warranty)}>
      {warrantyLabel(warranty)}
    </Text>
  </Stack>
);

/** Width of the tick box, so a row without one still lines up with the rows that have it. */
const checkboxWidth = (isMobile: boolean) => (isMobile ? 24 : 20);

/** What was sold, with anything returned marked in plain words, and the totals that make up the bill. */
export const InvoiceItemsPanel = ({
  invoice,
  onNestedWindowChange,
}: {
  invoice: Invoice;
  /** A claim window is open over the drawer, so the drawer must not close on Escape. */
  onNestedWindowChange: (open: boolean) => void;
}) => {
  const isMobile = useIsMobile();
  const canRecord = useHasPermission(PERMISSIONS.WARRANTY_CLAIMS_RECORD);
  const { data: warranties } = useWarranties({ invoiceKey: invoice.id });
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [claimWindowOpen, setClaimWindowOpen] = useState(false);
  const warrantiesByLine = new Map<number, Warranty[]>();
  for (const warranty of warranties?.items ?? []) {
    const line = warrantiesByLine.get(warranty.lineIndex) ?? [];
    line.push(warranty);
    warrantiesByLine.set(warranty.lineIndex, line);
  }
  const claimable = canRecord
    ? (warranties?.items ?? [])
        .filter(canStartClaim)
        .sort((first, second) => first.lineIndex - second.lineIndex)
    : [];
  // Picking several only helps with two or more; the bar also stays while its window is open,
  // because claiming some of them can leave fewer than two.
  const showSelection = claimable.length >= 2 || claimWindowOpen;
  const selected = new Set(claimable.filter((w) => ticked.has(w.key)).map((w) => w.key));
  const windowChanged = (open: boolean) => {
    setClaimWindowOpen(open);
    onNestedWindowChange(open);
  };
  const toggle = (key: string, on: boolean) =>
    setTicked((previous) => {
      const next = new Set(previous);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  return (
    <Stack gap="md">
      {showSelection && (
        <BatchClaimBar
          claimable={claimable}
          selected={selected}
          onSelectionChange={setTicked}
          onOpened={(keys) =>
            setTicked((previous) => new Set([...previous].filter((key) => !keys.includes(key))))
          }
          onNestedWindowChange={windowChanged}
        />
      )}
      <ScrollArea.Autosize
        mah="40dvh"
        offsetScrollbars
        classNames={{ viewport: 'scrollarea-fluid-content' }}
      >
        <Table highlightOnHover={false} horizontalSpacing={isMobile ? 6 : undefined}>
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
                          {lineWarranties.map((warranty) => {
                            const canTick = showSelection && canRecord && canStartClaim(warranty);
                            return (
                              <Group
                                key={warranty.key}
                                justify="space-between"
                                align="center"
                                gap="sm"
                                wrap={isMobile ? 'wrap' : 'nowrap'}
                                px={6}
                                py={6}
                                mx={-6}
                                style={{
                                  borderRadius: 'var(--mantine-radius-default)',
                                  background: selected.has(warranty.key)
                                    ? 'color-mix(in srgb, var(--mantine-primary-color-filled) 7%, transparent)'
                                    : undefined,
                                  minHeight: isMobile ? 44 : undefined,
                                }}
                              >
                                <Group
                                  gap="sm"
                                  wrap="nowrap"
                                  align="center"
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  {canTick && (
                                    <Checkbox
                                      size={isMobile ? 'md' : 'sm'}
                                      checked={selected.has(warranty.key)}
                                      onChange={(event) =>
                                        toggle(warranty.key, event.currentTarget.checked)
                                      }
                                      aria-label={`${t('Select')} ${warranty.itemName} ${warranty.warrantyNumber}`}
                                    />
                                  )}
                                  {showSelection && !canTick && (
                                    <Box w={checkboxWidth(isMobile)} style={{ flexShrink: 0 }} />
                                  )}
                                  <WarrantyRowInfo warranty={warranty} />
                                </Group>
                                <Box w={isMobile ? '100%' : undefined} style={{ flexShrink: 0 }}>
                                  <ClaimLauncher
                                    warranty={warranty}
                                    compact
                                    onNestedWindowChange={onNestedWindowChange}
                                  />
                                </Box>
                              </Group>
                            );
                          })}
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
