import type { ReactNode } from 'react';
import { Button, Group, Paper, ScrollArea, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { EmptyState } from '@/shared/components/EmptyState';
import { IconTable } from '@tabler/icons-react';
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
}: ReportTableProps<T>) {
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
                {rows.map((row, index) => (
                  <Table.Tr key={keyFor(row, index)}>
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

        {footer}
      </Stack>
    </Paper>
  );
}
