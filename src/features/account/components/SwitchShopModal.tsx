import { useState } from 'react';
import { Alert, Badge, Button, Divider, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { IconBuildingStore, IconCheck } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { logger } from '@/shared/logging';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { ShopAvatar } from './ShopAvatar';
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
  const isMobile = useIsMobile();
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

  const shops = profiles.data ?? [];

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="xs" wrap="nowrap">
            <IconBuildingStore size={20} stroke={1.75} aria-hidden />
            <Text fw={700} size="lg">
              {t('Shop and account')}
            </Text>
          </Group>
        }
        centered
        size="md"
        fullScreen={isMobile}
        closeOnClickOutside={switchedTo === null}
        closeOnEscape={switchedTo === null}
        withCloseButton={switchedTo === null}
      >
        {switchedTo !== null ? (
          <SwitchingNotice shop={switchedTo || null} />
        ) : (
          <Stack gap="lg">
            {error && (
              <Alert color="red" variant="light" role="alert">
                {error}
              </Alert>
            )}
            {shops.length > 0 && (
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('Shops on this computer')}
                </Text>
                {shops.map((shop) => (
                  <Paper key={shop.id} p="sm">
                    <Group wrap="nowrap" gap="sm">
                      <ShopAvatar shop={shop} linked={shop.linked} />
                      <Stack gap={2} miw={0} style={{ flex: 1 }}>
                        <Text fw={600} lh={1.25} lineClamp={2}>
                          {shopLabel(shop) ?? t('Offline shop')}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {[
                            shop.shopName ? shop.shopCode : null,
                            shop.accountEmail ?? t('Not connected to SimpleBash'),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </Text>
                      </Stack>
                      {shop.active ? (
                        <Badge
                          color="teal"
                          variant="light"
                          leftSection={<IconCheck size={12} stroke={2.5} />}
                          style={{ flexShrink: 0 }}
                        >
                          {t('Current')}
                        </Badge>
                      ) : (
                        <Button
                          variant="default"
                          size="xs"
                          style={{ minHeight: 44, flexShrink: 0 }}
                          onClick={() => setTarget(shop)}
                          data-log-id="switch-shop.open"
                        >
                          {t('Open')}
                        </Button>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
            <Divider label={t('Add another shop')} labelPosition="center" />
            <SignInPanel embedded onLinked={onClose} />
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
