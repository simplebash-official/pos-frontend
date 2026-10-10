import { useState } from 'react';
import { Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconSwitchHorizontal } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { isTauri } from '@/shared/lib/runtime';
import { ShopAvatar } from './ShopAvatar';
import { SwitchShopModal } from './SwitchShopModal';
import { useCloudState } from '../hooks/useCloudState';
import { shopLabel } from '../lib/shopLabel';

/**
 * Login-screen card: which shop and SimpleBash account this computer works with, and the way to
 * change them. Desktop app only, and only when this build has the cloud.
 */
export const ShopAccountCard = () => {
  const { state } = useCloudState();
  const [opened, setOpened] = useState(false);

  if (!isTauri() || !state.enabled) return null;

  return (
    <>
      <Paper p="sm" w="100%" data-testid="shop-account-card">
        <Group wrap="nowrap" gap="md" align="center">
          <ShopAvatar shop={state} linked={state.linked} size={48} />
          <Stack gap={2} miw={0} style={{ flex: 1 }}>
            <Text fw={700} lh={1.25} lineClamp={2}>
              {shopLabel(state) ?? t('This computer')}
            </Text>
            {state.shopCode && state.shopName && (
              <Text size="xs" c="dimmed" ff="monospace" truncate>
                {state.shopCode}
              </Text>
            )}
            <Group gap={6} wrap="nowrap">
              <Box
                w={8}
                h={8}
                aria-hidden
                style={{
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: state.linked
                    ? 'var(--mantine-color-teal-6)'
                    : 'var(--mantine-color-gray-5)',
                }}
              />
              <Text size="xs" c="dimmed" truncate>
                {state.linked
                  ? (state.accountEmail ?? t('Connected to SimpleBash'))
                  : t('Not connected to SimpleBash')}
              </Text>
            </Group>
          </Stack>
        </Group>
        <Button
          variant="default"
          size="sm"
          fullWidth
          mt="sm"
          leftSection={<IconSwitchHorizontal size={16} stroke={1.75} />}
          style={{ minHeight: 44 }}
          onClick={() => setOpened(true)}
          data-log-id="login.switch-shop"
        >
          {state.linked ? t('Switch shop or account') : t('Connect to SimpleBash')}
        </Button>
      </Paper>
      <SwitchShopModal opened={opened} onClose={() => setOpened(false)} />
    </>
  );
};
