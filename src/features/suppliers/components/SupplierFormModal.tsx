import { useState, useMemo } from 'react';
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
  IconX,
  IconSearch,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { getLinksForSupplier, setLinksForSupplier } from '@/features/supplier-products/api/mockSupplierProducts';
import { formatMoney } from '@/shared/lib/money';
import { Supplier, SupplierInput } from '../types';

export interface SupplierFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: SupplierInput) => Promise<void>;
  supplierToEdit?: Supplier | null;
  loading?: boolean;
}

const DEFAULT_SUGGESTED_TAGS = [
  'Phone Parts',
  'Mug Blanks',
  'Paper & Ink',
  'General Stationery',
  'T-Shirt Blanks',
  'Display Assemblies',
  'Batteries',
  'Screen Protectors',
  'Charging Cables',
  'Receipt Rolls',
  'Packaging Boxes',
  'Solvent Inks',
  'Repair Tools',
];

interface FormContentProps {
  supplierToEdit?: Supplier | null;
  onClose: () => void;
  onSubmit: (values: SupplierInput) => Promise<void>;
  loading?: boolean;
}

function SupplierFormContent({
  supplierToEdit,
  onClose,
  onSubmit,
  loading = false,
}: FormContentProps) {
  const isEditing = Boolean(supplierToEdit);

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
  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  const { data: existingLinks = [] } = useQuery({
    queryKey: queryKeys.supplierProducts.bySupplier(supplierToEdit?.id ?? ''),
    queryFn: () => getLinksForSupplier(supplierToEdit!.id),
    enabled: !!supplierToEdit?.id,
  });

  const [linkedProductIds, setLinkedProductIds] = useState<string[]>(
    existingLinks.map((l) => l.productId),
  );

  // Sync once existingLinks loads
  const [synced, setSynced] = useState(false);
  if (existingLinks.length > 0 && !synced) {
    setLinkedProductIds(existingLinks.map((l) => l.productId));
    setSynced(true);
  }

  const [productSearch, setProductSearch] = useState('');

  const availableProducts = useMemo(() => {
    const linkedSet = new Set(linkedProductIds);
    return allProducts
      .filter((p) => !linkedSet.has(p.id))
      .filter((p) => {
        if (!productSearch) return true;
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
        );
      });
  }, [allProducts, linkedProductIds, productSearch]);

  const linkedProducts = useMemo(() => {
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    return linkedProductIds
      .map((id) => productMap.get(id))
      .filter(Boolean) as typeof allProducts;
  }, [allProducts, linkedProductIds]);

  const addProduct = (id: string) => setLinkedProductIds((prev) => [...prev, id]);
  const removeProduct = (id: string) => setLinkedProductIds((prev) => prev.filter((pid) => pid !== id));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business Name is required (e.g. "Colombo Mobile Parts")';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required (e.g. "Ranjith Kumara")';
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Primary phone number is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address or location is required';
    }
    if (!formData.suppliedCategories || formData.suppliedCategories.length === 0) {
      newErrors.suppliedCategories = 'Specify at least one supply tag (e.g. "Phone Parts")';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(formData);

    // Save product links after the supplier is created/updated
    if (supplierToEdit) {
      await setLinksForSupplier(supplierToEdit.id, linkedProductIds);
    }
    // For new suppliers, the caller needs to handle linking after creation
    // since we don't have the ID yet. We store the IDs on the form for now.

    onClose();
  };

  const handleChange = (field: keyof SupplierInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Business Name */}
        <TextInput
          label="Business Name"
          description="Company or store name (e.g. 'Colombo Mobile Parts', not just a person's name)"
          placeholder="e.g. Colombo Mobile Parts"
          leftSection={<IconBuildingStore size={16} />}
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.currentTarget.value)}
          error={errors.name}
        />

        <Grid>
          {/* Contact Person */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Contact Person"
              description="The human representative you deal with"
              placeholder="e.g. Ranjith Kumara"
              leftSection={<IconUser size={16} />}
              required
              value={formData.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.currentTarget.value)}
              error={errors.contactPerson}
            />
          </Grid.Col>

          {/* Email */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Email Address"
              placeholder="e.g. contact@supplier.lk"
              leftSection={<IconMail size={16} />}
              value={formData.email}
              onChange={(e) => handleChange('email', e.currentTarget.value)}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          {/* Primary Phone */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Primary Phone Number"
              placeholder="e.g. 077 123 4567"
              leftSection={<IconPhone size={16} />}
              required
              value={formData.primaryPhone}
              onChange={(e) => handleChange('primaryPhone', e.currentTarget.value)}
              error={errors.primaryPhone}
            />
          </Grid.Col>

          {/* Backup Phone */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Backup Phone Number"
              description="Secondary / office landline"
              placeholder="e.g. 011 234 5678"
              leftSection={<IconPhone size={16} />}
              value={formData.secondaryPhone}
              onChange={(e) => handleChange('secondaryPhone', e.currentTarget.value)}
            />
          </Grid.Col>
        </Grid>

        {/* Address */}
        <Textarea
          label="Address / Location"
          description="Physical location useful for visits, pickups, or returns"
          placeholder="e.g. No. 45, First Cross Street, Pettah, Colombo 11"
          leftSection={<IconMapPin size={16} />}
          rows={2}
          required
          value={formData.address}
          onChange={(e) => handleChange('address', e.currentTarget.value)}
          error={errors.address}
        />

        {/* What They Supply Tags */}
        <TagsInput
          label="What They Supply (Tags & Categories)"
          description="Categories or items they sell (e.g. 'phone parts', 'mug blanks', 'paper/ink'). Helps you quickly filter who sells what."
          placeholder="Type tag and press Enter"
          data={DEFAULT_SUGGESTED_TAGS}
          leftSection={<IconTag size={16} />}
          required
          clearable
          value={formData.suppliedCategories}
          onChange={(val) => handleChange('suppliedCategories', val)}
          error={errors.suppliedCategories}
        />

        {/* Notes */}
        <Textarea
          label="Additional Notes / Terms"
          placeholder="e.g. Free delivery on orders over 50 units. Delivers every Tuesday."
          rows={2}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.currentTarget.value)}
        />

        {/* Linked Products */}
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={700}>
              <IconPackage size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Linked Products ({linkedProducts.length})
            </Text>
          </Group>

          {linkedProducts.length > 0 && (
            <Stack gap={4}>
              {linkedProducts.map((p) => (
                <Paper
                  key={p.id}
                  p="xs"
                  withBorder
                  radius="var(--mantine-radius-default)"
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" fw={700} lineClamp={1}>
                        {p.name}
                      </Text>
                      <Group gap={4} mt={2}>
                        <Badge size="xs" variant="filled" color="blue">
                          {p.sku}
                        </Badge>
                        <Badge size="xs" variant="light" color="gray">
                          {p.subcategory}
                        </Badge>
                      </Group>
                    </div>
                    <Tooltip label="Remove" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => removeProduct(p.id)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Quick product search and add */}
          <TextInput
            placeholder="Search products to link…"
            leftSection={<IconSearch size={14} />}
            size="xs"
            value={productSearch}
            onChange={(e) => setProductSearch(e.currentTarget.value)}
          />

          {productSearch && (
            <ScrollArea.Autosize mah={150}>
              <Stack gap={2}>
                {availableProducts.length === 0 ? (
                  <Center py="xs">
                    <Text size="xs" c="dimmed">
                      No matching products found.
                    </Text>
                  </Center>
                ) : (
                  availableProducts.slice(0, 8).map((p) => (
                    <Paper
                      key={p.id}
                      p="4px 8px"
                      radius="var(--mantine-radius-default)"
                      className="hover-card"
                      onClick={() => {
                        addProduct(p.id);
                        setProductSearch('');
                      }}
                      style={{ border: '1px solid var(--mantine-color-default-border)' }}
                    >
                      <Group gap={6} wrap="nowrap">
                        <IconPlus size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Text size="xs" fw={600} lineClamp={1}>
                            {p.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {p.sku} · {formatMoney(p.costPriceCents)}
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </Stack>

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" color="blue" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Supplier'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function SupplierFormModal({
  opened,
  onClose,
  onSubmit,
  supplierToEdit,
  loading = false,
}: SupplierFormModalProps) {
  const isEditing = Boolean(supplierToEdit);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Supplier Details' : 'Register New Supplier'}
      size="lg"
      centered
      radius="md"
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
}
