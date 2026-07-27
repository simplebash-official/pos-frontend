import { ReactNode } from 'react';
import { Table, Text, Box, Paper, Group, Pagination, Loader, Center } from '@mantine/core';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
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
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Paper p="xl" withBorder>
        <Center style={{ minHeight: 200 }}>
          <Loader size="md" />
        </Center>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center style={{ minHeight: 160 }}>
          <Text color="dimmed" size="sm">
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
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th
                  key={col.key}
                  style={{
                    textAlign: col.align || 'left',
                    width: col.width,
                  }}
                >
                  {col.header}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item, index) => (
              <Table.Tr key={keyExtractor(item, index)}>
                {columns.map((col) => (
                  <Table.Td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render(item, index)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {totalPages > 1 && onPageChange && (
        <Group
          justify="flex-end"
          p="md"
          style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
        >
          <Pagination value={page} onChange={onPageChange} total={totalPages} size="sm" />
        </Group>
      )}
    </Paper>
  );
}
