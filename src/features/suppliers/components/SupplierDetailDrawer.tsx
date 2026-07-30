import {
  Drawer,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Divider,
  Button,
  ThemeIcon,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconUser,
  IconPhone,
  IconMapPin,
  IconTag,
  IconMail,
  IconEdit,
  IconTrash,
  IconCopy,
  IconCheck,
  IconCalendar,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { Supplier } from '../types';
import { formatDateTime } from '@/shared/lib/date';

export interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierDetailDrawer({
  supplier,
  opened,
  onClose,
  onEdit,
  onDelete,
}: SupplierDetailDrawerProps) {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  if (!supplier) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    notifications.show({
      title: 'Copied!',
      message: `${label} copied to clipboard: ${text}`,
      color: 'teal',
      icon: <IconCheck size={16} />,
    });
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      padding="lg"
      title={
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="lg" radius="md">
            <IconBuildingStore size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              Supplier Profile
            </Text>
            <Text size="xs" c="dimmed">
              Vendor Specifications & Contacts
            </Text>
          </div>
        </Group>
      }
    >
      <Stack gap="md" pt="xs">
        {/* Header Banner */}
        <Paper p="md" radius="md" withBorder bg="var(--mantine-color-body)">
          <Text fw={800} size="lg" mb={4}>
            {supplier.name}
          </Text>
          <Group gap="xs" mb="xs">
            <IconUser size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Text size="sm" fw={600} c="blue">
              {supplier.contactPerson}
            </Text>
            <Text size="xs" c="dimmed">
              (Representative Contact)
            </Text>
          </Group>
          {supplier.email && (
            <Group gap="xs">
              <IconMail size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                {supplier.email}
              </Text>
            </Group>
          )}
        </Paper>

        {/* Contact Numbers */}
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Contact Phone Numbers
        </Text>
        <Paper p="sm" withBorder radius="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconPhone size={16} style={{ color: 'var(--mantine-color-teal-6)' }} />
                <div>
                  <Text size="xs" c="dimmed">
                    Primary Phone
                  </Text>
                  <Text size="sm" fw={700}>
                    {supplier.primaryPhone}
                  </Text>
                </div>
              </Group>
              <Tooltip label="Copy Primary Phone">
                <ActionIcon
                  variant="light"
                  color={copiedPhone === supplier.primaryPhone ? 'teal' : 'gray'}
                  onClick={() => copyToClipboard(supplier.primaryPhone, 'Primary Phone')}
                >
                  {copiedPhone === supplier.primaryPhone ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>

            {supplier.secondaryPhone && (
              <>
                <Divider />
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconPhone size={16} style={{ opacity: 0.6 }} />
                    <div>
                      <Text size="xs" c="dimmed">
                        Backup / Secondary Phone
                      </Text>
                      <Text size="sm" fw={600}>
                        {supplier.secondaryPhone}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label="Copy Backup Phone">
                    <ActionIcon
                      variant="light"
                      color={copiedPhone === supplier.secondaryPhone ? 'teal' : 'gray'}
                      onClick={() => copyToClipboard(supplier.secondaryPhone!, 'Backup Phone')}
                    >
                      {copiedPhone === supplier.secondaryPhone ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </>
            )}
          </Stack>
        </Paper>

        {/* Address */}
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Physical Location / Address
        </Text>
        <Paper p="sm" withBorder radius="md">
          <Group gap="xs" align="flex-start">
            <IconMapPin size={18} style={{ color: 'var(--mantine-color-red-6)', marginTop: 2 }} />
            <div>
              <Text size="sm" fw={500}>
                {supplier.address}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* What They Supply Tags */}
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          What They Supply (Categories & Tags)
        </Text>
        <Paper p="sm" withBorder radius="md">
          <Group gap={6}>
            <IconTag size={16} style={{ opacity: 0.6 }} />
            {supplier.suppliedCategories.map((cat) => (
              <Badge key={cat} color="blue" variant="light" size="sm">
                {cat}
              </Badge>
            ))}
          </Group>
        </Paper>

        {/* Notes */}
        {supplier.notes && (
          <>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Notes & Special Instructions
            </Text>
            <Paper p="sm" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
              <Text size="sm" c="dimmed" style={{ whitespace: 'pre-wrap' }}>
                {supplier.notes}
              </Text>
            </Paper>
          </>
        )}

        <Divider my="xs" />

        {/* Metadata */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <IconCalendar size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                Registered On
              </Text>
            </Group>
            <Text size="xs" fw={600}>
              {formatDateTime(supplier.createdAt)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Group gap="xs">
              <IconCalendar size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                Last Updated
              </Text>
            </Group>
            <Text size="xs" fw={600}>
              {formatDateTime(supplier.updatedAt)}
            </Text>
          </Group>
        </Stack>

        <Divider my="xs" />

        {/* Actions */}
        <Group justify="space-between" mt="sm">
          <Button
            variant="light"
            color="red"
            size="sm"
            leftSection={<IconTrash size={16} />}
            onClick={() => onDelete(supplier)}
          >
            Delete
          </Button>

          <Group gap="sm">
            <Button variant="default" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              color="blue"
              size="sm"
              leftSection={<IconEdit size={16} />}
              onClick={() => onEdit(supplier)}
            >
              Edit Details
            </Button>
          </Group>
        </Group>
      </Stack>
    </Drawer>
  );
}
