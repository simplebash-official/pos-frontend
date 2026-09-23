import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Switch,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconRefresh, IconSearch, IconX } from '@tabler/icons-react';
import { EMPTY_FILTERS, LOG_LEVELS } from '../lib/format';
import type { LogDayInfo, LogFilters, LogLevel } from '../types';

const SEARCH_DEBOUNCE_MS = 400;

const KNOWN_CATEGORIES = [
  'app',
  'auth',
  'command',
  'db',
  'domain',
  'error',
  'http',
  'lifecycle',
  'modal',
  'nav',
  'notification',
  'onboarding',
  'perf',
  'print',
  'query',
  'render',
  'shortcut',
  'sidecar',
  'state',
  'system',
  'ui',
  'updater',
  'window',
];

export interface LogFiltersBarProps {
  filters: LogFilters;
  days: LogDayInfo[];
  live: boolean;
  onChange: (filters: LogFilters) => void;
  onLiveChange: (live: boolean) => void;
  onRefresh: () => void;
}

/**
 * Filter controls for the log viewer. The search box keeps its own draft
 * text (debounced into `filters.text`); when filters are replaced from
 * outside (e.g. "Trace this request"), the parent remounts this component
 * via `key` so the draft starts fresh.
 */
export const LogFiltersBar = ({
  filters,
  days,
  live,
  onChange,
  onLiveChange,
  onRefresh,
}: LogFiltersBarProps) => {
  const [search, setSearch] = useState(filters.text === undefined ? '' : filters.text);

  useEffect(() => {
    const next = search.trim() === '' ? undefined : search.trim();
    if (next === filters.text) {
      return undefined;
    }
    const timer = setTimeout(() => onChange({ ...filters, text: next }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, filters, onChange]);

  const dayOptions = days.map((d) => ({ value: d.day, label: d.day }));
  const sourceOptions = Array.from(new Set(days.flatMap((d) => d.sources))).sort();
  const levelOptions = LOG_LEVELS.map((level) => ({ value: level, label: level.toUpperCase() }));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
      <Select
        label={t('From day')}
        placeholder={t('Earliest')}
        data={dayOptions}
        value={filters.fromDay === undefined ? null : filters.fromDay}
        onChange={(value) => onChange({ ...filters, fromDay: value === null ? undefined : value })}
        clearable
        searchable
      />
      <Select
        label={t('To day')}
        placeholder={t('Latest')}
        data={dayOptions}
        value={filters.toDay === undefined ? null : filters.toDay}
        onChange={(value) => onChange({ ...filters, toDay: value === null ? undefined : value })}
        clearable
        searchable
      />
      <MultiSelect
        label={t('Sources')}
        placeholder={t('All sources')}
        data={sourceOptions}
        value={filters.sources}
        onChange={(sources) => onChange({ ...filters, sources })}
        clearable
      />
      <Select
        label={t('Lowest level shown')}
        data={levelOptions}
        value={filters.minLevel === undefined ? 'trace' : filters.minLevel}
        onChange={(value) =>
          onChange({ ...filters, minLevel: value === null ? undefined : (value as LogLevel) })
        }
        allowDeselect={false}
      />
      <MultiSelect
        label={t('Categories')}
        placeholder={t('All categories')}
        data={KNOWN_CATEGORIES}
        value={filters.categories}
        onChange={(categories) => onChange({ ...filters, categories })}
        searchable
        clearable
      />
      <TextInput
        label={t('Search')}
        placeholder={t('Any word in the entry')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <TextInput
        label={t('Request ID')}
        placeholder={t('Follow one action end to end')}
        value={filters.requestId === undefined ? '' : filters.requestId}
        onChange={(event) => {
          const value = event.currentTarget.value.trim();
          onChange({ ...filters, requestId: value === '' ? undefined : value });
        }}
        rightSection={
          filters.requestId === undefined ? undefined : (
            <ActionIcon
              variant="subtle"
              aria-label={t('Clear request ID')}
              onClick={() => onChange({ ...filters, requestId: undefined })}
            >
              <IconX size={14} />
            </ActionIcon>
          )
        }
      />
      <Group gap="sm" align="flex-end" wrap="nowrap">
        <Switch
          label={t('Live')}
          checked={live}
          onChange={(event) => onLiveChange(event.currentTarget.checked)}
          mb={8}
        />
        <Tooltip label={t('Reload entries')}>
          <ActionIcon
            variant="default"
            size="lg"
            aria-label={t('Reload entries')}
            onClick={onRefresh}
            mb={2}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
        <Button
          variant="subtle"
          onClick={() => {
            setSearch('');
            onChange(EMPTY_FILTERS);
          }}
          mb={2}
        >
          {t('Reset filters')}
        </Button>
      </Group>
    </SimpleGrid>
  );
};
