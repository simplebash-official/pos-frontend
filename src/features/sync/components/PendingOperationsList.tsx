import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconRefresh, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { EmptyState } from '@/shared/components/EmptyState';
import { IconCheck } from '@tabler/icons-react';
import { formatDateTime } from '@/shared/lib/date';
import { db } from '@/offline/db/schema';
import type { OutboxOp, OutboxStatus } from '@/offline/db/tables';
import { retryOperation } from '@/offline/outbox/outbox';
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
export function PendingOperationsList({ operations }: PendingOperationsListProps) {
  if (operations.length === 0) {
    return (
      <EmptyState
        icon={<IconCheck size={28} />}
        title="Nothing waiting to sync"
        description="Every change on this device has been saved to the server."
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
    await db.outbox.delete(op.seq);
    notifications.show({
      title: 'Change discarded',
      message: 'That change will not be sent to the server.',
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
                    <Tooltip label="Try again">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="lg"
                        aria-label="Retry this change"
                        onClick={() => void handleRetry(op)}
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Discard this change">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="lg"
                        aria-label="Discard this change"
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
}
