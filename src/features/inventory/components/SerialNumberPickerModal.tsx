import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Modal, Stack, Text, Radio, Button, Group, Loader, Center } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useProductSerials } from '../hooks/useProductSerials';

export interface SerialNumberPickerModalProps {
  opened: boolean;
  onClose: () => void;
  productName: string;
  productKey: string;
  /** Serials already picked for this product elsewhere in the current sale, hidden from the list. */
  excludeSerialNumbers?: string[];
  onSelect: (serialNumber: string) => void;
}

/** Lets the cashier pick which in-stock unit of a serial-tracked product is being sold. */
export const SerialNumberPickerModal = ({
  opened,
  onClose,
  productName,
  productKey,
  excludeSerialNumbers,
  onSelect,
}: SerialNumberPickerModalProps) => {
  const isMobile = useIsMobile();
  const [chosen, setChosen] = useState<string | null>(null);
  const { data: serials, isLoading } = useProductSerials(productKey, 'in_stock', {
    enabled: opened,
  });

  const excluded = new Set(excludeSerialNumbers ?? []);
  const available = (serials ?? []).filter((s) => !excluded.has(s.serialNumber));

  const handleConfirm = () => {
    if (!chosen) return;
    onSelect(chosen);
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

        {isLoading ? (
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
