import { t } from '@/shared/i18n/t';
import { PRODUCT_NAME } from '@/config/branding';
import type { ReactNode } from 'react';
import {
  Alert,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconDownload, IconFolderOpen, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { isTauri } from '@/shared/lib/runtime';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { logger, type LogConfig } from '@/shared/logging';
import {
  LogsViewer,
  exportLogs,
  formatBytes,
  openLogFolder,
  useLogConfig,
  useLogStats,
  useSaveLogConfig,
} from '@/features/logs';
import type { SectionProps } from './ShopProfileSection';

// ============================================================================
// Shared chrome — a read-only section, so no Save bar (like Updates).
// ============================================================================

const LogsShell = ({ children }: { children: ReactNode }) => (
  <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1, minWidth: 0 }}>
    <Stack gap="md">
      <div>
        <Text fw={700} size="lg">
          {t('Activity Log')}
        </Text>
        <Text size="sm" c="dimmed" mt={2}>
          {t(
            'Everything that happens in the app is recorded on this computer with its date, time and time zone, from the day it was installed.'
          )}
        </Text>
      </div>
      <Divider />
      {children}
    </Stack>
  </Paper>
);

const StatCell = ({
  label,
  value,
  border,
}: {
  label: string;
  value: ReactNode;
  border: boolean;
}) => (
  <Grid.Col span={{ base: 12, sm: 4 }}>
    <Stack gap={2} p="sm" style={border ? { borderRight: '1px solid var(--border)' } : undefined}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <Text fw={700} size="lg">
        {value}
      </Text>
    </Stack>
  </Grid.Col>
);

const LogSummary = () => {
  const stats = useLogStats();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const path = await exportLogs(undefined, undefined);
      if (path !== null) {
        notifications.show({ color: 'green', title: t('Log saved'), message: path });
      }
    } catch (err) {
      logger.error('app', 'log.export_failed', err);
      notifications.show({
        color: 'red',
        title: t('Could not save the log'),
        message: t('Please choose another folder and try again.'),
      });
    } finally {
      setExporting(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openLogFolder();
    } catch (err) {
      logger.error('app', 'log.open_folder_failed', err);
      notifications.show({ color: 'red', message: t('Could not open the log folder.') });
    }
  };

  return (
    <Stack gap="sm">
      <Paper withBorder>
        {stats.isLoading || stats.data === undefined ? (
          <Skeleton height={72} />
        ) : (
          <Grid gap={0}>
            <StatCell
              label={t('Recording since')}
              value={stats.data.firstDay === null ? '—' : stats.data.firstDay}
              border
            />
            <StatCell label={t('Days recorded')} value={stats.data.dayCount} border />
            <StatCell
              label={t('Space used')}
              value={formatBytes(stats.data.totalBytes)}
              border={false}
            />
          </Grid>
        )}
      </Paper>
      {stats.data !== undefined && (
        <Text size="xs" c="dimmed" ff="monospace" style={{ wordBreak: 'break-all' }}>
          {stats.data.logsDir}
        </Text>
      )}
      <Group gap="sm">
        <Button
          variant="default"
          leftSection={<IconFolderOpen size={16} />}
          onClick={() => void handleOpenFolder()}
        >
          {t('Open log folder')}
        </Button>
        <Button
          leftSection={<IconDownload size={16} />}
          loading={exporting}
          onClick={() => void handleExport()}
        >
          {t('Save a copy (ZIP)')}
        </Button>
      </Group>
    </Stack>
  );
};

const LogOptions = () => {
  const config = useLogConfig();
  const save = useSaveLogConfig();

  if (config.data === undefined) {
    return <Skeleton height={96} />;
  }
  const current = config.data;
  const update = (patch: Partial<LogConfig>) => {
    save.mutate(
      { ...current, ...patch },
      {
        onError: () =>
          notifications.show({ color: 'red', message: t('Could not save the logging options.') }),
      }
    );
  };

  return (
    <Stack gap="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('What to record')}
      </Text>
      <Switch
        label={t('Record the full content of every request')}
        description={t('Passwords and secret keys are always hidden.')}
        checked={current.httpBodies}
        disabled={save.isPending}
        onChange={(event) => update({ httpBodies: event.currentTarget.checked })}
      />
      <Switch
        label={t('Record every focus change and scroll')}
        description={t('Very detailed. Use only while looking into a problem.')}
        checked={current.uiTrace}
        disabled={save.isPending}
        onChange={(event) => update({ uiTrace: event.currentTarget.checked })}
      />
      <Select
        label={t('Database activity')}
        description={t('Changes to this take effect the next time the app starts.')}
        maw={360}
        data={[
          { value: 'all', label: t('Every database action') },
          { value: 'slow', label: t('Only slow database actions') },
          { value: 'off', label: t('Do not record database actions') },
        ]}
        value={current.sql}
        disabled={save.isPending}
        allowDeselect={false}
        onChange={(value) => {
          if (value === 'all' || value === 'slow' || value === 'off') {
            update({ sql: value });
          }
        }}
      />
    </Stack>
  );
};

export const LogsSection = (_props: SectionProps) => {
  const userRole = useAppSelector(selectUserRole);

  if (!isTauri()) {
    return (
      <LogsShell>
        <Alert color="blue" icon={<IconInfoCircle size={20} />} title={t('Desktop Only Feature')}>
          {t(`The activity log is only available in the desktop version of ${PRODUCT_NAME}.`)}
        </Alert>
      </LogsShell>
    );
  }

  if (userRole !== USER_ROLES.ADMIN) {
    return (
      <LogsShell>
        <Alert
          color="yellow"
          icon={<IconAlertCircle size={20} />}
          title={t('Admin Access Required')}
        >
          {t('Only administrators can view the activity log.')}
        </Alert>
      </LogsShell>
    );
  }

  return (
    <LogsShell>
      <LogSummary />
      <LogOptions />
      <Divider />
      <LogsViewer />
    </LogsShell>
  );
};
