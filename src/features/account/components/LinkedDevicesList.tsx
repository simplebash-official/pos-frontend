import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Badge, Button, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime } from '@/shared/lib/date';
import { logger } from '@/shared/logging';
import { useCloudDevices, useCloudRevokeDevice } from '../hooks/useCloudState';
import { onlyThisDeviceLinked, toCloudError, visibleDevices } from '../lib/accountView';
import type { DeviceInfo } from '../types';

const DeviceRow = ({
  device,
  isThisDevice,
  onRevoke,
}: {
  device: DeviceInfo;
  isThisDevice: boolean;
  onRevoke: (device: DeviceInfo) => void;
}) => (
  <Paper p="sm" withBorder>
    <Group justify="space-between" wrap="nowrap" align="flex-start">
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Group gap="xs">
          <Text size="sm" fw={600} truncate>
            {device.deviceName}
          </Text>
          {isThisDevice && (
            <Badge color="blue" variant="light" size="xs">
              {t('This device')}
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {device.os} · {device.appVersion}
          {device.lastSeenAt
            ? ` · ${t('Last active')} ${formatDateTime(device.lastSeenAt)}`
            : ''}
        </Text>
      </Stack>
      {!isThisDevice && (
        <Button
          size="xs"
          color="red"
          variant="light"
          onClick={() => onRevoke(device)}
          data-log-id="account.revoke-device"
        >
          {t('Revoke')}
        </Button>
      )}
    </Group>
  </Paper>
);

/**
 * Settings → Cloud Account: every device linked to this shop. Revoking a
 * device other than this one signs it out; it stops syncing next time it
 * tries. This device's own row has no revoke button — use "Unlink this
 * device" above for that.
 */
export const LinkedDevicesList = ({ thisDeviceId }: { thisDeviceId: string | null }) => {
  const { data, isLoading, error } = useCloudDevices(true);
  const revoke = useCloudRevokeDevice();
  const [target, setTarget] = useState<DeviceInfo | null>(null);

  const devices = visibleDevices(data ?? []);
  const onlyThisDevice = onlyThisDeviceLinked(devices, thisDeviceId);

  const doRevoke = () => {
    if (!target) return;
    revoke.mutate(target.deviceId, {
      onSuccess: () => {
        logger.info('app', 'account.device_revoked');
        setTarget(null);
      },
      onError: (err) => {
        notifications.show({ color: 'red', message: toCloudError(err).message });
        setTarget(null);
      },
    });
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={700}>
        {t('Linked devices')}
      </Text>
      {isLoading ? (
        <Group gap="xs">
          <Loader size="xs" />
          <Text size="xs" c="dimmed">
            {t('Loading devices…')}
          </Text>
        </Group>
      ) : error ? (
        <Text size="xs" c="red">
          {toCloudError(error).message}
        </Text>
      ) : devices.length === 0 ? (
        <Text size="xs" c="dimmed">
          {t('No devices found.')}
        </Text>
      ) : (
        <>
          <Stack gap="xs">
            {devices.map((device) => (
              <DeviceRow
                key={device.deviceId}
                device={device}
                isThisDevice={device.deviceId === thisDeviceId}
                onRevoke={setTarget}
              />
            ))}
          </Stack>
          {onlyThisDevice && (
            <Text size="xs" c="dimmed">
              {t('No other devices are linked yet.')}
            </Text>
          )}
        </>
      )}

      <ConfirmDialog
        opened={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={doRevoke}
        title={t('Revoke this device?')}
        confirmLabel={t('Revoke')}
        loading={revoke.isPending}
      >
        {t('That device will be signed out and stop syncing. It can be linked again from that computer at any time.')}
      </ConfirmDialog>
    </Stack>
  );
};
