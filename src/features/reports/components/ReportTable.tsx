import { type ReactNode, useState, useMemo } from 'react';
import {
  Button,
  Group,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconDownload, IconTable } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { EmptyState } from '@/shared/components/EmptyState';
import { downloadCsv, toCsv, type CsvColumn } from '@/shared/lib/csv';

export interface ReportColumn<T> {
  header: string;
  align?: 'left' | 'center' | 'right';
  /** Rendered cell. */
  cell: (row: T) => ReactNode;
  /** Raw value for the CSV export (number/string/Date). Defaults to `cell`. */
  csv?: (row: T) => unknown;
}

interface ReportTableProps<T> {
  title: string;
  subtitle?: string;
  rows: readonly T[];
  columns: ReportColumn<T>[];
  keyFor: (row: T, index: number) => string;
  loading?: boolean;
  /** Base name for the exported file, e.g. "top-customers". */
  csvName: string;
  /** Period label folded into the filename. */
  periodLabel: string;
  emptyText?: string;
  footer?: ReactNode;
  /** Selectable page size options. Defaults to [10, 20, 50, 100]. */
  pageSizeOptions?: number[];
  /** Initial page size. Defaults to 10. */
  defaultPageSize?: number;
  /** Enable client-side pagination. Defaults to true. */
  paginated?: boolean;
}

export function ReportTable<T>({
  title,
  subtitle,
  rows,
  columns,
  keyFor,
  loading,
  csvName,
  periodLabel,
  emptyText,
  footer,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  paginated = true,
}: ReportTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const displayRows = useMemo(() => {
    if (!paginated) return rows;
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, paginated, safePage, pageSize]);

  const showingStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingEnd = Math.min(safePage * pageSize, totalCount);

  const onExport = () => {
    const csvColumns: CsvColumn<T>[] = columns.map((c) => ({
      header: c.header,
      value: c.csv ?? ((row: T) => c.cell(row)),
    }));
    const slug = periodLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    downloadCsv(`analytics-${csvName}${slug ? `-${slug}` : ''}.csv`, toCsv(rows, csvColumns));
  };

  return (
    <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
          <div>
            <Text fw={700} size="sm">
              {t(title)}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed">
                {t(subtitle)}
              </Text>
            )}
          </div>
          <Button
            size="xs"
            variant="default"
            leftSection={<IconDownload size={14} />}
            onClick={onExport}
            disabled={loading || rows.length === 0}
            visibleFrom="sm"
          >
            {t('Export CSV')}
          </Button>
        </Group>

        {loading ? (
          <Skeleton height={180} radius="sm" />
        ) : rows.length === 0 ? (
          <EmptyState
            withBorder={false}
            py="lg"
            icon={<IconTable size={28} />}
            title={t(emptyText ?? 'Nothing to show yet')}
          />
        ) : (
          <ScrollArea
            type="auto"
            classNames={{ viewport: 'scrollarea-fluid-content' }}
            offsetScrollbars
          >
            <Table striped highlightOnHover verticalSpacing="xs" horizontalSpacing="md" miw={480}>
              <Table.Thead>
                <Table.Tr>
                  {columns.map((c) => (
                    <Table.Th key={c.header} ta={c.align ?? 'left'}>
                      {t(c.header)}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {displayRows.map((row, index) => (
                  <Table.Tr key={keyFor(row, (safePage - 1) * pageSize + index)}>
                    {columns.map((c) => (
                      <Table.Td key={c.header} ta={c.align ?? 'left'}>
                        {c.cell(row)}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}

        {paginated && !loading && totalCount > 0 && (
          <Group
            justify="space-between"
            align="center"
            pt="xs"
            style={{ borderTop: '1px solid var(--border)' }}
            wrap="wrap"
            gap="sm"
          >
            <Group gap="sm" wrap="wrap">
              <Text size="xs" c="dimmed">
                {`Showing ${showingStart}–${showingEnd} of ${totalCount} entries`}
              </Text>

              <Group gap={6} align="center">
                <Text size="xs" c="dimmed">
                  {t('Rows per page:')}
                </Text>
                <Select
                  size="xs"
                  style={{ width: 75 }}
                  value={String(pageSize)}
                  onChange={(val) => val && handlePageSizeChange(Number(val))}
                  data={pageSizeOptions.map((opt) => ({
                    value: String(opt),
                    label: String(opt),
                  }))}
                  aria-label={t('Rows per page')}
                />
              </Group>
            </Group>

            {totalPages > 1 && (
              <Pagination
                value={safePage}
                onChange={setPage}
                total={totalPages}
                size="sm"
                radius="var(--mantine-radius-default)"
                aria-label={t('Table pagination')}
              />
            )}
          </Group>
        )}

        {footer}
      </Stack>
    </Paper>
  );
}
