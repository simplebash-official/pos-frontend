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
  Stack,
} from '@mantine/core';
import { IconTrash, IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { getSkeletonWidthPercent } from '@/shared/lib/utils';
import { ConfirmDialog } from './ConfirmDialog';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (item: T, index: number) => ReactNode;
  align: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
  sortKey?: string;
  sortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number;
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

  // Sorting Props (supports both client-side and backend sorting)
  sortBy?: string | null;
  sortDirection?: 'asc' | 'desc' | null;
  defaultSortBy?: string | null;
  defaultSortDirection?: 'asc' | 'desc' | null;
  onSortChange?: (sortBy: string | null, sortDirection: 'asc' | 'desc' | null) => void;
  clientSorting?: boolean;

  // Pagination Props (supports both client-side and backend pagination)
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

export const DataTable = <T,>({
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

  sortBy: externalSortBy,
  sortDirection: externalSortDirection,
  defaultSortBy = null,
  defaultSortDirection = null,
  onSortChange,
  clientSorting = true,

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
}: DataTableProps<T>) => {
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

  // Internal sorting state if not controlled externally
  const [internalSortBy, setInternalSortBy] = useState<string | null>(defaultSortBy);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc' | null>(
    defaultSortDirection
  );

  const sortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;
  const sortDirection =
    externalSortDirection !== undefined ? externalSortDirection : internalSortDirection;

  const handleSort = (key: string) => {
    let nextSortBy: string | null = key;
    let nextDirection: 'asc' | 'desc' | null = 'asc';

    if (sortBy === key) {
      if (sortDirection === 'asc') {
        nextDirection = 'desc';
      } else if (sortDirection === 'desc') {
        nextDirection = null;
        nextSortBy = null;
      } else {
        nextDirection = 'asc';
      }
    }

    if (onSortChange) {
      onSortChange(nextSortBy, nextDirection);
    }
    if (externalSortBy === undefined) {
      setInternalSortBy(nextSortBy);
      setInternalSortDirection(nextDirection);
    }
  };

  // Client-side sorting logic when not controlled by backend sorting handler
  const sortedData = useMemo(() => {
    if (!clientSorting || !sortBy || !sortDirection) {
      return data;
    }
    const activeCol = columns.find((c) => (c.sortKey || c.key) === sortBy || c.key === sortBy);
    return [...data].sort((a, b) => {
      if (activeCol?.sortFn) {
        return activeCol.sortFn(a, b, sortDirection);
      }
      const sortField = activeCol?.sortKey || sortBy;
      const aVal = (a as Record<string, unknown>)[sortField];
      const bVal = (b as Record<string, unknown>)[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined || aVal === '') return 1;
      if (bVal === null || bVal === undefined || bVal === '') return -1;

      let comparison: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = aVal === bVal ? 0 : aVal ? -1 : 1;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, clientSorting, sortBy, sortDirection, columns]);

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
      return sortedData;
    }
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, clientPagination, externalTotal, page, pageSize]);

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
        {columns.map((col) => {
          const isSortable = !!col.sortable;
          const colSortKey = col.sortKey || col.key;
          const isCurrentSorted = sortBy === colSortKey && sortDirection !== null;

          return (
            <Table.Th
              key={col.key}
              className={isSortable ? 'data-table-sort-th' : undefined}
              onClick={isSortable ? () => handleSort(colSortKey) : undefined}
              onKeyDown={
                isSortable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(colSortKey);
                      }
                    }
                  : undefined
              }
              tabIndex={isSortable ? 0 : undefined}
              role={isSortable ? 'button' : undefined}
              aria-sort={
                isSortable
                  ? isCurrentSorted
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : sortDirection === 'desc'
                        ? 'descending'
                        : 'none'
                    : 'none'
                  : undefined
              }
              style={{
                textAlign: col.align,
                width: col.width,
              }}
            >
              <Group
                gap={4}
                wrap="nowrap"
                justify={
                  col.align === 'right'
                    ? 'flex-end'
                    : col.align === 'center'
                      ? 'center'
                      : 'flex-start'
                }
                align="center"
                style={{ minWidth: 0, width: '100%' }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.header}</span>
                {isSortable &&
                  (isCurrentSorted ? (
                    sortDirection === 'asc' ? (
                      <IconChevronUp
                        size={14}
                        stroke={2.5}
                        style={{ flexShrink: 0, color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <IconChevronDown
                        size={14}
                        stroke={2.5}
                        style={{ flexShrink: 0, color: 'var(--text-primary)' }}
                      />
                    )
                  ) : (
                    <IconSelector
                      size={14}
                      stroke={1.5}
                      className="sort-icon-inactive"
                      style={{ flexShrink: 0 }}
                    />
                  ))}
              </Group>
            </Table.Th>
          );
        })}
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
                <Table.Tr key={`skeleton-row-${rowIndex}`} style={{ height: 60 }}>
                  {selectable && (
                    <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <Skeleton height={16} width={16} />
                    </Table.Td>
                  )}
                  {columns.map((col, colIndex) => (
                    <Table.Td
                      key={col.key}
                      style={{ textAlign: col.align, verticalAlign: 'middle' }}
                    >
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
    <Stack gap="xs">
      {/* Batch Actions Bar when items are selected - rendered outside the table border */}
      {selectable && selectedKeys.length > 0 && (
        <Paper
          p="xs"
          px="md"
          withBorder
          bg="var(--mantine-color-blue-light)"
          radius="var(--mantine-radius-default)"
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

      {/* Main Table Paper Container */}
      <Paper withBorder style={{ overflow: 'hidden' }} radius="var(--mantine-radius-default)">
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
                      className="data-table-row"
                      bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
                      onClick={rowClickable ? () => onRowClick(item) : undefined}
                      tabIndex={rowClickable ? 0 : undefined}
                      role={rowClickable ? 'button' : undefined}
                      onKeyDown={
                        rowClickable
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowClick(item);
                              }
                            }
                          : undefined
                      }
                      style={{
                        height: 60,
                        cursor: rowClickable ? 'pointer' : undefined,
                      }}
                    >
                      {selectable && (
                        <Table.Td
                          style={{ width: 40, textAlign: 'center', verticalAlign: 'middle' }}
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
                        <Table.Td
                          key={col.key}
                          style={{ textAlign: col.align, verticalAlign: 'middle' }}
                        >
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
      </Paper>

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
    </Stack>
  );
};
