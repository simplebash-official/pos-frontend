import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Alert, Badge, Button, Code, Collapse, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { formatDateTime } from '@/shared/lib/date';
import { logger } from '@/shared/logging';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import { listConflicts, resolveConflict } from '../api/syncStatusApi';
import { conflictLabel, openConflicts, toSyncError } from '../lib/statusView';
import { useSyncStatus } from '../hooks/useSyncStatus';
import type { SyncConflict } from '../types';

const ConflictRow = ({
  conflict,
  onResolve,
  resolving,
}: {
  conflict: SyncConflict;
  onResolve: (key: string) => void;
  resolving: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap="xs">
            <Badge color="orange" variant="light">
              {t(conflictLabel(conflict.kind))}
            </Badge>
            <Text size="sm" fw={600} truncate>
              {conflict.resource} · {conflict.entityKey}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {formatDateTime(conflict.detectedAt)}
          </Text>
        </Stack>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="subtle"
            onClick={() => setOpen((v) => !v)}
            data-log-id="sync.conflict-details"
          >
            {open ? t('Hide details') : t('Details')}
          </Button>
          <Button
            size="xs"
            variant="light"
            loading={resolving}
            onClick={() => onResolve(conflict.key)}
            data-log-id="sync.conflict-resolve"
          >
            {t('Mark as reviewed')}
          </Button>
        </Group>
      </Group>
      <Collapse expanded={open}>
        <Code block mt="sm" style={{ maxHeight: 220, overflow: 'auto' }}>
          {JSON.stringify(conflict.detail, null, 2)}
        </Code>
      </Collapse>
    </Paper>
  );
};

/**
 * Settings → Sync conflicts. Conflicts never block selling: they are records of
 * something worth a second look (an item edited on two devices, a serial number
 * sold twice, a refund above the sale). Reviewing one just marks it done.
 */
export const ConflictsSection = (_props: SectionProps) => {
  const status = useSyncStatus();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.syncStatus.conflicts(),
    queryFn: listConflicts,
    enabled: status.linked,
    refetchInterval: 30_000,
  });
  const resolve = useMutation({
    mutationFn: (key: string) => resolveConflict(key, 'reviewed'),
    onSuccess: () => {
      logger.info('app', 'sync.conflict_reviewed');
      return queryClient.invalidateQueries({ queryKey: queryKeys.syncStatus.conflicts() });
    },
    onError: (err) => notifications.show({ color: 'red', message: toSyncError(err).message }),
  });

  const open = openConflicts(data ?? []);

  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="md">
        <div>
          <Text fw={700} size="lg">
            {t('Sync conflicts')}
          </Text>
          <Text size="sm" c="dimmed" mt={2}>
            {t(
              'Things worth a second look after devices synced. Nothing here stops you from selling.'
            )}
          </Text>
        </div>

        {!status.linked ? (
          <Alert color="gray" variant="light">
            {t('This device is not linked to a cloud account yet. Link it under Cloud Account first.')}
          </Alert>
        ) : error ? (
          <Alert color="red" variant="light">
            {toSyncError(error).message}
          </Alert>
        ) : open.length === 0 && !isLoading ? (
          <Alert color="teal" variant="light">
            {t('No conflicts to review.')}
          </Alert>
        ) : (
          <Stack gap="xs">
            {open.map((conflict) => (
              <ConflictRow
                key={conflict.key}
                conflict={conflict}
                onResolve={(key) => resolve.mutate(key)}
                resolving={resolve.isPending && resolve.variables === conflict.key}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
