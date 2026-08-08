import { useMemo, useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Paper,
  Box,
  Switch,
  ThemeIcon,
} from '@mantine/core';
import { IconBarcode, IconTag, IconBox, IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Product, CreateProductInput, UpdateProductInput } from '../types';
import { useValidCategories } from '../hooks/useCategories';
import { fromCents, toCents } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { ApiError } from '@/shared/types/common';
import { CURRENCY } from '@/constants';

export interface ProductFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProductInput | UpdateProductInput) => Promise<void>;
  productToEdit?: Product | null;
  loading?: boolean;
}

interface FormContentProps {
  productToEdit?: Product | null;
  onClose: () => void;
  onSubmit: (values: CreateProductInput | UpdateProductInput) => Promise<void>;
  loading?: boolean;
}

function ProductFormContent({
  productToEdit,
  onClose,
  onSubmit,
  loading = false,
}: FormContentProps) {
  const isEditing = Boolean(productToEdit);
  const isMobile = useIsMobile();

  const { data: validCategories = [] } = useValidCategories();

  // Barcode states
  const [autoGenerateBarcode, setAutoGenerateBarcode] = useState(true);
  const [manualBarcode, setManualBarcode] = useState(productToEdit?.barcode ?? '');

  // Core Product info
  const [name, setName] = useState(productToEdit?.name ?? '');
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
    productToEdit ? productToEdit.minStockThreshold : ''
  );
  const [stockQuantity, setStockQuantity] = useState<number | string>('');

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
    if (costPrice === '' || Number(costPrice) < 0 || isNaN(Number(costPrice))) {
      newErrors.costPrice = 'Enter a valid cost price';
    }
    if (sellingPrice === '' || Number(sellingPrice) <= 0 || isNaN(Number(sellingPrice))) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }
    if (
      minStockThreshold === '' ||
      Number(minStockThreshold) < 0 ||
      isNaN(Number(minStockThreshold))
    ) {
      newErrors.minStockThreshold = 'Enter a valid threshold';
    }
    if (
      !isEditing &&
      (stockQuantity === '' || Number(stockQuantity) < 0 || isNaN(Number(stockQuantity)))
    ) {
      newErrors.stockQuantity = 'Enter a valid starting stock quantity';
    }

    // Barcode validation when manual entry is chosen on creation
    if (!isEditing && !autoGenerateBarcode) {
      const trimmed = manualBarcode.trim();
      if (trimmed && !/^\d{8,14}$/.test(trimmed)) {
        newErrors.barcode = 'Manual barcode must be 8–14 numeric digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !categoryKey || !subcategoryKey) return;

    if (isEditing) {
      const payload: UpdateProductInput = {
        name: name.trim(),
        categoryKey,
        subcategoryKey,
        costPriceCents: toCents(Number(costPrice)),
        sellingPriceCents: toCents(Number(sellingPrice)),
        minStockThreshold: Number(minStockThreshold || 0),
      };

      try {
        await onSubmit(payload);
        onClose();
      } catch (err: unknown) {
        handleApiError(err);
      }
    } else {
      const payload: CreateProductInput = {
        name: name.trim(),
        categoryKey,
        subcategoryKey,
        costPriceCents: toCents(Number(costPrice)),
        sellingPriceCents: toCents(Number(sellingPrice)),
        stockQuantity: Number(stockQuantity || 0),
        minStockThreshold: Number(minStockThreshold || 0),
      };

      if (autoGenerateBarcode) {
        payload.autoGenerateBarcode = true;
      } else {
        payload.autoGenerateBarcode = false;
        if (manualBarcode.trim()) {
          payload.barcode = manualBarcode.trim();
        }
      }

      try {
        await onSubmit(payload);
        onClose();
      } catch (err: unknown) {
        handleApiError(err);
      }
    }
  };

  const handleApiError = (err: unknown) => {
    const apiError = err as ApiError | undefined;
    const message =
      apiError?.message ?? (err instanceof Error ? err.message : 'Failed to save product');
    const code = apiError?.code;
    const statusCode = apiError?.statusCode;

    if (
      code === 'BARCODE_ALREADY_EXISTS' ||
      statusCode === 409 ||
      message.toLowerCase().includes('barcode')
    ) {
      setErrors((prev) => ({
        ...prev,
        barcode: message.includes('already exists')
          ? message
          : `A product with barcode "${manualBarcode.trim()}" already exists`,
      }));
    } else if (
      message.toLowerCase().includes('category') ||
      message.toLowerCase().includes('subcategory')
    ) {
      setErrors((prev) => ({ ...prev, categoryKey: message }));
    } else {
      notifications.show({
        title: 'Error Saving Product',
        message,
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Category Selection */}
        <Group grow align="flex-start">
          <Select
            label="Category"
            placeholder="Select a category"
            data={categoryOptions}
            value={categoryKey}
            onChange={handleCategoryChange}
            error={errors.categoryKey}
            disabled={isEditing}
            required
            searchable
          />
          <Select
            label="Subcategory"
            placeholder={categoryKey ? 'Select subcategory' : 'Choose category first'}
            data={subcategoryOptions}
            value={subcategoryKey}
            onChange={(val) => {
              setSubcategoryKey(val);
              if (errors.subcategoryKey) setErrors((prev) => ({ ...prev, subcategoryKey: '' }));
            }}
            error={errors.subcategoryKey}
            disabled={!categoryKey || isEditing}
            required
            searchable
          />
        </Group>

        {/* Product Name */}
        <TextInput
          label="Product Name"
          placeholder="e.g. iPhone 15 Pro Max Tempered Glass"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          required
          leftSection={<IconTag size={16} />}
        />

        {/* Barcode Configuration (Create Mode Only) */}
        {!isEditing && (
          <Stack gap={6}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Barcode
            </Text>

            <Box
              p="sm"
              style={{
                borderRadius: 'var(--mantine-radius-default)',
                border:
                  '1.5px dashed light-dark(var(--mantine-color-amber-5), rgba(245, 159, 0, 0.4))',
                backgroundColor: 'light-dark(rgba(255, 249, 219, 0.3), rgba(245, 159, 0, 0.04))',
              }}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" align="center" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <ThemeIcon
                    size={38}
                    radius="var(--mantine-radius-default)"
                    variant="light"
                    color="amber"
                    style={{ flexShrink: 0 }}
                  >
                    <IconTag size={18} stroke={1.6} />
                  </ThemeIcon>

                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={700} c="var(--text-primary)" lh={1.3}>
                      Auto-generate EAN-13
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.3}>
                      Internal prefix &quot;20&quot; · minted on save · GS1 compatible
                    </Text>
                  </Stack>
                </Group>

                <Switch
                  checked={autoGenerateBarcode}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setAutoGenerateBarcode(checked);
                    if (checked) {
                      setManualBarcode('');
                      if (errors.barcode) setErrors((prev) => ({ ...prev, barcode: '' }));
                    }
                  }}
                  color="amber"
                  size="md"
                  aria-label="Auto-generate EAN-13 barcode"
                />
              </Group>
            </Box>

            {!autoGenerateBarcode && (
              <TextInput
                mt={4}
                placeholder="Scan or enter manufacturer barcode (8–14 digits)"
                leftSection={<IconBarcode size={16} />}
                value={manualBarcode}
                onChange={(e) => {
                  setManualBarcode(e.currentTarget.value);
                  if (errors.barcode) setErrors((prev) => ({ ...prev, barcode: '' }));
                }}
                error={errors.barcode}
                autoFocus={!isMobile}
                description="Use a barcode scanner or enter product packaging barcode (8–14 numeric digits)"
              />
            )}
          </Stack>
        )}

        {/* Read-Only Barcode & SKU Banner (Edit Mode) */}
        {isEditing && (
          <Paper
            withBorder
            p="xs"
            radius="var(--mantine-radius-default)"
            bg="var(--mantine-color-default-hover)"
          >
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">
                  SKU (Immutable)
                </Text>
                <Text size="sm" fw={700}>
                  {productToEdit?.sku}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Barcode (Immutable)
                </Text>
                <Group gap={6}>
                  <Text size="sm" fw={700}>
                    {productToEdit?.barcode ?? 'None'}
                  </Text>
                  {productToEdit?.barcodeSource && (
                    <Badge
                      size="xs"
                      variant="light"
                      color={productToEdit.barcodeSource === 'generated' ? 'blue' : 'gray'}
                    >
                      {productToEdit.barcodeSource === 'generated' ? 'Generated' : 'Manual'}
                    </Badge>
                  )}
                </Group>
              </div>
            </Group>
          </Paper>
        )}

        {/* Pricing */}
        <Group grow align="flex-start">
          <NumberInput
            label="Cost Price (Rs.)"
            placeholder="0.00"
            decimalScale={2}
            min={0}
            value={costPrice}
            onChange={(val) => {
              setCostPrice(val);
              if (errors.costPrice) setErrors((prev) => ({ ...prev, costPrice: '' }));
            }}
            error={errors.costPrice}
            leftSection={
              <Text size="xs" fw={700} c="dimmed">
                {CURRENCY.symbol}
              </Text>
            }
            required
          />
          <NumberInput
            label="Selling Price (Rs.)"
            placeholder="0.00"
            decimalScale={2}
            min={0.01}
            value={sellingPrice}
            onChange={(val) => {
              setSellingPrice(val);
              if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: '' }));
            }}
            error={errors.sellingPrice}
            leftSection={
              <Text size="xs" fw={700} c="dimmed">
                {CURRENCY.symbol}
              </Text>
            }
            required
          />
        </Group>

        {/* Stock Metrics */}
        <Group grow align="flex-start">
          {!isEditing && (
            <NumberInput
              label="Starting Stock Units"
              placeholder="0"
              min={0}
              allowDecimal={false}
              value={stockQuantity}
              onChange={(val) => {
                setStockQuantity(val);
                if (errors.stockQuantity) setErrors((prev) => ({ ...prev, stockQuantity: '' }));
              }}
              error={errors.stockQuantity}
              leftSection={<IconBox size={16} />}
              required
            />
          )}
          <NumberInput
            label="Low-Stock Alert Threshold"
            placeholder="3"
            min={0}
            allowDecimal={false}
            value={minStockThreshold}
            onChange={(val) => {
              setMinStockThreshold(val);
              if (errors.minStockThreshold)
                setErrors((prev) => ({ ...prev, minStockThreshold: '' }));
            }}
            error={errors.minStockThreshold}
            leftSection={<IconAlertTriangle size={16} />}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            description="Alerts appear when available stock falls to or below this amount."
            required
          />
        </Group>

        {isEditing && (
          <Text size="xs" c="dimmed">
            Stock quantity is managed via stock adjustments or purchase orders so every change is
            captured in the audit trail.
          </Text>
        )}

        <Group justify="flex-end" mt="md" gap="sm">
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
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {isEditing ? `Edit: ${productToEdit?.name}` : 'Add New Inventory Product'}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
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
