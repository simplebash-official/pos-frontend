import { t } from '@/shared/i18n/t';

// DISABLED, NOT DEAD — do not delete. This folder's engine was removed;
// this file is kept for a future sync backend. See src/features/sync/README.md.
import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconRefresh, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { EmptyState } from '@/shared/components/EmptyState';
import { IconCheck } from '@tabler/icons-react';
import { formatDateTime } from '@/shared/lib/date';
import type { OutboxOp, OutboxStatus } from '@/offline/db/tables';
import { discardOperation, retryOperation } from '@/offline/outbox/outbox';
import { syncEngine } from '@/offline/engine/SyncEngine';

export interface PendingOperationsListProps {
  operations: OutboxOp[];
}

const STATUS_LABEL: Record<OutboxStatus, { label: string; color: string }> = {
  queued: { label: 'Waiting', color: 'orange' },
  inflight: { label: 'Uploading', color: 'blue' },
  failed: { label: 'Retrying', color: 'yellow' },
  dead: { label: 'Rejected', color: 'red' },
  conflict: { label: 'Conflict', color: 'red' },
};

/**
 * The queue of local changes that have not reached the server.
 *
 * Rejected entries stay here rather than disappearing — a change that was
 * silently dropped is indistinguishable from one that was never made.
 */
export const PendingOperationsList = ({ operations }: PendingOperationsListProps) => {
  if (operations.length === 0) {
    return (
      <EmptyState
        icon={<IconCheck size={28} />}
        title={t('Nothing waiting to sync')}
        description={t('Every change on this device has been saved to the server.')}
      />
    );
  }

  const handleRetry = async (op: OutboxOp) => {
    if (op.seq === undefined) {
      return;
    }
    await retryOperation(op.seq);
    syncEngine.requestFlush();
    notifications.show({
      title: 'Retrying',
      message: 'The change has been put back in the queue.',
      color: 'blue',
    });
  };

  const handleDiscard = async (op: OutboxOp) => {
    if (op.seq === undefined) {
      return;
    }
    // Rolls back the local write as well as dropping the queue entry.
    // Deleting the entry alone leaves the mirror row flagged `_pending`, and
    // the puller skips pending rows — so the record could never again be
    // corrected by the server.
    await discardOperation(op.seq);
    notifications.show({
      title: 'Change discarded',
      message: 'That change was undone and will not be sent to the server.',
      color: 'orange',
    });
  };

  return (
    <Stack gap="xs">
      {operations.map((op) => {
        const status = STATUS_LABEL[op.status];
        const isActionable = op.status === 'dead' || op.status === 'conflict';

        return (
          <Paper key={op.seq} p="sm" withBorder>
            <Group justify="space-between" wrap="nowrap" align="flex-start" gap="xs">
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} lineClamp={2}>
                  {op.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDateTime(op.createdAt)}
                  {op.attempts > 0 ? ` · ${op.attempts} attempt(s)` : ''}
                </Text>
                {op.lastError !== null && (
                  <Text size="xs" c="red" style={{ wordBreak: 'break-word' }}>
                    {op.lastError.message}
                  </Text>
                )}
              </Stack>

              <Group gap={4} wrap="nowrap">
                <Badge size="xs" color={status.color} variant="light">
                  {status.label}
                </Badge>
                {isActionable && (
                  <>
                    <Tooltip label={t('Try again')}>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="lg"
                        aria-label={t('Retry this change')}
                        onClick={() => void handleRetry(op)}
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('Discard this change')}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="lg"
                        aria-label={t('Discard this change')}
                        onClick={() => void handleDiscard(op)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </Group>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
};
