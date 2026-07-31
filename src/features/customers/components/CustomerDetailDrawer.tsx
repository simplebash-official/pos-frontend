import { Stack, Group, Text, Badge, Paper, Divider, Button, ThemeIcon } from '@mantine/core';
import {
  IconUser,
  IconMapPin,
  IconTag,
  IconMail,
  IconEdit,
  IconTrash,
  IconCalendar,
} from '@tabler/icons-react';
import { Customer } from '../types';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';

export interface CustomerDetailDrawerProps {
  customer: Customer | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerDetailDrawer({
  customer,
  opened,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailDrawerProps) {
  return (
    <DetailDrawer
      data={customer}
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon
            color="violet"
            variant="light"
            size="lg"
            radius="var(--mantine-radius-default)"
          >
            <IconUser size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              Customer Profile
            </Text>
            <Text size="xs" c="dimmed">
              Client Specifications & Account History
            </Text>
          </div>
        </Group>
      }
    >
      {(c) => (
        <Stack gap="md" pt="xs">
          {/* Header Banner */}
          <Paper
            p="md"
            radius="var(--mantine-radius-default)"
            withBorder
            bg="var(--mantine-color-body)"
          >
            <Text fw={800} size="lg" mb={4}>
              {c.name}
            </Text>
            <Group gap="xs" mb="xs">
              <IconUser size={16} style={{ color: 'var(--mantine-color-violet-6)' }} />
              <Text size="sm" fw={600} c="violet">
                {c.contactPerson}
              </Text>
              <Text size="xs" c="dimmed">
                (Primary Contact)
              </Text>
            </Group>
            {c.email && (
              <Group gap="xs">
                <IconMail size={14} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  {c.email}
                </Text>
              </Group>
            )}
          </Paper>

          {/* Financial Summary */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Financial & Account Volume
          </Text>
          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">
                  Total Purchases
                </Text>
                <Text fw={800} size="md">
                  {formatMoney(c.totalPurchasesCents)}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Balance Due
                </Text>
                <Badge
                  color={c.outstandingBalanceCents > 0 ? 'red' : 'green'}
                  variant="light"
                  size="md"
                  radius="var(--mantine-radius-default)"
                >
                  {formatMoney(c.outstandingBalanceCents)}
                </Badge>
              </div>
            </Group>
          </Paper>

          {/* Contact Numbers */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Contact Phone Numbers
          </Text>
          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <PhoneDisplay
              primaryPhone={c.primaryPhone}
              secondaryPhone={c.secondaryPhone}
              layout="stack"
            />
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
                  {c.address}
                </Text>
              </div>
            </Group>
          </Paper>

          {/* Customer Tags */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Account Type & Tags
          </Text>
          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <Group gap={6}>
              <IconTag size={16} style={{ opacity: 0.6 }} />
              {c.tags.map((tag) => (
                <Badge
                  key={tag}
                  color="violet"
                  variant="light"
                  size="sm"
                  radius="var(--mantine-radius-default)"
                >
                  {tag}
                </Badge>
              ))}
            </Group>
          </Paper>

          {/* Notes */}
          {c.notes && (
            <>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Notes & Client Preferences
              </Text>
              <Paper
                p="sm"
                withBorder
                radius="var(--mantine-radius-default)"
                style={{ backgroundColor: 'var(--mantine-color-body)' }}
              >
                <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                  {c.notes}
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
                {formatDateTime(c.createdAt)}
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
                {formatDateTime(c.updatedAt)}
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
              onClick={() => onDelete(c)}
            >
              Delete Profile
            </Button>

            <Group gap="sm">
              <Button variant="default" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                color="violet"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => onEdit(c)}
              >
                Edit Details
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </DetailDrawer>
  );
}
