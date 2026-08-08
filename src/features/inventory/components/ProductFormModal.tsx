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
  ActionIcon,
  Grid,
  Tooltip,
} from '@mantine/core';
import {
  IconBarcode,
  IconTag,
  IconBox,
  IconAlertTriangle,
  IconBuildingStore,
  IconPlus,
  IconTrash,
  IconReceipt,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys } from '@/api/queryKeys';
import { fetchSuppliers } from '@/features/suppliers/api/suppliersApi';
import { Product, CreateProductInput, UpdateProductInput, ProductSupplierIntake } from '../types';
import { useValidCategories } from '../hooks/useCategories';
import { fromCents, toCents, formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { ApiError } from '@/shared/types/common';
import { CURRENCY } from '@/constants';

export interface SupplierIntakeRow {
  id: string;
  supplierKey: string;
  quantity: number | string;
  costPrice: number | string;
  referenceNo: string;
  notes: string;
}

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
  const { data: suppliers = [] } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => fetchSuppliers(),
    enabled: !isEditing,
  });

  // Multi-supplier intake rows (Create Mode Only)
  const [supplierIntakes, setSupplierIntakes] = useState<SupplierIntakeRow[]>([]);

  const handleAddSupplierIntake = () => {
    setSupplierIntakes((prev) => [
      ...prev,
      {
        id: `intake-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        supplierKey: '',
        quantity: '',
        costPrice: costPrice !== '' ? costPrice : '',
        referenceNo: '',
        notes: '',
      },
    ]);
  };

  const handleRemoveSupplierIntake = (id: string) => {
    setSupplierIntakes((prev) => prev.filter((row) => row.id !== id));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`supplier_${id}_key`];
      delete updated[`supplier_${id}_qty`];
      delete updated[`supplier_${id}_cost`];
      return updated;
    });
  };

  const handleUpdateSupplierIntake = (
    id: string,
    field: keyof SupplierIntakeRow,
    value: unknown
  ) => {
    setSupplierIntakes((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return { ...row, [field]: value };
      })
    );
    if (field === 'supplierKey') {
      setErrors((prev) => ({ ...prev, [`supplier_${id}_key`]: '' }));
    } else if (field === 'quantity') {
      setErrors((prev) => ({ ...prev, [`supplier_${id}_qty`]: '' }));
    } else if (field === 'costPrice') {
      setErrors((prev) => ({ ...prev, [`supplier_${id}_cost`]: '' }));
    }
  };

  const hasSupplierIntakes = supplierIntakes.length > 0;

  const totalIntakeQuantity = useMemo(
    () =>
      supplierIntakes.reduce(
        (sum, row) => sum + (Number(row.quantity) > 0 ? Number(row.quantity) : 0),
        0
      ),
    [supplierIntakes]
  );

  const totalIntakeCostCents = useMemo(
    () =>
      supplierIntakes.reduce((sum, row) => {
        const qty = Number(row.quantity) > 0 ? Number(row.quantity) : 0;
        const unitCents = toCents(Number(row.costPrice) > 0 ? Number(row.costPrice) : 0);
        return sum + qty * unitCents;
      }, 0),
    [supplierIntakes]
  );

  const getAvailableSupplierOptions = (currentRowId: string, currentSelectedKey: string) => {
    const chosenKeysInOtherRows = new Set(
      supplierIntakes
        .filter((row) => row.id !== currentRowId && row.supplierKey)
        .map((row) => row.supplierKey)
    );

    return suppliers
      .filter((s) => !chosenKeysInOtherRows.has(s.key) || s.key === currentSelectedKey)
      .map((s) => ({
        value: s.key,
        label: `${s.name}${s.contactPerson ? ` (${s.contactPerson})` : ''}`,
      }));
  };

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

    if (
      !hasSupplierIntakes &&
      (costPrice === '' || Number(costPrice) < 0 || isNaN(Number(costPrice)))
    ) {
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
      !hasSupplierIntakes &&
      (stockQuantity === '' || Number(stockQuantity) < 0 || isNaN(Number(stockQuantity)))
    ) {
      newErrors.stockQuantity = 'Enter a valid starting stock quantity';
    }

    // Validate supplier intake rows
    if (!isEditing && hasSupplierIntakes) {
      const seenSupplierKeys = new Set<string>();
      supplierIntakes.forEach((row) => {
        if (!row.supplierKey) {
          newErrors[`supplier_${row.id}_key`] = 'Select a vendor';
        } else if (seenSupplierKeys.has(row.supplierKey)) {
          newErrors[`supplier_${row.id}_key`] = 'Duplicate vendor selected';
        } else {
          seenSupplierKeys.add(row.supplierKey);
        }

        if (row.quantity === '' || Number(row.quantity) < 1 || isNaN(Number(row.quantity))) {
          newErrors[`supplier_${row.id}_qty`] = 'Quantity must be at least 1';
        }

        if (row.costPrice === '' || Number(row.costPrice) < 0 || isNaN(Number(row.costPrice))) {
          newErrors[`supplier_${row.id}_cost`] = 'Enter a valid unit cost';
        }
      });
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
      const suppliersPayload: ProductSupplierIntake[] = hasSupplierIntakes
        ? supplierIntakes.map((row) => ({
            supplierKey: row.supplierKey,
            quantity: Number(row.quantity),
            costPriceCents: toCents(Number(row.costPrice)),
            referenceNo: row.referenceNo.trim() || undefined,
            notes: row.notes.trim() || undefined,
          }))
        : [];

      const finalCostPriceCents =
        costPrice !== ''
          ? toCents(Number(costPrice))
          : hasSupplierIntakes
            ? toCents(Number(supplierIntakes[0].costPrice))
            : 0;

      const finalStockQuantity = hasSupplierIntakes
        ? totalIntakeQuantity
        : Number(stockQuantity || 0);

      const payload: CreateProductInput = {
        name: name.trim(),
        categoryKey,
        subcategoryKey,
        costPriceCents: finalCostPriceCents,
        sellingPriceCents: toCents(Number(sellingPrice)),
        stockQuantity: finalStockQuantity,
        minStockThreshold: Number(minStockThreshold || 0),
        suppliers: suppliersPayload.length > 0 ? suppliersPayload : undefined,
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
    } else if (message.toLowerCase().includes('supplier')) {
      notifications.show({
        title: 'Supplier Validation Error',
        message,
        color: 'red',
      });
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

        {/* Multi-Supplier Intake Section (Create Mode Only) */}
        {!isEditing && (
          <Stack gap={8}>
            <Group justify="space-between" align="center">
              <Group gap="xs" align="center">
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Suppliers & Stock Intake
                </Text>
                {hasSupplierIntakes && (
                  <Badge size="xs" variant="light" color="blue">
                    {supplierIntakes.length} {supplierIntakes.length === 1 ? 'Batch' : 'Batches'} ·{' '}
                    {totalIntakeQuantity} Units
                  </Badge>
                )}
              </Group>

              {hasSupplierIntakes && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="blue"
                  leftSection={<IconPlus size={14} />}
                  onClick={handleAddSupplierIntake}
                >
                  Add Another Supplier
                </Button>
              )}
            </Group>

            {supplierIntakes.length === 0 ? (
              <Box
                onClick={handleAddSupplierIntake}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAddSupplierIntake();
                  }
                }}
                p="sm"
                style={{
                  borderRadius: 'var(--mantine-radius-default)',
                  border:
                    '1.5px dashed light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4))',
                  backgroundColor:
                    'light-dark(var(--mantine-color-gray-0), rgba(255, 255, 255, 0.02))',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Group gap="sm" align="center" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <ThemeIcon
                      size={36}
                      radius="var(--mantine-radius-default)"
                      variant="light"
                      color="blue"
                      style={{ flexShrink: 0 }}
                    >
                      <IconBuildingStore size={18} stroke={1.6} />
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--text-primary)" lineClamp={1}>
                        Add Supplier & Batch Intake
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        Optionally link vendors to record bought units, costs, and PO numbers
                      </Text>
                    </div>
                  </Group>
                  <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    leftSection={<IconPlus size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSupplierIntake();
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    Add Supplier
                  </Button>
                </Group>
              </Box>
            ) : (
              <Stack gap="xs">
                {supplierIntakes.map((row, index) => {
                  const availableOptions = getAvailableSupplierOptions(row.id, row.supplierKey);

                  return (
                    <Paper
                      key={row.id}
                      withBorder
                      p="sm"
                      radius="var(--mantine-radius-default)"
                      bg="light-dark(var(--bg-card), var(--mantine-color-dark-7))"
                      style={{
                        borderColor: 'var(--border)',
                      }}
                    >
                      <Stack gap="xs">
                        {/* Card Header */}
                        <Group justify="space-between" align="center">
                          <Group gap="xs" align="center">
                            <Badge size="sm" variant="light" color="blue">
                              Supplier Batch #{index + 1}
                            </Badge>
                          </Group>
                          <Tooltip label="Remove this supplier batch" position="top">
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="subtle"
                              onClick={() => handleRemoveSupplierIntake(row.id)}
                              aria-label={`Remove supplier batch #${index + 1}`}
                            >
                              <IconTrash size={15} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>

                        {/* Vendor Select */}
                        <Select
                          label="Vendor / Supplier"
                          placeholder="Search or select supplier vendor"
                          data={availableOptions}
                          value={row.supplierKey || null}
                          onChange={(val) =>
                            handleUpdateSupplierIntake(row.id, 'supplierKey', val || '')
                          }
                          error={errors[`supplier_${row.id}_key`]}
                          leftSection={<IconBuildingStore size={16} />}
                          searchable
                          clearable
                          required
                        />

                        <Grid gap="xs" align="flex-start">
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              label="Units Bought"
                              placeholder="0"
                              min={1}
                              allowDecimal={false}
                              value={row.quantity}
                              onChange={(val) =>
                                handleUpdateSupplierIntake(row.id, 'quantity', val)
                              }
                              error={errors[`supplier_${row.id}_qty`]}
                              leftSection={<IconBox size={16} />}
                              required
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                              label="Unit Cost Price"
                              placeholder="0.00"
                              min={0}
                              decimalScale={2}
                              value={row.costPrice}
                              onChange={(val) =>
                                handleUpdateSupplierIntake(row.id, 'costPrice', val)
                              }
                              error={errors[`supplier_${row.id}_cost`]}
                              leftSection={
                                <Text size="xs" fw={700} c="dimmed">
                                  {CURRENCY.symbol}
                                </Text>
                              }
                              required
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput
                              label="Invoice / Ref No"
                              placeholder="e.g. INV-1049"
                              value={row.referenceNo}
                              onChange={(e) =>
                                handleUpdateSupplierIntake(
                                  row.id,
                                  'referenceNo',
                                  e.currentTarget.value
                                )
                              }
                              leftSection={<IconReceipt size={16} />}
                            />
                          </Grid.Col>
                        </Grid>
                      </Stack>
                    </Paper>
                  );
                })}

                {/* Live Intake Summary Stat Strip */}
                <Paper
                  withBorder
                  px="md"
                  py="xs"
                  radius="var(--mantine-radius-default)"
                  bg="light-dark(rgba(34, 139, 230, 0.04), rgba(34, 139, 230, 0.08))"
                  style={{
                    borderColor: 'light-dark(rgba(34, 139, 230, 0.25), rgba(34, 139, 230, 0.35))',
                  }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                    <Group gap="xs" align="center">
                      <ThemeIcon size={24} radius="xl" variant="light" color="blue">
                        <IconBox size={13} />
                      </ThemeIcon>
                      <Text size="xs" c="var(--text-secondary)">
                        Total Intake Stock:{' '}
                        <Text span fw={700} c="var(--text-primary)">
                          {totalIntakeQuantity} Units
                        </Text>
                      </Text>
                    </Group>
                    <Group gap="xs" align="center">
                      <ThemeIcon size={24} radius="xl" variant="light" color="teal">
                        <IconReceipt size={13} />
                      </ThemeIcon>
                      <Text size="xs" c="var(--text-secondary)">
                        Total Investment:{' '}
                        <Text span fw={700} c="var(--text-primary)">
                          {formatMoney(totalIntakeCostCents)}
                        </Text>
                      </Text>
                    </Group>
                  </Group>
                </Paper>
              </Stack>
            )}
          </Stack>
        )}

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
            placeholder={
              hasSupplierIntakes && supplierIntakes[0]?.costPrice
                ? String(supplierIntakes[0].costPrice)
                : '0.00'
            }
            decimalScale={2}
            min={0}
            value={costPrice}
            onChange={(val) => {
              setCostPrice(val);
              if (errors.costPrice) setErrors((prev) => ({ ...prev, costPrice: '' }));
            }}
            error={errors.costPrice}
            description={
              hasSupplierIntakes && costPrice === ''
                ? 'Will adopt vendor intake cost price'
                : undefined
            }
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            leftSection={
              <Text size="xs" fw={700} c="dimmed">
                {CURRENCY.symbol}
              </Text>
            }
            required={!hasSupplierIntakes}
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
          {!isEditing &&
            (hasSupplierIntakes ? (
              <NumberInput
                label="Starting Stock Units"
                value={totalIntakeQuantity}
                disabled
                leftSection={<IconBox size={16} />}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
                description={`Calculated from ${supplierIntakes.length} vendor ${supplierIntakes.length === 1 ? 'batch' : 'batches'}`}
              />
            ) : (
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
            ))}
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
