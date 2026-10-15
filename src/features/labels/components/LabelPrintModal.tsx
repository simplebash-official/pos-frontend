import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBarcode, IconCheck, IconPrinter, IconSettings } from '@tabler/icons-react';
import { queryKeys } from '@/api/queryKeys';
import { PERMISSIONS } from '@/constants/permissions';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import { printLabelPdf } from '@/shared/print/printService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLabelPrintSettings, setLabelPrintSettings } from '@/store/slices/settingsSlice';
import { useProductSerials } from '@/features/inventory/hooks/useProductSerials';
import { useGenerateProductBarcode } from '@/features/inventory/hooks/useProducts';
import type { Product } from '@/features/inventory/types';
import { renderLabels } from '../api/labelsApi';
import { useLabelTemplates } from '../hooks/useLabelTemplates';
import {
  buildItems,
  countLabels,
  newRow,
  printBlockers,
  rowsWithoutBarcode,
  templateUsesPrice,
  type LabelRow,
} from '../lib/printJob';
import { draftFromSettings, settingsFromDraft, type SetupDraft } from '../lib/printSetupDraft';
import { LABEL_LIMITS, type LabelItem, type LabelTemplate } from '../types';
import { LabelPrintSetupFields } from './LabelPrintSetupFields';

/** 1 label / 2 labels, in the person's language. */
const labelCount = (count: number): string => `${count} ${count === 1 ? t('label') : t('labels')}`;

/** The preview shows at most this many different stickers (one of each). */
const PREVIEW_STICKER_LIMIT = 12;

export interface LabelPrintModalProps {
  opened: boolean;
  onClose: () => void;
  /** The products to print labels for. */
  products: Product[];
}

interface SerialUnitPickerProps {
  row: LabelRow;
  onChange: (serialNumbers: string[]) => void;
}

const SerialUnitPicker = ({ row, onChange }: SerialUnitPickerProps) => {
  const { data: units, isLoading, isError } = useProductSerials(row.product.key, 'in_stock');
  if (isLoading) return <Skeleton height={48} />;
  if (isError) {
    return (
      <Text size="xs" c="red">
        {t('Could not load the units of this item.')}
      </Text>
    );
  }
  const numbers = (units ?? []).map((unit) => unit.serialNumber);
  if (numbers.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        {t('No units in stock.')}
      </Text>
    );
  }
  return (
    <Stack gap={4}>
      <Group gap="xs">
        <Button size="compact-xs" variant="default" onClick={() => onChange(numbers)}>
          {t('Select all')}
        </Button>
        <Button size="compact-xs" variant="default" onClick={() => onChange([])}>
          {t('Clear')}
        </Button>
        <Text size="xs" c="dimmed">
          {row.serialNumbers.length} / {numbers.length} {t('chosen')}
        </Text>
      </Group>
      <ScrollArea.Autosize
        scrollbars="y"
        mah={140}
        classNames={{ viewport: 'scrollarea-fluid-content' }}
      >
        <Checkbox.Group value={row.serialNumbers} onChange={onChange}>
          <Stack gap={6}>
            {numbers.map((serialNumber) => (
              <Checkbox key={serialNumber} size="xs" value={serialNumber} label={serialNumber} />
            ))}
          </Stack>
        </Checkbox.Group>
      </ScrollArea.Autosize>
    </Stack>
  );
};

interface LabelRowEditorProps {
  row: LabelRow;
  usesPrice: boolean;
  onChange: (row: LabelRow) => void;
}

const LabelRowEditor = ({ row, usesPrice, onChange }: LabelRowEditorProps) => {
  const isMobile = useIsMobile();
  const { product } = row;
  const showPriceChoice = usesPrice && !product.isSerialized && product.priceTiers.length > 1;
  return (
    <Paper p="sm" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} size="sm" truncate>
              {product.name}
            </Text>
            <Text size="xs" c="dimmed">
              {product.sku}
              {product.isSerialized ? ` · ${t('Tracked by serial number')}` : ''}
            </Text>
          </Box>
          <NumberInput
            aria-label={t('Labels to print')}
            w={isMobile ? 96 : 84}
            size={isMobile ? 'md' : 'xs'}
            min={1}
            max={LABEL_LIMITS.maxCopies}
            allowDecimal={false}
            value={row.copies}
            onChange={(value) =>
              onChange({ ...row, copies: typeof value === 'number' ? value : Number.NaN })
            }
            suffix={product.isSerialized ? ` ${t('each')}` : undefined}
          />
        </Group>
        {showPriceChoice && (
          <Select
            size={isMobile ? 'md' : 'xs'}
            label={t('Price on the label')}
            data={product.priceTiers.map((tier) => ({
              value: String(tier.sellingPriceCents),
              label: `${formatMoney(tier.sellingPriceCents)} · ${tier.quantity} ${t('in stock')}`,
            }))}
            value={row.priceCents === null ? null : String(row.priceCents)}
            onChange={(value) =>
              onChange({ ...row, priceCents: value === null ? null : Number(value) })
            }
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
          />
        )}
        {product.isSerialized && (
          <SerialUnitPicker
            row={row}
            onChange={(serialNumbers) => onChange({ ...row, serialNumbers })}
          />
        )}
      </Stack>
    </Paper>
  );
};

/**
 * Print stickers for chosen items: pick how many of each (and which units, for
 * items tracked by serial number), see exactly what will be printed, then print
 * or download. The first time on a computer it asks how labels should print.
 */
export const LabelPrintModal = ({ opened, onClose, products }: LabelPrintModalProps) => {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectLabelPrintSettings);
  const canWriteInventory = useHasPermission(PERMISSIONS.INVENTORY_WRITE);
  const templatesQuery = useLabelTemplates();
  const generateBarcode = useGenerateProductBarcode();

  const [rows, setRows] = useState<LabelRow[]>(() => products.map((product) => newRow(product, 1)));
  const [settingUp, setSettingUp] = useState(settings === null);
  const [draft, setDraft] = useState<SetupDraft>(() => draftFromSettings(settings));
  const [creatingBarcodes, setCreatingBarcodes] = useState(false);

  const templates = templatesQuery.data;
  const template: LabelTemplate | undefined = templates?.find(
    (candidate) => candidate.key === settings?.templateKey
  );
  const blockers = template === undefined ? [] : printBlockers(rows, template);
  const items = buildItems(rows);
  const ready = settings !== null && template !== undefined && blockers.length === 0;
  const missingBarcodes = rowsWithoutBarcode(rows);

  // One of each different sticker is enough to see what will come out.
  const previewItems: LabelItem[] = items
    .slice(0, PREVIEW_STICKER_LIMIT)
    .map((item) => ({ ...item, copies: 1 }));
  const previewRequest =
    ready && template !== undefined ? { templateKey: template.key, items: previewItems } : null;
  const preview = useQuery({
    queryKey: queryKeys.labels.render(previewRequest),
    queryFn: () => renderLabels(previewRequest as NonNullable<typeof previewRequest>),
    enabled: previewRequest !== null,
    staleTime: 0,
    retry: false,
  });

  const printMutation = useMutation({
    mutationFn: async (action: 'print' | 'download') => {
      if (settings === null || template === undefined) throw new Error('Label setup is missing.');
      const blob = await renderLabels({ templateKey: template.key, items });
      const fileName = pdfFileName('labels');
      if (action === 'download') {
        downloadPdfBlob(blob, fileName);
      } else {
        await printLabelPdf(blob, settings, fileName);
      }
      return action;
    },
    onSuccess: (action) => {
      notifications.show({
        title: action === 'print' ? t('Labels sent to print') : t('Labels downloaded'),
        message: labelCount(countLabels(items)),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      if (action === 'print') onClose();
    },
    onError: (error) => {
      notifications.show({
        title: t('Labels were not printed'),
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });

  const updateRow = (key: string, next: LabelRow) =>
    setRows((current) => current.map((row) => (row.product.key === key ? next : row)));

  const createMissingBarcodes = async () => {
    setCreatingBarcodes(true);
    try {
      for (const row of missingBarcodes) {
        const updated = await generateBarcode.mutateAsync(row.product.id);
        setRows((current) =>
          current.map((existing) =>
            existing.product.key === updated.key ? { ...existing, product: updated } : existing
          )
        );
      }
      notifications.show({
        title: t('Barcodes created'),
        message: t('These items can now be printed.'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: t('Could not create a barcode'),
        message: getErrorMessage(error),
        color: 'red',
      });
    } finally {
      setCreatingBarcodes(false);
    }
  };

  const completedSettings = settingsFromDraft(draft);
  const saveSetup = () => {
    if (completedSettings === null) return;
    dispatch(setLabelPrintSettings(completedSettings));
    setSettingUp(false);
  };

  const settingsProblem =
    settings !== null && templates !== undefined && template === undefined
      ? t('The label design you chose is no longer there. Choose another.')
      : null;
  const showSetup = settingUp || settingsProblem !== null;

  const renderSetup = () => (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {t('How labels print on this computer')}
        </Text>
        {settingsProblem !== null && (
          <Alert color="orange" variant="light">
            {settingsProblem}
          </Alert>
        )}
        <LabelPrintSetupFields draft={draft} onChange={setDraft} templates={templates ?? []} />
        <Group justify="flex-end" gap="sm">
          {settings !== null && settingsProblem === null && (
            <Button variant="default" onClick={() => setSettingUp(false)}>
              {t('Cancel')}
            </Button>
          )}
          <Button color="blue" disabled={completedSettings === null} onClick={saveSetup}>
            {t('Save and continue')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );

  const renderItems = () => (
    <Stack gap="sm">
      {missingBarcodes.length > 0 && (
        <Alert color="orange" variant="light" icon={<IconBarcode size={18} />}>
          <Stack gap="xs">
            <Text size="sm">
              {missingBarcodes.length === 1
                ? t('1 item has no barcode yet, so it cannot be printed.')
                : `${missingBarcodes.length} ${t('items have no barcode yet, so they cannot be printed.')}`}
            </Text>
            {canWriteInventory ? (
              <Button
                size="xs"
                w="fit-content"
                loading={creatingBarcodes}
                onClick={() => void createMissingBarcodes()}
              >
                {t('Create barcodes')}
              </Button>
            ) : (
              <Text size="xs" c="dimmed">
                {t('Ask a manager to create their barcodes.')}
              </Text>
            )}
          </Stack>
        </Alert>
      )}
      {rows.map((row) => (
        <LabelRowEditor
          key={row.product.key}
          row={row}
          usesPrice={template !== undefined && templateUsesPrice(template)}
          onChange={(next) => updateRow(row.product.key, next)}
        />
      ))}
      {blockers
        .filter((blocker) => blocker.kind === 'other')
        .map((blocker, index) => (
          <Text key={`${blocker.productName}-${index}`} size="xs" c="red">
            {blocker.productName === null
              ? blocker.message
              : `${blocker.productName}: ${blocker.message}`}
          </Text>
        ))}
    </Stack>
  );

  const renderPreview = () => (
    <Stack gap="xs" style={{ minWidth: 0 }}>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('What will be printed')}
      </Text>
      <Box h={isMobile ? 320 : 420} style={{ minHeight: 0 }}>
        <PdfCanvasViewer
          blob={preview.data ?? null}
          loading={preview.isFetching}
          error={preview.isError}
          documentLabel={t('Labels')}
          initialAutoFit
        />
      </Box>
      {preview.isError && (
        <Text size="xs" c="red">
          {getErrorMessage(preview.error)}
        </Text>
      )}
      {items.length > PREVIEW_STICKER_LIMIT && (
        <Text size="xs" c="dimmed">
          {t('Showing one of each of the first 12 labels.')}
        </Text>
      )}
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Print Labels')}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        {templatesQuery.isLoading && <Skeleton height={120} />}
        {templatesQuery.isError && (
          <Alert color="red" variant="light">
            {getErrorMessage(templatesQuery.error)}
          </Alert>
        )}
        {templates !== undefined && showSetup && renderSetup()}
        {templates !== undefined && !showSetup && template !== undefined && (
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Text size="sm" c="dimmed" truncate style={{ flex: 1, minWidth: 0 }}>
              {t('Design')}: <b>{template.name}</b> · {template.widthMm} × {template.heightMm} mm
            </Text>
            <Button
              size="compact-sm"
              variant="subtle"
              leftSection={<IconSettings size={14} />}
              onClick={() => {
                setDraft(draftFromSettings(settings));
                setSettingUp(true);
              }}
            >
              {t('Change')}
            </Button>
          </Group>
        )}

        {templates !== undefined && !showSetup && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <ScrollArea.Autosize
              scrollbars="y"
              mah={isMobile ? undefined : 480}
              type="auto"
              offsetScrollbars
              classNames={{ viewport: 'scrollarea-fluid-content' }}
            >
              {renderItems()}
            </ScrollArea.Autosize>
            {renderPreview()}
          </SimpleGrid>
        )}

        <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
          <Badge size="lg" variant="light" color="blue">
            {labelCount(countLabels(items))}
          </Badge>
          <Group gap="sm">
            <Button variant="default" onClick={onClose} disabled={printMutation.isPending}>
              {t('Cancel')}
            </Button>
            <Button
              variant="default"
              disabled={!ready || showSetup}
              loading={printMutation.isPending && printMutation.variables === 'download'}
              onClick={() => printMutation.mutate('download')}
            >
              {t('Download PDF')}
            </Button>
            <Button
              color="blue"
              leftSection={<IconPrinter size={16} />}
              disabled={!ready || showSetup}
              loading={printMutation.isPending && printMutation.variables === 'print'}
              onClick={() => printMutation.mutate('print')}
            >
              {t('Print')}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
