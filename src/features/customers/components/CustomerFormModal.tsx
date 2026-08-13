import { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Grid,
  TagsInput,
  Text,
} from '@mantine/core';
import { IconUser, IconPhone, IconMail, IconMapPin, IconTag } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { Customer, CustomerInput } from '../types';
import { useCustomerTags } from '../hooks/useCustomers';

export interface CustomerFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerInput) => Promise<void>;
  customerToEdit?: Customer | null;
  loading?: boolean;
}

interface FormContentProps {
  customerToEdit?: Customer | null;
  onClose: () => void;
  onSubmit: (values: CustomerInput) => Promise<void>;
  loading?: boolean;
}

const CustomerFormContent = ({
  customerToEdit,
  onClose,
  onSubmit,
  loading = false,
}: FormContentProps) => {
  const availableTags = useCustomerTags();

  const [name, setName] = useState(customerToEdit?.name || '');
  const [contactPerson, setContactPerson] = useState(customerToEdit?.contactPerson || '');
  const [primaryPhone, setPrimaryPhone] = useState(customerToEdit?.primaryPhone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(customerToEdit?.secondaryPhone || '');
  const [email, setEmail] = useState(customerToEdit?.email || '');
  const [address, setAddress] = useState(customerToEdit?.address || '');
  const [tags, setTags] = useState<string[]>(customerToEdit?.tags || ['Retail Client']);
  const [notes, setNotes] = useState(customerToEdit?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Customer / Business Name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Customer name must be at least 2 characters';
    }

    const trimmedPrimaryPhone = primaryPhone.trim();
    if (!trimmedPrimaryPhone) {
      newErrors.primaryPhone = 'Primary Phone Number is required';
    } else if (!/^[\d\s+-]+$/.test(trimmedPrimaryPhone)) {
      newErrors.primaryPhone = 'Phone may only contain digits, spaces, dashes, and +';
    }

    const trimmedSecondaryPhone = secondaryPhone.trim();
    if (trimmedSecondaryPhone && !/^[\d\s+-]+$/.test(trimmedSecondaryPhone)) {
      newErrors.secondaryPhone = 'Phone may only contain digits, spaces, dashes, and +';
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      const isValidEmail =
        trimmedEmail.includes('@') &&
        !trimmedEmail.includes(' ') &&
        trimmedEmail.split('@')[1]?.includes('.');
      if (!isValidEmail) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      primaryPhone: primaryPhone.trim(),
      contactPerson: contactPerson.trim() || undefined,
      secondaryPhone: secondaryPhone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      tags,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Customer / Business Name"
              placeholder="e.g. Saman Perera or ABC Enterprises"
              leftSection={<IconUser size={16} />}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              error={errors.name}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Contact Person"
              placeholder="Actual human contact (optional)"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.currentTarget.value)}
              error={errors.contactPerson}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Primary Phone Number"
              placeholder="e.g. 077 123 4567"
              leftSection={<IconPhone size={16} />}
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.currentTarget.value)}
              error={errors.primaryPhone}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Backup / Secondary Phone"
              placeholder="Optional secondary line"
              value={secondaryPhone}
              onChange={(e) => setSecondaryPhone(e.currentTarget.value)}
              error={errors.secondaryPhone}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Email Address"
              placeholder="client@domain.com (optional)"
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              error={errors.email}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Physical Address / Location"
              placeholder="Delivery address (optional)"
              leftSection={<IconMapPin size={16} />}
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
            />
          </Grid.Col>
        </Grid>

        <TagsInput
          label="Customer Tags / Account Type"
          placeholder="Type or select tags (e.g. Retail, VIP)"
          leftSection={<IconTag size={16} />}
          data={availableTags}
          value={tags}
          onChange={setTags}
          clearable
        />

        <Textarea
          label="Notes & Special Instructions"
          placeholder="Preferences, credit terms, repair notes, etc."
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={3}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {customerToEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export const CustomerFormModal = ({
  opened,
  onClose,
  onSubmit,
  customerToEdit,
  loading = false,
}: CustomerFormModalProps) => {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {customerToEdit ? 'Edit Customer Profile' : 'Add New Customer Profile'}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      {opened && (
        <CustomerFormContent
          key={customerToEdit ? customerToEdit.id : 'new-customer'}
          customerToEdit={customerToEdit}
          onClose={onClose}
          onSubmit={onSubmit}
          loading={loading}
        />
      )}
    </Modal>
  );
};
