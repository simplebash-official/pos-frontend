import { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  TagsInput,
  Button,
  Group,
  Stack,
  Grid,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconUser,
  IconPhone,
  IconMapPin,
  IconTag,
  IconMail,
} from '@tabler/icons-react';
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
