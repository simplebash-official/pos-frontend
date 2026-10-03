import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Alert, Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime } from '@/shared/lib/date';
import { logger } from '@/shared/logging';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import { syncBootstrap, syncNow, syncPause, syncResume } from '../api/syncStatusApi';
import { badgeView, toSyncError } from '../lib/statusView';
import { setSyncStatus, useSyncStatus } from '../hooks/useSyncStatus';

/**
 * Settings → Sync. Shows what the sync agent is doing and lets the owner pause
 * it, run it now, or confirm a full re-download of the cloud data. Only reachable
 * when the shell reports a configured cloud (see settingsSections).
 */
export const SyncSection = (_props: SectionProps) => {
  const status = useSyncStatus();
  const [busy, setBusy] = useState(false);
  const [confirmBootstrap, setConfirmBootstrap] = useState(false);

  const run = async (name: string, action: () => Promise<typeof status>) => {
    setBusy(true);
    try {
      setSyncStatus(await action());
      logger.info('app', `sync.${name}`);
    } catch (err) {
      notifications.show({ color: 'red', message: toSyncError(err).message });
    } finally {
      setBusy(false);
    }
  };

  const view = badgeView(status);
  const paused = status.state === 'paused';

  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="md">
        <div>
          <Text fw={700} size="lg">
            {t('Cloud Sync')}
          </Text>
          <Text size="sm" c="dimmed" mt={2}>
            {t(
              'Keeps this computer and your other devices up to date through your cloud account. Selling never waits for the internet.'
            )}
          </Text>
        </div>

        {!status.linked || !view ? (
          <Alert color="gray" variant="light">
            {t(
              'This device is not linked to a cloud account yet. Link it under Cloud Account first.'
            )}
          </Alert>
        ) : (
          <Stack gap="xs">
            <Group gap="xs">
              <Badge color={view.color} variant="light" data-sync-state={status.state}>
                {t(view.label)}
              </Badge>
              {status.conflictsOpen > 0 && (
                <Badge color="orange" variant="light">
                  {status.conflictsOpen} {t('conflicts to review')}
                </Badge>
              )}
            </Group>
            <Text size="sm">
              {t('Last synced')}:{' '}
              <b>{status.lastSyncAt ? formatDateTime(status.lastSyncAt) : t('Not yet')}</b>
            </Text>
            <Text size="sm">
              {t('Waiting to upload')}: <b>{status.pendingOut}</b>
            </Text>
            {status.lastError && (
              <Alert color="red" variant="light">
                {status.lastError}
              </Alert>
            )}
            {status.bootstrapRequired && (
              <Alert color="orange" variant="light" title={t('Your confirmation is needed')}>
                <Stack gap="xs">
                  <Text size="sm">
                    {t(
                      'The cloud already holds data for this shop. To continue, this computer must replace its local data with the cloud copy. Export a backup first if you are unsure.'
                    )}
                  </Text>
                  <Group>
                    <Button
                      color="orange"
                      size="xs"
                      onClick={() => setConfirmBootstrap(true)}
                      data-log-id="sync.bootstrap-start"
                    >
                      {t('Replace local data with cloud data')}
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            )}
            <Group mt="xs">
              <Button
                variant="light"
                loading={busy}
                onClick={() => void run('now', syncNow)}
                data-log-id="sync.now"
              >
                {t('Sync now')}
              </Button>
              <Button
                variant="default"
                loading={busy}
                onClick={() =>
                  void run(paused ? 'resume' : 'pause', paused ? syncResume : syncPause)
                }
                data-log-id={paused ? 'sync.resume' : 'sync.pause'}
              >
                {paused ? t('Resume sync') : t('Pause sync')}
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>

      <ConfirmDialog
        opened={confirmBootstrap}
        onClose={() => setConfirmBootstrap(false)}
        onConfirm={() => {
          setConfirmBootstrap(false);
          void run('bootstrap', () => syncBootstrap(true));
        }}
        title={t('Replace local data?')}
        confirmLabel={t('Replace with cloud data')}
      >
        {t(
          'Everything stored on this computer will be replaced by the cloud copy. This cannot be undone.'
        )}
      </ConfirmDialog>
    </Paper>
  );
};
