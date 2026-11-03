import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Modal, Stack, Text, Radio, Button, Group, Loader, Center } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useProductSerials } from '../hooks/useProductSerials';
import { useProductBatches } from '../hooks/useProducts';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { WarrantyChip } from '@/features/warranties/components/WarrantyChip';
import { endsOnIfStartedToday } from '@/features/warranties/lib/warrantyView';
import type { ProductWarranty } from '@/features/warranties/types';

export interface SerialNumberPickerModalProps {
  opened: boolean;
  onClose: () => void;
  productName: string;
  productKey: string;
  /** The product's warranty, shown so the cashier can tell the customer before the sale. */
  warranty: ProductWarranty | null;
  /** Serials already picked for this product elsewhere in the current sale, hidden from the list. */
  excludeSerialNumbers?: string[];
  /** The chosen unit and the price it sells at (its delivery's selling price). */
  onSelect: (serialNumber: string, sellingPriceCents: number) => void;
}

/**
 * Lets the cashier pick which in-stock unit of a serial-tracked product is
 * being sold. Each unit shows its price — the selling price of the delivery
 * (stock batch) it came in.
 */
export const SerialNumberPickerModal = ({
  opened,
  onClose,
  productName,
  productKey,
  warranty,
  excludeSerialNumbers,
  onSelect,
}: SerialNumberPickerModalProps) => {
  const warrantyEnds = warranty === null ? null : endsOnIfStartedToday(warranty.coverage);
  const isMobile = useIsMobile();
  const [chosen, setChosen] = useState<string | null>(null);
  const { data: serials, isLoading } = useProductSerials(productKey, 'in_stock', {
    enabled: opened,
  });

  const { data: batches, isLoading: batchesLoading } = useProductBatches(productKey, {
    enabled: opened,
  });
  const priceByBatch = new Map((batches ?? []).map((b) => [b.key, b.sellingPriceCents]));

  const excluded = new Set(excludeSerialNumbers ?? []);
  const available = (serials ?? []).filter(
    (s) => !excluded.has(s.serialNumber) && priceByBatch.has(s.batchKey)
  );

  const handleConfirm = () => {
    const serial = available.find((s) => s.serialNumber === chosen);
    if (!serial) return;
    onSelect(serial.serialNumber, priceByBatch.get(serial.batchKey) as number);
    setChosen(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Which')} {productName} {t('unit?')}
        </Text>
      }
      size="sm"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('This item is tracked by serial number. Pick which one is being sold.')}
        </Text>
        {warranty !== null && (
          <Group gap="xs" wrap="wrap">
            <WarrantyChip coverage={warranty.coverage} />
            <Text size="xs" c="dimmed">
              {warrantyEnds !== null
                ? `${t('If sold today, covered until')} ${formatDate(warrantyEnds)}`
                : warranty.coverage.kind === 'lifetime'
                  ? t('Covered for life')
                  : t('This item has no warranty')}
            </Text>
          </Group>
        )}

        {isLoading || batchesLoading ? (
          <Center py="md">
            <Loader size="sm" />
          </Center>
        ) : available.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('No in-stock units are available to sell right now.')}
          </Text>
        ) : (
          <Radio.Group value={chosen} onChange={setChosen}>
            <Stack gap="xs">
              {available.map((serial) => (
                <Radio
                  key={serial.key}
                  value={serial.serialNumber}
                  label={serial.serialNumber}
                  description={formatMoney(priceByBatch.get(serial.batchKey) as number)}
                  size="md"
                  styles={{
                    label: { paddingLeft: 8, minHeight: 44, display: 'flex', alignItems: 'center' },
                  }}
                />
              ))}
            </Stack>
          </Radio.Group>
        )}

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button color="blue" disabled={!chosen} onClick={handleConfirm}>
            {t('Add to Sale')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
