import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { formatDateTime } from '@/shared/lib/date';
import { activityView } from '../lib/syncView';
import { phraseText } from '../lib/phrase';
import type { HistoryEntry } from '../types';

/** What sync did recently, newest first, in plain words. */
export const SyncActivityList = ({ history }: { history: HistoryEntry[] }) => (
  <Stack gap="xs">
    <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
      {t('Recent activity')}
    </Text>
    <Paper withBorder p="sm">
      {history.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('Nothing yet. Activity shows up here after the first sync.')}
        </Text>
      ) : (
        <Stack gap="xs">
          {history.map((entry, i) => {
            const view = activityView(entry);
            return (
              <Group key={`${entry.at}-${i}`} gap="sm" wrap="nowrap" align="flex-start">
                <Text size="xs" c="dimmed" style={{ width: 150, flexShrink: 0 }}>
                  {formatDateTime(entry.at)}
                </Text>
                <Badge color={view.tone} variant="light" style={{ flexShrink: 0 }}>
                  {t(view.title)}
                </Badge>
                <Text size="sm" style={{ minWidth: 0 }}>
                  {phraseText(view.detail, t)}
                </Text>
              </Group>
            );
          })}
        </Stack>
      )}
    </Paper>
  </Stack>
);
