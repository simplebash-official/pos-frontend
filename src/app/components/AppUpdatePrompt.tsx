import { useEffect } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useAppSelector } from '@/store/hooks';
import { selectCartItemsCount } from '@/store/slices/cartSlice';

const UPDATE_NOTIFICATION_ID = 'app-update-available';

/**
 * Offers a new app version rather than installing it silently.
 *
 * Applying an update reloads the page, and the active cart is not persisted —
 * so the prompt is withheld until the till is empty. A cashier mid-sale should
 * never lose the basket to a deploy.
 */
export const AppUpdatePrompt = () => {
  const cartItemsCount = useAppSelector(selectCartItemsCount);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh || cartItemsCount > 0) {
      return;
    }

    notifications.show({
      id: UPDATE_NOTIFICATION_ID,
      title: 'Update available',
      color: 'blue',
      autoClose: false,
      withCloseButton: true,
      message: (
        <Group gap="sm" mt="xs">
          <Text size="sm">A newer version of the POS is ready.</Text>
          <Button size="xs" variant="light" onClick={() => void updateServiceWorker(true)}>
            Update now
          </Button>
        </Group>
      ),
    });

    return () => {
      notifications.hide(UPDATE_NOTIFICATION_ID);
    };
  }, [needRefresh, cartItemsCount, updateServiceWorker]);

  return null;
};
