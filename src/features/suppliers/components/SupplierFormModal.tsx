import { t } from '@/shared/i18n/t';
import { useState, useMemo, useRef } from 'react';
import {
  Alert,
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
  IconAlertCircle,
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
import { Supplier, SupplierInput } from '../types';
import { DEFAULT_SUGGESTED_TAGS } from '../constants';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { adminCostText } from '@/features/inventory/lib/priceTiers';
import { getErrorMessage } from '@/shared/lib/error';

export interface SupplierFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** `linkedProductKeys` is passed only when `linkProducts` is on. */
  onSubmit: (values: SupplierInput, linkedProductKeys?: string[]) => Promise<void>;
  supplierToEdit?: Supplier | null;
  loading?: boolean;
  /**
   * Whether the form offers linking inventory products. Off where the person may register a
   * supplier but not read the supplier-product links (the cash window).
   */
  linkProducts: boolean;
  /** Fills the business name of a new supplier, e.g. the name typed in a dropdown. */
  initialName: string;
}

interface FormContentProps {
  supplierToEdit?: Supplier | null;
  initialName: string;
  onClose: () => void;
  onSubmit: (values: SupplierInput, linkedProductKeys?: string[]) => Promise<void>;
  loading?: boolean;
  /** The "Linked Inventory Products" block, or `null` when linking is off. */
  linkSection: React.ReactNode;
  /** The products chosen in `linkSection`; `undefined` when linking is off. */
  linkedProductKeys: string[] | undefined;
}

const SupplierFormContent = ({
  supplierToEdit,
  initialName,
  onClose,
  onSubmit,
  loading = false,
  linkSection,
  linkedProductKeys,
}: FormContentProps) => {
  const isEditing = Boolean(supplierToEdit);

  const [formData, setFormData] = useState<SupplierInput>({
    name: supplierToEdit ? supplierToEdit.name : initialName,
    contactPerson: supplierToEdit ? supplierToEdit.contactPerson : '',
    primaryPhone: supplierToEdit ? supplierToEdit.primaryPhone : '',
    secondaryPhone: supplierToEdit?.secondaryPhone ?? '',
    address: supplierToEdit ? supplierToEdit.address : '',
    suppliedCategories: supplierToEdit ? supplierToEdit.suppliedCategories : [],
    email: supplierToEdit?.email ?? '',
    notes: supplierToEdit?.notes ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('Please enter the business name (e.g. "Colombo Mobile Parts")');
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = t(
        'Please enter the contact person\'s name (e.g. "Ranjith Kumara")'
      );
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = t('Please enter the primary phone number');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('Please enter the address or physical location');
    }
    if (!formData.suppliedCategories || formData.suppliedCategories.length === 0) {
      newErrors.suppliedCategories = t(
        'Please specify at least one supply tag (e.g. "Phone Parts")'
      );
    }

    const email = formData.email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('Please enter a valid email address (e.g. contact@supplier.lk)');
    }

    const secPhone = formData.secondaryPhone?.trim();
    if (secPhone && !secPhone.split('').every((c) => '0123456789 -+'.includes(c))) {
      newErrors.secondaryPhone = t(
        'Backup phone may only contain digits, spaces, dashes, and a plus sign'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const email = formData.email?.trim();
    const secondaryPhone = formData.secondaryPhone?.trim();
    const notes = formData.notes?.trim();

    const payload: SupplierInput = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      primaryPhone: formData.primaryPhone.trim(),
      address: formData.address.trim(),
      suppliedCategories: formData.suppliedCategories,
      ...(email ? { email } : {}),
      ...(secondaryPhone ? { secondaryPhone } : {}),
      ...(notes ? { notes } : {}),
    };

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      await onSubmit(payload, linkedProductKeys);
      onClose();
    } catch (err) {
      const message = getErrorMessage(err);
      setSubmitError(message);
      const lower = message.toLowerCase();
      if (lower.includes('email')) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (lower.includes('primary phone')) {
        setErrors((prev) => ({ ...prev, primaryPhone: message }));
      } else if (lower.includes('backup phone') || lower.includes('secondary phone')) {
        setErrors((prev) => ({ ...prev, secondaryPhone: message }));
      } else if (lower.includes('name')) {
        setErrors((prev) => ({ ...prev, name: message }));
      } else if (lower.includes('address')) {
        setErrors((prev) => ({ ...prev, address: message }));
      } else if (lower.includes('contact')) {
        setErrors((prev) => ({ ...prev, contactPerson: message }));
      } else if (lower.includes('categor')) {
        setErrors((prev) => ({ ...prev, suppliedCategories: message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SupplierInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {submitError && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertCircle size={16} />}
            title={t('Failed to Save Supplier')}
            withCloseButton
            onClose={() => setSubmitError(null)}
          >
            {submitError}
          </Alert>
        )}
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
                  error={errors.email}
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
                  error={errors.secondaryPhone}
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

        {linkSection}

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
          <Button variant="default" onClick={onClose} disabled={loading || isSubmitting}>
            {t('Cancel')}
          </Button>
          <Button type="submit" color="blue" loading={loading || isSubmitting}>
            {isEditing ? t('Save Changes') : t('Create Supplier')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

/**
 * The form plus its "Linked Inventory Products" block. Kept apart from `SupplierFormContent` so the
 * product and link queries (Admin-only on the server) only run where linking is offered.
 */
const SupplierFormWithLinks = ({
  supplierToEdit,
  initialName,
  onClose,
  onSubmit,
  loading = false,
}: Omit<FormContentProps, 'linkSection' | 'linkedProductKeys'>) => {
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const hasLinkedProducts = linkedProducts.length > 0;
  const showSearchArea = isLinkingActive || hasLinkedProducts;

  const linkSection = (
    <>
      {/* Section 3: Linked Catalog Products */}
      <Stack gap={8}>
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
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
              backgroundColor: 'light-dark(var(--mantine-color-gray-0), rgba(255, 255, 255, 0.02))',
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
                              {adminCostText(p)}
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
              <ScrollArea.Autosize mah={220} classNames={{ viewport: 'scrollarea-fluid-content' }}>
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
                                  {adminCostText(p)}
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
    </>
  );

  return (
    <SupplierFormContent
      supplierToEdit={supplierToEdit}
      initialName={initialName}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
      linkSection={linkSection}
      linkedProductKeys={linkedProductKeys}
    />
  );
};

const SupplierFormPlain = (props: Omit<FormContentProps, 'linkSection' | 'linkedProductKeys'>) => (
  <SupplierFormContent {...props} linkSection={null} linkedProductKeys={undefined} />
);

export const SupplierFormModal = ({
  opened,
  onClose,
  onSubmit,
  supplierToEdit,
  loading = false,
  linkProducts,
  initialName,
}: SupplierFormModalProps) => {
  const isMobile = useIsMobile();
  const Form = linkProducts ? SupplierFormWithLinks : SupplierFormPlain;

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
        <Form
          key={supplierToEdit ? supplierToEdit.id : 'new-supplier'}
          supplierToEdit={supplierToEdit}
          initialName={initialName}
          onClose={onClose}
          onSubmit={onSubmit}
          loading={loading}
        />
      )}
    </Modal>
  );
};
