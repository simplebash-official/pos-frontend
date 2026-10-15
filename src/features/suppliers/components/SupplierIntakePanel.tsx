import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import {
  Button,
  Center,
  Collapse,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconReceipt } from '@tabler/icons-react';
import { IconAction, ListRow } from '@/shared/components/drawer';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { EnrichedLinkedProduct } from '@/features/supplier-products/hooks/useSupplierProducts';
import { useCreatePurchase } from '@/features/purchases/hooks/usePurchases';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';
import type { EnrichedStockPurchase } from '@/features/purchases/types';
import type { Product } from '@/features/inventory/types';
import type { Supplier } from '../types';

export interface SupplierIntakePanelProps {
  supplier: Supplier;
  purchases: EnrichedStockPurchase[];
  loading: boolean;
  linked: EnrichedLinkedProduct[];
  allProducts: Product[];
}

/** Every delivery received from this supplier, and the quick form that records a new one. */
export const SupplierIntakePanel = ({
  supplier,
  purchases,
  loading,
  linked,
  allProducts,
}: SupplierIntakePanelProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const [formOpen, setFormOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [productKey, setProductKey] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unitCostCents, setUnitCostCents] = useState(0);
  const [sellingPriceCents, setSellingPriceCents] = useState(0);
  const [referenceNo, setReferenceNo] = useState('');
  const createPurchase = useCreatePurchase();

  // The products this supplier is linked to first; if none, any product.
  const productOptions = useMemo(
    () =>
      linked.length > 0
        ? linked.map((lp) => ({
            value: lp.productKey,
            label: `${lp.product.name} (${lp.product.sku})`,
          }))
        : allProducts.map((p) => ({ value: p.key, label: `${p.name} (${p.sku})` })),
    [linked, allProducts]
  );

  const canRecord =
    Boolean(productKey) && Boolean(quantity) && Number(quantity) > 0 && sellingPriceCents > 0;

  const resetForm = () => {
    setFormOpen(false);
    setProductKey(null);
    setQuantity(1);
    setUnitCostCents(0);
    setSellingPriceCents(0);
    setReferenceNo('');
  };

  // The supplier's own agreed cost for this product, when the link has one.
  const chooseProduct = (key: string | null) => {
    setProductKey(key);
    const lp = linked.find((p) => p.productKey === key);
    if (lp?.costPriceCents) setUnitCostCents(lp.costPriceCents);
  };

  const record = () => {
    if (!productKey || !quantity || Number(quantity) <= 0 || sellingPriceCents <= 0) return;
    createPurchase.mutate(
      {
        supplierKey: supplier.key,
        productKey,
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
            message: 'Stock intake recorded successfully.',
            color: 'teal',
          });
          resetForm();
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
        <Group gap={6} wrap="nowrap">
          <IconAction
            kind="neutral"
            label={t('Advanced Receive Form')}
            icon={<IconReceipt size={16} />}
            onClick={() => setReceiveOpen(true)}
          />
          {!formOpen && (
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => setFormOpen(true)}
            >
              {t('Receive stock')}
            </Button>
          )}
        </Group>
      </Group>

      <Collapse expanded={formOpen}>
        <Paper p="md" bg="var(--bg-app)">
          <Stack gap="sm">
            <Select
              label={t('Product *')}
              placeholder={t('Select product received')}
              data={productOptions}
              value={productKey}
              onChange={chooseProduct}
              searchable
              clearable
              size={fieldSize}
            />
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <NumberInput
                label={t('Quantity Received *')}
                placeholder={t('e.g. 20')}
                value={quantity}
                onChange={(val) => setQuantity(val === '' ? '' : Number(val))}
                min={1}
                allowDecimal={false}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Unit Cost *')}
                valueCents={unitCostCents}
                onChangeCents={setUnitCostCents}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Selling Price each *')}
                valueCents={sellingPriceCents}
                onChangeCents={setSellingPriceCents}
                size={fieldSize}
              />
            </SimpleGrid>
            <Text size="xs" c="dimmed">
              {t('These units keep their own price, even if older stock sells for less.')}
            </Text>
            <TextInput
              label={t('Invoice / Reference No. (Optional)')}
              placeholder={t('e.g. INV-9021')}
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.currentTarget.value)}
              size={fieldSize}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="sm" onClick={resetForm}>
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
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Stack>
      ) : purchases.length === 0 ? (
        <Center py="md">
          <Stack gap={8} align="center">
            <IconReceipt size={24} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t('No stock intakes recorded for this supplier yet.')}
            </Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea.Autosize
          mah="45dvh"
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          {purchases.map((purchase, index) => (
            <ListRow
              key={purchase.id}
              index={index}
              first={index === 0}
              icon={<IconReceipt size={20} style={{ color: 'var(--mantine-color-teal-6)' }} />}
              title={purchase.product.name}
              meta={
                <>
                  <div>
                    {formatDateTime(purchase.date)}
                    {purchase.referenceNo ? ` · ${t('Ref:')} ${purchase.referenceNo}` : ''}
                  </div>
                  {purchase.unitCostCents ? (
                    <div>
                      {t('Unit:')} {formatMoney(purchase.unitCostCents)}
                    </div>
                  ) : null}
                </>
              }
              trailing={
                <>
                  <Text size="sm" fw={800} c="blue">
                    {t('Qty: +')}
                    {purchase.quantity}
                  </Text>
                  <Text size="xs" fw={700}>
                    {formatMoney(purchase.totalCostCents)}
                  </Text>
                </>
              }
            />
          ))}
        </ScrollArea.Autosize>
      )}

      <ReceiveStockModal
        opened={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        initialSupplierKey={supplier.key}
      />
    </Stack>
  );
};
