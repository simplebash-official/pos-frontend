import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Alert, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { logger } from '@/shared/logging';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import type { SettingsSectionId } from '@/features/settings/settingsSections';
import { SyncActivityList } from './SyncActivityList';
import { SyncHero } from './SyncHero';
import { SyncModulesList } from './SyncModulesList';
import { syncBootstrap, syncNow, syncPause, syncResume } from '../api/syncStatusApi';
import { toSyncError } from '../lib/statusView';
import { setSyncStatus, useSyncStatus } from '../hooks/useSyncStatus';

/**
 * Settings → Sync. Shows what the sync agent is doing and lets the owner pause
 * it, run it now, or confirm a full re-download of the cloud data. Only reachable
 * when the shell reports a configured cloud (see settingsSections).
 */
export interface SyncSectionProps extends SectionProps {
  /** Lets the screen jump to another settings section (e.g. Sync Conflicts). */
  onOpenSection?: (target: SettingsSectionId) => void;
}

export const SyncSection = ({ onOpenSection }: SyncSectionProps) => {
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

  const paused = status.state === 'paused';

  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="lg">
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

        {!status.linked ? (
          <Alert color="gray" variant="light">
            {t(
              'This device is not linked to a cloud account yet. Link it under Cloud Account first.'
            )}
          </Alert>
        ) : (
          <>
            <SyncHero
              status={status}
              busy={busy}
              onSyncNow={() => void run('now', syncNow)}
              onTogglePause={() =>
                void run(paused ? 'resume' : 'pause', paused ? syncResume : syncPause)
              }
              onReview={() =>
                status.bootstrapRequired ? setConfirmBootstrap(true) : onOpenSection?.('conflicts')
              }
            />
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
            <SyncModulesList status={status} />
            <SyncActivityList history={status.history} />
          </>
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
