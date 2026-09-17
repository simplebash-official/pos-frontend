import { t } from '@/shared/i18n/t';
import { PRODUCT_NAME } from '@/config/branding';
import { useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconDownload,
  IconInfoCircle,
  IconRefresh,
  IconUpload,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { isTauri } from '@/shared/lib/runtime';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDateTime } from '@/shared/lib/date';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import {
  restoreSettings,
  selectPrintSettings,
  selectShopProfile,
} from '@/store/slices/settingsSlice';
import {
  downloadBackupFile,
  exportBackup,
  restoreBackup,
  type BackupExportData,
} from '../../api/backupApi';
import type { SectionProps } from './ShopProfileSection';

export const BackupSection = ({ onDirtyChange: _onDirtyChange }: SectionProps) => {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const userRole = useAppSelector(selectUserRole);
  const shopProfile = useAppSelector(selectShopProfile);
  const printSettings = useAppSelector(selectPrintSettings);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [includeSettings, setIncludeSettings] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Restore state
  const [isParsing, setIsParsing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupExportData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Desktop guard: feature is strictly desktop only
  if (!isTauri()) {
    return (
      <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
        <Stack gap="md">
          <div>
            <Text fw={700} size="lg">
              {t('Data Backup & Restore')}
            </Text>
            <Text size="sm" c="dimmed" mt={2}>
              {t('Export all shop records or restore from a backup file')}
            </Text>
          </div>
          <Divider />
          <Alert color="blue" icon={<IconInfoCircle size={20} />} title={t('Desktop Only Feature')}>
            {t(
              `Complete data export and database restore is only available in the desktop version of ${PRODUCT_NAME}.`
            )}
          </Alert>
        </Stack>
      </Paper>
    );
  }

  // Admin access guard
  if (userRole !== USER_ROLES.ADMIN) {
    return (
      <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
        <Stack gap="md">
          <div>
            <Text fw={700} size="lg">
              {t('Data Backup & Restore')}
            </Text>
            <Text size="sm" c="dimmed" mt={2}>
              {t('Export all shop records or restore from a backup file')}
            </Text>
          </div>
          <Divider />
          <Alert
            color="yellow"
            icon={<IconAlertCircle size={20} />}
            title={t('Admin Access Required')}
          >
            {t('Only administrators can export all system records or restore from a backup file.')}
          </Alert>
        </Stack>
      </Paper>
    );
  }

  // Handle Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payloadSettings = includeSettings
        ? {
            shopProfile,
            printSettings,
          }
        : undefined;

      const backup = await exportBackup({
        includeSettings,
        settings: payloadSettings,
      });

      downloadBackupFile(backup);

      notifications.show({
        title: t('Backup Downloaded'),
        message: t('Your shop data backup file was created and downloaded successfully.'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: t('Export Failed'),
        message:
          err instanceof Error ? err.message : t('Could not export shop data. Please try again.'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Selection and Client-side Preflight
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setParsedBackup(null);

    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as BackupExportData;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error(t('The selected file is not a valid JSON backup.'));
      }

      if (parsed.version !== 1) {
        throw new Error(
          t(`Unsupported backup version. Please ensure this file was created by ${PRODUCT_NAME}.`)
        );
      }

      if (!parsed.tables || typeof parsed.tables !== 'object') {
        throw new Error(t('Backup file is missing required table records.'));
      }

      setParsedBackup(parsed);
      setConfirmModalOpen(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('Failed to read the backup file. It may be corrupted.');
      setParseError(message);
    } finally {
      setIsParsing(false);
      // Reset input value so re-selecting the same file fires onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle Confirmed Restore
  const handleConfirmRestore = async () => {
    if (!parsedBackup) return;

    setIsRestoring(true);
    try {
      const result = await restoreBackup({ backup: parsedBackup });

      // If the backup included shop settings, update Redux store & localStorage
      if (result.settings && typeof result.settings === 'object') {
        dispatch(restoreSettings(result.settings as Record<string, unknown>));
      }

      // Invalidate all TanStack Query caches so every screen refreshes
      await queryClient.invalidateQueries();

      notifications.show({
        title: t('Data Restored Successfully'),
        message: `${t('Your shop data has been restored.')} (${result.totalRecords.toLocaleString()} ${t('records across')} ${result.totalTables} ${t('tables')})`,
        color: 'green',
        icon: <IconCheck size={16} />,
        autoClose: 8000,
      });

      setConfirmModalOpen(false);
      setParsedBackup(null);
      setSelectedFile(null);
    } catch (err) {
      notifications.show({
        title: t('Restore Failed'),
        message:
          err instanceof Error
            ? err.message
            : t('Failed to restore data. No changes were applied.'),
        color: 'red',
        icon: <IconAlertCircle size={16} />,
        autoClose: false,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const tableSummary = parsedBackup?.tables
    ? [
        {
          label: t('Products & Stock'),
          count: parsedBackup.tables['products']?.length || 0,
        },
        {
          label: t('Sales & Invoices'),
          count: parsedBackup.tables['invoices']?.length || 0,
        },
        {
          label: t('Payments Received'),
          count: parsedBackup.tables['payments']?.length || 0,
        },
        {
          label: t('Customers'),
          count: parsedBackup.tables['customers']?.length || 0,
        },
        {
          label: t('Repair Jobs'),
          count: parsedBackup.tables['repairs']?.length || 0,
        },
        {
          label: t('Print Jobs'),
          count: parsedBackup.tables['print_jobs']?.length || 0,
        },
        {
          label: t('Suppliers & Purchases'),
          count:
            (parsedBackup.tables['suppliers']?.length || 0) +
            (parsedBackup.tables['purchases']?.length || 0),
        },
      ]
    : [];

  return (
    <>
      <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
        <Stack gap="lg">
          <div>
            <Text fw={700} size="lg">
              {t('Data Backup & Restore')}
            </Text>
            <Text size="sm" c="dimmed" mt={2}>
              {t(
                'Save a complete backup copy of your shop data, or restore your system from a previously saved backup.'
              )}
            </Text>
          </div>
          <Divider />

          {/* Section 1: Export Shop Data */}
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-body)' }}>
            <Stack gap="sm">
              <Group gap="xs">
                <ThemeIcon
                  color="blue"
                  variant="light"
                  size="lg"
                  radius="var(--mantine-radius-default)"
                >
                  <IconDownload size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="md">
                    {t('Export Shop Data')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t(
                      'Download a complete copy of all your inventory, sales, customers, repairs, print jobs, and settings into a single backup file.'
                    )}
                  </Text>
                </div>
              </Group>

              <Checkbox
                label={t('Include shop branding, bank details, and printing settings')}
                checked={includeSettings}
                onChange={(e) => setIncludeSettings(e.currentTarget.checked)}
                size="sm"
                mt="xs"
              />

              <Group justify="flex-start" mt="xs">
                <Button
                  color="blue"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleExport}
                  loading={isExporting}
                  style={{ minHeight: isMobile ? 44 : 36 }}
                >
                  {t('Export Backup File')}
                </Button>
              </Group>
            </Stack>
          </Paper>

          {/* Section 2: Restore Shop Data */}
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-body)' }}>
            <Stack gap="sm">
              <Group gap="xs">
                <ThemeIcon
                  color="orange"
                  variant="light"
                  size="lg"
                  radius="var(--mantine-radius-default)"
                >
                  <IconUpload size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="md">
                    {t('Restore From Backup')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t(
                      'Restore your shop system from a previously downloaded .posbackup or .json backup file.'
                    )}
                  </Text>
                </div>
              </Group>

              <Alert
                color="orange"
                icon={<IconAlertTriangle size={18} />}
                title={t('Important Warning')}
                mt="xs"
              >
                {t(
                  'Restoring from a backup will replace all current shop data with the contents of the backup file. Any changes made since this backup was created will be overwritten. We recommend exporting a fresh backup first before restoring.'
                )}
              </Alert>

              {parseError && (
                <Alert
                  color="red"
                  icon={<IconAlertCircle size={18} />}
                  title={t('Invalid Backup File')}
                >
                  {parseError}
                </Alert>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".posbackup,.json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Group justify="flex-start" mt="xs">
                <Button
                  variant="default"
                  leftSection={<IconUpload size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  loading={isParsing}
                  style={{ minHeight: isMobile ? 44 : 36 }}
                >
                  {t('Select Backup File')}
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Preflight Modal & Confirmation Dialog */}
      <Modal
        opened={confirmModalOpen}
        onClose={() => {
          if (!isRestoring) {
            setConfirmModalOpen(false);
            setParsedBackup(null);
            setSelectedFile(null);
          }
        }}
        title={
          <Text fw={700} size="lg">
            {t('Review Backup Before Restoring')}
          </Text>
        }
        size="lg"
        centered
        fullScreen={isMobile}
      >
        <Stack gap="md">
          <Alert
            color="orange"
            icon={<IconAlertTriangle size={20} />}
            title={t('Confirm Data Replacement')}
          >
            {t(
              'This will completely replace your current database records with the data in this backup file. This action cannot be undone.'
            )}
          </Alert>

          {parsedBackup && (
            <Paper p="md" withBorder radius="var(--mantine-radius-default)">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('File Name')}:
                  </Text>
                  <Text size="sm" fw={600}>
                    {selectedFile?.name}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('Backup Created')}:
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatDateTime(parsedBackup.exportedAt)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('Total Records')}:
                  </Text>
                  <Badge color="blue" variant="light" size="lg">
                    {parsedBackup.totalRecords.toLocaleString()} {t('records')}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('Shop Settings Included')}:
                  </Text>
                  <Badge color={parsedBackup.settings ? 'green' : 'gray'} variant="light">
                    {parsedBackup.settings ? t('Yes') : t('No')}
                  </Badge>
                </Group>

                <Divider my="xs" />

                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {t('Record Breakdown')}
                </Text>

                <Table withTableBorder withColumnBorders fz="xs">
                  <Table.Tbody>
                    {tableSummary.map((item) => (
                      <Table.Tr key={item.label}>
                        <Table.Td>{item.label}</Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {item.count.toLocaleString()}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          )}

          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setConfirmModalOpen(false);
                setParsedBackup(null);
                setSelectedFile(null);
              }}
              disabled={isRestoring}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="red"
              leftSection={<IconRefresh size={16} />}
              onClick={handleConfirmRestore}
              loading={isRestoring}
            >
              {t('Restore All Data')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
