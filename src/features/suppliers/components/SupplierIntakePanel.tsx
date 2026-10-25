import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Button, Center, Group, ScrollArea, Skeleton, Stack, Text } from '@mantine/core';
import { IconCoin, IconPlus, IconReceipt, IconReceiptRefund } from '@tabler/icons-react';
import { IconAction, ListRow } from '@/shared/components/drawer';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';
import { RecordCreditModal } from '@/features/purchases/components/RecordCreditModal';
import { receiptLabel } from '@/features/purchases/lib/settlement';
import { receiptStatusLook } from '@/features/purchases/lib/receiptView';
import type { PurchaseReceipt } from '@/features/purchases/types';
import type { Supplier } from '../types';

export interface SupplierIntakePanelProps {
  supplier: Supplier;
  receipts: PurchaseReceipt[];
  loading: boolean;
  /** Opens the window that pays this supplier. */
  onPay: () => void;
}

/** What one bill is made of, for the small line under its number. */
const productsOf = (receipt: PurchaseReceipt): string =>
  receipt.lines.map((line) => `${line.product.name} ×${line.quantity}`).join(' · ');

/** Every bill from this supplier with what is still owed on it, and the ways to add to it. */
export const SupplierIntakePanel = ({
  supplier,
  receipts,
  loading,
  onPay,
}: SupplierIntakePanelProps) => {
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={700}>
          {t('Bills from this supplier')}
        </Text>
        <Group gap={6} wrap="nowrap">
          <IconAction
            kind="neutral"
            label={t('Pay this supplier')}
            icon={<IconCoin size={16} />}
            onClick={onPay}
          />
          <IconAction
            kind="neutral"
            label={t('Record credit from this supplier')}
            icon={<IconReceiptRefund size={16} />}
            onClick={() => setCreditOpen(true)}
          />
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() => setReceiveOpen(true)}
          >
            {t('Receive stock')}
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Stack gap={6}>
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Stack>
      ) : receipts.length === 0 ? (
        <Center py="md">
          <Stack gap={8} align="center">
            <IconReceipt size={24} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t('No stock received from this supplier yet.')}
            </Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea.Autosize
          mah="45dvh"
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          {receipts.map((receipt, index) => {
            const look = receiptStatusLook(receipt.status);
            return (
              <ListRow
                key={receipt.key}
                index={index}
                first={index === 0}
                icon={<IconReceipt size={20} style={{ color: 'var(--mantine-color-teal-6)' }} />}
                title={receiptLabel(receipt)}
                meta={
                  <>
                    <div>
                      {formatDate(receipt.date)} · {receipt.receiptNumber}
                    </div>
                    <div>{productsOf(receipt)}</div>
                    {receipt.extraChargesCents !== 0 ? (
                      <div>
                        {t('Extra charges on the bill:')} {formatMoney(receipt.extraChargesCents)}
                      </div>
                    ) : null}
                    {receipt.paidToOthersCents !== 0 ? (
                      <div>
                        {t('Paid to others (courier, agent):')}{' '}
                        {formatMoney(receipt.paidToOthersCents)}
                      </div>
                    ) : null}
                    {receipt.creditedCents > 0 ? (
                      <div>
                        {t('Credit from supplier:')} {formatMoney(receipt.creditedCents)}
                      </div>
                    ) : null}
                  </>
                }
                trailing={
                  <>
                    <Text size="sm" fw={800}>
                      {formatMoney(receipt.totalCents)}
                    </Text>
                    <Group gap={6} justify="flex-end" wrap="nowrap">
                      <span
                        aria-hidden
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: `var(--mantine-color-${look.color}-6)`,
                        }}
                      />
                      <Text size="xs" fw={700}>
                        {look.label}
                      </Text>
                    </Group>
                    {receipt.dueCents > 0 ? (
                      <Text size="xs" c="dimmed">
                        {t('Owed')} {formatMoney(receipt.dueCents)}
                      </Text>
                    ) : null}
                  </>
                }
              />
            );
          })}
        </ScrollArea.Autosize>
      )}

      <ReceiveStockModal
        opened={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        initialSupplierKey={supplier.key}
      />
      <RecordCreditModal
        opened={creditOpen}
        onClose={() => setCreditOpen(false)}
        supplierKey={supplier.key}
        supplierName={supplier.name}
      />
    </Stack>
  );
};
