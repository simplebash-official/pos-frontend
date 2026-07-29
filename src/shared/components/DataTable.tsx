import { ReactNode } from 'react';
import { Table, Text, Box, Paper, Group, Pagination, Skeleton, Center } from '@mantine/core';
import { getSkeletonWidthPercent } from '@/shared/lib/utils';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (item: T, index: number) => ReactNode;
  align: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyText?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  skeletonRows?: number;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyText = 'No data available',
  page = 1,
  totalPages = 1,
  onPageChange,
  skeletonRows = 6,
}: DataTableProps<T>) {
  const tableHead = (
    <Table.Thead>
      <Table.Tr>
        {columns.map((col) => (
          <Table.Th
            key={col.key}
            style={{
              textAlign: col.align,
              width: col.width,
            }}
          >
            {col.header}
          </Table.Th>
        ))}
      </Table.Tr>
    </Table.Thead>
  );

  if (loading) {
    return (
      <Paper withBorder style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
            {tableHead}
            <Table.Tbody>
              {Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <Table.Tr key={`skeleton-row-${rowIndex}`}>
                  {columns.map((col, colIndex) => (
                    <Table.Td key={col.key} style={{ textAlign: col.align }}>
                      <Skeleton
                        height={14}
                        width={`${getSkeletonWidthPercent(rowIndex, colIndex, col.align)}%`}
                        style={
                          col.align === 'right'
                            ? { marginInlineStart: 'auto' }
                            : col.align === 'center'
                              ? { marginInline: 'auto' }
                              : undefined
                        }
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center style={{ minHeight: 160 }}>
          <Text c="dimmed" size="sm">
            {emptyText}
          </Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder style={{ overflow: 'hidden' }}>
      <Box style={{ overflowX: 'auto' }}>
        <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
          {tableHead}
          <Table.Tbody>
            {data.map((item, index) => (
              <Table.Tr key={keyExtractor(item, index)}>
                {columns.map((col) => (
                  <Table.Td key={col.key} style={{ textAlign: col.align }}>
                    {col.render(item, index)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {totalPages > 1 && onPageChange && (
        <Group justify="flex-end" p="md" style={{ borderTop: '1px solid var(--border)' }}>
          <Pagination value={page} onChange={onPageChange} total={totalPages} size="sm" />
        </Group>
      )}
    </Paper>
  );
}
