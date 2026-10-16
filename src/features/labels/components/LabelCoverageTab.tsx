import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPrinter, IconSearch } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { useLabelCoverage } from '../hooks/useLabelJobs';
import { coverageLine } from '../lib/jobView';
import { rowFromCoverage, type LabelRow } from '../lib/printJob';
import { LABEL_LIMITS, type LabelCoverageRow, type LabelCoverageStatus } from '../types';

const PAGE_SIZE = 20;

const STATUS_COLOR: Record<LabelCoverageStatus, string> = {
  never: 'var(--status-error)',
  needed: 'var(--status-warn)',
  labelled: 'var(--status-ok)',
};

export interface LabelCoverageTabProps {
  /** Prints the chosen items, with labels for their new (or all their) stock. */
  onPrint: (rows: LabelRow[]) => void;
}

/**
 * Which items still need labels: never labelled, or new stock since their last
 * label (and, to check, the ones that are labelled). Tick items and print them,
 * with as many labels as there are new units on the shelf.
 */
export const LabelCoverageTab = ({ onPrint }: LabelCoverageTabProps) => {
  const isMobile = useIsMobile();
  const [status, setStatus] = useState<LabelCoverageStatus>('never');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);
  const [page, setPage] = useState(1);
  // Chosen across pages and filters, by product key.
  const [chosen, setChosen] = useState<Map<string, LabelCoverageRow>>(new Map());

  const query = useLabelCoverage({
    page,
    limit: PAGE_SIZE,
    status,
    search: debouncedSearch === '' ? undefined : debouncedSearch,
  });
  const coverage = query.data;
  const rows = coverage?.items ?? [];
  const counts = coverage?.counts;

  const toggle = (row: LabelCoverageRow, on: boolean) =>
    setChosen((current) => {
      const next = new Map(current);
      if (on) next.set(row.product.key, row);
      else next.delete(row.product.key);
      return next;
    });
  const allOnPage = rows.length > 0 && rows.every((row) => chosen.has(row.product.key));
  const someOnPage = rows.some((row) => chosen.has(row.product.key));
  const tooMany = chosen.size > LABEL_LIMITS.maxItems;

  const filterLabel = (label: string, count: number | undefined) =>
    count === undefined ? label : `${label} (${count})`;

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap" align="flex-end">
        <SegmentedToggle
          value={status}
          onChange={(value) => {
            setStatus(value as LabelCoverageStatus);
            setPage(1);
          }}
          data={[
            { value: 'never', label: filterLabel(t('Never labelled'), counts?.never) },
            { value: 'needed', label: filterLabel(t('New stock'), counts?.needed) },
            { value: 'labelled', label: filterLabel(t('Labelled'), counts?.labelled) },
          ]}
          fullWidth={isMobile}
          // Three counted choices do not fit side by side on a phone.
          orientation={isMobile ? 'vertical' : 'horizontal'}
          style={{ flex: isMobile ? '1 1 100%' : undefined }}
        />
        <TextInput
          aria-label={t('Search items')}
          placeholder={t('Search by name, code or barcode')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
          size={isMobile ? 'md' : 'sm'}
          style={{ flex: 1, minWidth: 200 }}
        />
      </Group>

      <Paper p="xs" px="md" withBorder>
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="sm">
            <Checkbox
              aria-label={t('Choose every item on this page')}
              checked={allOnPage}
              indeterminate={!allOnPage && someOnPage}
              disabled={rows.length === 0}
              onChange={(event) => {
                const on = event.currentTarget.checked;
                rows.forEach((row) => toggle(row, on));
              }}
            />
            <Text size="sm">
              {chosen.size} {t('chosen')}
            </Text>
            {chosen.size > 0 && (
              <Button size="compact-sm" variant="subtle" onClick={() => setChosen(new Map())}>
                {t('Clear')}
              </Button>
            )}
          </Group>
          <Button
            leftSection={<IconPrinter size={16} />}
            disabled={chosen.size === 0 || tooMany}
            onClick={() => onPrint([...chosen.values()].map(rowFromCoverage))}
          >
            {t('Print labels')} ({chosen.size})
          </Button>
        </Group>
        {tooMany && (
          <Text size="xs" c="red" mt={4}>
            {t('You can print labels for at most 200 items at a time.')}
          </Text>
        )}
      </Paper>

      {query.isError && (
        <Alert color="red" variant="light">
          {getErrorMessage(query.error)}
        </Alert>
      )}
      {query.isLoading && <Skeleton height={240} />}
      {coverage !== undefined && rows.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {status === 'labelled'
            ? t('No item has been labelled yet.')
            : t('Every item in stock has its labels. Nothing to do here.')}
        </Text>
      )}

      <Stack gap={6}>
        {rows.map((row) => {
          const checked = chosen.has(row.product.key);
          // Beside the name on a computer, under it on a phone so the name keeps its room.
          const status = (
            <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }} mt={isMobile ? 4 : 0}>
              {row.status !== null && (
                <Box
                  aria-hidden
                  w={8}
                  h={8}
                  style={{ borderRadius: '50%', background: STATUS_COLOR[row.status] }}
                />
              )}
              <Text size="xs" c="dimmed">
                {coverageLine(row, (iso) => formatDate(iso))}
              </Text>
            </Group>
          );
          return (
            <Paper
              key={row.product.key}
              p="sm"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => toggle(row, !checked)}
            >
              <Group wrap="nowrap" gap="sm">
                <Checkbox
                  aria-label={row.product.name}
                  checked={checked}
                  onChange={(event) => toggle(row, event.currentTarget.checked)}
                  onClick={(event) => event.stopPropagation()}
                  size={isMobile ? 'md' : 'sm'}
                />
                <Box style={{ minWidth: 0, flex: 1 }}>
                  <Text fw={600} size="sm" truncate>
                    {row.product.name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {row.product.sku} · {row.product.stockQuantity} {t('in stock')}
                  </Text>
                  {isMobile && status}
                </Box>
                {!isMobile && status}
              </Group>
            </Paper>
          );
        })}
      </Stack>

      {coverage !== undefined && coverage.pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={coverage.pagination.totalPages}
            value={page}
            onChange={setPage}
            size={isMobile ? 'md' : 'sm'}
          />
        </Group>
      )}
    </Stack>
  );
};
