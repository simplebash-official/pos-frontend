import { t } from '@/shared/i18n/t';
import { useRef } from 'react';
import { Badge, Box, Button, Center, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { LEVEL_COLOR, formatLogTime, recordKey, recordSummary } from '../lib/format';
import type { LogRecord } from '../types';

export interface LogTableProps {
  records: LogRecord[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onSelect: (record: LogRecord) => void;
}

const ROW_HEIGHT_DESKTOP = 36;
const ROW_HEIGHT_MOBILE = 64;

export const LogTable = ({
  records,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelect,
}: LogTableProps) => {
  const isMobile = useIsMobile();
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT_DESKTOP;
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 20,
  });

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (records.length === 0) {
    return (
      <Paper withBorder p="xl">
        <Text c="dimmed" ta="center" size="sm">
          {t('No log entries match these filters.')}
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      <Paper withBorder style={{ overflow: 'hidden' }}>
        <Box ref={parentRef} style={{ height: '60dvh', overflowY: 'auto' }}>
          <Box style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => {
              const record = records[item.index];
              return (
                <Box
                  key={recordKey(record)}
                  role="button"
                  tabIndex={0}
                  data-log-id="logs.entry"
                  onClick={() => onSelect(record)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onSelect(record);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: rowHeight,
                    transform: `translateY(${item.start}px)`,
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    padding: '6px 12px',
                  }}
                  className="log-row"
                >
                  <Group gap="xs" wrap={isMobile ? 'wrap' : 'nowrap'} style={{ minWidth: 0 }}>
                    <Text size="xs" ff="monospace" c="dimmed" style={{ flexShrink: 0 }}>
                      {formatLogTime(record.ts)}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={LEVEL_COLOR[record.level]}
                      style={{ flexShrink: 0, width: 52 }}
                    >
                      {record.level}
                    </Badge>
                    <Badge
                      size="xs"
                      variant="outline"
                      color="gray"
                      tt="none"
                      style={{ flexShrink: 0 }}
                    >
                      {record.source}
                    </Badge>
                    <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
                      {record.category}/{record.event}
                    </Text>
                    <Text size="sm" truncate="end" style={{ flex: 1, minWidth: 0 }}>
                      {recordSummary(record)}
                    </Text>
                  </Group>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {records.length} {t('entries shown')}
        </Text>
        {hasMore && (
          <Button variant="default" size="xs" loading={loadingMore} onClick={onLoadMore}>
            {t('Load older entries')}
          </Button>
        )}
      </Group>
    </Stack>
  );
};
