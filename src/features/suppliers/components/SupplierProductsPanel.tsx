import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import {
  Button,
  Center,
  Collapse,
  Group,
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
import { IconLink, IconPackage, IconPlus, IconSearch, IconUnlink } from '@tabler/icons-react';
import { IconAction, ListRow } from '@/shared/components/drawer';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import {
  useLinkProduct,
  useUnlinkProduct,
  type EnrichedLinkedProduct,
} from '@/features/supplier-products/hooks/useSupplierProducts';
import { ProductPickerModal } from '@/features/inventory/components/ProductPickerModal';
import { adminCostText } from '@/features/inventory/lib/priceTiers';
import type { Product } from '@/features/inventory/types';
import type { Supplier } from '../types';

export interface SupplierProductsPanelProps {
  supplier: Supplier;
  linked: EnrichedLinkedProduct[];
  loading: boolean;
  allProducts: Product[];
}

/** The inventory items this supplier provides, and the form that links another one. */
export const SupplierProductsPanel = ({
  supplier,
  linked,
  loading,
  allProducts,
}: SupplierProductsPanelProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const [formOpen, setFormOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productKey, setProductKey] = useState<string | null>(null);
  const [supplierSku, setSupplierSku] = useState('');
  const [costCents, setCostCents] = useState(0);
  const [notes, setNotes] = useState('');
  const linkMutation = useLinkProduct();
  const unlinkMutation = useUnlinkProduct();

  const linkedKeys = useMemo(() => new Set(linked.map((lp) => lp.productKey)), [linked]);
  const productOptions = useMemo(
    () =>
      allProducts
        .filter((p) => !linkedKeys.has(p.key))
        .map((p) => ({ value: p.key, label: `${p.name} (${p.sku})` })),
    [allProducts, linkedKeys]
  );

  const resetForm = () => {
    setFormOpen(false);
    setProductKey(null);
    setSupplierSku('');
    setCostCents(0);
    setNotes('');
  };

  const linkFromPicker = (key: string) =>
    linkMutation.mutate(
      { supplierKey: supplier.key, productKey: key },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Product Linked',
            message: 'Product has been linked to this supplier.',
            color: 'teal',
          });
        },
      }
    );

  const linkInline = () => {
    if (!productKey) return;
    linkMutation.mutate(
      {
        supplierKey: supplier.key,
        productKey,
        supplierSku: supplierSku.trim() || undefined,
        costPriceCents: costCents > 0 ? costCents : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Product Linked',
            message: 'Product has been linked to this supplier.',
            color: 'teal',
          });
          resetForm();
        },
      }
    );
  };

  const unlink = (key: string) =>
    unlinkMutation.mutate(
      { supplierKey: supplier.key, productKey: key },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Product Unlinked',
            message: 'Product has been removed from this supplier.',
            color: 'orange',
          });
        },
      }
    );

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={700}>
          {t('Linked Inventory Products')}
        </Text>
        <Group gap={6} wrap="nowrap">
          <IconAction
            kind="neutral"
            label={t('Browse All Products')}
            icon={<IconSearch size={16} />}
            onClick={() => setPickerOpen(true)}
          />
          {!formOpen && (
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => setFormOpen(true)}
            >
              {t('Link a product')}
            </Button>
          )}
        </Group>
      </Group>

      <Collapse expanded={formOpen}>
        <Paper p="md" bg="var(--bg-app)">
          <Stack gap="sm">
            <Select
              label={t('Select Product *')}
              placeholder={t('Search product name or SKU')}
              data={productOptions}
              value={productKey}
              onChange={setProductKey}
              searchable
              clearable
              size={fieldSize}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label={t('Supplier SKU (Optional)')}
                placeholder={t('e.g. SUP-1002')}
                value={supplierSku}
                onChange={(e) => setSupplierSku(e.currentTarget.value)}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Supplier Cost (Optional)')}
                valueCents={costCents}
                onChangeCents={setCostCents}
                size={fieldSize}
              />
            </SimpleGrid>
            <TextInput
              label={t('Notes (Optional)')}
              placeholder={t('e.g. Minimum order quantity 10 units')}
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              size={fieldSize}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="sm" onClick={resetForm}>
                {t('Cancel')}
              </Button>
              <Button
                size="sm"
                color="blue"
                onClick={linkInline}
                disabled={!productKey}
                loading={linkMutation.isPending}
              >
                {t('Link Product')}
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
      ) : linked.length === 0 ? (
        <Center py="md">
          <Stack gap={8} align="center">
            <IconLink size={24} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t('No products linked to this supplier yet.')}
            </Text>
            {!formOpen && (
              <Button
                variant="light"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => setFormOpen(true)}
              >
                {t('Link an inventory item')}
              </Button>
            )}
          </Stack>
        </Center>
      ) : (
        <ScrollArea.Autosize
          mah="45dvh"
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          {linked.map((lp: EnrichedLinkedProduct, index) => (
            <ListRow
              key={lp.productKey}
              index={index}
              first={index === 0}
              icon={<IconPackage size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />}
              title={lp.product.name}
              meta={
                <>
                  <div>
                    {lp.product.sku} · {lp.product.subcategory || lp.product.category}
                  </div>
                  <div>
                    {lp.costPriceCents
                      ? `${t('Supplier Cost:')} ${formatMoney(lp.costPriceCents)}`
                      : `${t('Default Cost:')} ${adminCostText(lp.product)}`}
                    {lp.supplierSku ? ` · ${t('SKU:')} ${lp.supplierSku}` : ''}
                  </div>
                  {lp.notes ? <div>{lp.notes}</div> : null}
                </>
              }
              trailing={
                <IconAction
                  kind="danger"
                  label={t('Unlink product')}
                  icon={<IconUnlink size={16} />}
                  onClick={() => unlink(lp.productKey)}
                  loading={unlinkMutation.isPending}
                />
              }
            />
          ))}
        </ScrollArea.Autosize>
      )}

      <ProductPickerModal
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={linkFromPicker}
        excludeKeys={linked.map((lp) => lp.productKey)}
      />
    </Stack>
  );
};
