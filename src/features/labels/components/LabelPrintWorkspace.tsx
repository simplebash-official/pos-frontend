import { t } from '@/shared/i18n/t';
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBarcode,
  IconBulb,
  IconCheck,
  IconPrinter,
  IconSettings,
  IconTestPipe,
  IconX,
} from '@tabler/icons-react';
import { queryKeys } from '@/api/queryKeys';
import { PERMISSIONS } from '@/constants/permissions';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { downloadPdfBlob, pdfFileName } from '@/shared/print/pdfFileName';
import { printLabelPdf } from '@/shared/print/printService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLabelPrintSettings, setLabelPrintSettings } from '@/store/slices/settingsSlice';
import { fetchProducts } from '@/features/inventory/api/productsApi';
import { useProductSerials } from '@/features/inventory/hooks/useProductSerials';
import { useGenerateProductBarcode } from '@/features/inventory/hooks/useProducts';
import { createLabelJob, previewLabel, renderLabels, reportLabelJob } from '../api/labelsApi';
import { useRefreshLabelHistory } from '../hooks/useLabelJobs';
import { useLabelTemplates } from '../hooks/useLabelTemplates';
import { labelCount } from '../lib/jobView';
import { buildLabelSample } from '../lib/labelSample';
import {
  buildItems,
  countLabels,
  jobRequest,
  newRow,
  priceFreeAlternative,
  printBlockers,
  rowsWithoutBarcode,
  templateUsesPrice,
  withCopies,
  withStockCopies,
  type LabelRow,
} from '../lib/printJob';
import { draftFromSettings, settingsFromDraft, type SetupDraft } from '../lib/printSetupDraft';
import { LABEL_LIMITS, type LabelItem, type LabelTemplate } from '../types';
import { LabelPrintSetupFields } from './LabelPrintSetupFields';

/** The preview shows at most this many different stickers (one of each). */
const PREVIEW_STICKER_LIMIT = 12;
/** A print failure reason is kept to what the history stores. */
const MAX_REASON_CHARS = 500;

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

interface SerialUnitPickerProps {
  row: LabelRow;
  onChange: (serialNumbers: string[]) => void;
}

/**
 * The units of a serial product to label. Every unit in stock starts chosen;
 * units chosen earlier (a reprint) that have been sold since drop out.
 */
const SerialUnitPicker = ({ row, onChange }: SerialUnitPickerProps) => {
  const { data: units, isLoading, isError } = useProductSerials(row.product.key, 'in_stock');
  const numbers = (units ?? []).map((unit) => unit.serialNumber);
  const loaded = units !== undefined;
  const chosen = row.serialNumbers;

  useEffect(() => {
    if (!loaded) return;
    if (chosen === null) {
      onChange(numbers);
      return;
    }
    const inStock = chosen.filter((serialNumber) => numbers.includes(serialNumber));
    if (inStock.length !== chosen.length) onChange(inStock);
  }, [loaded, chosen, numbers, onChange]);

  if (isLoading) return <Skeleton height={48} />;
  if (isError) {
    return (
      <Text size="xs" c="red">
        {t('Could not load the units of this item.')}
      </Text>
    );
  }
  if (numbers.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        {t('No units in stock.')}
      </Text>
    );
  }
  const selected = chosen ?? [];
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
          {selected.length} / {numbers.length} {t('chosen')}
        </Text>
      </Group>
      <ScrollArea.Autosize
        scrollbars="y"
        mah={140}
        classNames={{ viewport: 'scrollarea-fluid-content' }}
      >
        <Checkbox.Group value={selected} onChange={onChange}>
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
  onRemove: () => void;
}

const LabelRowEditor = ({ row, usesPrice, onChange, onRemove }: LabelRowEditorProps) => {
  const isMobile = useIsMobile();
  const { product } = row;
  const showPriceChoice = usesPrice && !product.isSerialized && product.priceTiers.length > 1;
  const onSerialsChange = (serialNumbers: string[]) => onChange({ ...row, serialNumbers });
  return (
    <Paper p="sm" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text fw={600} size="sm" lineClamp={2}>
              {product.name}
            </Text>
            <Text size="xs" c="dimmed">
              {product.sku} · {product.stockQuantity} {t('in stock')}
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
          <Tooltip label={t('Remove from this print')}>
            <ActionIcon
              variant="light"
              color="red"
              size={isMobile ? 44 : 30}
              aria-label={t('Remove from this print')}
              onClick={onRemove}
            >
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
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
        {product.isSerialized && <SerialUnitPicker row={row} onChange={onSerialsChange} />}
      </Stack>
    </Paper>
  );
};

/** Finds an item by name, code or barcode and adds it to the print. */
const AddItemSearch = ({
  excludeKeys,
  onAdd,
}: {
  excludeKeys: string[];
  onAdd: (row: LabelRow) => void;
}) => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search.trim(), 300);
  const results = useQuery({
    queryKey: ['labels', 'item-search', debounced],
    queryFn: () => fetchProducts({ search: debounced, limit: 10 }),
    enabled: debounced.length > 0,
  });
  const products = (results.data?.items ?? []).filter(
    (product) => !excludeKeys.includes(product.key)
  );
  return (
    <Select
      size={isMobile ? 'md' : 'sm'}
      aria-label={t('Add an item to this print')}
      placeholder={t('Add an item: type its name, code or barcode')}
      searchable
      clearable
      value={null}
      searchValue={search}
      onSearchChange={setSearch}
      data={products.map((product) => ({
        value: product.key,
        label: `${product.name} · ${product.sku}`,
      }))}
      // The server already matched the search; do not filter its answer again.
      filter={({ options }) => options}
      nothingFoundMessage={
        debounced.length === 0
          ? t('Type to search your items')
          : results.isFetching
            ? t('Searching…')
            : t('No matching items')
      }
      onChange={(key) => {
        const product = products.find((candidate) => candidate.key === key);
        if (product === undefined) return;
        onAdd(newRow(product, 1));
        setSearch('');
      }}
      comboboxProps={{ withinPortal: true }}
    />
  );
};

export interface LabelPrintWorkspaceProps {
  /** The items in this print (may be empty: the person adds items here). */
  rows: LabelRow[];
  onRowsChange: Dispatch<SetStateAction<LabelRow[]>>;
  /** After a print was sent (not after a download). */
  onPrinted: () => void;
  /** Shown first in the footer, e.g. a modal's Cancel; `null` for none. */
  footerStart: ReactNode;
  /** Enter prints while this is true (desktop only). */
  shortcutsActive: boolean;
  /** Fit the height the parent gives (items and preview scroll inside it) instead of fixed heights. */
  fill: boolean;
}

/**
 * Everything needed to print labels: the items (add, remove, how many of each,
 * which price, which units), a live preview of exactly what will come out, and
 * print / download, each recorded in the print history. The first time on a
 * computer it asks how labels should print.
 */
export const LabelPrintWorkspace = ({
  rows,
  onRowsChange: setRows,
  onPrinted,
  footerStart,
  shortcutsActive,
  fill,
}: LabelPrintWorkspaceProps) => {
  const isMobile = useIsMobile();
  const fitting = fill && !isMobile;
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectLabelPrintSettings);
  const canWriteInventory = useHasPermission(PERMISSIONS.INVENTORY_WRITE);
  const templatesQuery = useLabelTemplates();
  const generateBarcode = useGenerateProductBarcode();
  const refreshHistory = useRefreshLabelHistory();

  const [settingUp, setSettingUp] = useState(settings === null);
  const [draft, setDraft] = useState<SetupDraft>(() => draftFromSettings(settings));
  const [creatingBarcodes, setCreatingBarcodes] = useState(false);
  const [allCopies, setAllCopies] = useState<number | string>(1);

  const templates = templatesQuery.data;
  const template: LabelTemplate | undefined = templates?.find(
    (candidate) => candidate.key === settings?.templateKey
  );
  const blockers = template === undefined ? [] : printBlockers(rows, template);
  const items = buildItems(rows);
  const ready = settings !== null && template !== undefined && blockers.length === 0;
  const missingBarcodes = rowsWithoutBarcode(rows);
  const suggestion =
    template === undefined || templates === undefined
      ? null
      : priceFreeAlternative(rows, template, templates);

  // One of each different sticker is enough to see what will come out.
  const previewItems: LabelItem[] = items
    .slice(0, PREVIEW_STICKER_LIMIT)
    .map((item) => ({ ...item, copies: 1 }));
  const previewRequest =
    ready && template !== undefined ? { templateKey: template.key, items: previewItems } : null;
  // Quick successive edits become one request, and the last picture stays up while the next loads.
  const [settledKey] = useDebouncedValue(
    previewRequest === null ? null : JSON.stringify(previewRequest),
    250
  );
  const settledRequest =
    settledKey === null ? null : (JSON.parse(settledKey) as typeof previewRequest);
  const preview = useQuery({
    queryKey: queryKeys.labels.render(settledRequest),
    queryFn: () => renderLabels(settledRequest as NonNullable<typeof settledRequest>),
    enabled: settledRequest !== null && previewRequest !== null,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const printMutation = useMutation({
    mutationFn: async (action: 'print' | 'download') => {
      if (settings === null || template === undefined) throw new Error('Label setup is missing.');
      const { jobKey, pdf } = await createLabelJob(
        jobRequest(template.key, items, settings, action)
      );
      const fileName = pdfFileName('labels');
      if (action === 'download') {
        downloadPdfBlob(pdf, fileName);
        return action;
      }
      try {
        await printLabelPdf(pdf, settings, fileName);
      } catch (error) {
        const reason = getErrorMessage(error).slice(0, MAX_REASON_CHARS) || t('Printing failed');
        await reportLabelJob(jobKey, 'failed', reason).catch(() => undefined);
        throw error;
      }
      // The labels are printed: a lost report only leaves the history saying "waiting".
      await reportLabelJob(jobKey, 'sent', null).catch(() => undefined);
      return action;
    },
    onSuccess: (action) => {
      notifications.show({
        title: action === 'print' ? t('Labels sent to print') : t('Labels downloaded'),
        message: labelCount(countLabels(items)),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      if (action === 'print') onPrinted();
    },
    onError: (error) => {
      notifications.show({
        title: t('Labels were not printed'),
        message: getErrorMessage(error),
        color: 'red',
      });
    },
    onSettled: refreshHistory,
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (settings === null || template === undefined) throw new Error('Label setup is missing.');
      const { name, widthMm, heightMm, elements } = template;
      const pdf = await previewLabel({ name, widthMm, heightMm, elements }, buildLabelSample());
      await printLabelPdf(pdf, settings, pdfFileName('label-test'));
    },
    onSuccess: () => {
      notifications.show({
        title: t('Test label sent'),
        message: t('Check that it lines up with your label paper.'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (error) => {
      notifications.show({
        title: t('The test label was not printed'),
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });

  const busy = printMutation.isPending || testMutation.isPending;
  const settingsProblem =
    settings !== null && templates !== undefined && template === undefined
      ? t('The label design you chose is no longer there. Choose another.')
      : null;
  const showSetup = settingUp || settingsProblem !== null;
  const canPrint = ready && !showSetup && !busy;

  useAppShortcuts(
    [{ key: 'Enter', handler: () => canPrint && printMutation.mutate('print') }],
    shortcutsActive && !isMobile
  );

  const updateRow = (key: string, next: LabelRow) =>
    setRows((current) => current.map((row) => (row.product.key === key ? next : row)));
  const removeRow = (key: string) =>
    setRows((current) => current.filter((row) => row.product.key !== key));

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

  const renderSetup = () => (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {sectionLabel(t('How labels print on this computer'))}
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

  const renderBulkCopies = () => (
    <Group gap="xs" wrap="wrap">
      <Text size="xs" c="dimmed">
        {t('Labels for every item:')}
      </Text>
      <Button
        size={isMobile ? 'sm' : 'compact-xs'}
        variant="default"
        onClick={() => setRows((current) => withCopies(current, 1))}
      >
        {t('1 each')}
      </Button>
      <Button
        size={isMobile ? 'sm' : 'compact-xs'}
        variant="default"
        onClick={() => setRows(withStockCopies)}
      >
        {t('Match stock')}
      </Button>
      <Group gap={4} wrap="nowrap">
        <NumberInput
          aria-label={t('Labels for every item')}
          w={isMobile ? 88 : 72}
          size={isMobile ? 'sm' : 'xs'}
          min={1}
          max={LABEL_LIMITS.maxCopies}
          allowDecimal={false}
          value={allCopies}
          onChange={setAllCopies}
        />
        <Button
          size={isMobile ? 'sm' : 'compact-xs'}
          variant="default"
          disabled={typeof allCopies !== 'number'}
          onClick={() =>
            typeof allCopies === 'number' && setRows((current) => withCopies(current, allCopies))
          }
        >
          {t('Set all')}
        </Button>
      </Group>
    </Group>
  );

  const renderItems = () => (
    <Stack gap="sm">
      <AddItemSearch
        excludeKeys={rows.map((row) => row.product.key)}
        onAdd={(row) => setRows((current) => [...current, row])}
      />
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="lg">
          {t('Nothing to print yet. Add an item above.')}
        </Text>
      ) : (
        renderBulkCopies()
      )}
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
      {suggestion !== null && settings !== null && (
        <Alert color="blue" variant="light" icon={<IconBulb size={18} />}>
          <Stack gap="xs">
            <Text size="sm">
              {t('Some items are out of stock, so they have no price to print.')}{' '}
              {t('This design has no price:')} <b>{suggestion.name}</b>
            </Text>
            <Button
              size="xs"
              w="fit-content"
              variant="light"
              onClick={() =>
                dispatch(setLabelPrintSettings({ ...settings, templateKey: suggestion.key }))
              }
            >
              {t('Use this design')}
            </Button>
          </Stack>
        </Alert>
      )}
      {rows.map((row) => (
        <LabelRowEditor
          key={row.product.key}
          row={row}
          usesPrice={template !== undefined && templateUsesPrice(template)}
          onChange={(next) => updateRow(row.product.key, next)}
          onRemove={() => removeRow(row.product.key)}
        />
      ))}
      {rows.length > 0 &&
        blockers
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
    <Stack gap="xs" style={{ minWidth: 0, minHeight: 0, height: fitting ? '100%' : undefined }}>
      {sectionLabel(t('What will be printed'))}
      <Box
        h={fitting ? undefined : isMobile ? 320 : 420}
        style={fitting ? { flex: 1, minHeight: 220 } : { minHeight: 0 }}
      >
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
    <Stack gap="md" style={fitting ? { flex: 1, minHeight: 0 } : undefined}>
      {templatesQuery.isLoading && <Skeleton height={120} />}
      {templatesQuery.isError && (
        <Alert color="red" variant="light">
          {getErrorMessage(templatesQuery.error)}
        </Alert>
      )}
      {templates !== undefined && showSetup && renderSetup()}
      {templates !== undefined && !showSetup && template !== undefined && (
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed" truncate style={{ flex: 1, minWidth: 200 }}>
            {t('Design')}: <b>{template.name}</b> · {template.widthMm} × {template.heightMm} mm
          </Text>
          <Group gap="xs" wrap="nowrap">
            <Button
              size={isMobile ? 'sm' : 'compact-sm'}
              variant="subtle"
              leftSection={<IconTestPipe size={14} />}
              loading={testMutation.isPending}
              disabled={busy}
              onClick={() => testMutation.mutate()}
            >
              {t('Print a test label')}
            </Button>
            <Button
              size={isMobile ? 'sm' : 'compact-sm'}
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
        </Group>
      )}

      {templates !== undefined && !showSetup && (
        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="md"
          style={
            fitting ? { flex: 1, minHeight: 0, gridTemplateRows: 'minmax(0, 1fr)' } : undefined
          }
        >
          {/* A phone scrolls the whole page; the items column only scrolls on its own beside the preview. */}
          {isMobile ? (
            <Box style={{ minWidth: 0 }}>{renderItems()}</Box>
          ) : fitting ? (
            <Box style={{ minWidth: 0, minHeight: 0, overflowY: 'auto' }}>{renderItems()}</Box>
          ) : (
            <ScrollArea.Autosize
              scrollbars="y"
              mah={520}
              type="auto"
              offsetScrollbars
              classNames={{ viewport: 'scrollarea-fluid-content' }}
            >
              {renderItems()}
            </ScrollArea.Autosize>
          )}
          {renderPreview()}
        </SimpleGrid>
      )}

      <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
        <Badge size="lg" variant="light" color="blue">
          {labelCount(countLabels(items))}
        </Badge>
        <Group gap="sm">
          {footerStart}
          <Button
            variant="default"
            disabled={!canPrint}
            loading={printMutation.isPending && printMutation.variables === 'download'}
            onClick={() => printMutation.mutate('download')}
          >
            {t('Download PDF')}
          </Button>
          <Button
            color="blue"
            leftSection={<IconPrinter size={16} />}
            disabled={!canPrint}
            loading={printMutation.isPending && printMutation.variables === 'print'}
            onClick={() => printMutation.mutate('print')}
            data-log-id="labels.print"
          >
            {isMobile ? t('Print') : `${t('Print')} (Enter)`}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
};
