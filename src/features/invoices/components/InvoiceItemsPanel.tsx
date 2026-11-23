import type { ReactNode } from 'react';
import { useState } from 'react';
import { t } from '@/shared/i18n/t';
import {
  Badge,
  Box,
  Checkbox,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconShieldCheck, IconShieldOff, IconShieldX } from '@tabler/icons-react';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { calcItemReturnedUnits, isItemFullyReturned } from '@/shared/calculations';
import {
  BatchClaimBar,
  canStartClaim,
  ClaimLauncher,
  stateLook,
  useWarranties,
  warrantyChipLabel,
} from '@/features/warranties';
import type { Warranty } from '@/features/warranties';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';

const TABULAR = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;
const ROW_DIVIDER = '1px solid var(--mantine-color-default-border)';

/** Which unit a warranty is for (its serial number, or how many units), or `null` when it covers one plain unit. */
const unitLabel = (warranty: Warranty): string | null => {
  if (warranty.serialNumber !== undefined) return warranty.serialNumber;
  if (warranty.quantity > 1) return `${warranty.quantity} ${t('units covered')}`;
  return null;
};

/** How long a warranty lasts (or that it was cancelled), coloured by where it stands. */
const WarrantyChip = ({ warranty }: { warranty: Warranty }) => {
  const Icon =
    warranty.state === 'void'
      ? IconShieldOff
      : warranty.state === 'expired'
        ? IconShieldX
        : IconShieldCheck;
  return (
    <Badge
      variant="light"
      color={stateLook(warranty.state).color}
      size="md"
      leftSection={<Icon size={12} />}
      style={{ textTransform: 'none', flexShrink: 0 }}
    >
      {warrantyChipLabel(warranty)}
    </Badge>
  );
};

/** Width of the tick box, so a row without one still lines up with the rows that have it. */
const checkboxWidth = (isMobile: boolean) => (isMobile ? 24 : 20);

/** One row of the card: tick column, what it is, and the right-hand side (amounts, buttons). */
const Row = ({
  select,
  selected = false,
  dimmed = false,
  indent = false,
  children,
  amounts,
  actions,
}: {
  /** The tick box or its spacer; `null` when the card has no tick column. */
  select: ReactNode;
  selected?: boolean;
  dimmed?: boolean;
  indent?: boolean;
  children: ReactNode;
  amounts?: ReactNode;
  actions?: ReactNode;
}) => {
  const isMobile = useIsMobile();
  return (
    <Group
      gap="sm"
      // Wraps when the right side does not fit (a phone, or an open-claim link beside the buttons),
      // so the name and the warranty chip always keep their room.
      wrap="wrap"
      align="center"
      px="sm"
      py="sm"
      pl={indent ? 'xl' : undefined}
      style={{
        borderTop: ROW_DIVIDER,
        opacity: dimmed ? 0.65 : undefined,
        background: selected
          ? 'color-mix(in srgb, var(--mantine-primary-color-filled) 7%, transparent)'
          : undefined,
      }}
    >
      <Group
        gap="sm"
        wrap="nowrap"
        align="center"
        style={{ flex: isMobile ? '1 1 100%' : '1 1 18rem', minWidth: 0 }}
      >
        {select}
        <Box style={{ minWidth: 0, flex: 1 }}>{children}</Box>
      </Group>
      {amounts !== undefined && <Box style={{ flexShrink: 0 }}>{amounts}</Box>}
      {actions !== undefined && (
        <Box style={{ marginLeft: 'auto', maxWidth: '100%' }}>{actions}</Box>
      )}
    </Group>
  );
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

  /** The tick box of a claimable warranty, a spacer for any other row, nothing without a tick column. */
  const selectCell = (warranty: Warranty | null): ReactNode => {
    if (!showSelection) return null;
    if (warranty === null || !canRecord || !canStartClaim(warranty)) {
      return <Box w={checkboxWidth(isMobile)} style={{ flexShrink: 0 }} />;
    }
    return (
      <Checkbox
        size={isMobile ? 'md' : 'sm'}
        checked={selected.has(warranty.key)}
        onChange={(event) => toggle(warranty.key, event.currentTarget.checked)}
        aria-label={`${t('Select')} ${warranty.itemName} ${warranty.warrantyNumber}`}
      />
    );
  };
  const launcher = (warranty: Warranty) => (
    <ClaimLauncher
      warranty={warranty}
      compact
      slimLater
      onNestedWindowChange={onNestedWindowChange}
    />
  );

  return (
    <Stack gap="md">
      <Paper
        withBorder
        radius="md"
        p={0}
        style={{ overflow: 'hidden', background: 'var(--bg-card)' }}
      >
        {showSelection && (
          <BatchClaimBar
            embedded
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
          mah="50dvh"
          classNames={{ viewport: 'scrollarea-fluid-content' }}
          style={{ marginTop: -1 }}
        >
          {invoice.items.map((item, lineIndex) => {
            const lineWarranties = warrantiesByLine.get(lineIndex);
            // A replaced warranty leaves a cancelled one on the same line: the one still running is
            // the line's warranty, and the cancelled ones are only history beside it.
            const live = lineWarranties?.filter((w) => w.state !== 'void') ?? [];
            const single =
              live.length === 1 ? live[0] : lineWarranties?.length === 1 ? lineWarranties[0] : null;
            const history =
              single === null ? [] : (lineWarranties ?? []).filter((w) => w !== single);
            const alreadyReturned = calcItemReturnedUnits(item);
            const itemFullyReturned = isItemFullyReturned(item);
            const name = (
              <>
                <Text size="sm" fw={600} c={single?.state === 'void' ? 'dimmed' : undefined}>
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
              </>
            );
            const amounts = (
              <Box style={{ textAlign: isMobile ? 'left' : 'right', ...TABULAR }}>
                <Text size="xs" c="dimmed" inherit>
                  {item.quantity} x {formatMoney(item.unitPriceCents)}
                </Text>
                <Text size="md" fw={700} inherit>
                  {formatMoney(item.totalCents)}
                </Text>
              </Box>
            );
            const unit = single === null ? null : unitLabel(single);
            return (
              <Box key={item.id}>
                <Row
                  select={selectCell(single)}
                  selected={single !== null && selected.has(single.key)}
                  dimmed={single?.state === 'void'}
                  amounts={amounts}
                  actions={single === null ? undefined : launcher(single)}
                >
                  {name}
                  {lineWarranties === undefined && (
                    <Badge
                      variant="light"
                      color="violet"
                      size="md"
                      mt={6}
                      style={{ textTransform: 'none' }}
                    >
                      {t('No warranty')}
                    </Badge>
                  )}
                  {single !== null && (
                    <Group gap="xs" mt={6} wrap="wrap" align="center">
                      <WarrantyChip warranty={single} />
                      {history.map((past) => (
                        <WarrantyChip key={past.key} warranty={past} />
                      ))}
                      {unit !== null && (
                        <Text size="3xs" c="dimmed" truncate title={unit}>
                          {unit}
                        </Text>
                      )}
                    </Group>
                  )}
                </Row>
                {lineWarranties !== undefined &&
                  single === null &&
                  lineWarranties.map((warranty) => {
                    const unitText = unitLabel(warranty);
                    return (
                      <Row
                        key={warranty.key}
                        indent
                        select={selectCell(warranty)}
                        selected={selected.has(warranty.key)}
                        dimmed={warranty.state === 'void'}
                        actions={launcher(warranty)}
                      >
                        <Group gap="xs" wrap="wrap" align="center">
                          {unitText !== null && (
                            <Text size="xs" fw={600} truncate title={unitText}>
                              {unitText}
                            </Text>
                          )}
                          <WarrantyChip warranty={warranty} />
                        </Group>
                      </Row>
                    );
                  })}
              </Box>
            );
          })}
        </ScrollArea.Autosize>
      </Paper>

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
