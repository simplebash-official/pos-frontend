// DISABLED, NOT DEAD — do not delete. This folder's engine was removed;
// this file is kept for a future sync backend. See src/features/sync/README.md.
import { Badge, Group, Stack, Text } from '@mantine/core';
import { ExpandableCard } from '@/shared/components/ExpandableCard';
import { formatDateTime } from '@/shared/lib/date';
import type { ModuleSyncView } from '@/offline/types';
import { MODULE_STATUS_PRESENTATION } from '../types';

export interface SyncModuleCardProps {
  module: ModuleSyncView;
  pendingCount: number;
}

/** One row of the per-module sync dashboard. */
export const SyncModuleCard = ({ module, pendingCount }: SyncModuleCardProps) => {
  const presentation = MODULE_STATUS_PRESENTATION[module.status];

  return (
    <ExpandableCard
      value={module.resource}
      color={presentation.color}
      title={module.label}
      subtitle={
        module.status === 'never'
          ? 'Not available offline yet'
          : `${module.rowCount} record${module.rowCount === 1 ? '' : 's'} stored on this device`
      }
      actions={
        <Group gap="xs" wrap="nowrap">
          {pendingCount > 0 && (
            <Badge size="xs" color="orange" variant="light">
              {pendingCount} queued
            </Badge>
          )}
          <Badge size="xs" color={presentation.color} variant="light">
            {presentation.label}
          </Badge>
        </Group>
      }
    >
      <Stack gap={6} pt="xs">
        <Group justify="space-between" gap="xs">
          <Text size="xs" c="dimmed">
            Last downloaded
          </Text>
          <Text size="xs">
            {module.lastPulledAt ? formatDateTime(module.lastPulledAt) : 'Never'}
          </Text>
        </Group>
        <Group justify="space-between" gap="xs">
          <Text size="xs" c="dimmed">
            Last uploaded
          </Text>
          <Text size="xs">
            {module.lastPushedAt ? formatDateTime(module.lastPushedAt) : 'Never'}
          </Text>
        </Group>
        {module.lastError !== null && (
          <Text size="xs" c="red" style={{ wordBreak: 'break-word' }}>
            {module.lastError}
          </Text>
        )}
      </Stack>
    </ExpandableCard>
  );
};
