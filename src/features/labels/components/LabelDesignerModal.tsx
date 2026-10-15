import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { useElementSize } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import {
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { queryKeys } from '@/api/queryKeys';
import { PdfCanvasViewer } from '@/shared/components/PdfCanvasViewer';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { useAppSelector } from '@/store/hooks';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { previewLabel } from '../api/labelsApi';
import { useSaveLabelTemplate } from '../hooks/useLabelTemplates';
import {
  designProblem,
  elementTitle,
  fitElementsToLabel,
  newElement,
  nextElementId,
  placeBelow,
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
const MAX_SCALE = 10;

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
  const [widthMm, setWidthMm] = useState(() => base?.widthMm ?? 50);
  const [heightMm, setHeightMm] = useState(() => base?.heightMm ?? 30);
  const [elements, setElements] = useState<LabelElement[]>(() => base?.elements ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'layout' | 'preview'>('layout');

  const label = { widthMm, heightMm };
  const input: LabelTemplateInput = { name, widthMm, heightMm, elements };
  const problem = designProblem(input);
  const selected = elements.find((element) => element.id === selectedId) ?? null;
  const scale = Math.min(Math.max(stageWidth / widthMm, MIN_SCALE), MAX_SCALE);

  const previewRequest = view === 'preview' && problem === null ? { input, sample } : null;
  const preview = useQuery({
    queryKey: queryKeys.labels.preview(previewRequest),
    queryFn: () =>
      previewLabel(
        (previewRequest as NonNullable<typeof previewRequest>).input,
        (previewRequest as NonNullable<typeof previewRequest>).sample
      ),
    enabled: previewRequest !== null,
    staleTime: 0,
    retry: false,
  });

  const setSize = (width: number, height: number) => {
    setWidthMm(width);
    setHeightMm(height);
    setElements((current) => fitElementsToLabel(current, { widthMm: width, heightMm: height }));
  };

  const add = (type: LabelElementType, source: TextSource) => {
    if (elements.length >= LABEL_LIMITS.maxElements) return;
    const created = newElement(type, nextElementId(elements), label, source);
    const element = placeBelow(created, elements, label);
    setElements([...elements, element]);
    setSelectedId(element.id);
    setView('layout');
  };

  const remove = (id: string) => {
    setElements((current) => current.filter((element) => element.id !== id));
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
          <Text size="xs" c="dimmed">
            {t('Drag items to move them. Drag the blue corner to resize.')}
          </Text>
        </Group>
        <Paper
          withBorder
          p="md"
          style={{ background: 'var(--bg-app)', overflow: 'hidden', minHeight: 120 }}
        >
          {/* Measured here, inside the padding, so the sheet always fits the room it has. */}
          <Box ref={stageRef} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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
          <LabelElementEditor
            element={selected}
            label={label}
            onChange={(next) =>
              setElements((current) =>
                current.map((element) => (element.id === next.id ? next : element))
              )
            }
            onRemove={() => remove(selected.id)}
          />
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
