import { t } from '@/shared/i18n/t';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';
import { DrawerCard } from '@/shared/components/drawer';
import type { CreditNote } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { sumCreditNoteItemsCount } from '@/shared/calculations';
import { formatDateTime } from '@/shared/lib/date';
import { getCreditNoteStatusMeta } from '../lib/invoiceStatus';

export interface InvoiceCreditNotesCardProps {
  creditNotes: CreditNote[];
  /** Every unit on the invoice has been returned, so there is nothing left to return. */
  isFullyReturned: boolean;
  onPreview: (creditNote: CreditNote) => void;
  onProcessReturn: () => void;
}

/**
 * Returns and refunds against this invoice. It stays on view above the tabs on purpose: a
 * return must never be tucked away where a cashier would not think to look.
 */
export const InvoiceCreditNotesCard = ({
  creditNotes,
  isFullyReturned,
  onPreview,
  onProcessReturn,
}: InvoiceCreditNotesCardProps) => (
  <DrawerCard
    label={t('Credit Notes')}
    icon={<IconArrowBackUp size={14} />}
    action={
      creditNotes.length > 0 ? (
        <Text size="xs" c="orange" fw={700}>
          {sumCreditNoteItemsCount(creditNotes)} {t('items returned')}
        </Text>
      ) : undefined
    }
  >
    <Stack gap="sm">
      {creditNotes.length === 0 ? (
        <Text size="xs" c="dimmed">
          {t('No credit notes have been issued against this invoice yet.')}
        </Text>
      ) : (
        <Stack gap={0}>
          {creditNotes.map((cn, index) => {
            const statusMeta = getCreditNoteStatusMeta(cn.status);
            return (
              <Box
                key={cn.id}
                py="xs"
                style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
              >
                <Group justify="space-between" wrap="nowrap" gap="xs">
                  <Text size="sm" fw={800} c="orange">
                    {cn.netRefundCents >= 0 ? t('Refund') : t('Charged')}:{' '}
                    {formatMoney(Math.abs(cn.netRefundCents))}
                  </Text>
                  <Text size="xs" fw={700} c={statusMeta.color} style={{ whiteSpace: 'nowrap' }}>
                    {statusMeta.label}
                    {cn.exchangeReference ? ` · ${t('Exchange')}` : ''}
                    {cn.noReceipt ? ` · ${t('No Receipt')}` : ''}
                  </Text>
                </Group>
                <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                  <Text size="xs" c="dimmed">
                    {formatDateTime(cn.createdAt)} · {cn.creditNoteNumber} · {cn.items.length}{' '}
                    {t('line(s)')}
                  </Text>
                  <Button size="compact-xs" variant="light" onClick={() => onPreview(cn)}>
                    {t('View / Print')}
                  </Button>
                </Group>
                {cn.notes && (
                  <Text size="xs" c="dimmed" mt={2} fs="italic">
                    “{cn.notes}”
                  </Text>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      {isFullyReturned ? (
        <Text size="xs" c="dimmed" ta="center">
          {t('All items on this invoice have already been returned.')}
        </Text>
      ) : (
        <Button
          variant="light"
          color="orange"
          leftSection={<IconArrowBackUp size={16} />}
          onClick={onProcessReturn}
        >
          {t('Process Return / Exchange')}
        </Button>
      )}
    </Stack>
  </DrawerCard>
);
