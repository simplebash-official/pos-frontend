import { Alert, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconPhone } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { Customer } from '../types';

export interface CustomerMatchPanelProps {
  /** The saved customer who already has the typed phone number. Saving is blocked while set. */
  phoneMatch: Customer | null;
  /** Saved customers with a similar name. They only warn: two people can share a name. */
  nameMatches: Customer[];
  onUse: (customer: Customer) => void;
}

/** Tells the person who they are about to add already exists, and lets them use that customer. */
export const CustomerMatchPanel = ({ phoneMatch, nameMatches, onUse }: CustomerMatchPanelProps) => {
  const isMobile = useIsMobile();
  const buttonHeight = isMobile ? 44 : undefined;

  return (
    <Stack gap="sm">
      {phoneMatch !== null && (
        <Alert color="orange" icon={<IconAlertTriangle size={18} />} role="alert">
          <Group justify="space-between" align="center" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <div style={{ minWidth: 0 }}>
              <Text size="sm" fw={600}>
                {t('This number is already saved for')} {phoneMatch.name}
              </Text>
              <Text size="xs" c="dimmed">
                {phoneMatch.primaryPhone}
              </Text>
            </div>
            <Button
              size="xs"
              h={buttonHeight}
              style={{ flexShrink: 0 }}
              onClick={() => onUse(phoneMatch)}
            >
              {t('Use this customer')}
            </Button>
          </Group>
        </Alert>
      )}
      {nameMatches.length > 0 && (
        <Paper withBorder p="sm">
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            tt="uppercase"
            mb="xs"
            style={{ letterSpacing: '0.05em' }}
          >
            {t('Already in your list')}
          </Text>
          <Stack gap="xs">
            {nameMatches.map((customer) => (
              <Group key={customer.id} justify="space-between" wrap="nowrap" gap="sm">
                <div style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {customer.name}
                  </Text>
                  <Group gap={4}>
                    <IconPhone size={12} style={{ opacity: 0.6 }} />
                    <Text size="xs" c="dimmed">
                      {customer.primaryPhone}
                    </Text>
                  </Group>
                </div>
                <Button
                  size="xs"
                  variant="light"
                  h={buttonHeight}
                  style={{ flexShrink: 0 }}
                  onClick={() => onUse(customer)}
                >
                  {t('Use this customer')}
                </Button>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};
