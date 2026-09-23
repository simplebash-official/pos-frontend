import { t } from '@/shared/i18n/t';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useLiveTail, useLogDays, useLogQuery } from '../hooks/useLogs';
import { EMPTY_FILTERS, matchesFilters, recordKey } from '../lib/format';
import type { LogFilters, LogRecord } from '../types';
import { LogDetailDrawer } from './LogDetailDrawer';
import { LogFiltersBar } from './LogFiltersBar';
import { LogTable } from './LogTable';

/** Live entries kept on top of the loaded pages before a reload is needed. */
const MAX_LIVE_ENTRIES = 2000;

/**
 * Browse the desktop activity log: filter by day, source, level, category,
 * text or request id; follow new entries live; open any entry in full.
 */
export const LogsViewer = () => {
  const [filters, setFilters] = useState<LogFilters>(EMPTY_FILTERS);
  const [live, setLive] = useState(false);
  const [liveEntries, setLiveEntries] = useState<LogRecord[]>([]);
  const [selected, setSelected] = useState<LogRecord | null>(null);
  // Bumped when filters are replaced from outside the filter bar, so it
  // remounts with a fresh search draft.
  const [filtersEpoch, setFiltersEpoch] = useState(0);

  const days = useLogDays();
  const query = useLogQuery(filters);

  const changeFilters = useCallback((next: LogFilters) => {
    setLiveEntries([]);
    setFilters(next);
  }, []);

  useLiveTail(live, (entries) => {
    const matching = entries.filter((entry) => matchesFilters(entry, filters));
    if (matching.length > 0) {
      setLiveEntries((current) => [...matching.reverse(), ...current].slice(0, MAX_LIVE_ENTRIES));
    }
  });

  const records = useMemo(() => {
    const loaded = query.data === undefined ? [] : query.data.pages.flatMap((page) => page.entries);
    const seen = new Set<string>();
    return [...liveEntries, ...loaded].filter((record) => {
      const key = recordKey(record);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [liveEntries, query.data]);

  return (
    <Stack gap="md">
      <LogFiltersBar
        key={filtersEpoch}
        filters={filters}
        days={days.data === undefined ? [] : days.data}
        live={live}
        onChange={changeFilters}
        onLiveChange={setLive}
        onRefresh={() => {
          setLiveEntries([]);
          void query.refetch();
          void days.refetch();
        }}
      />
      {query.isError && (
        <Alert color="red" icon={<IconAlertCircle size={18} />} title={t('Could not read the log')}>
          {query.error instanceof Error ? query.error.message : String(query.error)}
        </Alert>
      )}
      <LogTable
        records={records}
        loading={query.isLoading}
        hasMore={query.hasNextPage}
        loadingMore={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
        onSelect={setSelected}
      />
      <LogDetailDrawer
        record={selected}
        onClose={() => setSelected(null)}
        onTraceRequest={(requestId) => {
          setSelected(null);
          setFiltersEpoch((epoch) => epoch + 1);
          changeFilters({ ...EMPTY_FILTERS, requestId, minLevel: undefined });
        }}
      />
    </Stack>
  );
};
