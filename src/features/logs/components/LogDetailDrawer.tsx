import { t } from '@/shared/i18n/t';
import { Badge, Button, Code, Group, Paper, ScrollArea, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCopy, IconFileText, IconRoute } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { LEVEL_COLOR, formatLogTime } from '../lib/format';
import type { LogRecord } from '../types';

export interface LogDetailDrawerProps {
  record: LogRecord | null;
  onClose: () => void;
  onTraceRequest: (requestId: string) => void;
}

const MetaRow = ({ label, value }: { label: string; value: string | undefined }) =>
  value === undefined || value === '' ? null : (
    <Group justify="space-between" gap="md" wrap="nowrap">
      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="xs" ff="monospace" ta="right" style={{ wordBreak: 'break-all' }}>
        {value}
      </Text>
    </Group>
  );

export const LogDetailDrawer = ({ record, onClose, onTraceRequest }: LogDetailDrawerProps) => {
  const isMobile = useIsMobile();

  const copy = async (entry: LogRecord) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      notifications.show({ color: 'green', message: t('Log entry copied') });
    } catch {
      notifications.show({ color: 'red', message: t('Could not copy the log entry') });
    }
  };

  return (
    <DetailDrawer
      data={record}
      opened={record !== null}
      onClose={onClose}
      size={isMobile ? '100%' : 'lg'}
      title={
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="lg">
            <IconFileText size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              {t('Log Entry Details')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('Exactly what was recorded, with its local time')}
            </Text>
          </div>
        </Group>
      }
    >
      {(entry) => (
        <Stack gap="md">
          <Paper p="md" withBorder bg="var(--mantine-color-body)">
            <Stack gap="xs">
              <Group gap="xs">
                <Badge color={LEVEL_COLOR[entry.level]} variant="light">
                  {entry.level}
                </Badge>
                <Badge color="gray" variant="outline" tt="none">
                  {entry.source}
                </Badge>
                <Badge color="blue" variant="light" tt="none">
                  {entry.category}/{entry.event}
                </Badge>
              </Group>
              {entry.msg !== undefined && (
                <Text fw={700} size="md" style={{ wordBreak: 'break-word' }}>
                  {entry.msg}
                </Text>
              )}
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap={6}>
              <MetaRow label={t('Local time')} value={formatLogTime(entry.ts)} />
              <MetaRow label={t('Time zone')} value={entry.tz} />
              <MetaRow label={t('UTC time')} value={entry.ts_utc} />
              <MetaRow label={t('Screen')} value={entry.route} />
              <MetaRow label={t('Signed-in user')} value={entry.session_user} />
              <MetaRow label={t('Request ID')} value={entry.request_id} />
              <MetaRow label={t('App version')} value={entry.app_version} />
              <MetaRow label={t('App session')} value={entry.boot_id} />
              <MetaRow label={t('Sequence')} value={String(entry.seq)} />
            </Stack>
          </Paper>

          {entry.data !== undefined && (
            <Stack gap={4}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                {t('Details')}
              </Text>
              <ScrollArea.Autosize mah="45dvh" type="auto">
                <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(entry.data, null, 2)}
                </Code>
              </ScrollArea.Autosize>
            </Stack>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="default" leftSection={<IconCopy size={16} />} onClick={() => void copy(entry)}>
              {t('Copy')}
            </Button>
            {entry.request_id !== undefined && (
              <Button
                leftSection={<IconRoute size={16} />}
                onClick={() => onTraceRequest(entry.request_id as string)}
              >
                {t('Trace this request')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </DetailDrawer>
  );
};
