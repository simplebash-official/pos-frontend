import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  MultiSelect,
  Grid,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { Customer, CustomerInput } from '../types';
import { PRESET_CUSTOMER_TAGS } from '../api/mockCustomers';

export interface CustomerFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerInput) => Promise<void>;
  customerToEdit?: Customer | null;
  loading?: boolean;
}

export function CustomerFormModal({
  opened,
  onClose,
  onSubmit,
  customerToEdit,
  loading = false,
}: CustomerFormModalProps) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setContactPerson(customerToEdit.contactPerson || '');
      setPrimaryPhone(customerToEdit.primaryPhone);
      setSecondaryPhone(customerToEdit.secondaryPhone || '');
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address);
      setTags(customerToEdit.tags || []);
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setPrimaryPhone('');
      setSecondaryPhone('');
      setEmail('');
      setAddress('');
      setTags(['Retail Client']);
      setNotes('');
    }
    setErrors({});
  }, [customerToEdit, opened]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Customer / Business Name is required';
    if (!contactPerson.trim()) newErrors.contactPerson = 'Contact Person is required';
    if (!primaryPhone.trim()) newErrors.primaryPhone = 'Primary Phone Number is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      primaryPhone: primaryPhone.trim(),
      secondaryPhone: secondaryPhone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim(),
      tags,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={customerToEdit ? 'Edit Customer Profile' : 'Add New Customer Profile'}
      size="lg"
      radius="var(--mantine-radius-default)"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Customer / Business Name"
                placeholder="e.g. Saman Perera or ABC Enterprises"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                error={errors.name}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Contact Person"
                placeholder="Actual human contact"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.currentTarget.value)}
                error={errors.contactPerson}
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Primary Phone Number"
                placeholder="e.g. 077 123 4567"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.currentTarget.value)}
                error={errors.primaryPhone}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Backup / Secondary Phone"
                placeholder="Optional backup line"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Email Address"
            placeholder="Optional e.g. client@domain.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <TextInput
            label="Physical Address / Location"
            placeholder="Full address for deliveries, visits, or returns"
            value={address}
            onChange={(e) => setAddress(e.currentTarget.value)}
            error={errors.address}
            required
          />

          <MultiSelect
            label="Customer Tags / Account Type"
            placeholder="Select customer tags"
            data={PRESET_CUSTOMER_TAGS}
            value={tags}
            onChange={setTags}
            searchable
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
            <Button type="submit" loading={loading} color="violet">
              {customerToEdit ? 'Save Changes' : 'Create Customer'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
