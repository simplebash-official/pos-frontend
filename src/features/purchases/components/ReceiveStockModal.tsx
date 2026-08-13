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
    }
  }, [opened, initialProductKey, initialSupplierKey]);

  const selectedProduct = products?.find((p) => p.key === productKey);
  const selectedSupplier = suppliers?.find((s) => s.key === supplierKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productKey || !supplierKey || !quantity || !unitCost || !date) return;

    createPurchase(
      {
        productKey,
        supplierKey,
        quantity: Number(quantity),
        unitCostCents: toCents(Number(unitCost)),
        date: date.toISOString(),
        referenceNo,
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
            Receive Stock
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
                  Product
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
                    Select Product
                  </Button>
                )}
              </Stack>
            )}

            {/* Supplier Selection */}
            {!initialSupplierKey && (
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Supplier
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
                    Select Supplier
                  </Button>
                )}
              </Stack>
            )}

            <Group grow>
              <NumberInput
                label="Quantity Received"
                placeholder="0"
                min={1}
                value={quantity}
                onChange={setQuantity}
                required
              />
              <NumberInput
                label="Unit Cost (Rs.)"
                placeholder="0.00"
                decimalScale={2}
                min={0}
                value={unitCost}
                onChange={setUnitCost}
                required
              />
            </Group>

            <Group grow>
              <DateInput
                label="Date Received"
                value={date}
                onChange={(val) => setDate(val as Date | null)}
                required
              />
              <TextInput
                label="Reference / Invoice No."
                placeholder="INV-1234"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending} disabled={!productKey || !supplierKey}>
                Receive Stock
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
