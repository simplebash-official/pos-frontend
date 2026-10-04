import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Alert, Badge, Button, Divider, Group, Paper, Stack, Switch, Text } from '@mantine/core';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime } from '@/shared/lib/date';
import { logger } from '@/shared/logging';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import { LinkedDevicesList } from './LinkedDevicesList';
import { SignInPanel } from './SignInPanel';
import { useCloudState, useCloudTelemetry, useCloudUnlink } from '../hooks/useCloudState';
import { accountMode, toCloudError } from '../lib/accountView';

/**
 * Settings → Account. Optional: the POS works fully offline without it. Shown
 * only when the desktop shell reports a configured cloud (see settingsSections).
 * Signing in happens in the browser (see SignInPanel); this screen shows the result.
 */
export const AccountSection = (_props: SectionProps) => {
  const { state } = useCloudState();
  const unlink = useCloudUnlink();
  const telemetry = useCloudTelemetry();

  const [error, setError] = useState<string | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const mode = accountMode(state);

  const doUnlink = () => {
    unlink.mutate(undefined, {
      onSuccess: () => {
        logger.info('app', 'account.unlinked');
        setConfirmUnlink(false);
      },
      onError: (err) => setError(toCloudError(err).message),
    });
  };

  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="md">
        <div>
          <Text fw={700} size="lg">
            {t('Cloud Account')}
          </Text>
          <Text size="sm" c="dimmed" mt={2}>
            {t(
              'Optional. Link this computer to your free account for cloud backup and web access. The POS keeps working offline either way.'
            )}
          </Text>
        </div>

        {mode === 'disabled' && (
          <Alert color="gray" variant="light">
            {t('Cloud features are not available in this build.')}
          </Alert>
        )}

        {(mode === 'signed-out' || mode === 'pending') && <SignInPanel />}

        {mode === 'linked' && (
          <Stack gap="xs">
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}
            <Group gap="xs">
              <Badge color="teal" variant="light">
                {t('Linked')}
              </Badge>
              {state.shopCode && <Badge variant="light">{state.shopCode}</Badge>}
            </Group>
            <Text size="sm">
              {t('Account')}: <b>{state.accountEmail ?? '—'}</b>
            </Text>
            {state.linkedAt && (
              <Text size="xs" c="dimmed">
                {t('Linked on')}: {formatDateTime(state.linkedAt)}
              </Text>
            )}
            <Group mt="xs">
              <Button
                color="red"
                variant="light"
                onClick={() => setConfirmUnlink(true)}
                data-log-id="account.unlink"
              >
                {t('Unlink this device')}
              </Button>
            </Group>
            <Divider mt="xs" />
            <LinkedDevicesList thisDeviceId={state.deviceId} />
          </Stack>
        )}

        {mode !== 'disabled' && (
          <>
            <Divider />
            <Switch
              checked={state.telemetryEnabled}
              disabled={telemetry.isPending}
              onChange={(e) => telemetry.mutate(e.currentTarget.checked)}
              label={t('Share anonymous usage statistics')}
              description={t(
                'App version, operating system and installation ID only. Never sales, customers or shop data.'
              )}
              data-log-id="account.telemetry"
            />
          </>
        )}
      </Stack>

      <ConfirmDialog
        opened={confirmUnlink}
        onClose={() => setConfirmUnlink(false)}
        onConfirm={doUnlink}
        title={t('Unlink this device?')}
        confirmLabel={t('Unlink')}
        loading={unlink.isPending}
      >
        {t('Your data stays on this computer. You can link it again at any time.')}
      </ConfirmDialog>
    </Paper>
  );
};
