import { Button, Group, Paper, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';

export interface CustomerChoiceCardProps {
  /** The chosen customer, or `null` until one is chosen. */
  customer: { name: string; phone: string } | null;
  onChoose: () => void;
  /** Whether the record cannot be saved without a customer: adds a red star to the heading. */
  required: boolean;
  /** Why no customer can be accepted yet, shown in red under the card. */
  error?: string;
}

/** Shows who a record is for and opens the customer list to choose or change them. */
export const CustomerChoiceCard = ({
  customer,
  onChoose,
  required,
  error,
}: CustomerChoiceCardProps) => (
  <div>
    <Text size="sm" fw={500} mb={4}>
      {t('Customer')}
      {required && (
        <Text component="span" c="red" aria-hidden="true">
          {' *'}
        </Text>
      )}
    </Text>
    <Paper
      withBorder
      p="sm"
      style={error === undefined ? undefined : { borderColor: 'var(--mantine-color-red-6)' }}
    >
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <IconUser size={20} />
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} lineClamp={1}>
              {customer === null ? t('No customer chosen') : customer.name}
            </Text>
            {customer !== null && (
              <Text size="xs" c="dimmed">
                {customer.phone}
              </Text>
            )}
          </div>
        </Group>
        <Button variant="light" size="xs" onClick={onChoose} style={{ flexShrink: 0 }}>
          {customer === null ? t('Choose customer') : t('Change customer')}
        </Button>
      </Group>
    </Paper>
    {error !== undefined && (
      <Text size="xs" c="red" mt={4} role="alert">
        {error}
      </Text>
    )}
  </div>
);
