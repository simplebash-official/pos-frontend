import { t } from '@/shared/i18n/t';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge, Button, Divider, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { IconCircleCheck, IconDownload, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Update } from '@tauri-apps/plugin-updater';
import { env } from '@/config/env';
import { formatDateTime } from '@/shared/lib/date';
import { isTauri } from '@/shared/lib/runtime';
import { logger } from '@/shared/logging';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePwaUpdate } from '@/app/pwa/PwaUpdateContext';
import { useSetupStatus } from '@/features/onboarding';
import { downloadPercent } from '../../lib/updateView';
import type { SectionProps } from './ShopProfileSection';

// ============================================================================
// Shared chrome — matches SectionShell's Paper/header without the Save bar
// (nothing here is an editable form).
// ============================================================================

const UpdatesShell = ({ description, children }: { description: string; children: ReactNode }) => (
  <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
    <Stack gap="md">
      <div>
        <Text fw={700} size="lg">
          {t('Updates')}
        </Text>
        <Text size="sm" c="dimmed" mt={2}>
          {description}
        </Text>
      </div>
      <Divider />
      {children}
    </Stack>
  </Paper>
);

const VersionLine = ({
  version,
  builtAt,
  commit,
}: {
  version: string;
  builtAt: string;
  commit?: string;
}) => (
  <Stack gap={4}>
    <Group gap={6} align="baseline">
      <Text size="sm">
        {t('You are running')}{' '}
        <Text span fw={700}>
          {version || t('an unknown version')}
        </Text>
      </Text>
      {commit && (
        <Text size="xs" c="dimmed" ff="monospace">
          ({commit.slice(0, 7)})
        </Text>
      )}
    </Group>
    {builtAt && (
      <Text size="xs" c="dimmed">
        {t('Installed')}: {formatDateTime(builtAt)}
      </Text>
    )}
  </Stack>
);

// ============================================================================
// Web (PWA) — the browser handles fetching the new build; we drive the
// service-worker re-check and the restart.
// ============================================================================

const WebUpdates = () => {
  const pwa = usePwaUpdate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const checkedOnce = pwa?.lastCheckedAt != null;

  const handleRestart = async () => {
    if (!pwa) return;
    setApplying(true);
    try {
      await pwa.applyUpdate();
    } finally {
      setApplying(false);
      setConfirmOpen(false);
    }
  };

  return (
    <UpdatesShell description={t('See which version you are running and move to the latest one.')}>
      <VersionLine version={env.appVersion} builtAt={env.buildTime} commit={env.commit} />
      <Divider />

      {pwa?.updateAvailable ? (
        <Stack gap="xs" align="flex-start">
          <Badge color="blue" variant="light" size="lg">
            {t('An update is ready')}
          </Badge>
          <Text size="sm" c="dimmed">
            {t('Finish any sale you have started, then restart to move to the new version.')}
          </Text>
          <Button
            color="blue"
            leftSection={<IconRefresh size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            {t('Restart to update')}
          </Button>
        </Stack>
      ) : (
        <Stack gap="xs" align="flex-start">
          {checkedOnce && (
            <Group gap={6} c="green">
              <IconCircleCheck size={18} />
              <Text size="sm">{t('You are on the latest version.')}</Text>
            </Group>
          )}
          <Group gap="sm" wrap="wrap">
            <Button
              variant="default"
              leftSection={<IconRefresh size={16} />}
              loading={pwa?.checking}
              onClick={() => void pwa?.checkForUpdate()}
            >
              {t('Check for updates')}
            </Button>
            {pwa?.lastCheckedAt != null && (
              <Text size="sm" c="dimmed">
                {t('Last checked')}: {formatDateTime(pwa.lastCheckedAt)}
              </Text>
            )}
          </Group>
        </Stack>
      )}

      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRestart}
        title={t('Restart to update?')}
        confirmLabel={t('Restart now')}
        cancelLabel={t('Not yet')}
        confirmColor="blue"
        loading={applying}
      >
        {t(
          'This restarts the app to finish updating. Any sale you have started but not completed will be cleared.'
        )}
      </ConfirmDialog>
    </UpdatesShell>
  );
};

// ============================================================================
// Desktop (Tauri) — check GitHub, download the installer, swap the app,
// relaunch. Local data (sales, settings) lives outside the app and is untouched.
// ============================================================================

type DesktopStatus =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'uptodate' }
  | { kind: 'available'; version: string; notes: string }
  | { kind: 'downloading'; version: string; percent: number | null }
  | { kind: 'ready'; version: string }
  | { kind: 'error'; message: string };

const DesktopUpdates = () => {
  const [currentVersion, setCurrentVersion] = useState('');
  const [status, setStatus] = useState<DesktopStatus>({ kind: 'idle' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const updateRef = useRef<Update | null>(null);
  const { data: setupStatus } = useSetupStatus();

  useEffect(() => {
    let cancelled = false;
    void import('@tauri-apps/api/app')
      .then(({ getVersion }) => getVersion())
      .then((v) => {
        if (!cancelled) setCurrentVersion(v);
      })
      .catch(() => {
        /* leave blank — the version line degrades gracefully */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const check = useCallback(async () => {
    setStatus({ kind: 'checking' });
    logger.info('updater', 'check.start');
    try {
      const { check: runCheck } = await import('@tauri-apps/plugin-updater');
      const update = await runCheck();
      if (!update) {
        logger.info('updater', 'check.up_to_date', undefined, 'No update available');
        setStatus({ kind: 'uptodate' });
        return;
      }
      logger.info(
        'updater',
        'check.available',
        { version: update.version, currentVersion: update.currentVersion, notes: update.body },
        `Update ${update.version} available`
      );
      updateRef.current = update;
      setStatus({
        kind: 'available',
        version: update.version,
        notes: update.body ?? '',
      });
    } catch (err) {
      logger.error('updater', 'check.error', err);
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      notifications.show({
        color: 'red',
        title: t('Could not check for updates'),
        message: t('Please check your internet connection and try again.'),
      });
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;
    const version = update.version;
    let downloaded = 0;
    let total = 0;
    let lastLoggedDecile = -1;
    setStatus({ kind: 'downloading', version, percent: null });
    logger.info('updater', 'download.start', { version });
    try {
      await update.download((event) => {
        if (event.event === 'Started') {
          total = event.data.contentLength ?? 0;
          logger.info('updater', 'download.started', { version, contentLength: total });
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          const percent = downloadPercent(downloaded, total);
          // One entry per 10% step, not one per network chunk.
          const decile = percent === null ? -1 : Math.floor(percent / 10);
          if (decile > lastLoggedDecile) {
            lastLoggedDecile = decile;
            logger.info('updater', 'download.progress', { version, percent, downloaded, total });
          }
          setStatus({
            kind: 'downloading',
            version,
            percent: downloadPercent(downloaded, total),
          });
        } else if (event.event === 'Finished') {
          setStatus({ kind: 'ready', version });
        }
      });
      logger.info(
        'updater',
        'download.finished',
        { version, downloaded },
        `Update ${version} downloaded`
      );
      setStatus({ kind: 'ready', version });
    } catch (err) {
      logger.error('updater', 'download.error', err, { version, downloaded, total });
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      notifications.show({
        color: 'red',
        title: t('The update could not be installed'),
        message: t('Nothing on this computer was changed. Please try again later.'),
      });
    }
  }, []);

  const restart = useCallback(async () => {
    setApplying(true);
    const version = updateRef.current?.version;
    logger.info('updater', 'install.start', { version }, `Installing update ${version}`);
    try {
      // Pre-emptively kill sidecars before the installer runs, so running
      // processes don't hold file locks on simplebash-backend.exe or document-server.
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('prepare_for_update').catch((err: unknown) => {
        // Not fatal: the installer's own hooks stop the services too.
        logger.error('updater', 'prepare_for_update.error', err, { version });
      });
      // The installer may end this process; get everything on disk first.
      await logger.flush();

      const update = updateRef.current;
      if (update) {
        await update.install();
        logger.info('updater', 'install.done', { version });
      }

      logger.info('updater', 'relaunch', { version }, 'Restarting to finish the update');
      await logger.flush();

      // On macOS/Linux, install() replaces the app bundle while the app runs,
      // so relaunch() finishes the update. On Windows, install() launches the
      // NSIS installer and exits automatically.
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (err) {
      logger.error('updater', 'install.error', err, { version });
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      setApplying(false);
      setConfirmOpen(false);
    }
  }, []);

  return (
    <UpdatesShell
      description={t(
        'Check for a new version, install it, and restart. Your sales and settings stay on this computer and are not affected.'
      )}
    >
      <VersionLine version={currentVersion} builtAt="" />
      {setupStatus && (
        <Group gap="xs" wrap="wrap" mt="xs">
          <Badge variant="outline" color="gray" size="sm">
            {t('Workstation ID')}: {setupStatus.installation_id.slice(0, 8).toUpperCase()}
          </Badge>
          {setupStatus.installed_at && (
            <Badge variant="outline" color="gray" size="sm">
              {t('Installed')}: {new Date(setupStatus.installed_at).toLocaleDateString()}
            </Badge>
          )}
          <Badge
            variant="light"
            color={setupStatus.sample_data_loaded ? 'indigo' : 'teal'}
            size="sm"
          >
            {setupStatus.sample_data_loaded ? t('Demo Data Mode') : t('Clean Production Mode')}
          </Badge>
        </Group>
      )}
      <Divider />

      {(status.kind === 'idle' || status.kind === 'checking') && (
        <Group>
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={status.kind === 'checking'}
            onClick={() => void check()}
          >
            {t('Check for updates')}
          </Button>
        </Group>
      )}

      {status.kind === 'uptodate' && (
        <Stack gap="xs" align="flex-start">
          <Group gap={6} c="green">
            <IconCircleCheck size={18} />
            <Text size="sm">{t('You are on the latest version.')}</Text>
          </Group>
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => void check()}
          >
            {t('Check again')}
          </Button>
        </Stack>
      )}

      {status.kind === 'available' && (
        <Stack gap="xs" align="flex-start">
          <Badge color="blue" variant="light" size="lg">
            {t('New version')} {status.version}
          </Badge>
          {status.notes && (
            <Paper withBorder p="sm" style={{ backgroundColor: 'var(--bg-app)', width: '100%' }}>
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                {status.notes}
              </Text>
            </Paper>
          )}
          <Text size="sm" c="dimmed">
            {t('Finish any sale you have started before installing — the app restarts at the end.')}
          </Text>
          <Button
            color="blue"
            leftSection={<IconDownload size={16} />}
            onClick={() => void downloadAndInstall()}
          >
            {t('Download and install')}
          </Button>
        </Stack>
      )}

      {status.kind === 'downloading' && (
        <Stack gap="xs">
          <Text size="sm">{t('Downloading the update…')}</Text>
          <Progress
            value={status.percent ?? 100}
            animated={status.percent == null}
            striped={status.percent == null}
          />
        </Stack>
      )}

      {status.kind === 'ready' && (
        <Stack gap="xs" align="flex-start">
          <Group gap={6} c="green">
            <IconCircleCheck size={18} />
            <Text size="sm">{t('The update is installed.')}</Text>
          </Group>
          <Button
            color="blue"
            leftSection={<IconRefresh size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            {t('Restart now')}
          </Button>
        </Stack>
      )}

      {status.kind === 'error' && (
        <Stack gap="xs" align="flex-start">
          <Text size="sm" c="red">
            {t('Something went wrong. Nothing on this computer was changed.')}
          </Text>
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => void check()}
          >
            {t('Try again')}
          </Button>
        </Stack>
      )}

      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void restart();
        }}
        title={t('Restart to update?')}
        confirmLabel={t('Restart now')}
        cancelLabel={t('Not yet')}
        confirmColor="blue"
        loading={applying}
      >
        {t(
          'This closes and reopens the app to finish updating. Any sale you have started but not completed will be cleared.'
        )}
      </ConfirmDialog>
    </UpdatesShell>
  );
};

// ============================================================================

export const UpdatesSection = ({ onDirtyChange }: SectionProps) => {
  // Nothing here is an editable form, so the section is never "dirty".
  useEffect(() => {
    onDirtyChange(false);
  }, [onDirtyChange]);

  return isTauri() ? <DesktopUpdates /> : <WebUpdates />;
};
