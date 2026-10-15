import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconReceipt } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useCreatePurchase } from '@/features/purchases/hooks/usePurchases';
import type { EnrichedStockPurchase } from '@/features/purchases/types';
import type { Product } from '../types';
import type { SupplierOption } from './ItemSuppliersPanel';

export interface ItemIntakePanelProps {
  product: Product;
  purchases: EnrichedStockPurchase[];
  loading: boolean;
  supplierOptions: SupplierOption[];
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
}

/** Every delivery received from a supplier, and the form that records a new one. */
export const ItemIntakePanel = ({
  product,
  purchases,
  loading,
  supplierOptions,
  formOpen,
  onFormOpenChange,
}: ItemIntakePanelProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const [quantity, setQuantity] = useState<number | ''>('');
  const [supplierKey, setSupplierKey] = useState<string | null>(null);
  const [referenceNo, setReferenceNo] = useState('');
  const [unitCostCents, setUnitCostCents] = useState(0);
  const [sellingPriceCents, setSellingPriceCents] = useState(0);
  const createPurchase = useCreatePurchase();

  const canRecord = Boolean(supplierKey) && Boolean(quantity) && sellingPriceCents > 0;

  const closeForm = () => {
    onFormOpenChange(false);
    setQuantity('');
    setSupplierKey(null);
    setReferenceNo('');
    setUnitCostCents(0);
    setSellingPriceCents(0);
  };

  const record = () => {
    if (!supplierKey || !quantity || sellingPriceCents <= 0) return;
    createPurchase.mutate(
      {
        productKey: product.key,
        supplierKey,
        quantity: Number(quantity),
        unitCostCents,
        sellingPriceCents,
        date: new Date().toISOString(),
        referenceNo: referenceNo.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Stock Received',
            message: `Recorded intake of ${quantity} units.`,
            color: 'teal',
          });
          closeForm();
        },
      }
    );
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={700}>
          {t('Stock Intake History')}
        </Text>
        {!formOpen && (
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() => onFormOpenChange(true)}
          >
            {t('Receive stock')}
          </Button>
        )}
      </Group>

      <Collapse expanded={formOpen}>
        <Paper p="md" bg="var(--bg-app)">
          <Stack gap="sm">
            <Select
              label={t('Supplier')}
              placeholder={t('Select supplier')}
              data={supplierOptions}
              value={supplierKey}
              onChange={setSupplierKey}
              searchable
              size={fieldSize}
            />
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <NumberInput
                label={t('Quantity Received')}
                placeholder={t('e.g. 100')}
                value={quantity}
                onChange={(val) => setQuantity(val === '' ? '' : Number(val))}
                min={1}
                allowDecimal={false}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Unit Cost')}
                valueCents={unitCostCents}
                onChangeCents={setUnitCostCents}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Selling Price each')}
                valueCents={sellingPriceCents}
                onChangeCents={setSellingPriceCents}
                size={fieldSize}
              />
            </SimpleGrid>
            <TextInput
              label={t('Invoice / Reference No. (optional)')}
              placeholder={t('e.g. INV-8834')}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.currentTarget.value)}
              size={fieldSize}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="sm" onClick={closeForm}>
                {t('Cancel')}
              </Button>
              <Button
                size="sm"
                color="blue"
                onClick={record}
                disabled={!canRecord}
                loading={createPurchase.isPending}
              >
                {t('Record Intake')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Collapse>

      {loading ? (
        <Stack gap={6}>
          <Skeleton height={52} />
          <Skeleton height={52} />
        </Stack>
      ) : purchases.length === 0 ? (
        <Center py="md">
          <Stack gap={6} align="center">
            <IconReceipt size={22} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t('No stock intakes recorded.')}
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={0}>
          {purchases.map((purchase, index) => (
            <Box
              key={purchase.id}
              py="xs"
              style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
            >
              <Text size="sm" fw={700} lineClamp={1}>
                {purchase.supplier.name}
              </Text>
              <Group gap={6} mt={4}>
                <Badge size="xs" variant="filled" color="blue">
                  {t('Qty:')} {purchase.quantity}
                </Badge>
                <Badge size="xs" variant="light" color="teal">
                  {formatMoney(purchase.totalCostCents)}
                </Badge>
                <Badge size="xs" variant="light" color="blue">
                  {t('Sells at')} {formatMoney(purchase.sellingPriceCents)}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                {formatDateTime(purchase.date)}
                {purchase.referenceNo ? ` · ${t('Ref:')} ${purchase.referenceNo}` : ''}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
