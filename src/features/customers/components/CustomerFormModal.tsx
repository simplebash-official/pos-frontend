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
  Paper,
  Badge,
} from '@mantine/core';
import {
  IconUser,
  IconUserCheck,
  IconPhone,
  IconPhoneCall,
  IconMail,
  IconMapPin,
  IconTag,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { Customer, CustomerInput } from '../types';
import { useCustomerTags } from '../hooks/useCustomers';
import { PRESET_CUSTOMER_TAGS } from '../constants';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { ApiError } from '@/shared/types/common';

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
  const isEditing = Boolean(customerToEdit);
  const isMobile = useIsMobile();
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
      newErrors.primaryPhone = 'Primary phone number is required';
    } else if (!/^[0-9+\s-]{9,15}$/.test(trimmedPrimaryPhone)) {
      newErrors.primaryPhone = 'A phone number should be 9 to 15 digits (e.g. 077 123 4567)';
    }

    const trimmedSecondaryPhone = secondaryPhone.trim();
    if (trimmedSecondaryPhone && !/^[0-9+\s-]{9,15}$/.test(trimmedSecondaryPhone)) {
      newErrors.secondaryPhone = 'A backup phone should be 9 to 15 digits';
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      const isValidEmail =
        trimmedEmail.includes('@') &&
        !trimmedEmail.includes(' ') &&
        trimmedEmail.split('@')[1]?.includes('.');
      if (!isValidEmail) {
        newErrors.email = 'Please enter a valid email address (e.g. client@example.com)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CustomerInput = {
      name: name.trim(),
      primaryPhone: primaryPhone.trim(),
      contactPerson: contactPerson.trim() || undefined,
      secondaryPhone: secondaryPhone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      handleApiError(err);
    }
  };

  const handleApiError = (err: unknown) => {
    const apiError = err as ApiError | undefined;
    const message =
      apiError?.message ?? (err instanceof Error ? err.message : 'Failed to save customer profile');

    if (message.toLowerCase().includes('phone')) {
      setErrors((prev) => ({ ...prev, primaryPhone: message }));
    } else if (message.toLowerCase().includes('email')) {
      setErrors((prev) => ({ ...prev, email: message }));
    } else if (message.toLowerCase().includes('name')) {
      setErrors((prev) => ({ ...prev, name: message }));
    } else {
      notifications.show({
        title: 'Error Saving Customer',
        message,
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Edit Mode Account Context Banner */}
        {isEditing && customerToEdit && (
          <Paper
            withBorder
            p="sm"
            radius="var(--mantine-radius-default)"
            bg="var(--mantine-color-default-hover)"
          >
            <Grid align="center" gap="sm">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Outstanding Balance
                  </Text>
                  <Group gap="xs" align="center">
                    <Text
                      size="sm"
                      fw={700}
                      c={customerToEdit.outstandingBalanceCents > 0 ? 'red' : 'teal'}
                    >
                      {formatMoney(customerToEdit.outstandingBalanceCents)}
                    </Text>
                    <Badge
                      size="xs"
                      color={customerToEdit.outstandingBalanceCents > 0 ? 'red' : 'teal'}
                      variant="light"
                    >
                      {customerToEdit.outstandingBalanceCents > 0 ? 'Due' : 'Settled'}
                    </Badge>
                  </Group>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Total Purchases
                  </Text>
                  <Text size="sm" fw={700} c="blue">
                    {formatMoney(customerToEdit.totalPurchasesCents || 0)}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Account Details
                  </Text>
                  <Text size="xs" fw={600} c="dimmed">
                    Key: {customerToEdit.key} · Joined {formatDate(customerToEdit.createdAt)}
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>
        )}

        {/* Section 1: General Information */}
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            General Information
          </Text>
          <Grid gap="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Customer / Business Name"
                placeholder="e.g. Saman Perera or Apex Technologies"
                description="The person or business name printed on receipts and invoices."
                leftSection={<IconUser size={16} />}
                value={name}
                onChange={(e) => {
                  setName(e.currentTarget.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                autoFocus={!isMobile}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Contact Person"
                placeholder="e.g. Mr. Sunil (Manager)"
                description="Person to speak with for business or corporate accounts."
                leftSection={<IconUserCheck size={16} />}
                value={contactPerson}
                onChange={(e) => {
                  setContactPerson(e.currentTarget.value);
                  if (errors.contactPerson) setErrors((prev) => ({ ...prev, contactPerson: '' }));
                }}
                error={errors.contactPerson}
              />
            </Grid.Col>
          </Grid>
        </Stack>

        {/* Section 2: Contact & Location */}
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Contact & Location
          </Text>
          <Grid gap="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Primary Phone Number"
                placeholder="e.g. 077 123 4567"
                description="Primary contact for lookup at checkout and SMS alerts."
                leftSection={<IconPhone size={16} />}
                value={primaryPhone}
                onChange={(e) => {
                  setPrimaryPhone(e.currentTarget.value);
                  if (errors.primaryPhone) setErrors((prev) => ({ ...prev, primaryPhone: '' }));
                }}
                error={errors.primaryPhone}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Backup / Secondary Phone"
                placeholder="e.g. 011 234 5678"
                description="Alternative mobile, landline, or WhatsApp number."
                leftSection={<IconPhoneCall size={16} />}
                value={secondaryPhone}
                onChange={(e) => {
                  setSecondaryPhone(e.currentTarget.value);
                  if (errors.secondaryPhone) setErrors((prev) => ({ ...prev, secondaryPhone: '' }));
                }}
                error={errors.secondaryPhone}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email Address"
                placeholder="client@example.com"
                description="For emailing digital receipts and account statements."
                leftSection={<IconMail size={16} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Physical Address / Location"
                placeholder="e.g. No. 45, Main Street, Colombo"
                description="Delivery address, town, or workshop location."
                leftSection={<IconMapPin size={16} />}
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>
        </Stack>

        {/* Section 3: Classification & Tags */}
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Account Classification
          </Text>
          <TagsInput
            label="Customer Tags / Account Type"
            placeholder="Select or type tags (e.g. Retail Client, VIP Customer)"
            description="Categorize clients for special pricing, credit terms, or marketing."
            leftSection={<IconTag size={16} />}
            data={availableTags}
            value={tags}
            onChange={setTags}
            clearable
          />
          <div>
            <Text size="xs" c="dimmed" mb={6}>
              Suggested presets:
            </Text>
            <Group gap="xs" wrap="wrap">
              {PRESET_CUSTOMER_TAGS.map((presetTag) => {
                const isActive = tags.includes(presetTag);
                return (
                  <Button
                    key={presetTag}
                    size="xs"
                    variant={isActive ? 'light' : 'default'}
                    color={isActive ? 'blue' : undefined}
                    radius="xl"
                    onClick={() => {
                      setTags((prev) =>
                        isActive ? prev.filter((t) => t !== presetTag) : [...prev, presetTag]
                      );
                    }}
                  >
                    {presetTag}
                  </Button>
                );
              })}
            </Group>
          </div>
        </Stack>

        {/* Section 5: Notes & Special Instructions */}
        <Stack gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Notes & Instructions
          </Text>
          <Textarea
            label="Notes & Special Instructions"
            placeholder="Special billing terms, repair preferences, delivery notes, or customer remarks..."
            description="Internal notes visible to cashiers and repair technicians."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />
        </Stack>

        {/* Action Footer */}
        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" color="blue" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
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
  const isEditing = Boolean(customerToEdit);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {isEditing && customerToEdit
            ? `Edit: ${customerToEdit.name}`
            : 'Add New Customer Profile'}
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
