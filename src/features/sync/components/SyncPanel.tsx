import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCloudOff,
  IconDatabase,
  IconDownload,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ExpandableCardGroup } from '@/shared/components/ExpandableCard';
import { formatDateTime } from '@/shared/lib/date';
import {
  clearLocalData,
  estimateStorage,
  exportDiagnostics,
  forceFullResync,
  type StorageEstimate,
} from '@/offline/db/maintenance';
import { syncEngine } from '@/offline/engine/SyncEngine';
import { getDeviceId } from '@/offline/ids/deviceId';
import { usePendingOperations } from '@/offline/react/useSyncData';
import { MAX_CLOCK_SKEW_MS } from '@/offline/constants';
import { useAppSelector } from '@/store/hooks';
import {
  selectConnectivity,
  selectModuleViews,
  selectIsSyncLeader,
  selectOverallSyncStatus,
  selectSyncTotals,
} from '@/store/slices/syncSlice';
import { OVERALL_STATUS_PRESENTATION } from '../types';
import { PendingOperationsList } from './PendingOperationsList';
import { SyncModuleCard } from './SyncModuleCard';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * The sync dashboard body.
 *
 * Shared by the shell-level drawer and the Settings page section so both show
 * exactly the same picture.
 */
export const SyncPanel = () => {
  const status = useAppSelector(selectOverallSyncStatus);
  const connectivity = useAppSelector(selectConnectivity);
  const modules = useAppSelector(selectModuleViews);
  const totals = useAppSelector(selectSyncTotals);
  const isLeader = useAppSelector(selectIsSyncLeader);
  const { data: operations } = usePendingOperations();

  const [storage, setStorage] = useState<StorageEstimate | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);

  useEffect(() => {
    void estimateStorage().then(setStorage);
  }, [operations.length]);

  const presentation = OVERALL_STATUS_PRESENTATION[status];
  const pendingByResource = new Map<string, number>();
  for (const op of operations) {
    pendingByResource.set(op.resource, (pendingByResource.get(op.resource) ?? 0) + 1);
  }

  const clockSkew = connectivity.clockSkewMs;
  const hasBadClock = clockSkew !== null && Math.abs(clockSkew) > MAX_CLOCK_SKEW_MS;

  const handleSyncNow = () => {
    void syncEngine.syncNow();
  };

  const handleForceResync = async () => {
    setIsResyncing(true);
    try {
      await forceFullResync();
      await syncEngine.syncNow();
      notifications.show({
        title: 'Re-downloading everything',
        message: 'All modules are being downloaded again from the server.',
        color: 'blue',
      });
    } finally {
      setIsResyncing(false);
    }
  };

  const handleExport = async () => {
    const diagnostics = await exportDiagnostics();
    const blob = new Blob([diagnostics], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jana2u-sync-diagnostics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLocalData = async () => {
    try {
      await clearLocalData({ discardPendingChanges: true });
      setConfirmClearOpen(false);
      notifications.show({
        title: 'Local data cleared',
        message: 'Everything will be downloaded again from the server.',
        color: 'orange',
      });
      await syncEngine.syncNow();
    } catch (error) {
      notifications.show({
        title: 'Could not clear local data',
        message: error instanceof Error ? error.message : String(error),
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Connection */}
      <Paper p="md" withBorder>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon variant="light" color={presentation.color} size="lg">
              {connectivity.state === 'offline' ? (
                <IconCloudOff size={20} />
              ) : (
                <IconRefresh size={20} />
              )}
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={600}>{presentation.label}</Text>
              <Text size="xs" c="dimmed">
                {connectivity.lastReachableAt !== null
                  ? `Server last reached ${formatDateTime(new Date(connectivity.lastReachableAt).toISOString())}`
                  : 'Server has not been reached yet'}
              </Text>
            </Stack>
          </Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={handleSyncNow}
          >
            Sync now
          </Button>
        </Group>

        {totals.pending > 0 && (
          <Text size="xs" c="dimmed" mt="sm">
            {totals.pending} change{totals.pending === 1 ? '' : 's'} waiting to upload.
          </Text>
        )}
      </Paper>

      {connectivity.state === 'offline' && (
        <Alert color="orange" icon={<IconCloudOff size={16} />} title="Working offline">
          You can keep selling and editing. Everything is saved on this device and uploads
          automatically once the connection returns.
        </Alert>
      )}

      {hasBadClock && (
        <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Device clock is wrong">
          This device&apos;s clock is off by about {Math.round(Math.abs(clockSkew) / 60_000)}{' '}
          minutes. Fix the date and time — records saved offline may be filed under the wrong time.
        </Alert>
      )}

      {!isLeader && (
        <Alert color="blue" title="Syncing in another tab">
          Another tab of this app is handling the sync. Everything here stays up to date.
        </Alert>
      )}

      {/* Modules */}
      <Stack gap="xs">
        <Text fw={600} size="sm">
          Modules
        </Text>
        <ExpandableCardGroup>
          {modules.map((module) => (
            <SyncModuleCard
              key={module.resource}
              module={module}
              pendingCount={pendingByResource.get(module.resource) ?? 0}
            />
          ))}
        </ExpandableCardGroup>
      </Stack>

      <Divider />

      {/* Queue */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600} size="sm">
            Changes waiting to sync
          </Text>
          {totals.dead + totals.conflicts > 0 && (
            <Badge size="xs" color="red" variant="light">
              {totals.dead + totals.conflicts} need attention
            </Badge>
          )}
        </Group>
        <PendingOperationsList operations={operations} />
      </Stack>

      <Divider />

      {/* Maintenance */}
      <Stack gap="xs">
        <Text fw={600} size="sm">
          This device
        </Text>

        {storage?.usageBytes !== null && storage?.quotaBytes ? (
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                <IconDatabase
                  size={12}
                  style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}
                />
                Storage used
              </Text>
              <Text size="xs">
                {formatBytes(storage.usageBytes)} of {formatBytes(storage.quotaBytes)}
              </Text>
            </Group>
            <Progress
              value={(storage.ratio ?? 0) * 100}
              color={storage.isNearLimit ? 'red' : 'blue'}
              size="sm"
            />
          </Stack>
        ) : null}

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Device ID
          </Text>
          <Text size="xs" style={{ fontFamily: 'monospace' }}>
            {getDeviceId().slice(0, 8)}
          </Text>
        </Group>

        <Group gap="xs" mt="xs" wrap="wrap">
          <Button
            size="xs"
            variant="default"
            leftSection={<IconRefresh size={14} />}
            loading={isResyncing}
            onClick={() => void handleForceResync()}
          >
            Re-download everything
          </Button>
          <Button
            size="xs"
            variant="default"
            leftSection={<IconDownload size={14} />}
            onClick={() => void handleExport()}
          >
            Export diagnostics
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => setConfirmClearOpen(true)}
          >
            Clear local data
          </Button>
        </Group>
      </Stack>

      <ConfirmDialog
        opened={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => void handleClearLocalData()}
        title="Clear all local data?"
        confirmLabel="Clear everything"
        confirmColor="red"
      >
        <Stack gap="xs">
          <Text size="sm">
            This deletes everything stored on this device and downloads it again from the server.
          </Text>
          {totals.pending > 0 && (
            <Alert color="red" icon={<IconAlertTriangle size={16} />}>
              {totals.pending} change{totals.pending === 1 ? '' : 's'} on this device{' '}
              {totals.pending === 1 ? 'has' : 'have'} not reached the server yet and will be lost
              permanently.
            </Alert>
          )}
        </Stack>
      </ConfirmDialog>
    </Stack>
  );
};
