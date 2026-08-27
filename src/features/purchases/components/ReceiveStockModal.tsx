import { t } from '@/shared/i18n/t';
import { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Stack,
  Group,
  Text,
  ActionIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPackage, IconBuildingStore, IconX } from '@tabler/icons-react';
import { useCreatePurchase } from '../hooks/usePurchases';
import { SupplierPickerModal } from '@/features/suppliers/components/SupplierPickerModal';
import { ProductPickerModal } from '@/features/inventory/components/ProductPickerModal';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { toCents } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';

interface ReceiveStockModalProps {
  opened: boolean;
  onClose: () => void;
  initialProductKey?: string;
  initialSupplierKey?: string;
}

export const ReceiveStockModal = ({
  opened,
  onClose,
  initialProductKey,
  initialSupplierKey,
}: ReceiveStockModalProps) => {
  const [productKey, setProductKey] = useState<string | undefined>(initialProductKey);
  const [supplierKey, setSupplierKey] = useState<string | undefined>(initialSupplierKey);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unitCost, setUnitCost] = useState<number | string>(''); // in rupees
  const [date, setDate] = useState<Date | null>(new Date());
  const [referenceNo, setReferenceNo] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: products } = useAllProducts({ enabled: opened });
  const { data: suppliers } = useAllSuppliers({ enabled: opened });
  const { mutate: createPurchase, isPending } = useCreatePurchase();

  // Reset state when modal opens
  useEffect(() => {
    if (opened) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductKey(initialProductKey);
      setSupplierKey(initialSupplierKey);
      setQuantity(1);
      setUnitCost('');
      setDate(new Date());
      setReferenceNo('');
      setSerialNumbers([]);
    }
  }, [opened, initialProductKey, initialSupplierKey]);

  const selectedProduct = products?.find((p) => p.key === productKey);
  const selectedSupplier = suppliers?.find((s) => s.key === supplierKey);
  const needsSerials = Boolean(selectedProduct?.isSerialized);
  const serialUnitCount = Math.max(0, Number(quantity) || 0);

  // Keep the serial-number input list the same length as the quantity.
  useEffect(() => {
    if (!needsSerials) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (serialNumbers.length > 0) setSerialNumbers([]);
      return;
    }
    setSerialNumbers((prev) => {
      if (prev.length === serialUnitCount) return prev;
      const next = prev.slice(0, serialUnitCount);
      while (next.length < serialUnitCount) next.push('');
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSerials, serialUnitCount]);

  const hasBlankSerial = needsSerials && serialNumbers.some((s) => !s.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productKey || !supplierKey || !quantity || !unitCost || !date) return;
    if (hasBlankSerial) return;

    createPurchase(
      {
        productKey,
        supplierKey,
        quantity: Number(quantity),
        unitCostCents: toCents(Number(unitCost)),
        date: date.toISOString(),
        referenceNo,
        serialNumbers: needsSerials ? serialNumbers.map((s) => s.trim()) : undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Text fw={700} size="lg">
            {t('Receive Stock')}
          </Text>
        }
        size="md"
        centered
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* Product Selection */}
            {!initialProductKey && (
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  {t('Product')}
                </Text>
                {selectedProduct ? (
                  <Group
                    justify="space-between"
                    p="xs"
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--mantine-radius-default)',
                    }}
                  >
                    <Group>
                      <IconPackage size={16} />
                      <Text size="sm">{selectedProduct.name}</Text>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => setProductKey(undefined)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Button
                    variant="light"
                    leftSection={<IconPackage size={16} />}
                    onClick={() => setProductPickerOpen(true)}
                  >
                    {t('Select Product')}
                  </Button>
                )}
              </Stack>
            )}

            {/* Supplier Selection */}
            {!initialSupplierKey && (
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  {t('Supplier')}
                </Text>
                {selectedSupplier ? (
                  <Group
                    justify="space-between"
                    p="xs"
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--mantine-radius-default)',
                    }}
                  >
                    <Group>
                      <IconBuildingStore size={16} />
                      <Text size="sm">{selectedSupplier.name}</Text>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => setSupplierKey(undefined)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Button
                    variant="light"
                    leftSection={<IconBuildingStore size={16} />}
                    onClick={() => setSupplierPickerOpen(true)}
                  >
                    {t('Select Supplier')}
                  </Button>
                )}
              </Stack>
            )}

            <Group grow>
              <NumberInput
                label={t('Quantity Received')}
                placeholder="0"
                min={1}
                value={quantity}
                onChange={setQuantity}
                required
              />
              <NumberInput
                label={t('Unit Cost (Rs.)')}
                placeholder="0.00"
                decimalScale={2}
                min={0}
                value={unitCost}
                onChange={setUnitCost}
                required
              />
            </Group>

            {needsSerials && serialUnitCount > 0 && (
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  {t('Serial Numbers')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'This item is tracked by serial number. Enter the serial for each unit received.'
                  )}
                </Text>
                {Array.from({ length: serialUnitCount }).map((_, index) => (
                  <TextInput
                    key={index}
                    placeholder={`Serial number for unit ${index + 1} of ${serialUnitCount}`}
                    value={serialNumbers[index] ?? ''}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setSerialNumbers((prev) => {
                        const next = [...prev];
                        next[index] = value;
                        return next;
                      });
                    }}
                  />
                ))}
              </Stack>
            )}

            <Group grow>
              <DateInput
                label={t('Date Received')}
                value={date}
                onChange={(val) => setDate(val as Date | null)}
                required
              />
              <TextInput
                label={t('Reference / Invoice No.')}
                placeholder={t('INV-1234')}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={!productKey || !supplierKey || hasBlankSerial}
              >
                {t('Receive Stock')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ProductPickerModal
        opened={productPickerOpen}
        onClose={() => setProductPickerOpen(false)}
        onSelect={(key) => {
          setProductKey(key);
          setProductPickerOpen(false);
        }}
        excludeKeys={[]}
      />

      <SupplierPickerModal
        opened={supplierPickerOpen}
        onClose={() => setSupplierPickerOpen(false)}
        onSelect={(key) => {
          setSupplierKey(key);
          setSupplierPickerOpen(false);
        }}
        excludeKeys={[]}
      />
    </>
  );
};
