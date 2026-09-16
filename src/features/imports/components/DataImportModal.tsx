import { useId, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Collapse,
  Group,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCategory,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconFileSpreadsheet,
  IconSearch,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys } from '@/api/queryKeys';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney, toCents } from '@/shared/lib/money';
import { createCategory, updateCategory } from '@/features/inventory/api/categoriesApi';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { useProcessImport } from '../hooks/useImportBatches';
import { parseSpreadsheetFile } from '../lib/fileParser';
import { downloadTemplate } from '../lib/templateGenerator';
import { detectDistinctCategories, type DetectedCategory } from '../lib/categoryDetector';
import { CategoryStylingView } from './CategoryStylingView';
import type {
  ImportBatchRecord,
  ImportConfig,
  ImportOptions,
  ParsedFileResult,
  ParsedRow,
} from '../types';

export interface DataImportModalProps {
  opened: boolean;
  onClose: () => void;
  config: ImportConfig;
  onSuccess?: (result: ImportBatchRecord) => void;
}

function isNumericColumn(key: string): boolean {
  return [
    'sellingPrice',
    'costPrice',
    'stockQuantity',
    'minStockThreshold',
    'warrantyMonths',
  ].includes(key);
}

function getColumnMinWidth(key: string): number {
  switch (key) {
    case 'name':
      return 220;
    case 'category':
      return 140;
    case 'subcategory':
      return 150;
    case 'sellingPrice':
    case 'costPrice':
      return 130;
    case 'stockQuantity':
    case 'minStockThreshold':
      return 110;
    case 'barcode':
      return 150;
    case 'warrantyMonths':
      return 120;
    case 'isSerialized':
      return 100;
    default:
      return 130;
  }
}

export function DataImportModal({ opened, onClose, config, onSuccess }: DataImportModalProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: catalogCategories = [] } = useCategories();

  // Flow steps: 'upload' | 'preview' | 'result'
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [previewTab, setPreviewTab] = useState<'table' | 'categories'>('table');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Extracted data
  const [parsedResult, setParsedResult] = useState<ParsedFileResult | null>(null);
  const [detectedCategories, setDetectedCategories] = useState<DetectedCategory[]>([]);

  // Selection & filtering state
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'selected' | 'valid' | 'issues'>('all');
  const [previewPage, setPreviewPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Import options
  const [options, setOptions] = useState<ImportOptions>(() => {
    const initial: ImportOptions = {};
    config.supportedOptions?.forEach((opt) => {
      initial[opt.key] = opt.defaultValue ?? false;
    });
    return initial;
  });

  // Server result & import execution
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportBatchRecord | null>(null);
  const [showFailedDetails, setShowFailedDetails] = useState(false);

  const processMutation = useProcessImport();

  const handleReset = () => {
    setStep('upload');
    setPreviewTab('table');
    setParsedResult(null);
    setDetectedCategories([]);
    setParseError(null);
    setSelectedRowKeys(new Set());
    setSearchQuery('');
    setStatusFilter('all');
    setPreviewPage(1);
    setImportResult(null);
    setShowFailedDetails(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (processMutation.isPending || isImporting) return;
    handleReset();
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseSpreadsheetFile(file, config);
      setParsedResult(result);

      // By default select all valid rows
      const validRowNumbers = new Set(
        result.rows.filter((r) => r._isValid).map((r) => r._rowNumber)
      );
      setSelectedRowKeys(validRowNumbers);

      // Detect unique categories from file if applicable
      if (config.target === 'inventory' || config.columns.some((c) => c.key === 'category')) {
        const detected = detectDistinctCategories(result.rows, catalogCategories);
        setDetectedCategories(detected);
      } else {
        setDetectedCategories([]);
      }

      setStep('preview');
      setPreviewTab('table');
      setPreviewPage(1);
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : 'Failed to read file. Please ensure it is a valid Excel or CSV document.'
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Row selection helpers
  const toggleRow = (rowNumber: number) => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  };

  const handleSelectAllValid = () => {
    if (!parsedResult) return;
    setSelectedRowKeys(
      new Set(parsedResult.rows.filter((r) => r._isValid).map((r) => r._rowNumber))
    );
  };

  const handleDeselectAll = () => {
    setSelectedRowKeys(new Set());
  };

  // Filtered preview rows
  const displayRows = useMemo(() => {
    if (!parsedResult) return [];
    let rows = parsedResult.rows;

    if (statusFilter === 'selected') {
      rows = rows.filter((r) => selectedRowKeys.has(r._rowNumber));
    } else if (statusFilter === 'valid') {
      rows = rows.filter((r) => r._isValid);
    } else if (statusFilter === 'issues') {
      rows = rows.filter((r) => !r._isValid);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter((r) => {
        const rowObj = r.data as Record<string, unknown>;
        return Object.values(rowObj).some(
          (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(query)
        );
      });
    }

    return rows;
  }, [parsedResult, statusFilter, searchQuery, selectedRowKeys]);

  const totalDisplayPages = Math.ceil(displayRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (previewPage - 1) * pageSize;
    return displayRows.slice(start, start + pageSize);
  }, [displayRows, previewPage, pageSize]);

  // Counts
  const selectedValidCount = useMemo(() => {
    if (!parsedResult) return 0;
    return parsedResult.rows.filter((r) => selectedRowKeys.has(r._rowNumber) && r._isValid).length;
  }, [parsedResult, selectedRowKeys]);

  const selectedIssuesCount = useMemo(() => {
    if (!parsedResult) return 0;
    return parsedResult.rows.filter((r) => selectedRowKeys.has(r._rowNumber) && !r._isValid).length;
  }, [parsedResult, selectedRowKeys]);

  // Master checkbox for visible rows
  const visibleValidRows = useMemo(() => displayRows.filter((r) => r._isValid), [displayRows]);
  const isAllVisibleSelected =
    visibleValidRows.length > 0 && visibleValidRows.every((r) => selectedRowKeys.has(r._rowNumber));
  const isSomeVisibleSelected =
    visibleValidRows.some((r) => selectedRowKeys.has(r._rowNumber)) && !isAllVisibleSelected;

  const handleToggleVisible = () => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        visibleValidRows.forEach((r) => next.delete(r._rowNumber));
      } else {
        visibleValidRows.forEach((r) => next.add(r._rowNumber));
      }
      return next;
    });
  };

  // Execution: Pre-create/update categories and import selected rows
  const handleConfirmImport = async () => {
    if (!parsedResult) return;

    const selectedValidRows = parsedResult.rows.filter(
      (r) => selectedRowKeys.has(r._rowNumber) && r._isValid
    );

    if (selectedValidRows.length === 0) return;

    setIsImporting(true);
    try {
      // 1. If categories were detected and customized, pre-create new categories or update modified ones
      if (detectedCategories.length > 0) {
        for (const cat of detectedCategories) {
          if (!cat.isExisting) {
            try {
              await createCategory({
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                subcategories: cat.subcategories,
              });
            } catch (catErr) {
              console.warn(`Category creation warning for '${cat.name}':`, catErr);
            }
          } else if (
            cat.existingKey &&
            (cat.color !== cat.originalColor || cat.icon !== cat.originalIcon)
          ) {
            try {
              await updateCategory(cat.existingKey, {
                color: cat.color,
                icon: cat.icon,
              });
            } catch (catErr) {
              console.warn(`Category update warning for '${cat.name}':`, catErr);
            }
          }
        }
        void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.categories.valid() });
      }

      // 2. Transmit ONLY the selected valid rows to the backend
      const rawRows = selectedValidRows.map((r) => r.data as Record<string, unknown>);

      processMutation.mutate(
        {
          target: config.target,
          fileName: parsedResult.fileName,
          fileType: parsedResult.fileType,
          fileSizeBytes: parsedResult.fileSizeBytes,
          rows: rawRows,
          options,
        },
        {
          onSuccess: (record) => {
            setImportResult(record);
            setStep('result');
            if (onSuccess) {
              onSuccess(record);
            }
          },
          onSettled: () => {
            setIsImporting(false);
          },
        }
      );
    } catch (err) {
      setIsImporting(false);
      notifications.show({
        title: t('Import Error'),
        message:
          err instanceof Error ? err.message : t('Failed to process categories or import batch'),
        color: 'red',
      });
    }
  };

  const renderCellValue = (key: string, val: unknown, hasError: boolean) => {
    if (hasError) {
      return (
        <Text size="xs" c="red" fw={600}>
          {val !== undefined && val !== null ? String(val) : '—'}
        </Text>
      );
    }

    if (val === undefined || val === null || val === '') {
      return (
        <Text size="xs" c="dimmed">
          —
        </Text>
      );
    }

    if (key === 'sellingPrice' || key === 'costPrice') {
      const num = Number(val);
      if (!isNaN(num)) {
        return (
          <Text size="xs" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(toCents(num))}
          </Text>
        );
      }
    }

    if (key === 'stockQuantity' || key === 'minStockThreshold' || key === 'warrantyMonths') {
      const num = Number(val);
      if (!isNaN(num)) {
        return (
          <Text size="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {num.toLocaleString()}
          </Text>
        );
      }
    }

    if (key === 'barcode') {
      return (
        <Text size="xs" ff="monospace">
          {String(val)}
        </Text>
      );
    }

    if (key === 'isSerialized') {
      return (
        <Badge size="xs" variant={val ? 'filled' : 'light'} color={val ? 'blue' : 'gray'}>
          {val ? t('Yes') : t('No')}
        </Badge>
      );
    }

    return (
      <Text size="xs" lineClamp={1} title={String(val)}>
        {String(val)}
      </Text>
    );
  };

  const tableMinWidth = Math.max(1100, config.columns.length * 130 + 190);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {config.title}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
    >
      {step === 'upload' && (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {config.description}
          </Text>

          {/* Template Download Affordance */}
          <Paper p="md" withBorder bg="var(--mantine-color-body)">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <div>
                <Text fw={600} size="sm">
                  {t('Need a formatted spreadsheet?')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'Download our pre-formatted template with example rows to ensure a smooth upload.'
                  )}
                </Text>
              </div>
              <Group gap="xs">
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => downloadTemplate(config, 'xlsx')}
                >
                  {t('Excel Template (.xlsx)')}
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => downloadTemplate(config, 'csv')}
                >
                  {t('CSV Template (.csv)')}
                </Button>
              </Group>
            </Group>
          </Paper>

          {/* Drag and Drop Zone */}
          <div onDrop={handleDrop} onDragOver={handleDragOver} style={{ width: '100%' }}>
            <Paper
              p="xl"
              withBorder
              style={{
                borderStyle: 'dashed',
                borderWidth: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <Stack align="center" gap="xs">
                <ThemeIcon size={52} radius="md" color="blue" variant="light">
                  <IconUpload size={28} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="md">
                    {t('Choose an Excel or CSV file to import')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('Drag and drop your file here, or click to browse')}
                  </Text>
                </div>
                <Badge variant="light" color="gray" size="sm">
                  {t('Supports .xlsx, .xls, and .csv')}
                </Badge>
              </Stack>
            </Paper>
          </div>

          {parseError && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={16} />}
              title={t('Unable to read file')}
            >
              {parseError}
            </Alert>
          )}

          {/* Expected Columns Summary */}
          <div>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: '0.05em' }}
              mb="xs"
            >
              {t('Expected Columns')}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
              {config.columns.map((col) => (
                <Paper key={col.key} p="xs" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="xs" fw={600} lineClamp={1}>
                      {col.label}
                    </Text>
                    <Badge
                      size="xs"
                      variant={col.required ? 'filled' : 'light'}
                      color={col.required ? 'blue' : 'gray'}
                    >
                      {col.required ? t('Required') : t('Optional')}
                    </Badge>
                  </Group>
                  {col.description && (
                    <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                      {col.description}
                    </Text>
                  )}
                </Paper>
              ))}
            </SimpleGrid>
          </div>

          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={handleClose} disabled={isParsing}>
              {t('Cancel')}
            </Button>
          </Group>
        </Stack>
      )}

      {step === 'preview' && parsedResult && (
        <Stack gap="md">
          {/* File summary header */}
          <Paper p="sm" withBorder bg="var(--mantine-color-body)">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Group gap="xs">
                <ThemeIcon color="blue" variant="light" size="md">
                  <IconFileSpreadsheet size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="sm">
                    {parsedResult.fileName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(parsedResult.fileSizeBytes / 1024).toFixed(1)} KB · {parsedResult.totalRows}{' '}
                    {t('total rows extracted')}
                  </Text>
                </div>
              </Group>

              <Group gap="xs">
                <Badge color="blue" variant="filled" size="md">
                  {selectedValidCount} / {parsedResult.validRowCount} {t('Selected to Import')}
                </Badge>
                {selectedIssuesCount > 0 && (
                  <Badge color="red" variant="light" size="md">
                    {selectedIssuesCount} {t('Invalid Selected')}
                  </Badge>
                )}
              </Group>
            </Group>
          </Paper>

          {/* Top navigation tabs: Data Selection vs Category Styling */}
          {detectedCategories.length > 0 && (
            <SegmentedControl
              value={previewTab}
              onChange={(val) => setPreviewTab(val as 'table' | 'categories')}
              data={[
                {
                  value: 'table',
                  label: (
                    <Group gap={6} justify="center">
                      <IconFileSpreadsheet size={16} />
                      <span>{t('Data Selection')}</span>
                      <Badge
                        size="xs"
                        variant={selectedValidCount > 0 ? 'filled' : 'light'}
                        color="blue"
                      >
                        {selectedValidCount} / {parsedResult.validRowCount}
                      </Badge>
                    </Group>
                  ),
                },
                {
                  value: 'categories',
                  label: (
                    <Group gap={6} justify="center">
                      <IconCategory size={16} />
                      <span>{t('Category Styling')}</span>
                      <Badge
                        size="xs"
                        variant={detectedCategories.some((c) => !c.isExisting) ? 'filled' : 'light'}
                        color={detectedCategories.some((c) => !c.isExisting) ? 'green' : 'gray'}
                      >
                        {detectedCategories.length}
                        {detectedCategories.some((c) => !c.isExisting) &&
                          ` (${detectedCategories.filter((c) => !c.isExisting).length} new)`}
                      </Badge>
                    </Group>
                  ),
                },
              ]}
              fullWidth
            />
          )}

          {/* Tab 2: Category Styling View */}
          {previewTab === 'categories' && detectedCategories.length > 0 && (
            <CategoryStylingView
              categories={detectedCategories}
              onChangeCategories={setDetectedCategories}
            />
          )}

          {/* Tab 1: Data Selection Table */}
          {previewTab === 'table' && (
            <>
              {selectedIssuesCount > 0 && (
                <Alert color="orange" icon={<IconAlertTriangle size={16} />} p="xs">
                  <Text size="xs">
                    {selectedIssuesCount}{' '}
                    {t(
                      'selected rows have validation issues. Only valid selected rows will be inserted into the database.'
                    )}
                  </Text>
                </Alert>
              )}

              {/* Table search & filter toolbar */}
              <Paper p="xs" withBorder bg="var(--mantine-color-body)">
                <Stack gap="xs">
                  <Group justify="space-between" wrap="wrap" gap="xs">
                    <TextInput
                      placeholder={t('Search products, categories, barcodes...')}
                      leftSection={<IconSearch size={14} />}
                      rightSection={
                        searchQuery ? (
                          <IconX
                            size={14}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSearchQuery('')}
                          />
                        ) : undefined
                      }
                      size="xs"
                      style={{ flex: 1, minWidth: 220 }}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.currentTarget.value);
                        setPreviewPage(1);
                      }}
                    />

                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="default"
                        onClick={handleSelectAllValid}
                        disabled={selectedValidCount === parsedResult.validRowCount}
                      >
                        {t('Select All Valid')}
                      </Button>
                      <Button
                        size="xs"
                        variant="default"
                        onClick={handleDeselectAll}
                        disabled={selectedRowKeys.size === 0}
                      >
                        {t('Deselect All')}
                      </Button>
                    </Group>
                  </Group>

                  <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                    <SegmentedControl
                      size="xs"
                      value={statusFilter}
                      onChange={(val) => {
                        setStatusFilter(val as 'all' | 'selected' | 'valid' | 'issues');
                        setPreviewPage(1);
                      }}
                      data={[
                        { label: `${t('All')} (${parsedResult.totalRows})`, value: 'all' },
                        {
                          label: `${t('Selected')} (${selectedRowKeys.size})`,
                          value: 'selected',
                        },
                        {
                          label: `${t('Valid')} (${parsedResult.validRowCount})`,
                          value: 'valid',
                        },
                        {
                          label: `${t('Issues')} (${parsedResult.invalidRowCount})`,
                          value: 'issues',
                        },
                      ]}
                    />

                    <Group gap="xs" align="center">
                      <Text size="xs" c="dimmed">
                        {t('Rows per page')}:
                      </Text>
                      <Select
                        size="xs"
                        w={75}
                        value={String(pageSize)}
                        onChange={(val) => {
                          if (val) {
                            setPageSize(Number(val));
                            setPreviewPage(1);
                          }
                        }}
                        data={['10', '25', '50']}
                      />
                    </Group>
                  </Group>
                </Stack>
              </Paper>

              {/* Data Table */}
              <Paper withBorder style={{ overflow: 'hidden' }}>
                <Box
                  style={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: isMobile ? '50vh' : 520,
                  }}
                >
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder={false}
                    style={{
                      fontSize: 13,
                      minWidth: tableMinWidth,
                      borderCollapse: 'separate',
                      borderSpacing: 0,
                    }}
                  >
                    <Table.Thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 4,
                        backgroundColor: 'var(--bg-card)',
                      }}
                    >
                      <Table.Tr>
                        {/* Checkbox column */}
                        <Table.Th
                          style={{
                            width: 44,
                            minWidth: 44,
                            textAlign: 'center',
                            position: 'sticky',
                            left: 0,
                            zIndex: 5,
                            backgroundColor: 'var(--bg-card)',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <Checkbox
                            size="xs"
                            checked={isAllVisibleSelected}
                            indeterminate={isSomeVisibleSelected}
                            onChange={handleToggleVisible}
                            aria-label={t('Select visible rows')}
                          />
                        </Table.Th>

                        {/* Row # column */}
                        <Table.Th
                          style={{
                            width: 50,
                            minWidth: 50,
                            position: 'sticky',
                            left: 44,
                            zIndex: 5,
                            backgroundColor: 'var(--bg-card)',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          {t('#')}
                        </Table.Th>

                        {/* Status column */}
                        <Table.Th
                          style={{
                            width: 90,
                            minWidth: 90,
                            position: 'sticky',
                            left: 94,
                            zIndex: 5,
                            backgroundColor: 'var(--bg-card)',
                            borderRight: '1px solid var(--border)',
                            borderBottom: '1px solid var(--border)',
                            boxShadow: '3px 0 6px -2px rgba(0,0,0,0.12)',
                          }}
                        >
                          {t('Status')}
                        </Table.Th>

                        {/* All configured columns */}
                        {config.columns.map((col) => {
                          const isNumeric = isNumericColumn(col.key);
                          return (
                            <Table.Th
                              key={col.key}
                              style={{
                                minWidth: getColumnMinWidth(col.key),
                                textAlign: isNumeric ? 'right' : 'left',
                                whiteSpace: 'nowrap',
                                backgroundColor: 'var(--bg-card)',
                                borderBottom: '1px solid var(--border)',
                              }}
                            >
                              {col.label}
                            </Table.Th>
                          );
                        })}
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {paginatedRows.length === 0 ? (
                        <Table.Tr>
                          <Table.Td
                            colSpan={config.columns.length + 3}
                            style={{ textAlign: 'center' }}
                          >
                            <Text size="xs" c="dimmed" py="md">
                              {t('No matching rows found.')}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        paginatedRows.map((row: ParsedRow, index: number) => {
                          const isChecked = selectedRowKeys.has(row._rowNumber);
                          const isInvalid = !row._isValid;

                          // Solid opaque backgrounds for alternating stripes and selection states
                          const rowBg = isInvalid
                            ? 'var(--status-error-bg)'
                            : isChecked
                              ? index % 2 === 1
                                ? 'light-dark(#edf5fc, var(--mantine-color-dark-5))'
                                : 'light-dark(#f7faff, var(--mantine-color-dark-6))'
                              : index % 2 === 1
                                ? 'var(--bg-hover)'
                                : 'var(--bg-card)';

                          const borderLeft = isInvalid
                            ? '3px solid var(--mantine-color-red-filled)'
                            : isChecked
                              ? '3px solid var(--mantine-color-blue-filled)'
                              : '3px solid transparent';

                          return (
                            <Table.Tr
                              key={row._rowNumber}
                              style={{
                                backgroundColor: rowBg,
                                borderLeft,
                              }}
                            >
                              {/* Row Checkbox */}
                              <Table.Td
                                style={{
                                  textAlign: 'center',
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 2,
                                  backgroundColor: rowBg,
                                  borderBottom: '1px solid var(--border)',
                                }}
                              >
                                <Checkbox
                                  size="xs"
                                  checked={isChecked}
                                  onChange={() => toggleRow(row._rowNumber)}
                                  aria-label={`Select row ${row._rowNumber}`}
                                />
                              </Table.Td>

                              {/* Row # */}
                              <Table.Td
                                style={{
                                  position: 'sticky',
                                  left: 44,
                                  zIndex: 2,
                                  backgroundColor: rowBg,
                                  borderBottom: '1px solid var(--border)',
                                }}
                              >
                                <Text size="xs" c="dimmed">
                                  {row._rowNumber}
                                </Text>
                              </Table.Td>

                              {/* Status Badge */}
                              <Table.Td
                                style={{
                                  position: 'sticky',
                                  left: 94,
                                  zIndex: 2,
                                  backgroundColor: rowBg,
                                  borderRight: '1px solid var(--border)',
                                  borderBottom: '1px solid var(--border)',
                                  boxShadow: '3px 0 6px -2px rgba(0,0,0,0.12)',
                                }}
                              >
                                {row._isValid ? (
                                  <Badge color="green" size="xs" variant="filled">
                                    {t('Valid')}
                                  </Badge>
                                ) : (
                                  <Tooltip
                                    label={Object.values(row._errors).join(', ')}
                                    multiline
                                    w={240}
                                    withArrow
                                  >
                                    <Badge
                                      color="red"
                                      size="xs"
                                      variant="filled"
                                      style={{ cursor: 'help' }}
                                    >
                                      {t('Issue')}
                                    </Badge>
                                  </Tooltip>
                                )}
                              </Table.Td>

                              {/* All configured columns */}
                              {config.columns.map((col) => {
                                const val = (row.data as Record<string, unknown>)[col.key];
                                const hasError = Boolean(row._errors[col.key]);
                                const isNumeric = isNumericColumn(col.key);

                                return (
                                  <Table.Td
                                    key={col.key}
                                    style={{
                                      textAlign: isNumeric ? 'right' : 'left',
                                      whiteSpace: 'nowrap',
                                      backgroundColor: rowBg,
                                      borderBottom: '1px solid var(--border)',
                                    }}
                                  >
                                    {renderCellValue(col.key, val, hasError)}
                                  </Table.Td>
                                );
                              })}
                            </Table.Tr>
                          );
                        })
                      )}
                    </Table.Tbody>
                  </Table>
                </Box>

                {displayRows.length > 0 && (
                  <Group
                    justify="space-between"
                    p="xs"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <Text size="xs" c="dimmed">
                      {t('Showing')} {(previewPage - 1) * pageSize + 1}–
                      {Math.min(previewPage * pageSize, displayRows.length)} {t('of')}{' '}
                      {displayRows.length} {t('items')} ({selectedValidCount} {t('selected')})
                    </Text>
                    {totalDisplayPages > 1 && (
                      <Pagination
                        size="xs"
                        total={totalDisplayPages}
                        value={previewPage}
                        onChange={setPreviewPage}
                      />
                    )}
                  </Group>
                )}
              </Paper>

              {/* Configurable options (e.g. auto generate barcodes) */}
              {config.supportedOptions && config.supportedOptions.length > 0 && (
                <Paper p="sm" withBorder>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                    mb="xs"
                  >
                    {t('Import Settings')}
                  </Text>
                  <Stack gap="xs">
                    {config.supportedOptions.map((opt) => (
                      <Checkbox
                        key={String(opt.key)}
                        label={opt.label}
                        description={opt.description}
                        checked={Boolean(options[opt.key])}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            [opt.key]: e.currentTarget.checked,
                          }))
                        }
                      />
                    ))}
                  </Stack>
                </Paper>
              )}
            </>
          )}

          {processMutation.isError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} title={t('Import Failed')}>
              {processMutation.error instanceof Error
                ? processMutation.error.message
                : t('Failed to process import. Please try again.')}
            </Alert>
          )}

          {/* Footer Actions */}
          <Group justify="space-between" mt="md" gap="sm">
            <Button
              variant="default"
              onClick={() => setStep('upload')}
              disabled={isImporting || processMutation.isPending}
            >
              {t('Back to File Selection')}
            </Button>

            <Group gap="sm">
              {previewTab === 'table' && detectedCategories.length > 0 && (
                <Button
                  variant="light"
                  color="blue"
                  onClick={() => setPreviewTab('categories')}
                  disabled={isImporting || processMutation.isPending}
                >
                  {t('Configure Categories')} →
                </Button>
              )}

              {previewTab === 'categories' && (
                <Button
                  variant="light"
                  color="blue"
                  onClick={() => setPreviewTab('table')}
                  disabled={isImporting || processMutation.isPending}
                >
                  ← {t('Back to Data Selection')}
                </Button>
              )}

              <Button
                variant="default"
                onClick={handleClose}
                disabled={isImporting || processMutation.isPending}
              >
                {t('Cancel')}
              </Button>

              <Button
                color="blue"
                onClick={handleConfirmImport}
                loading={isImporting || processMutation.isPending}
                disabled={selectedValidCount === 0}
              >
                {selectedValidCount > 0
                  ? `${t('Import')} ${selectedValidCount} ${t('Selected Items')}`
                  : t('Import Selected Items')}
              </Button>
            </Group>
          </Group>
        </Stack>
      )}

      {step === 'result' && importResult && (
        <Stack gap="md">
          {/* Result Outcome Box */}
          <Paper p="lg" withBorder bg="var(--mantine-color-body)">
            <Stack align="center" gap="xs">
              <ThemeIcon
                size={56}
                radius="xl"
                color={
                  importResult.status === 'completed'
                    ? 'green'
                    : importResult.status === 'partially_completed'
                      ? 'orange'
                      : 'red'
                }
                variant="light"
              >
                {importResult.status === 'completed' ? (
                  <IconCheck size={32} />
                ) : (
                  <IconAlertTriangle size={32} />
                )}
              </ThemeIcon>

              <Text fw={700} size="lg">
                {importResult.status === 'completed'
                  ? t('Import Successfully Completed!')
                  : importResult.status === 'partially_completed'
                    ? t('Import Finished with Some Exceptions')
                    : t('Import Failed')}
              </Text>

              <Text size="sm" c="dimmed" ta="center">
                {importResult.successfulRows} {t('items added to the database.')}
                {importResult.failedRows > 0 &&
                  ` ${importResult.failedRows} items were skipped due to errors.`}
              </Text>

              <Group gap="sm" mt="xs">
                <Badge color="green" size="lg" variant="filled">
                  {importResult.successfulRows} {t('Added')}
                </Badge>
                {importResult.failedRows > 0 && (
                  <Badge color="red" size="lg" variant="filled">
                    {importResult.failedRows} {t('Skipped')}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* Expandable row errors table if any rows failed */}
          {importResult.errors.length > 0 && (
            <div>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                fullWidth
                rightSection={
                  showFailedDetails ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
                }
                onClick={() => setShowFailedDetails((prev) => !prev)}
              >
                {showFailedDetails
                  ? t('Hide error details')
                  : `${t('View')} ${importResult.errors.length} ${t('skipped row details')}`}
              </Button>

              <Collapse expanded={showFailedDetails}>
                <Paper withBorder mt="xs" p="xs">
                  <ScrollArea mah={200}>
                    <Table style={{ fontSize: 12 }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: 60 }}>{t('Row #')}</Table.Th>
                          <Table.Th style={{ width: 120 }}>{t('Field')}</Table.Th>
                          <Table.Th>{t('Reason')}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {importResult.errors.map((err, i) => (
                          <Table.Tr key={i}>
                            <Table.Td>
                              <Text size="xs" fw={600}>
                                {err.rowNumber}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c="dimmed">
                                {err.field ?? '—'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c="red">
                                {err.message}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Paper>
              </Collapse>
            </div>
          )}

          <Group justify="flex-end" mt="md" gap="sm">
            <Button color="blue" onClick={handleClose}>
              {t('Done')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
