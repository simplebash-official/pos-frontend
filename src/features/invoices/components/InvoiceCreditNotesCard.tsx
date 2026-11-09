import { t } from '@/shared/i18n/t';
import { Badge, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconArrowBackUp,
  IconBan,
  IconCircleCheck,
  IconClipboardSearch,
  IconPrinter,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { PERMISSIONS } from '@/constants/permissions';
import { DrawerCard } from '@/shared/components/drawer';
import type { CreditNote, CreditNoteStatus } from '@/features/billing/types';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { sumCreditNoteItemsCount } from '@/shared/calculations';
import { formatDateTime } from '@/shared/lib/date';
import { creditNoteLines } from '../lib/creditNoteView';
import {
  CREDIT_NOTE_FLAG_META,
  getCreditNoteStatusMeta,
  getItemConditionMeta,
  getItemDispositionMeta,
} from '../lib/invoiceStatus';

export interface InvoiceCreditNotesCardProps {
  creditNotes: CreditNote[];
  /** Every unit on the invoice has been returned, so there is nothing left to return. */
  isFullyReturned: boolean;
  onPreview: (creditNote: CreditNote) => void;
  /** Opens the inspection window for a credit note that is waiting for it. */
  onResolve: (creditNote: CreditNote) => void;
  onProcessReturn: () => void;
}

const STATUS_ICON: Record<CreditNoteStatus, ReactNode> = {
  resolved: <IconCircleCheck size={20} />,
  awaiting_resolution: <IconClipboardSearch size={20} />,
  voided: <IconBan size={20} />,
};

/**
 * Returns and refunds against this invoice. It stays on view above the tabs on purpose: a
 * return must never be tucked away where a cashier would not think to look. A note whose units
 * are still waiting for inspection says so loudly and carries the button that finishes it.
 */
export const InvoiceCreditNotesCard = ({
  creditNotes,
  isFullyReturned,
  onPreview,
  onResolve,
  onProcessReturn,
}: InvoiceCreditNotesCardProps) => {
  const isMobile = useIsMobile();
  const canResolve = useHasPermission(PERMISSIONS.BILLING_WRITE);
  const touch = isMobile ? 44 : undefined;

  return (
    <DrawerCard
      label={t('Credit Notes')}
      icon={<IconArrowBackUp size={14} />}
      action={
        creditNotes.length > 0 ? (
          <Badge variant="light" color="orange" size="md">
            {sumCreditNoteItemsCount(creditNotes)} {t('items returned')}
          </Badge>
        ) : undefined
      }
    >
      <Stack gap="sm">
        {creditNotes.length === 0 ? (
          <Text size="xs" c="dimmed">
            {t('No credit notes have been issued against this invoice yet.')}
          </Text>
        ) : (
          creditNotes.map((cn) => {
            const status = getCreditNoteStatusMeta(cn.status);
            const waiting = cn.status === 'awaiting_resolution';
            return (
              <Paper
                key={cn.id}
                p="sm"
                radius="md"
                bg={`var(--mantine-color-${status.color}-light)`}
                style={{ border: `1px solid var(--mantine-color-${status.color}-light-hover)` }}
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
                    <Group gap="sm" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
                      <ThemeIcon size={40} radius="xl" variant="light" color={status.color}>
                        {STATUS_ICON[cn.status]}
                      </ThemeIcon>
                      <Stack gap={2} style={{ minWidth: 0 }}>
                        <Group gap={6}>
                          <Text size="sm" fw={800} ff="monospace">
                            {cn.creditNoteNumber}
                          </Text>
                          <Badge
                            size="sm"
                            variant="dot"
                            color={status.color}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {t(status.label)}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {formatDateTime(cn.createdAt)}
                          {cn.cashierName === undefined ? '' : ` · ${cn.cashierName}`}
                        </Text>
                      </Stack>
                    </Group>
                    <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
                      <Text size="10px" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
                        {cn.netRefundCents >= 0 ? t('Refunded') : t('Charged')}
                      </Text>
                      <Text size="lg" fw={800} c={cn.status === 'voided' ? 'dimmed' : 'orange'}>
                        {formatMoney(Math.abs(cn.netRefundCents))}
                      </Text>
                    </Stack>
                  </Group>

                  {(cn.exchangeReference !== undefined || cn.noReceipt || cn.isManagerOverride) && (
                    <Group gap={6}>
                      {cn.exchangeReference !== undefined && (
                        <Badge
                          size="xs"
                          variant="light"
                          color={CREDIT_NOTE_FLAG_META.exchange.color}
                        >
                          {t(CREDIT_NOTE_FLAG_META.exchange.label)}
                        </Badge>
                      )}
                      {cn.noReceipt && (
                        <Badge
                          size="xs"
                          variant="light"
                          color={CREDIT_NOTE_FLAG_META.noReceipt.color}
                        >
                          {t(CREDIT_NOTE_FLAG_META.noReceipt.label)}
                        </Badge>
                      )}
                      {cn.isManagerOverride && (
                        <Badge
                          size="xs"
                          variant="light"
                          color={CREDIT_NOTE_FLAG_META.managerOverride.color}
                        >
                          {t(CREDIT_NOTE_FLAG_META.managerOverride.label)}
                        </Badge>
                      )}
                    </Group>
                  )}

                  <Stack gap={6}>
                    {creditNoteLines(cn).map(({ item, condition, disposition }, index) => (
                      <Group key={index} justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="xs" fw={600} lineClamp={1} style={{ minWidth: 0 }}>
                          {item.name} × {item.quantity}
                        </Text>
                        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                          <Badge
                            size="xs"
                            variant="light"
                            color={getItemConditionMeta(condition).color}
                          >
                            {t(getItemConditionMeta(condition).label)}
                          </Badge>
                          {disposition !== undefined && (
                            <Badge
                              size="xs"
                              variant="outline"
                              color={getItemDispositionMeta(disposition).color}
                            >
                              {t(getItemDispositionMeta(disposition).label)}
                            </Badge>
                          )}
                        </Group>
                      </Group>
                    ))}
                  </Stack>

                  {waiting && (
                    <Paper p="xs" radius="sm" bg="var(--bg-card)">
                      <Text size="xs" fw={600}>
                        {t('Returned units are waiting for inspection.')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('Decide what happens to them. Stock does not change until you do.')}
                      </Text>
                    </Paper>
                  )}

                  {cn.resolution !== undefined && (
                    <Text size="xs" c="dimmed">
                      {t('Inspected by')} {cn.resolution.resolvedByName} ·{' '}
                      {formatDateTime(cn.resolution.resolvedAt)}
                    </Text>
                  )}

                  {cn.notes && (
                    <Text size="xs" c="dimmed" fs="italic">
                      “{cn.notes}”
                    </Text>
                  )}

                  <Group gap="xs" grow={isMobile}>
                    {waiting && canResolve && (
                      <Button
                        size="xs"
                        mih={touch}
                        leftSection={<IconClipboardSearch size={16} />}
                        onClick={() => onResolve(cn)}
                      >
                        {t('Inspect and resolve')}
                      </Button>
                    )}
                    <Button
                      size="xs"
                      mih={touch}
                      variant="light"
                      color="gray"
                      leftSection={<IconPrinter size={16} />}
                      onClick={() => onPreview(cn)}
                    >
                      {t('View / Print')}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            );
          })
        )}

        {isFullyReturned ? (
          <Group gap={6} justify="center">
            <IconCircleCheck size={16} color="var(--mantine-color-green-filled)" />
            <Text size="xs" c="dimmed">
              {t('All items on this invoice have already been returned.')}
            </Text>
          </Group>
        ) : (
          <Button
            variant="light"
            color="orange"
            mih={touch}
            leftSection={<IconArrowBackUp size={16} />}
            onClick={onProcessReturn}
          >
            {t('Process Return / Exchange')}
          </Button>
        )}
      </Stack>
    </DrawerCard>
  );
};
