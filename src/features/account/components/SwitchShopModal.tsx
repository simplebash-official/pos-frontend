import { useState } from 'react';
import { Alert, Badge, Button, Divider, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { logger } from '@/shared/logging';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { SignInPanel } from './SignInPanel';
import { SwitchingNotice } from './SwitchingNotice';
import { useCloudState, useProfileActivate, useProfiles } from '../hooks/useCloudState';
import { shopLabel } from '../lib/shopLabel';
import { toCloudError } from '../lib/accountView';
import { clearShopScopedStorage } from '../lib/switchShop';
import type { ShopProfile } from '../types';

export interface SwitchShopModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Change the shop or SimpleBash account this computer works with. Every shop has its own data on
 * this computer, so shops already here open instantly (also offline), and another shop is added by
 * signing in in the browser. Nothing is ever deleted.
 */
export const SwitchShopModal = ({ opened, onClose }: SwitchShopModalProps) => {
  const { state } = useCloudState();
  const profiles = useProfiles(opened && state.enabled);
  const activate = useProfileActivate();
  const [target, setTarget] = useState<ShopProfile | null>(null);
  const [switchedTo, setSwitchedTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = (shop: ShopProfile) => {
    setError(null);
    activate.mutate(shop.id, {
      onSuccess: () => {
        // The shell restarts the app in a moment: forget the old shop's browser data first.
        clearShopScopedStorage();
        logger.info('app', 'account.shop_opened', {}, 'Opening another shop');
        setTarget(null);
        setSwitchedTo(shopLabel(shop) ?? '');
      },
      onError: (err) => {
        setTarget(null);
        setError(toCloudError(err).message);
      },
    });
  };

  const others = (profiles.data ?? []).filter((p) => !p.active);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Text fw={700} size="lg">
            {t('Shop and account')}
          </Text>
        }
        centered
        size="md"
        closeOnClickOutside={switchedTo === null}
        closeOnEscape={switchedTo === null}
        withCloseButton={switchedTo === null}
      >
        {switchedTo !== null ? (
          <SwitchingNotice shop={switchedTo || null} />
        ) : (
          <Stack gap="md">
            {error && (
              <Alert color="red" variant="light" role="alert">
                {error}
              </Alert>
            )}
            {others.length > 0 && (
              <Stack gap="xs">
                <Text fw={600} size="sm">
                  {t('Shops on this computer')}
                </Text>
                {others.map((shop) => (
                  <Paper key={shop.id} withBorder p="sm" radius="md">
                    <Group justify="space-between" wrap="wrap" gap="xs">
                      <Stack gap={2} miw={0}>
                        <Text fw={600} truncate>
                          {shopLabel(shop) ?? t('Offline shop')}
                        </Text>
                        <Group gap="xs">
                          {shop.shopCode && shop.shopName && (
                            <Badge variant="light">{shop.shopCode}</Badge>
                          )}
                          <Text size="xs" c="dimmed">
                            {shop.accountEmail ?? t('Not connected to SimpleBash')}
                          </Text>
                        </Group>
                      </Stack>
                      <Button
                        variant="default"
                        size="xs"
                        style={{ minHeight: 44 }}
                        onClick={() => setTarget(shop)}
                        data-log-id="switch-shop.open"
                      >
                        {t('Open')}
                      </Button>
                    </Group>
                  </Paper>
                ))}
                <Divider mt="xs" />
              </Stack>
            )}
            <Stack gap="xs">
              <Text fw={600} size="sm">
                {t('Add or switch to another shop')}
              </Text>
              <SignInPanel hideTitle onLinked={onClose} />
            </Stack>
          </Stack>
        )}
      </Modal>
      <ConfirmDialog
        opened={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={() => target && open(target)}
        title={t('Open this shop?')}
        confirmLabel={t('Open')}
        confirmColor="blue"
        loading={activate.isPending}
      >
        {t('The app restarts and opens {shop}. Your other shops stay on this computer.').replace(
          '{shop}',
          (target && shopLabel(target)) || t('this shop')
        )}
      </ConfirmDialog>
    </>
  );
};
