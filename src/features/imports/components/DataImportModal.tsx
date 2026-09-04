import { useId, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Collapse,
  Group,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconFileSpreadsheet,
  IconUpload,
} from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { useProcessImport } from '../hooks/useImportBatches';
import { parseSpreadsheetFile } from '../lib/fileParser';
import { downloadTemplate } from '../lib/templateGenerator';
import type { ImportBatchRecord, ImportConfig, ImportOptions, ParsedFileResult } from '../types';

export interface DataImportModalProps {
  opened: boolean;
  onClose: () => void;
  config: ImportConfig;
  onSuccess?: (result: ImportBatchRecord) => void;
}

const ROWS_PER_PAGE = 8;

export function DataImportModal({ opened, onClose, config, onSuccess }: DataImportModalProps) {
  const isMobile = useIsMobile();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow steps: 'upload' | 'preview' | 'result'
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Extracted data
  const [parsedResult, setParsedResult] = useState<ParsedFileResult | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  // Import options
  const [options, setOptions] = useState<ImportOptions>(() => {
    const initial: ImportOptions = {};
    config.supportedOptions?.forEach((opt) => {
      initial[opt.key] = opt.defaultValue ?? false;
    });
    return initial;
  });

  // Server result
  const [importResult, setImportResult] = useState<ImportBatchRecord | null>(null);
  const [showFailedDetails, setShowFailedDetails] = useState(false);

  const processMutation = useProcessImport();

  const handleReset = () => {
    setStep('upload');
    setParsedResult(null);
    setParseError(null);
    setPreviewPage(1);
    setShowErrorsOnly(false);
    setImportResult(null);
    setShowFailedDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (processMutation.isPending) return;
    handleReset();
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseSpreadsheetFile(file, config);
      setParsedResult(result);
      setStep('preview');
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

  const handleConfirmImport = async () => {
    if (!parsedResult) return;

    // Send the rows payload to backend
    const rawRows = parsedResult.rows.map((r) => r.data as Record<string, unknown>);

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
      }
    );
  };

  // Filtered preview rows
  const displayRows = useMemo(() => {
    if (!parsedResult) return [];
    if (showErrorsOnly) {
      return parsedResult.rows.filter((r) => !r._isValid);
    }
    return parsedResult.rows;
  }, [parsedResult, showErrorsOnly]);

  const totalDisplayPages = Math.ceil(displayRows.length / ROWS_PER_PAGE) || 1;
  const paginatedRows = useMemo(() => {
    const start = (previewPage - 1) * ROWS_PER_PAGE;
    return displayRows.slice(start, start + ROWS_PER_PAGE);
  }, [displayRows, previewPage]);

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
                <Badge color="green" variant="light" size="md">
                  {parsedResult.validRowCount} {t('Ready to Import')}
                </Badge>
                {parsedResult.invalidRowCount > 0 && (
                  <Button
                    size="xs"
                    variant={showErrorsOnly ? 'filled' : 'light'}
                    color="red"
                    onClick={() => {
                      setShowErrorsOnly((prev) => !prev);
                      setPreviewPage(1);
                    }}
                  >
                    {parsedResult.invalidRowCount} {t('Need Attention')}
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>

          {parsedResult.invalidRowCount > 0 && !showErrorsOnly && (
            <Alert color="orange" icon={<IconAlertTriangle size={16} />} p="xs">
              <Text size="xs">
                {t(
                  'Some rows have missing fields or formatting issues. You can still proceed — invalid rows will be skipped and reported in the summary.'
                )}
              </Text>
            </Alert>
          )}

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

          {/* Extracted Data Table */}
          <Paper withBorder>
            <ScrollArea
              classNames={{ viewport: 'scrollarea-fluid-content' }}
              mah={isMobile ? '45vh' : 320}
            >
              <Table striped highlightOnHover withTableBorder={false} style={{ fontSize: 13 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 50 }}>{t('#')}</Table.Th>
                    <Table.Th style={{ width: 90 }}>{t('Status')}</Table.Th>
                    {config.columns.slice(0, 5).map((col) => (
                      <Table.Th key={col.key}>{col.label}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedRows.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                        <Text size="xs" c="dimmed" py="md">
                          {t('No matching rows found.')}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    paginatedRows.map((row) => (
                      <Table.Tr
                        key={row._rowNumber}
                        bg={!row._isValid ? 'var(--mantine-color-red-light)' : undefined}
                      >
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {row._rowNumber}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {row._isValid ? (
                            <Badge color="green" size="xs" variant="filled">
                              {t('Valid')}
                            </Badge>
                          ) : (
                            <Tooltip
                              label={Object.values(row._errors).join(', ')}
                              multiline
                              w={220}
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
                        {config.columns.slice(0, 5).map((col) => {
                          const val = (row.data as Record<string, unknown>)[col.key];
                          const hasError = Boolean(row._errors[col.key]);
                          return (
                            <Table.Td key={col.key}>
                              <Text
                                size="xs"
                                c={hasError ? 'red' : undefined}
                                fw={hasError ? 600 : undefined}
                                lineClamp={1}
                              >
                                {val !== undefined && val !== null ? String(val) : '—'}
                              </Text>
                            </Table.Td>
                          );
                        })}
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {totalDisplayPages > 1 && (
              <Group
                justify="space-between"
                p="xs"
                style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
              >
                <Text size="xs" c="dimmed">
                  {t('Showing page')} {previewPage} {t('of')} {totalDisplayPages}
                </Text>
                <Pagination
                  size="xs"
                  total={totalDisplayPages}
                  value={previewPage}
                  onChange={setPreviewPage}
                />
              </Group>
            )}
          </Paper>

          {processMutation.isError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} title={t('Import Failed')}>
              {processMutation.error instanceof Error
                ? processMutation.error.message
                : t('Failed to process import. Please try again.')}
            </Alert>
          )}

          <Group justify="space-between" mt="md" gap="sm">
            <Button
              variant="default"
              onClick={() => setStep('upload')}
              disabled={processMutation.isPending}
            >
              {t('Back to File Selection')}
            </Button>
            <Group gap="sm">
              <Button variant="default" onClick={handleClose} disabled={processMutation.isPending}>
                {t('Cancel')}
              </Button>
              <Button
                color="blue"
                onClick={handleConfirmImport}
                loading={processMutation.isPending}
                disabled={parsedResult.validRowCount === 0}
              >
                {t('Confirm & Add to Database')}
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
