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
import { SupplierPickerModal } from '@/shared/components/SupplierPickerModal';
import { ProductPickerModal } from '@/shared/components/ProductPickerModal';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { fetchSuppliers } from '@/features/suppliers/api/mockSuppliers';

interface ReceiveStockModalProps {
  opened: boolean;
  onClose: () => void;
  initialProductId?: string;
  initialSupplierId?: string;
}

export const ReceiveStockModal = ({
  opened,
  onClose,
  initialProductId,
  initialSupplierId,
}: ReceiveStockModalProps) => {
  const [productId, setProductId] = useState<string | undefined>(initialProductId);
  const [supplierId, setSupplierId] = useState<string | undefined>(initialSupplierId);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unitCost, setUnitCost] = useState<number | string>(''); // in rupees
  const [date, setDate] = useState<Date | null>(new Date());
  const [referenceNo, setReferenceNo] = useState('');
  
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);

  const { data: products } = useQuery({ queryKey: queryKeys.inventory.all, queryFn: fetchProducts });
  const { data: suppliers } = useQuery({ queryKey: queryKeys.suppliers.all, queryFn: fetchSuppliers });
  const { mutate: createPurchase, isPending } = useCreatePurchase();

  // Reset state when modal opens
  useEffect(() => {
    if (opened) {
      setProductId(initialProductId);
      setSupplierId(initialSupplierId);
      setQuantity(1);
      setUnitCost('');
      setDate(new Date());
      setReferenceNo('');
    }
  }, [opened, initialProductId, initialSupplierId]);

  const selectedProduct = products?.find(p => p.id === productId);
  const selectedSupplier = suppliers?.find(s => s.id === supplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !supplierId || !quantity || !unitCost || !date) return;

    createPurchase(
      {
        productId,
        supplierId,
        quantity: Number(quantity),
        unitCostCents: Math.round(Number(unitCost) * 100),
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
        title={<Text fw={600}>Receive Stock</Text>}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {/* Product Selection */}
            {!initialProductId && (
              <Stack gap={4}>
                <Text size="sm" fw={500}>Product</Text>
                {selectedProduct ? (
                  <Group justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
                    <Group>
                      <IconPackage size={16} />
                      <Text size="sm">{selectedProduct.name}</Text>
                    </Group>
                    <ActionIcon variant="subtle" color="red" onClick={() => setProductId(undefined)}>
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Button variant="light" leftSection={<IconPackage size={16} />} onClick={() => setProductPickerOpen(true)}>
                    Select Product
                  </Button>
                )}
              </Stack>
            )}

            {/* Supplier Selection */}
            {!initialSupplierId && (
              <Stack gap={4}>
                <Text size="sm" fw={500}>Supplier</Text>
                {selectedSupplier ? (
                  <Group justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}>
                    <Group>
                      <IconBuildingStore size={16} />
                      <Text size="sm">{selectedSupplier.name}</Text>
                    </Group>
                    <ActionIcon variant="subtle" color="red" onClick={() => setSupplierId(undefined)}>
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Button variant="light" leftSection={<IconBuildingStore size={16} />} onClick={() => setSupplierPickerOpen(true)}>
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
              <Button variant="subtle" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={isPending} disabled={!productId || !supplierId}>
                Receive Stock
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ProductPickerModal
        opened={productPickerOpen}
        onClose={() => setProductPickerOpen(false)}
        onSelect={(productId) => {
          setProductId(productId);
          setProductPickerOpen(false);
        }}
        excludeIds={[]}
      />

      <SupplierPickerModal
        opened={supplierPickerOpen}
        onClose={() => setSupplierPickerOpen(false)}
        onSelect={(supplierId) => {
          setSupplierId(supplierId);
          setSupplierPickerOpen(false);
        }}
        excludeIds={[]}
      />
    </>
  );
};
