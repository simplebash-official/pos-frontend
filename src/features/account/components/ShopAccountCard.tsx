import { useState } from 'react';
import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { isTauri } from '@/shared/lib/runtime';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SwitchShopModal } from './SwitchShopModal';
import { useCloudState } from '../hooks/useCloudState';
import { shopLabel } from '../lib/shopLabel';

/**
 * Login-screen card: which shop and SimpleBash account this computer works with, and the way to
 * change them. Desktop app only, and only when this build has the cloud.
 */
export const ShopAccountCard = () => {
  const { state } = useCloudState();
  const isMobile = useIsMobile();
  const [opened, setOpened] = useState(false);

  if (!isTauri() || !state.enabled) return null;

  return (
    <>
      <Paper withBorder p="sm" radius="md" w="100%" data-testid="shop-account-card">
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Stack gap={2} miw={0}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={700} truncate>
                {shopLabel(state) ?? t('This computer')}
              </Text>
              {state.shopCode && state.shopName && <Badge variant="light">{state.shopCode}</Badge>}
            </Group>
            <Text size="xs" c="dimmed" truncate>
              {state.linked
                ? (state.accountEmail ?? t('Connected to SimpleBash'))
                : t('Not connected to SimpleBash')}
            </Text>
          </Stack>
          <Button
            variant="default"
            size="xs"
            fullWidth={isMobile}
            style={{ minHeight: 44 }}
            onClick={() => setOpened(true)}
            data-log-id="login.switch-shop"
          >
            {state.linked ? t('Switch shop or account') : t('Connect to SimpleBash')}
          </Button>
        </Group>
      </Paper>
      <SwitchShopModal opened={opened} onClose={() => setOpened(false)} />
    </>
  );
};
