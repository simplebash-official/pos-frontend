import { ReactNode, useState, useMemo } from 'react';
import {
  Table,
  Text,
  Box,
  Paper,
  Group,
  Pagination,
  Skeleton,
  Center,
  Checkbox,
  Button,
  Badge,
  Select,
  Tooltip,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { getSkeletonWidthPercent } from '@/shared/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';

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

  // Multi-Selection Props
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onDeleteSelected?: (selectedKeys: string[]) => void;
  bulkActions?: ReactNode;

  // Pagination Props
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  clientPagination?: boolean;

  skeletonRows?: number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyText = 'No data available',

  selectable = true,
  selectedKeys: externalSelectedKeys,
  onSelectionChange,
  onDeleteSelected,
  bulkActions,

  page: externalPage = 1,
  pageSize: externalPageSize = 10,
  total: externalTotal,
  totalPages: externalTotalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  clientPagination = true,

  skeletonRows = 6,
  onRowClick,
}: DataTableProps<T>) {
  // Internal selection state if not controlled externally
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const selectedKeys =
    externalSelectedKeys !== undefined ? externalSelectedKeys : internalSelectedKeys;

  const setSelectedKeys = (keys: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(keys);
    }
    if (externalSelectedKeys === undefined) {
      setInternalSelectedKeys(keys);
    }
  };

  // Internal pagination state if not controlled externally
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(externalPageSize);

  const page = onPageChange ? externalPage : internalPage;
  const pageSize = onPageSizeChange ? externalPageSize : internalPageSize;

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  // Delete modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Client-side pagination logic when not server-paginated
  const totalCount = externalTotal !== undefined ? externalTotal : data.length;
  const computedTotalPages =
    externalTotalPages !== undefined
      ? externalTotalPages
      : Math.max(1, Math.ceil(totalCount / pageSize));

  const displayData = useMemo(() => {
    if (!clientPagination || externalTotal !== undefined) {
      return data;
    }
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, clientPagination, externalTotal, page, pageSize]);

  // Keys of visible items
  const visibleKeys = useMemo(
    () => displayData.map((item, index) => keyExtractor(item, index)),
    [displayData, keyExtractor]
  );

  const isAllVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((key) => selectedKeys.includes(key));
  const isSomeVisibleSelected =
    visibleKeys.some((key) => selectedKeys.includes(key)) && !isAllVisibleSelected;

  const handleToggleAll = () => {
    if (isAllVisibleSelected) {
      // Unselect visible keys
      const newKeys = selectedKeys.filter((k) => !visibleKeys.includes(k));
      setSelectedKeys(newKeys);
    } else {
      // Add all visible keys
      const newKeys = Array.from(new Set([...selectedKeys, ...visibleKeys]));
      setSelectedKeys(newKeys);
    }
  };

  const handleToggleRow = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const handleConfirmDeleteBatch = () => {
    if (onDeleteSelected) {
      onDeleteSelected(selectedKeys);
    }
    setSelectedKeys([]);
    setConfirmDeleteOpen(false);
  };

  const tableHead = (
    <Table.Thead>
      <Table.Tr>
        {selectable && (
          <Table.Th style={{ width: 40, textAlign: 'center' }}>
            <Checkbox
              size="xs"
              aria-label="Select all rows"
              checked={isAllVisibleSelected}
              indeterminate={isSomeVisibleSelected}
              onChange={handleToggleAll}
            />
          </Table.Th>
        )}
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
      <Paper withBorder style={{ overflow: 'hidden' }} radius="var(--mantine-radius-default)">
        <Box style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
            {tableHead}
            <Table.Tbody>
              {Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <Table.Tr key={`skeleton-row-${rowIndex}`}>
                  {selectable && (
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Skeleton height={16} width={16} radius="xs" />
                    </Table.Td>
                  )}
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

  const showingStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, totalCount);

  return (
    <Paper withBorder style={{ overflow: 'hidden' }} radius="var(--mantine-radius-default)">
      {/* Batch Actions Bar when items are selected */}
      {selectable && selectedKeys.length > 0 && (
        <Paper
          p="xs"
          px="md"
          bg="var(--mantine-color-blue-light)"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Badge color="blue" size="md" variant="filled">
                {selectedKeys.length} selected
              </Badge>
              <Button variant="subtle" size="xs" color="gray" onClick={() => setSelectedKeys([])}>
                Deselect All
              </Button>
            </Group>

            <Group gap="xs">
              {bulkActions}
              {onDeleteSelected && (
                <Tooltip label="Delete all selected items">
                  <Button
                    color="red"
                    size="xs"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => setConfirmDeleteOpen(true)}
                  >
                    Delete Selected ({selectedKeys.length})
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>
        </Paper>
      )}

      {!data || data.length === 0 ? (
        <Center style={{ minHeight: 160 }} p="xl">
          <Text c="dimmed" size="sm">
            {emptyText}
          </Text>
        </Center>
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="sm" horizontalSpacing="md" striped highlightOnHover>
            {tableHead}
            <Table.Tbody>
              {displayData.map((item, index) => {
                const key = keyExtractor(item, index);
                const isSelected = selectedKeys.includes(key);
                const rowClickable = !!onRowClick;

                return (
                  <Table.Tr
                    key={key}
                    bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
                    onClick={rowClickable ? () => onRowClick(item) : undefined}
                    style={rowClickable ? { cursor: 'pointer' } : undefined}
                  >
                    {selectable && (
                      <Table.Td
                        style={{ width: 40, textAlign: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          size="xs"
                          aria-label={`Select row ${key}`}
                          checked={isSelected}
                          onChange={() => handleToggleRow(key)}
                        />
                      </Table.Td>
                    )}
                    {columns.map((col) => (
                      <Table.Td key={col.key} style={{ textAlign: col.align }}>
                        {col.render(item, index)}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      {/* Pagination Footer */}
      <Group
        justify="space-between"
        align="center"
        p="xs"
        px="md"
        style={{ borderTop: '1px solid var(--border)' }}
        wrap="wrap"
      >
        <Group gap="sm">
          <Text size="xs" c="dimmed">
            Showing {showingStart}–{showingEnd} of {totalCount} entries
          </Text>

          <Group gap={6} align="center">
            <Text size="xs" c="dimmed">
              Rows per page:
            </Text>
            <Select
              size="xs"
              style={{ width: 70 }}
              value={String(pageSize)}
              onChange={(val) => val && handlePageSizeChange(Number(val))}
              data={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: String(opt),
              }))}
            />
          </Group>
        </Group>

        {computedTotalPages > 1 && (
          <Pagination
            value={page}
            onChange={handlePageChange}
            total={computedTotalPages}
            size="sm"
            radius="var(--mantine-radius-default)"
          />
        )}
      </Group>

      {/* Confirm Batch Delete Modal */}
      {onDeleteSelected && (
        <ConfirmDialog
          opened={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDeleteBatch}
          title="Delete Selected Items"
          confirmLabel={`Delete ${selectedKeys.length} Items`}
          confirmColor="red"
        >
          Are you sure you want to delete <strong>{selectedKeys.length}</strong> selected item(s)?
          This action cannot be undone.
        </ConfirmDialog>
      )}
    </Paper>
  );
}
