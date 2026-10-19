import { t } from '@/shared/i18n/t';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconClock,
  IconDownload,
  IconGitBranch,
  IconInfoCircle,
  IconRefresh,
  IconServer,
  IconWorld,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Update } from '@tauri-apps/plugin-updater';
import { env } from '@/config/env';
import { formatDateTime } from '@/shared/lib/date';
import { isTauri, platformInfo } from '@/shared/lib/runtime';
import { logger } from '@/shared/logging';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePwaUpdate } from '@/app/pwa/PwaUpdateContext';
import { useSetupStatus } from '@/features/onboarding';
import { cloudPing } from '@/features/account';
import { downloadPercent } from '../../lib/updateView';
import type { SectionProps } from './ShopProfileSection';

// ============================================================================
// Shared chrome — matches SectionShell's Paper/header without the Save bar
// (nothing here is an editable form).
// ============================================================================

const AboutShell = ({ description, children }: { description: string; children: ReactNode }) => (
  <Paper
    p="lg"
    withBorder
    style={{
      backgroundColor: 'var(--bg-card)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
    }}
  >
    <div style={{ flexShrink: 0 }}>
      <Text fw={700} size="lg">
        {t('About')}
      </Text>
      <Text size="sm" c="dimmed" mt={2}>
        {description}
      </Text>
    </div>
    <Divider my="md" style={{ flexShrink: 0 }} />
    <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</Box>
  </Paper>
);

const getOsLabel = (): string => {
  if (platformInfo.isMac) return 'macOS';
  if (platformInfo.isWindows) return 'Windows';
  if (platformInfo.isLinux) return 'Linux';
  if (platformInfo.isMobileOS) return 'Mobile';
  return 'Desktop';
};

const getRuntimeLabel = (): string => {
  const os = getOsLabel();
  if (isTauri()) return `Desktop App (${os})`;
  return `Web Browser (${os})`;
};

const InfoCard = ({
  icon,
  label,
  value,
  secondary,
  badge,
  badgeColor = 'blue',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  secondary?: string;
  badge?: ReactNode;
  badgeColor?: string;
}) => (
  <Paper
    withBorder
    p="sm"
    style={{
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 88,
    }}
  >
    <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
      <Group gap={6} wrap="nowrap">
        <ThemeIcon size="xs" variant="transparent" color="dimmed">
          {icon}
        </ThemeIcon>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
          {label}
        </Text>
      </Group>
      {badge && (
        <Badge size="xs" variant="light" color={badgeColor} tt="none">
          {badge}
        </Badge>
      )}
    </Group>
    <div>
      <Text fw={700} size="sm" style={{ wordBreak: 'break-word' }}>
        {value}
      </Text>
      {secondary && (
        <Text size="xs" c="dimmed" mt={2}>
          {secondary}
        </Text>
      )}
    </div>
  </Paper>
);

// ============================================================================
// Web — displays version, commit, timestamp and environment info.
// The web POS updates automatically via the browser and cloud deployments;
// cashiers do not need a manual "Check for updates" button.
// ============================================================================

const WebAbout = () => {
  const pwa = usePwaUpdate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const { data: setupStatus } = useSetupStatus();

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
    <AboutShell description={t('Application version, build information, and system details.')}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <InfoCard
          icon={<IconInfoCircle size={15} />}
          label={t('Application Version')}
          value={env.appVersion ? `v${env.appVersion}` : t('Unknown')}
          badge={env.commit ? env.commit.slice(0, 7) : undefined}
          secondary={env.appName || 'SimpleBash POS'}
        />
        <InfoCard
          icon={<IconClock size={15} />}
          label={t('Last Updated')}
          value={env.buildTime ? formatDateTime(env.buildTime) : t('Unknown')}
          secondary={t('Build timestamp')}
        />
        <InfoCard
          icon={<IconCircleCheck size={15} />}
          label={t('System Status')}
          value={t('Running latest release')}
          badge={t('Active')}
          badgeColor="teal"
        />
        <InfoCard
          icon={<IconServer size={15} />}
          label={t('Environment')}
          value={env.isProd ? t('Production') : t('Development')}
          badge={env.isProd ? 'Live' : 'Dev'}
          badgeColor={env.isProd ? 'teal' : 'orange'}
        />
        <InfoCard
          icon={<IconWorld size={15} />}
          label={t('Client Platform')}
          value={getRuntimeLabel()}
          badge="Web Client"
          badgeColor="blue"
        />
        <InfoCard
          icon={<IconGitBranch size={15} />}
          label={t('Deployment Mode')}
          value={env.multiTenant ? t('Multi-Tenant Cloud') : t('Cloud Web Client')}
        />
      </SimpleGrid>

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

      {pwa?.updateAvailable && (
        <>
          <Divider my="sm" />
          <Paper withBorder p="md" style={{ backgroundColor: 'var(--mantine-color-blue-light)' }}>
            <Group justify="space-between" wrap="wrap">
              <div>
                <Text fw={700} size="sm" c="blue">
                  {t('An update is ready in the background')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('Finish any sale you have started, then reload to switch to the new version.')}
                </Text>
              </div>
              <Button
                color="blue"
                size="xs"
                leftSection={<IconRefresh size={14} />}
                onClick={() => setConfirmOpen(true)}
              >
                {t('Reload to update')}
              </Button>
            </Group>
          </Paper>
        </>
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
    </AboutShell>
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

const DesktopAbout = () => {
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
      void cloudPing(); // opt-out usage ping; silent on any failure
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
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('prepare_for_update').catch((err: unknown) => {
        logger.error('updater', 'prepare_for_update.error', err, { version });
      });
      await logger.flush();

      const update = updateRef.current;
      if (update) {
        await update.install();
        logger.info('updater', 'install.done', { version });
      }

      logger.info('updater', 'relaunch', { version }, 'Restarting to finish the update');
      await logger.flush();

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

  const effectiveVersion = currentVersion || env.appVersion;

  return (
    <AboutShell
      description={t(
        'Application version, build details and software updates. Your sales and settings stay on this computer and are not affected.'
      )}
    >
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <InfoCard
          icon={<IconInfoCircle size={15} />}
          label={t('Application Version')}
          value={effectiveVersion ? `v${effectiveVersion}` : t('Unknown')}
          badge={env.commit ? env.commit.slice(0, 7) : undefined}
          secondary={env.appName || 'SimpleBash POS'}
        />
        <InfoCard
          icon={<IconClock size={15} />}
          label={t('Last Updated')}
          value={env.buildTime ? formatDateTime(env.buildTime) : t('Unknown')}
          secondary={t('Build timestamp')}
        />
        <InfoCard
          icon={<IconCircleCheck size={15} />}
          label={t('System Status')}
          value={t('Running latest release')}
          badge={t('Active')}
          badgeColor="teal"
        />
        <InfoCard
          icon={<IconServer size={15} />}
          label={t('Environment')}
          value={env.isProd ? t('Production') : t('Development')}
          badge={env.isProd ? 'Live' : 'Dev'}
          badgeColor={env.isProd ? 'teal' : 'orange'}
        />
        <InfoCard
          icon={<IconWorld size={15} />}
          label={t('Client Platform')}
          value={getRuntimeLabel()}
          badge="Native Shell"
          badgeColor="blue"
        />
        <InfoCard
          icon={<IconGitBranch size={15} />}
          label={t('Deployment Mode')}
          value={env.multiTenant ? t('Multi-Tenant Cloud') : t('Desktop POS')}
        />
      </SimpleGrid>

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

      <Divider label={t('Software Updates')} labelPosition="left" mt="xs" />

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
    </AboutShell>
  );
};

// ============================================================================

export const AboutSection = ({ onDirtyChange }: SectionProps) => {
  // Nothing here is an editable form, so the section is never "dirty".
  useEffect(() => {
    onDirtyChange(false);
  }, [onDirtyChange]);

  return isTauri() ? <DesktopAbout /> : <WebAbout />;
};

/**
 * Backward compatibility alias for any existing imports or references.
 */
export const UpdatesSection = AboutSection;
