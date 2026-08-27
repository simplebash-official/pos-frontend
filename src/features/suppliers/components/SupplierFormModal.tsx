import { t } from '@/shared/i18n/t';
import { useState, useMemo, useRef } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  TagsInput,
  Button,
  Group,
  Stack,
  Grid,
  Text,
  Badge,
  Paper,
  ActionIcon,
  Tooltip,
  Center,
  ScrollArea,
  Box,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconUser,
  IconPhone,
  IconMapPin,
  IconTag,
  IconMail,
  IconPackage,
  IconPlus,
  IconTrash,
  IconX,
  IconSearch,
} from '@tabler/icons-react';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useProductsForSupplier } from '@/features/supplier-products';
import { formatMoney } from '@/shared/lib/money';
import { Supplier, SupplierInput } from '../types';
import { DEFAULT_SUGGESTED_TAGS } from '../constants';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';

export interface SupplierFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: SupplierInput, linkedProductKeys?: string[]) => Promise<void>;
  supplierToEdit?: Supplier | null;
  loading?: boolean;
}

interface FormContentProps {
  supplierToEdit?: Supplier | null;
  onClose: () => void;
  onSubmit: (values: SupplierInput, linkedProductKeys?: string[]) => Promise<void>;
  loading?: boolean;
}

const SupplierFormContent = ({
  supplierToEdit,
  onClose,
  onSubmit,
  loading = false,
}: FormContentProps) => {
  const isEditing = Boolean(supplierToEdit);
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SupplierInput>({
    name: supplierToEdit?.name || '',
    contactPerson: supplierToEdit?.contactPerson || '',
    primaryPhone: supplierToEdit?.primaryPhone || '',
    secondaryPhone: supplierToEdit?.secondaryPhone || '',
    address: supplierToEdit?.address || '',
    suppliedCategories: supplierToEdit?.suppliedCategories || [],
    email: supplierToEdit?.email || '',
    notes: supplierToEdit?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Product linking
  const { data: allProducts } = useAllProducts();

  // Read from the local mirror, not the network: `supplierProducts` is a
  // synced resource, so a direct request would show no links at all while
  // offline — and the save below would then wipe them.
  const { data: existingLinks, isFetching: linksLoading } = useProductsForSupplier(
    supplierToEdit?.key
  );

  const [linkedProductKeys, setLinkedProductKeys] = useState<string[]>(
    existingLinks.map((link) => link.productKey)
  );

  // Adopt the mirrored links once, when they first settle. Keyed on the load
  // finishing rather than on the list being non-empty: a supplier that
  // genuinely has no links must still latch, or it can never sync afterwards.
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const linksOwner = supplierToEdit?.key ?? null;
  if (!linksLoading && syncedFor !== linksOwner) {
    setLinkedProductKeys(existingLinks.map((link) => link.productKey));
    setSyncedFor(linksOwner);
  }

  const [productSearch, setProductSearch] = useState('');
  const [isLinkingActive, setIsLinkingActive] = useState(false);

  const unlinkedProducts = useMemo(() => {
    const linkedSet = new Set(linkedProductKeys);
    return allProducts.filter((p) => !linkedSet.has(p.key));
  }, [allProducts, linkedProductKeys]);

  const { results: availableProducts } = useEntitySearch(
    unlinkedProducts,
    PRODUCT_SEARCH_FIELDS,
    productSearch,
    null
  );

  const linkedProducts = useMemo(() => {
    const productMap = new Map(allProducts.map((p) => [p.key, p]));
    return linkedProductKeys
      .map((key) => productMap.get(key))
      .filter(Boolean) as typeof allProducts;
  }, [allProducts, linkedProductKeys]);

  const addProduct = (key: string) => {
    setLinkedProductKeys((prev) => [...prev, key]);
    setProductSearch('');
  };

  const removeProduct = (key: string) => {
    setLinkedProductKeys((prev) => prev.filter((pKey) => pKey !== key));
  };

  const handleStartLinking = () => {
    setIsLinkingActive(true);
    if (!isMobile) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter the business name (e.g. "Colombo Mobile Parts")';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Please enter the contact person\'s name (e.g. "Ranjith Kumara")';
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Please enter the primary phone number';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Please enter the address or physical location';
    }
    if (!formData.suppliedCategories || formData.suppliedCategories.length === 0) {
      newErrors.suppliedCategories = 'Please specify at least one supply tag (e.g. "Phone Parts")';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // `onSubmit` owns persisting the links too — it queues them through the
    // outbox so they survive being saved offline. Writing them again here
    // would duplicate the write and bypass that queue.
    await onSubmit(formData, linkedProductKeys);
    onClose();
  };

  const handleChange = (field: keyof SupplierInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const hasLinkedProducts = linkedProducts.length > 0;
  const showSearchArea = isLinkingActive || hasLinkedProducts;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Section 1: Supplier Profile */}
        <Stack gap={6}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            {t('Supplier Profile')}
          </Text>

          <Stack gap="sm">
            <TextInput
              label={t('Business Name')}
              placeholder={t('e.g. Colombo Mobile Parts')}
              leftSection={<IconBuildingStore size={16} />}
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.currentTarget.value)}
              error={errors.name}
            />

            <div>
              <TagsInput
                label={t('What They Supply (Tags & Categories)')}
                placeholder={t('Select or type tags (e.g. Phone Parts, Screen Protectors)')}
                data={DEFAULT_SUGGESTED_TAGS}
                leftSection={<IconTag size={16} />}
                required
                clearable
                value={formData.suppliedCategories}
                onChange={(val) => handleChange('suppliedCategories', val)}
                error={errors.suppliedCategories}
              />
              <Text size="xs" c="dimmed" mt={4}>
                {t(
                  'Categories or items they provide. Helps you quickly filter suppliers when\n                                              restocking.'
                )}
              </Text>
            </div>
          </Stack>
        </Stack>

        {/* Section 2: Contact & Location */}
        <Stack gap={6}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            {t('Contact & Location')}
          </Text>

          <Stack gap="sm">
            <Grid gap="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t('Contact Person')}
                  placeholder={t('e.g. Ranjith Kumara')}
                  leftSection={<IconUser size={16} />}
                  required
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.currentTarget.value)}
                  error={errors.contactPerson}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t('Email Address')}
                  placeholder={t('e.g. contact@supplier.lk')}
                  leftSection={<IconMail size={16} />}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.currentTarget.value)}
                />
              </Grid.Col>
            </Grid>

            <Grid gap="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t('Primary Phone Number')}
                  placeholder={t('e.g. 077 123 4567')}
                  leftSection={<IconPhone size={16} />}
                  required
                  value={formData.primaryPhone}
                  onChange={(e) => handleChange('primaryPhone', e.currentTarget.value)}
                  error={errors.primaryPhone}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t('Backup Phone Number')}
                  placeholder={t('e.g. 011 234 5678')}
                  leftSection={<IconPhone size={16} />}
                  value={formData.secondaryPhone}
                  onChange={(e) => handleChange('secondaryPhone', e.currentTarget.value)}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label={t('Address / Location')}
              placeholder={t('e.g. No. 45, First Cross Street, Pettah, Colombo 11')}
              leftSection={<IconMapPin size={16} />}
              rows={2}
              required
              value={formData.address}
              onChange={(e) => handleChange('address', e.currentTarget.value)}
              error={errors.address}
            />
          </Stack>
        </Stack>

        {/* Section 3: Linked Catalog Products */}
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
                {t('Linked Inventory Products')}
              </Text>
              {hasLinkedProducts && (
                <Badge size="xs" variant="light" color="blue">
                  {linkedProducts.length} {linkedProducts.length === 1 ? 'Product' : 'Products'}{' '}
                  {t('Linked')}
                </Badge>
              )}
            </Group>

            {hasLinkedProducts && !isLinkingActive && (
              <Button
                size="xs"
                variant="subtle"
                color="blue"
                leftSection={<IconPlus size={14} />}
                onClick={handleStartLinking}
              >
                {t('Link Another Product')}
              </Button>
            )}
          </Group>

          {hasLinkedProducts && (
            <Text size="xs" c="dimmed">
              {t(
                'Products supplied by this vendor. Link items to quickly select them during stock\n                                        intakes.'
              )}
            </Text>
          )}

          {!showSearchArea ? (
            /* Dashed Callout Box Empty State */
            <Box
              onClick={handleStartLinking}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartLinking();
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
                    <IconPackage size={18} stroke={1.6} />
                  </ThemeIcon>
                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600} c="var(--text-primary)" lineClamp={1}>
                      {t('Which products does this supplier provide?')}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {t(
                        'Connect inventory items you purchase from this supplier. You can skip this.'
                      )}
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
                    handleStartLinking();
                  }}
                  style={{ flexShrink: 0 }}
                >
                  {t('Link Products')}
                </Button>
              </Group>
            </Box>
          ) : (
            <Stack gap="xs">
              {/* Quick Search and Add Input */}
              <TextInput
                ref={searchInputRef}
                placeholder={t('Search products to link by name, SKU, or category…')}
                leftSection={<IconSearch size={16} />}
                size="sm"
                value={productSearch}
                onChange={(e) => setProductSearch(e.currentTarget.value)}
                rightSection={
                  productSearch ? (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => setProductSearch('')}
                      aria-label={t('Clear search')}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : null
                }
              />

              {/* Search Suggestions Dropdown */}
              {productSearch && (
                <Paper
                  withBorder
                  p="xs"
                  radius="var(--mantine-radius-default)"
                  bg="light-dark(var(--bg-card), var(--mantine-color-dark-7))"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <ScrollArea.Autosize
                    mah={160}
                    classNames={{ viewport: 'scrollarea-fluid-content' }}
                  >
                    <Stack gap={4}>
                      {availableProducts.length === 0 ? (
                        <Center py="sm">
                          <Text size="xs" c="dimmed">
                            {t('No unlinked products match &quot;')}
                            {productSearch}
                            {t('&quot;')}
                          </Text>
                        </Center>
                      ) : (
                        availableProducts.slice(0, 10).map((p) => (
                          <Paper
                            key={p.key}
                            p="xs"
                            radius="var(--mantine-radius-default)"
                            onClick={() => addProduct(p.key)}
                            style={{
                              border: '1px solid var(--mantine-color-default-border)',
                              cursor: 'pointer',
                              transition: 'background-color 120ms ease',
                            }}
                          >
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                                <ThemeIcon
                                  size={24}
                                  radius="var(--mantine-radius-default)"
                                  variant="light"
                                  color="blue"
                                  style={{ flexShrink: 0 }}
                                >
                                  <IconPlus size={13} />
                                </ThemeIcon>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <Text size="xs" fw={700} lineClamp={1}>
                                    {p.name}
                                  </Text>
                                  <Group gap={4} mt={2}>
                                    <Badge size="xs" variant="light" color="blue">
                                      {p.sku}
                                    </Badge>
                                    <Badge size="xs" variant="outline" color="gray">
                                      {p.subcategory || p.category}
                                    </Badge>
                                  </Group>
                                </div>
                              </Group>
                              <Text
                                size="xs"
                                fw={600}
                                c="var(--text-secondary)"
                                style={{ flexShrink: 0 }}
                              >
                                {formatMoney(p.costPriceCents)}
                              </Text>
                            </Group>
                          </Paper>
                        ))
                      )}
                    </Stack>
                  </ScrollArea.Autosize>
                </Paper>
              )}

              {/* Linked Product Cards List */}
              {hasLinkedProducts && (
                <ScrollArea.Autosize
                  mah={220}
                  classNames={{ viewport: 'scrollarea-fluid-content' }}
                >
                  <Stack gap={6}>
                    {linkedProducts.map((p) => (
                      <Paper
                        key={p.key}
                        withBorder
                        p="xs"
                        radius="var(--mantine-radius-default)"
                        bg="light-dark(var(--bg-card), var(--mantine-color-dark-7))"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <Group justify="space-between" align="center" wrap="nowrap">
                          <Group
                            gap="sm"
                            align="center"
                            wrap="nowrap"
                            style={{ minWidth: 0, flex: 1 }}
                          >
                            <ThemeIcon
                              size={30}
                              radius="var(--mantine-radius-default)"
                              variant="light"
                              color="blue"
                              style={{ flexShrink: 0 }}
                            >
                              <IconPackage size={16} />
                            </ThemeIcon>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <Text size="xs" fw={700} lineClamp={1}>
                                {p.name}
                              </Text>
                              <Group gap={6} mt={2} wrap="wrap">
                                <Badge size="xs" variant="filled" color="blue">
                                  {p.sku}
                                </Badge>
                                <Badge size="xs" variant="light" color="gray">
                                  {p.category} · {p.subcategory}
                                </Badge>
                                <Text size="xs" c="dimmed">
                                  {t('Cost:')}{' '}
                                  <Text span fw={600} c="var(--text-primary)">
                                    {formatMoney(p.costPriceCents)}
                                  </Text>
                                </Text>
                              </Group>
                            </div>
                          </Group>
                          <Tooltip label={t('Remove product link')} position="top" withArrow>
                            <ActionIcon
                              size="sm"
                              color="red"
                              variant="subtle"
                              onClick={() => removeProduct(p.key)}
                              aria-label={`Remove ${p.name}`}
                            >
                              <IconTrash size={15} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              )}

              {/* Live Summary Stat Strip */}
              {hasLinkedProducts && (
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
                        <IconPackage size={13} />
                      </ThemeIcon>
                      <Text size="xs" c="var(--text-secondary)">
                        {t('Total Linked Products:')}{' '}
                        <Text span fw={700} c="var(--text-primary)">
                          {linkedProducts.length} {linkedProducts.length === 1 ? 'Item' : 'Items'}
                        </Text>
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {t('Ready for stock intake & purchase orders')}
                    </Text>
                  </Group>
                </Paper>
              )}
            </Stack>
          )}
        </Stack>

        {/* Section 4: Terms & Notes */}
        <Stack gap={6}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            {t('Terms & Notes')}
          </Text>

          <Textarea
            label={t('Additional Notes / Terms')}
            placeholder={t('e.g. Free delivery on orders over 50 units. Delivers every Tuesday.')}
            rows={2}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.currentTarget.value)}
          />
        </Stack>

        {/* Footer Actions */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('Cancel')}
          </Button>
          <Button type="submit" color="blue" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Supplier'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export const SupplierFormModal = ({
  opened,
  onClose,
  onSubmit,
  supplierToEdit,
  loading = false,
}: SupplierFormModalProps) => {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {supplierToEdit ? `Edit: ${supplierToEdit.name}` : 'Register New Supplier'}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      {opened && (
        <SupplierFormContent
          key={supplierToEdit ? supplierToEdit.id : 'new-supplier'}
          supplierToEdit={supplierToEdit}
          onClose={onClose}
          onSubmit={onSubmit}
          loading={loading}
        />
      )}
    </Modal>
  );
};
