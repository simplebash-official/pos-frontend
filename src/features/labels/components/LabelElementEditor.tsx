import { t } from '@/shared/i18n/t';
import {
  Button,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { clampElement, elementTitle, textSourceTitle, type LabelSize } from '../lib/labelGeometry';
import {
  LABEL_LIMITS,
  type LabelElement,
  type TextAlign,
  type TextElement,
  type TextSource,
} from '../types';

const TEXT_SOURCES: TextSource[] = [
  'productName',
  'price',
  'sku',
  'code',
  'category',
  'shopName',
  'customText',
];

export interface LabelElementEditorProps {
  element: LabelElement;
  label: LabelSize;
  onChange: (element: LabelElement) => void;
  onRemove: () => void;
}

/** Position, size and look of the selected item, for exact numbers instead of dragging. */
export const LabelElementEditor = ({
  element,
  label,
  onChange,
  onRemove,
}: LabelElementEditorProps) => {
  const isMobile = useIsMobile();
  const size = isMobile ? 'md' : 'xs';

  const setFrame = (field: 'xMm' | 'yMm' | 'widthMm' | 'heightMm', value: string | number) => {
    if (typeof value !== 'number') return;
    onChange(clampElement({ ...element, [field]: value }, label));
  };

  const setText = (patch: Partial<TextElement>) => {
    if (element.type === 'text') onChange({ ...element, ...patch });
  };

  const frameInput = (field: 'xMm' | 'yMm' | 'widthMm' | 'heightMm', text: string) => (
    <NumberInput
      size={size}
      label={text}
      suffix=" mm"
      min={0}
      step={0.5}
      decimalScale={1}
      value={element[field]}
      onChange={(value) => setFrame(field, value)}
    />
  );

  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="nowrap">
        <Text fw={700} size="sm">
          {elementTitle(element)}
        </Text>
        <Button
          size={isMobile ? 'sm' : 'compact-sm'}
          color="red"
          variant="light"
          leftSection={<IconTrash size={14} />}
          onClick={onRemove}
        >
          {t('Remove')}
        </Button>
      </Group>

      <SimpleGrid cols={2} spacing="xs">
        {frameInput('xMm', t('From the left'))}
        {frameInput('yMm', t('From the top'))}
        {frameInput('widthMm', t('Width'))}
        {frameInput('heightMm', t('Height'))}
      </SimpleGrid>

      {element.type === 'text' && (
        <>
          <Select
            size={size}
            label={t('What it shows')}
            data={TEXT_SOURCES.map((source) => ({ value: source, label: textSourceTitle(source) }))}
            value={element.source}
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
            onChange={(value) => {
              const source = TEXT_SOURCES.find((candidate) => candidate === value);
              if (source === undefined) return;
              setText({
                source,
                customText: source === 'customText' ? (element.customText ?? t('Your text')) : null,
              });
            }}
          />
          {element.source === 'customText' && (
            <TextInput
              size={size}
              label={t('Your text')}
              maxLength={LABEL_LIMITS.maxCustomTextChars}
              value={element.customText ?? ''}
              onChange={(event) => setText({ customText: event.currentTarget.value })}
            />
          )}
        </>
      )}

      {(element.type === 'text' || element.type === 'barcode') && (
        <NumberInput
          size={size}
          label={t('Text size')}
          suffix=" pt"
          min={LABEL_LIMITS.minFontPt}
          max={LABEL_LIMITS.maxFontPt}
          step={0.5}
          decimalScale={1}
          value={element.fontSizePt}
          onChange={(value) => {
            if (typeof value !== 'number') return;
            onChange({ ...element, fontSizePt: value });
          }}
        />
      )}

      {element.type === 'text' && (
        <>
          <Switch
            label={t('Bold')}
            checked={element.bold}
            onChange={(event) => setText({ bold: event.currentTarget.checked })}
          />
          <SegmentedToggle
            fullWidth
            value={element.align}
            onChange={(value) => {
              const align: TextAlign =
                value === 'center' ? 'center' : value === 'right' ? 'right' : 'left';
              setText({ align });
            }}
            data={[
              { label: t('Left'), value: 'left' },
              { label: t('Centre'), value: 'center' },
              { label: t('Right'), value: 'right' },
            ]}
          />
        </>
      )}

      {element.type === 'barcode' && (
        <Switch
          label={t('Show the number under the barcode')}
          checked={element.showValue}
          onChange={(event) => onChange({ ...element, showValue: event.currentTarget.checked })}
        />
      )}
    </Stack>
  );
};
