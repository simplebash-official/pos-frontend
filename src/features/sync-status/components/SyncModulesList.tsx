import { useState } from 'react';
import { Badge, Collapse, Group, Loader, Paper, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { formatDateTime } from '@/shared/lib/date';
import {
  chipText,
  groupPending,
  moduleRows,
  pendingLabel,
  type ModuleChip,
  type ModuleRow,
} from '../lib/syncView';
import { useNow } from '../hooks/useNow';
import { usePendingRecords } from '../hooks/useSyncStatus';
import type { SyncStatus } from '../types';

const CHIPS: Record<ModuleChip, { color: string; label: string }> = {
  upToDate: { color: 'teal', label: 'Up to date' },
  waiting: { color: 'yellow', label: 'Waiting' },
  sending: { color: 'blue', label: 'Sending' },
  receiving: { color: 'blue', label: 'Receiving' },
  done: { color: 'teal', label: 'Synced' },
  review: { color: 'orange', label: 'Needs review' },
};

const OP_LABEL = { upsert: 'Saved', delete: 'Removed' } as const;

const Chip = ({ row }: { row: ModuleRow }) => {
  const chip = CHIPS[row.chip];
  const active = row.chip === 'sending' || row.chip === 'receiving';
  return (
    <Badge
      color={chip.color}
      variant="light"
      data-module-chip={row.chip}
      leftSection={
        active ? (
          <Loader size={10} color={chip.color} />
        ) : row.chip === 'done' ? (
          <IconCheck size={12} />
        ) : undefined
      }
    >
      {chipText(row, t)}
    </Badge>
  );
};

/** Every kind of shop record and whether it is safe in the cloud. */
export const SyncModulesList = ({ status }: { status: SyncStatus }) => {
  // A finished row says what it just moved for a short while, then settles to "Up to date".
  const [tick, setTick] = useState(false);
  const now = useNow(tick);
  const rows = moduleRows(status, now);
  const fading = rows.some((r) => r.chip === 'done');
  if (fading !== tick) setTick(fading);
  const [open, setOpen] = useState<string | null>(null);
  const { records, failed } = usePendingRecords(open !== null, status.pendingOut);
  const grouped = records ? groupPending(records.items) : null;

  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t("What's syncing")}
      </Text>
      <Paper withBorder>
        {rows.map((row, index) => {
          const expandable = row.pending > 0;
          const isOpen = open === row.id && expandable;
          const items = grouped?.get(row.id) ?? [];
          return (
            <div
              key={row.id}
              style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
            >
              <UnstyledButton
                w="100%"
                p="sm"
                disabled={!expandable}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : row.id)}
                data-log-id={`sync.module.${row.id}`}
                style={{ minHeight: 44, cursor: expandable ? 'pointer' : 'default' }}
              >
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    {expandable ? (
                      isOpen ? (
                        <IconChevronDown size={16} />
                      ) : (
                        <IconChevronRight size={16} />
                      )
                    ) : (
                      <span style={{ width: 16, flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {t(row.label)}
                      </Text>
                      {row.chip === 'upToDate' && row.lastChangeAt && (
                        <Text size="xs" c="dimmed" truncate>
                          {t('Updated')} {formatDateTime(row.lastChangeAt)}
                        </Text>
                      )}
                    </div>
                  </Group>
                  <Chip row={row} />
                </Group>
              </UnstyledButton>
              <Collapse expanded={isOpen}>
                <Stack gap={4} px="md" pb="sm">
                  {failed && (
                    <Text size="xs" c="dimmed">
                      {t('Could not load the list. Try again in a moment.')}
                    </Text>
                  )}
                  {!failed && !grouped && <Loader size="xs" />}
                  {items.map((r) => (
                    <Group
                      key={`${r.resource}:${r.key}`}
                      justify="space-between"
                      gap="sm"
                      wrap="nowrap"
                    >
                      <Text size="xs" truncate>
                        {t(pendingLabel(r))}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                        {t(OP_LABEL[r.op])} · {formatDateTime(r.enqueuedAt)}
                      </Text>
                    </Group>
                  ))}
                  {records && records.total > records.items.length && (
                    <Text size="xs" c="dimmed">
                      {t('and more waiting')}
                    </Text>
                  )}
                </Stack>
              </Collapse>
            </div>
          );
        })}
      </Paper>
    </Stack>
  );
};
