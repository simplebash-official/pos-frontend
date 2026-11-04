import { Stack, Textarea } from '@mantine/core';
import { CoverageEditor, type ProductWarranty, type WarrantyType } from '@/features/warranties';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { t } from '@/shared/i18n/t';

const TYPES: { value: WarrantyType; label: string }[] = [
  { value: 'shop', label: 'Shop' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'both', label: 'Both' },
];

export interface WorkWarrantyFieldsProps {
  value: ProductWarranty;
  onChange: (warranty: ProductWarranty) => void;
}

/** How long a piece of repair work is covered, who gives the cover, and what it covers. */
export const WorkWarrantyFields = ({ value, onChange }: WorkWarrantyFieldsProps) => (
  <Stack gap="sm">
    <CoverageEditor
      value={value.coverage}
      allowNone
      onChange={(coverage) =>
        onChange(coverage.kind === 'none' ? { coverage } : { ...value, coverage })
      }
    />
    {value.coverage.kind !== 'none' && (
      <>
        <SegmentedToggle
          fullWidth
          size="xs"
          value={value.warrantyType ?? ''}
          onChange={(type) => onChange({ ...value, warrantyType: type as WarrantyType })}
          data={TYPES.map((type) => ({ value: type.value, label: t(type.label) }))}
          aria-label={t('Who gives this warranty?')}
        />
        <Textarea
          label={t('What it covers (optional)')}
          placeholder={t('e.g. Covers the screen fitted; not new cracks or water damage')}
          autosize
          minRows={2}
          maxLength={1000}
          value={value.terms ?? ''}
          onChange={(event) => {
            const terms = event.currentTarget.value;
            onChange({ ...value, terms: terms.trim() === '' ? undefined : terms });
          }}
        />
      </>
    )}
  </Stack>
);
