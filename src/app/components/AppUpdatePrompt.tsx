import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useAppSelector } from '@/store/hooks';
import { selectCartItemsCount } from '@/store/slices/cartSlice';
import { usePwaUpdate } from '@/app/pwa/PwaUpdateContext';
import { shouldOfferUpdate } from '@/app/pwa/updatePolicy';

const UPDATE_NOTIFICATION_ID = 'app-update-available';

/**
 * Offers a new app version rather than installing it silently.
 *
 * The notification appears on its own once a newer build has been detected by
 * the periodic check in {@link PwaUpdateProvider} — no page reload needed. It
 * is still withheld while a sale is on the till (applying an update reloads
 * the page and the cart is not persisted), and "Update now" asks for an
 * explicit confirmation before the reload as a second safety net.
 */
export const AppUpdatePrompt = () => {
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const pwa = usePwaUpdate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const offerUpdate = shouldOfferUpdate(Boolean(pwa?.updateAvailable), cartItemsCount);

  useEffect(() => {
    if (!offerUpdate) {
      notifications.hide(UPDATE_NOTIFICATION_ID);
      return;
    }

    notifications.show({
      id: UPDATE_NOTIFICATION_ID,
      title: t('Update available'),
      color: 'blue',
      autoClose: false,
      withCloseButton: true,
      message: (
        <Group gap="sm" mt="xs">
          <Text size="sm">{t('A newer version of the POS is ready.')}</Text>
          <Button size="xs" variant="light" onClick={() => setConfirmOpen(true)}>
            {t('Update now')}
          </Button>
        </Group>
      ),
    });

    return () => {
      notifications.hide(UPDATE_NOTIFICATION_ID);
    };
  }, [offerUpdate]);

  const handleConfirm = async () => {
    if (!pwa) return;
    setApplying(true);
    try {
      await pwa.applyUpdate();
    } finally {
      // The page reloads on success; this only matters if it somehow does not.
      setApplying(false);
      setConfirmOpen(false);
    }
  };

  return (
    <ConfirmDialog
      opened={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      onConfirm={handleConfirm}
      title={t('Update now?')}
      confirmLabel={t('Update now')}
      cancelLabel={t('Not yet')}
      confirmColor="blue"
      loading={applying}
    >
      {t(
        'This restarts the app to finish updating. Any sale you have started but not completed will be cleared.'
      )}
    </ConfirmDialog>
  );
};
