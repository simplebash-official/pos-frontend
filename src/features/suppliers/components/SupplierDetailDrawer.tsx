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
  const [cachedSupplier, setCachedSupplier] = useState<Supplier | null>(supplier);

  if (supplier && supplier !== cachedSupplier) {
    setCachedSupplier(supplier);
  }

  const activeSupplier = supplier || cachedSupplier;

  if (!activeSupplier) return null;

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
          <ThemeIcon color="blue" variant="light" size="lg" radius="var(--mantine-radius-default)">
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
        <Paper p="md" radius="var(--mantine-radius-default)" withBorder bg="var(--mantine-color-body)">
          <Text fw={800} size="lg" mb={4}>
            {activeSupplier.name}
          </Text>
          <Group gap="xs" mb="xs">
            <IconUser size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Text size="sm" fw={600} c="blue">
              {activeSupplier.contactPerson}
            </Text>
            <Text size="xs" c="dimmed">
              (Representative Contact)
            </Text>
          </Group>
          {activeSupplier.email && (
            <Group gap="xs">
              <IconMail size={14} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">
                {activeSupplier.email}
              </Text>
            </Group>
          )}
        </Paper>

        {/* Contact Numbers */}
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Contact Phone Numbers
        </Text>
        <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconPhone size={16} style={{ color: 'var(--mantine-color-teal-6)' }} />
                <div>
                  <Text size="xs" c="dimmed">
                    Primary Phone
                  </Text>
                  <Text size="sm" fw={700}>
                    {activeSupplier.primaryPhone}
                  </Text>
                </div>
              </Group>
              <Tooltip label="Copy Primary Phone">
                <ActionIcon
                  variant="light"
                  color={copiedPhone === activeSupplier.primaryPhone ? 'teal' : 'gray'}
                  onClick={() => copyToClipboard(activeSupplier.primaryPhone, 'Primary Phone')}
                >
                  {copiedPhone === activeSupplier.primaryPhone ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>

            {activeSupplier.secondaryPhone && (
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
                        {activeSupplier.secondaryPhone}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label="Copy Backup Phone">
                    <ActionIcon
                      variant="light"
                      color={copiedPhone === activeSupplier.secondaryPhone ? 'teal' : 'gray'}
                      onClick={() => copyToClipboard(activeSupplier.secondaryPhone!, 'Backup Phone')}
                    >
                      {copiedPhone === activeSupplier.secondaryPhone ? <IconCheck size={16} /> : <IconCopy size={16} />}
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
        <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
          <Group gap="xs" align="flex-start">
            <IconMapPin size={18} style={{ color: 'var(--mantine-color-red-6)', marginTop: 2 }} />
            <div>
              <Text size="sm" fw={500}>
                {activeSupplier.address}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* What They Supply Tags */}
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          What They Supply (Categories & Tags)
        </Text>
        <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
          <Group gap={6}>
            <IconTag size={16} style={{ opacity: 0.6 }} />
            {activeSupplier.suppliedCategories.map((cat) => (
              <Badge key={cat} color="blue" variant="light" size="sm" radius="var(--mantine-radius-default)">
                {cat}
              </Badge>
            ))}
          </Group>
        </Paper>

        {/* Notes */}
        {activeSupplier.notes && (
          <>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Notes & Special Instructions
            </Text>
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
              <Text size="sm" c="dimmed" style={{ whitespace: 'pre-wrap' }}>
                {activeSupplier.notes}
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
              {formatDateTime(activeSupplier.createdAt)}
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
              {formatDateTime(activeSupplier.updatedAt)}
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
            onClick={() => onDelete(activeSupplier)}
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
              onClick={() => onEdit(activeSupplier)}
            >
              Edit Details
            </Button>
          </Group>
        </Group>
      </Stack>
    </Drawer>
  );
}
