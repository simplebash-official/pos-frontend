import { useMemo, useState } from 'react';
import { Modal, TextInput, NumberInput, Select, Button, Group, Stack, Text } from '@mantine/core';
import { IconBox, IconBarcode, IconTag, IconCoin } from '@tabler/icons-react';
import { Product, ProductInput } from '../types';
import { useValidCategories } from '../hooks/useCategories';
import { fromCents, toCents } from '@/shared/lib/money';

export interface ProductFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ProductInput) => Promise<void>;
  productToEdit?: Product | null;
  loading?: boolean;
}

interface FormContentProps {
  productToEdit?: Product | null;
  onClose: () => void;
  onSubmit: (values: ProductInput) => Promise<void>;
  loading?: boolean;
}

function ProductFormContent({
  productToEdit,
  onClose,
  onSubmit,
  loading = false,
}: FormContentProps) {
  const isEditing = Boolean(productToEdit);

  const { data: validCategories = [] } = useValidCategories();

  const [name, setName] = useState(productToEdit?.name ?? '');
  const [barcode, setBarcode] = useState(productToEdit?.barcode ?? '');
  const [categoryKey, setCategoryKey] = useState<string | null>(productToEdit?.categoryKey ?? null);
  const [subcategoryKey, setSubcategoryKey] = useState<string | null>(
    productToEdit?.subcategoryKey ?? null
  );
  const [costPrice, setCostPrice] = useState<number | string>(
    productToEdit ? fromCents(productToEdit.costPriceCents) : ''
  );
  const [sellingPrice, setSellingPrice] = useState<number | string>(
    productToEdit ? fromCents(productToEdit.sellingPriceCents) : ''
  );
  const [minStockThreshold, setMinStockThreshold] = useState<number | string>(
    productToEdit?.minStockThreshold ?? 3
  );
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = useMemo(
    () => validCategories.map((c) => ({ value: c.key, label: c.name })),
    [validCategories]
  );

  const subcategoryOptions = useMemo(() => {
    const selected = validCategories.find((c) => c.key === categoryKey);
    return (selected?.subcategories ?? []).map((s) => ({ value: s.key, label: s.name }));
  }, [validCategories, categoryKey]);

  const handleCategoryChange = (value: string | null) => {
    setCategoryKey(value);
    setSubcategoryKey(null);
    if (errors.categoryKey) setErrors((prev) => ({ ...prev, categoryKey: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!categoryKey) newErrors.categoryKey = 'Select a category';
    if (!subcategoryKey) newErrors.subcategoryKey = 'Select a subcategory';
    if (costPrice === '' || Number(costPrice) < 0) newErrors.costPrice = 'Enter a valid cost price';
    if (sellingPrice === '' || Number(sellingPrice) < 0)
      newErrors.sellingPrice = 'Enter a valid selling price';
    if (minStockThreshold === '' || Number(minStockThreshold) < 0)
      newErrors.minStockThreshold = 'Enter a valid threshold';
    if (!isEditing && (stockQuantity === '' || Number(stockQuantity) < 0))
      newErrors.stockQuantity = 'Enter a valid starting stock quantity';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !categoryKey || !subcategoryKey) return;

    await onSubmit({
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      categoryKey,
      subcategoryKey,
      costPriceCents: toCents(Number(costPrice)),
      sellingPriceCents: toCents(Number(sellingPrice)),
      stockQuantity: isEditing ? productToEdit!.stockQuantity : Number(stockQuantity),
      minStockThreshold: Number(minStockThreshold),
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Product / Material Name"
          placeholder="e.g. iPhone 13 Screen Replacement"
          leftSection={<IconBox size={16} />}
          required
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
        />

        <TextInput
          label="Barcode"
          description="Optional — scannable barcode for this item"
          placeholder="e.g. 8901234567890"
          leftSection={<IconBarcode size={16} />}
          value={barcode}
          onChange={(e) => setBarcode(e.currentTarget.value)}
        />

        <Group grow align="flex-start">
          <Select
            label="Category"
            placeholder="Select a category"
            leftSection={<IconTag size={16} />}
            required
            data={categoryOptions}
            value={categoryKey}
            onChange={handleCategoryChange}
            error={errors.categoryKey}
            searchable
          />
          <Select
            label="Subcategory"
            placeholder={categoryKey ? 'Select a subcategory' : 'Select a category first'}
            required
            data={subcategoryOptions}
            value={subcategoryKey}
            onChange={(value) => {
              setSubcategoryKey(value);
              if (errors.subcategoryKey) setErrors((prev) => ({ ...prev, subcategoryKey: '' }));
            }}
            disabled={!categoryKey}
            error={errors.subcategoryKey}
            searchable
          />
        </Group>

        <Group grow align="flex-start">
          <NumberInput
            label="Cost Price (Rs.)"
            placeholder="0.00"
            leftSection={<IconCoin size={16} />}
            decimalScale={2}
            min={0}
            required
            value={costPrice}
            onChange={setCostPrice}
            error={errors.costPrice}
          />
          <NumberInput
            label="Selling Price (Rs.)"
            placeholder="0.00"
            leftSection={<IconCoin size={16} />}
            decimalScale={2}
            min={0}
            required
            value={sellingPrice}
            onChange={setSellingPrice}
            error={errors.sellingPrice}
          />
        </Group>

        <Group grow align="flex-start">
          {!isEditing && (
            <NumberInput
              label="Starting Stock Quantity"
              placeholder="0"
              min={0}
              required
              value={stockQuantity}
              onChange={setStockQuantity}
              error={errors.stockQuantity}
            />
          )}
          <NumberInput
            label="Minimum Stock Threshold"
            description="Triggers a low-stock alert at or below this level"
            placeholder="0"
            min={0}
            required
            value={minStockThreshold}
            onChange={setMinStockThreshold}
            error={errors.minStockThreshold}
          />
        </Group>

        {isEditing && (
          <Text size="xs" c="dimmed">
            Stock quantity isn&apos;t edited here — use the drawer&apos;s Quick Stock Adjustment so
            every change is captured in the audit trail.
          </Text>
        )}

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" color="blue" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ProductFormModal({
  opened,
  onClose,
  onSubmit,
  productToEdit,
  loading = false,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Product Details' : 'Add Product / Material'}
      size="lg"
      centered
    >
      {opened && (
        <ProductFormContent
          key={productToEdit ? productToEdit.id : 'new-product'}
          productToEdit={productToEdit}
          onClose={onClose}
          onSubmit={onSubmit}
          loading={loading}
        />
      )}
    </Modal>
  );
}
