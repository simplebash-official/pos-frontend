import { Alert, Stack, Text } from '@mantine/core';
import { IconDevicesOff } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';

interface DeviceShiftLockAlertProps {
  message: string | null;
  onClose: () => void;
}

export const DeviceShiftLockAlert = ({ message, onClose }: DeviceShiftLockAlertProps) => {
  if (!message) return null;

  return (
    <Alert
      color="orange"
      variant="light"
      icon={<IconDevicesOff size={18} />}
      title={t('Shift Open on Another Device')}
      withCloseButton
      closeButtonLabel={t('Dismiss')}
      onClose={onClose}
      w="100%"
    >
      <Stack gap={4}>
        <Text size="xs">{message}</Text>
        <Text size="xs" c="dimmed">
          {t(
            'Close that shift on the other device first, or ask an Admin to close it or enable Allow Across Devices under Settings → Registers & Shifts.'
          )}
        </Text>
      </Stack>
    </Alert>
  );
};
