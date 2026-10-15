import { t } from '@/shared/i18n/t';
import { Button, Code, Group, ScrollArea, Stack, Text } from '@mantine/core';
import {
  IconCalendarTime,
  IconCopy,
  IconDeviceDesktop,
  IconFileText,
  IconHash,
  IconRoute,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  CopyIconButton,
  DrawerCard,
  DrawerFooter,
  DrawerHero,
  InfoRow,
  RichDrawer,
} from '@/shared/components/drawer';
import { LEVEL_COLOR, formatLogTime } from '../lib/format';
import type { LogRecord } from '../types';

export interface LogDetailDrawerProps {
  record: LogRecord | null;
  onClose: () => void;
  onTraceRequest: (requestId: string) => void;
}

/** A line of the meta card; nothing is shown for a value the entry does not have. */
const MetaRow = ({
  icon,
  label,
  value,
  copyLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  /** Give the value a copy button, named for assistive technology by this. */
  copyLabel?: string;
}) =>
  value === undefined || value === '' ? null : (
    <InfoRow icon={icon} label={label} mono>
      <Group gap={2} wrap="nowrap" justify="flex-end">
        <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{value}</span>
        {copyLabel !== undefined && <CopyIconButton value={value} label={copyLabel} />}
      </Group>
    </InfoRow>
  );

export const LogDetailDrawer = ({ record, onClose, onTraceRequest }: LogDetailDrawerProps) => {
  const copy = async (entry: LogRecord) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      notifications.show({ color: 'green', message: t('Log entry copied') });
    } catch {
      notifications.show({ color: 'red', message: t('Could not copy the log entry') });
    }
  };

  return (
    <RichDrawer
      data={record}
      opened={record !== null}
      onClose={onClose}
      width="standard"
      title={{
        icon: <IconFileText size={20} />,
        text: t('Log Entry Details'),
        subtitle: t('Exactly what was recorded, with its local time'),
      }}
      footer={(entry) => (
        <DrawerFooter>
          <Button
            variant="default"
            size="sm"
            leftSection={<IconCopy size={16} />}
            onClick={() => void copy(entry)}
          >
            {t('Copy')}
          </Button>
          {entry.request_id !== undefined && (
            <Button
              size="sm"
              leftSection={<IconRoute size={16} />}
              onClick={() => onTraceRequest(entry.request_id as string)}
            >
              {t('Trace this request')}
            </Button>
          )}
        </DrawerFooter>
      )}
    >
      {(entry) => (
        <Stack gap="md">
          <DrawerHero
            accent={LEVEL_COLOR[entry.level]}
            icon={<IconFileText size={32} />}
            eyebrow={`${entry.category}/${entry.event}`}
            status={{ color: LEVEL_COLOR[entry.level], label: entry.level }}
            title={entry.msg !== undefined ? entry.msg : `${entry.category}/${entry.event}`}
            subtitle={entry.source}
          />

          <DrawerCard label={t('Details')} icon={<IconCalendarTime size={14} />}>
            <Stack gap="xs">
              <MetaRow
                icon={<IconCalendarTime size={16} />}
                label={t('Local time')}
                value={formatLogTime(entry.ts)}
              />
              <MetaRow icon={<IconWorld size={16} />} label={t('Time zone')} value={entry.tz} />
              <MetaRow icon={<IconWorld size={16} />} label={t('UTC time')} value={entry.ts_utc} />
              <MetaRow
                icon={<IconDeviceDesktop size={16} />}
                label={t('Screen')}
                value={entry.route}
              />
              <MetaRow
                icon={<IconUser size={16} />}
                label={t('Signed-in user')}
                value={entry.session_user}
              />
              <MetaRow
                icon={<IconRoute size={16} />}
                label={t('Request ID')}
                value={entry.request_id}
                copyLabel={t('Copy request ID')}
              />
              <MetaRow
                icon={<IconHash size={16} />}
                label={t('App version')}
                value={entry.app_version}
              />
              <MetaRow
                icon={<IconHash size={16} />}
                label={t('App session')}
                value={entry.boot_id}
              />
              <MetaRow
                icon={<IconHash size={16} />}
                label={t('Sequence')}
                value={String(entry.seq)}
              />
            </Stack>
          </DrawerCard>

          {entry.data !== undefined && (
            <DrawerCard label={t('Data')} icon={<IconFileText size={14} />}>
              <ScrollArea.Autosize mah="45dvh" type="auto">
                <Text component="div" size="xs">
                  <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(entry.data, null, 2)}
                  </Code>
                </Text>
              </ScrollArea.Autosize>
            </DrawerCard>
          )}
        </Stack>
      )}
    </RichDrawer>
  );
};
