import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { useDebouncedValue, useElementSize } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
  IconCopy,
  IconLayoutAlignBottom,
  IconLayoutAlignCenter,
  IconLayoutAlignLeft,
  IconLayoutAlignMiddle,
  IconLayoutAlignRight,
  IconLayoutAlignTop,
  IconPlus,
  IconStackBack,
  IconStackFront,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { queryKeys } from '@/api/queryKeys';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { getErrorMessage } from '@/shared/lib/error';
import { useAppSelector } from '@/store/hooks';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { previewLabel } from '../api/labelsApi';
import { useSaveLabelTemplate } from '../hooks/useLabelTemplates';
import {
  applyChange,
  canRedo,
  canUndo,
  redo,
  startHistory,
  undo,
  type DesignHistory,
} from '../lib/designHistory';
import {
  alignElement,
  designProblem,
  duplicateElement,
  elementTitle,
  fitElementsToLabel,
  moveLayer,
  newElement,
  nextElementId,
  placeBelow,
  type Alignment,
} from '../lib/labelGeometry';
import { buildLabelSample } from '../lib/labelSample';
import {
  LABEL_LIMITS,
  type LabelElement,
  type LabelElementType,
  type LabelTemplate,
  type LabelTemplateInput,
  type TextSource,
} from '../types';
import { LabelCanvas } from './LabelCanvas';
import { LabelElementEditor } from './LabelElementEditor';

/** Common label sizes, width x height in millimetres. */
const SIZE_PRESETS: ReadonlyArray<readonly [number, number]> = [
  [40, 30],
  [50, 30],
  [58, 40],
  [100, 50],
];

/** What the "Add" menu offers, in plain words. */
const ADDABLE: ReadonlyArray<{ label: string; type: LabelElementType; source: TextSource }> = [
  { label: 'Item name', type: 'text', source: 'productName' },
  { label: 'Price', type: 'text', source: 'price' },
  { label: 'Item code (SKU)', type: 'text', source: 'sku' },
  { label: 'Barcode number', type: 'text', source: 'code' },
  { label: 'Category', type: 'text', source: 'category' },
  { label: 'Shop name', type: 'text', source: 'shopName' },
  { label: 'Your own text', type: 'text', source: 'customText' },
  { label: 'Barcode', type: 'barcode', source: 'code' },
  { label: 'QR code', type: 'qr', source: 'code' },
  { label: 'Line', type: 'line', source: 'code' },
];

const MIN_SCALE = 2.5;
const MAX_SCALE = 16;
/** Zoom steps on top of "fit the label to the room". */
const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3] as const;

/** What undo/redo steps through: the label's size and its items. */
interface Layout {
  widthMm: number;
  heightMm: number;
  elements: LabelElement[];
}

const ALIGN_ACTIONS: ReadonlyArray<{ how: Alignment; label: string; icon: ReactNode }> = [
  { how: 'left', label: 'Line up on the left edge', icon: <IconLayoutAlignLeft size={16} /> },
  { how: 'center', label: 'Centre from side to side', icon: <IconLayoutAlignCenter size={16} /> },
  { how: 'right', label: 'Line up on the right edge', icon: <IconLayoutAlignRight size={16} /> },
  { how: 'top', label: 'Line up on the top edge', icon: <IconLayoutAlignTop size={16} /> },
  { how: 'middle', label: 'Centre from top to bottom', icon: <IconLayoutAlignMiddle size={16} /> },
  { how: 'bottom', label: 'Line up on the bottom edge', icon: <IconLayoutAlignBottom size={16} /> },
];

/** A small icon button with a tooltip; 44px on phones. */
const ToolButton = ({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled: boolean;
}) => {
  const isMobile = useIsMobile();
  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="default"
        size={isMobile ? 44 : 30}
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );
};

export type LabelDesignerMode = 'new' | 'edit' | 'copy';

export interface LabelDesignerModalProps {
  opened: boolean;
  onClose: () => void;
  mode: LabelDesignerMode;
  /** The design to edit or copy; `null` for a blank new design. */
  base: LabelTemplate | null;
  onSaved?: (template: LabelTemplate) => void;
}

const initialName = (mode: LabelDesignerMode, base: LabelTemplate | null): string => {
  if (base === null || mode === 'new') return '';
  return mode === 'copy' ? `${base.name} (${t('copy')})` : base.name;
};

/**
 * Build or change a label design: pick the label size, add items (text, barcode,
 * QR code, line), drag them into place and see the real result before saving.
 */
export const LabelDesignerModal = ({
  opened,
  onClose,
  mode,
  base,
  onSaved,
}: LabelDesignerModalProps) => {
  const isMobile = useIsMobile();
  const shopProfile = useAppSelector(selectShopProfile);
  const save = useSaveLabelTemplate();
  const { ref: stageRef, width: stageWidth } = useElementSize();
  const sample = buildLabelSample();

  const [name, setName] = useState(() => initialName(mode, base));
  const [history, setHistory] = useState<DesignHistory<Layout>>(() =>
    startHistory({
      widthMm: base?.widthMm ?? 50,
      heightMm: base?.heightMm ?? 30,
      elements: base?.elements ?? [],
    })
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'layout' | 'preview'>('layout');
  const [zoom, setZoom] = useState<(typeof ZOOM_STEPS)[number]>(1);

  const { widthMm, heightMm, elements } = history.present;
  const label = { widthMm, heightMm };
  const input: LabelTemplateInput = { name, widthMm, heightMm, elements };
  const problem = designProblem(input);
  const selected = elements.find((element) => element.id === selectedId) ?? null;
  const scale = Math.min(Math.max((stageWidth / widthMm) * zoom, MIN_SCALE), MAX_SCALE);
  const zoomIndex = ZOOM_STEPS.indexOf(zoom);

  /** Records a change to the layout; `tag` merges a burst of the same change into one undo step. */
  const change = (next: Partial<Layout>, tag: string) =>
    setHistory((current) => applyChange(current, { ...current.present, ...next }, tag, Date.now()));
  const setElements = (next: LabelElement[], tag: string) => change({ elements: next }, tag);
  const replaceElement = (next: LabelElement, tag: string) =>
    setElements(
      elements.map((element) => (element.id === next.id ? next : element)),
      `${tag}:${next.id}`
    );

  const duplicateSelected = () => {
    if (selected === null || elements.length >= LABEL_LIMITS.maxElements) return;
    const copy = duplicateElement(selected, elements, label);
    setElements([...elements, copy], `duplicate:${copy.id}`);
    setSelectedId(copy.id);
  };

  useAppShortcuts(
    [
      { key: 'Mod+Z', handler: () => setHistory(undo) },
      { key: ['Mod+Shift+Z', 'Mod+Y'], handler: () => setHistory(redo) },
      { key: 'Mod+D', handler: duplicateSelected },
    ],
    opened && !isMobile && view === 'layout'
  );

  // Draw the preview in the background once the design settles, so the Preview tab is
  // usually ready on click; on that tab itself edits apply immediately.
  const liveKey = problem === null ? JSON.stringify({ input, sample }) : null;
  const [settledKey] = useDebouncedValue(liveKey, 400);
  const previewKey = view === 'preview' ? liveKey : liveKey && settledKey;
  const previewRequest = previewKey
    ? (JSON.parse(previewKey) as { input: LabelTemplateInput; sample: typeof sample })
    : null;
  const preview = useQuery({
    queryKey: queryKeys.labels.preview(previewRequest),
    queryFn: () =>
      previewLabel(
        (previewRequest as NonNullable<typeof previewRequest>).input,
        (previewRequest as NonNullable<typeof previewRequest>).sample
      ),
    enabled: previewRequest !== null,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const setSize = (width: number, height: number) =>
    change(
      {
        widthMm: width,
        heightMm: height,
        elements: fitElementsToLabel(elements, { widthMm: width, heightMm: height }),
      },
      'size'
    );

  const add = (type: LabelElementType, source: TextSource) => {
    if (elements.length >= LABEL_LIMITS.maxElements) return;
    const created = newElement(type, nextElementId(elements), label, source);
    const element = placeBelow(created, elements, label);
    setElements([...elements, element], `add:${element.id}`);
    setSelectedId(element.id);
    setView('layout');
  };

  const remove = (id: string) => {
    setElements(
      elements.filter((element) => element.id !== id),
      `remove:${id}`
    );
    setSelectedId(null);
  };

  const handleSave = () => {
    if (problem !== null) return;
    save.mutate(
      {
        key: mode === 'edit' && base !== null ? base.key : null,
        input: { ...input, name: name.trim() },
      },
      {
        onSuccess: (saved) => {
          notifications.show({
            title: t('Label design saved'),
            message: saved.name,
            color: 'green',
            icon: <IconCheck size={16} />,
          });
          onSaved?.(saved);
          onClose();
        },
        onError: (error) => {
          notifications.show({
            title: t('Could not save the design'),
            message: getErrorMessage(error),
            color: 'red',
          });
        },
      }
    );
  };

  const title =
    mode === 'edit'
      ? t('Edit Label Design')
      : mode === 'copy'
        ? t('Copy Label Design')
        : t('New Label Design');

  const layoutView = (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ alignItems: 'start' }}>
      <Stack gap="sm" style={{ minWidth: 0 }}>
        <Group gap="xs">
          <Menu withinPortal position="bottom-start">
            <Menu.Target>
              <Button
                size={isMobile ? 'md' : 'xs'}
                leftSection={<IconPlus size={14} />}
                disabled={elements.length >= LABEL_LIMITS.maxElements}
              >
                {t('Add')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {ADDABLE.map((option) => (
                <Menu.Item
                  key={`${option.type}-${option.source}`}
                  onClick={() => add(option.type, option.source)}
                >
                  {t(option.label)}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <ToolButton
            label={isMobile ? t('Undo') : `${t('Undo')} (Ctrl+Z)`}
            icon={<IconArrowBackUp size={16} />}
            onClick={() => setHistory(undo)}
            disabled={!canUndo(history)}
          />
          <ToolButton
            label={isMobile ? t('Redo') : `${t('Redo')} (Ctrl+Y)`}
            icon={<IconArrowForwardUp size={16} />}
            onClick={() => setHistory(redo)}
            disabled={!canRedo(history)}
          />
          <Group gap={4} wrap="nowrap" ml="auto">
            <ToolButton
              label={t('Zoom out')}
              icon={<IconZoomOut size={16} />}
              onClick={() => setZoom(ZOOM_STEPS[zoomIndex - 1])}
              disabled={zoomIndex <= 0}
            />
            <Button
              variant="subtle"
              size={isMobile ? 'sm' : 'compact-xs'}
              aria-label={t('Fit the label to the window')}
              onClick={() => setZoom(1)}
              style={{ width: 56, flexShrink: 0 }}
            >
              {Math.round(zoom * 100)}%
            </Button>
            <ToolButton
              label={t('Zoom in')}
              icon={<IconZoomIn size={16} />}
              onClick={() => setZoom(ZOOM_STEPS[zoomIndex + 1])}
              disabled={zoomIndex >= ZOOM_STEPS.length - 1}
            />
          </Group>
        </Group>
        <Text size="xs" c="dimmed">
          {t('Drag items to move them. Drag the blue corner to resize.')}{' '}
          {t('Items snap to the middle of the label.')}
        </Text>
        <Paper
          withBorder
          p="md"
          style={{ background: 'var(--bg-app)', overflow: 'hidden', minHeight: 120 }}
        >
          {/* Measured here, inside the padding, so the sheet always fits the room it has. */}
          <Box
            ref={stageRef}
            style={{
              display: 'flex',
              // Zoomed in, the sheet is wider than the room: scroll from its left edge.
              justifyContent: zoom > 1 ? 'flex-start' : 'center',
              width: '100%',
              overflow: 'auto',
            }}
          >
            {stageWidth > 0 && (
              <LabelCanvas
                label={label}
                elements={elements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={setElements}
                onRemove={remove}
                sample={sample}
                shopName={shopProfile.tradingName}
                scale={scale}
              />
            )}
          </Box>
        </Paper>
        {elements.length === 0 && (
          <Text size="sm" c="dimmed" ta="center">
            {t('Your label is empty. Press Add to put something on it.')}
          </Text>
        )}
      </Stack>

      <Paper withBorder p="sm">
        {selected === null ? (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {t('Choose an item on the label to change it, or pick one from this list.')}
            </Text>
            <ScrollArea.Autosize
              scrollbars="y"
              mah={240}
              classNames={{ viewport: 'scrollarea-fluid-content' }}
            >
              <Stack gap={4}>
                {elements.map((element) => (
                  <Button
                    key={element.id}
                    variant="default"
                    size={isMobile ? 'md' : 'xs'}
                    justify="flex-start"
                    onClick={() => setSelectedId(element.id)}
                  >
                    {elementTitle(element)}
                  </Button>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Stack>
        ) : (
          <Stack gap="sm">
            <Group gap={6} wrap="wrap">
              {ALIGN_ACTIONS.map((action) => (
                <ToolButton
                  key={action.how}
                  label={t(action.label)}
                  icon={action.icon}
                  onClick={() => replaceElement(alignElement(selected, label, action.how), 'align')}
                  disabled={false}
                />
              ))}
              <ToolButton
                label={isMobile ? t('Make a copy') : `${t('Make a copy')} (Ctrl+D)`}
                icon={<IconCopy size={16} />}
                onClick={duplicateSelected}
                disabled={elements.length >= LABEL_LIMITS.maxElements}
              />
              <ToolButton
                label={t('Bring forward')}
                icon={<IconStackFront size={16} />}
                onClick={() => setElements(moveLayer(elements, selected.id, 'up'), 'layer')}
                disabled={elements[elements.length - 1]?.id === selected.id}
              />
              <ToolButton
                label={t('Send backward')}
                icon={<IconStackBack size={16} />}
                onClick={() => setElements(moveLayer(elements, selected.id, 'down'), 'layer')}
                disabled={elements[0]?.id === selected.id}
              />
            </Group>
            <LabelElementEditor
              element={selected}
              label={label}
              onChange={(next) => replaceElement(next, 'edit')}
              onRemove={() => remove(selected.id)}
            />
          </Stack>
        )}
      </Paper>
    </SimpleGrid>
  );

  const previewView = (
    <Stack gap="xs">
      {problem !== null ? (
        <Alert color="orange" variant="light">
          {problem}
        </Alert>
      ) : (
        <Box h={isMobile ? 360 : 420}>
          <PdfCanvasViewer
            blob={preview.data ?? null}
            loading={preview.isFetching}
            error={preview.isError}
            documentLabel={t('Label')}
            initialAutoFit
          />
        </Box>
      )}
      {preview.isError && (
        <Text size="sm" c="red">
          {getErrorMessage(preview.error)}
        </Text>
      )}
      <Text size="xs" c="dimmed">
        {t('This is a sample. Your real labels use each item’s own details.')}
      </Text>
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {title}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            label={t('Design name')}
            placeholder={t('For example: Shelf label')}
            maxLength={LABEL_LIMITS.maxNameChars}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <Box>
            <Text size="sm" fw={500} mb={4}>
              {t('Label size')}
            </Text>
            <Group gap="xs" wrap="nowrap" align="flex-end">
              <NumberInput
                aria-label={t('Width')}
                suffix=" mm"
                min={LABEL_LIMITS.minWidthMm}
                max={LABEL_LIMITS.maxWidthMm}
                allowDecimal={false}
                value={widthMm}
                onChange={(value) => typeof value === 'number' && setSize(value, heightMm)}
              />
              <Text c="dimmed">×</Text>
              <NumberInput
                aria-label={t('Height')}
                suffix=" mm"
                min={LABEL_LIMITS.minHeightMm}
                max={LABEL_LIMITS.maxHeightMm}
                allowDecimal={false}
                value={heightMm}
                onChange={(value) => typeof value === 'number' && setSize(widthMm, value)}
              />
            </Group>
          </Box>
        </SimpleGrid>
        <Group gap="xs">
          {SIZE_PRESETS.map(([width, height]) => (
            <Button
              key={`${width}x${height}`}
              size={isMobile ? 'sm' : 'compact-xs'}
              variant={widthMm === width && heightMm === height ? 'filled' : 'default'}
              onClick={() => setSize(width, height)}
            >
              {width} × {height}
            </Button>
          ))}
        </Group>

        <SegmentedToggle
          fullWidth
          value={view}
          onChange={(value) => setView(value === 'preview' ? 'preview' : 'layout')}
          data={[
            { label: t('Layout'), value: 'layout' },
            { label: t('Preview'), value: 'preview' },
          ]}
        />
        {view === 'layout' ? layoutView : previewView}

        {problem !== null && view === 'layout' && elements.length > 0 && (
          <Text size="xs" c="red">
            {problem}
          </Text>
        )}

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={onClose} disabled={save.isPending}>
            {t('Cancel')}
          </Button>
          <Button
            color="blue"
            onClick={handleSave}
            loading={save.isPending}
            disabled={problem !== null}
          >
            {mode === 'edit' ? t('Save Changes') : t('Save Design')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
