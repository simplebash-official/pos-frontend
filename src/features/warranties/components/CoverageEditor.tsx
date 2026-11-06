import { Group, NumberInput, Select, Stack } from '@mantine/core';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import type { WarrantyCoverage, WarrantyUnit } from '../types';

type CoverageKind = WarrantyCoverage['kind'];

export interface CoverageEditorProps {
  value: WarrantyCoverage;
  onChange: (coverage: WarrantyCoverage) => void;
  /** Offer "No warranty" (product and till); an extension always has some period. */
  allowNone: boolean;
  disabled?: boolean;
}

const UNITS: { value: WarrantyUnit; label: string }[] = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

/**
 * Choose how long something is covered: no warranty, a period (a whole number of days, weeks,
 * months or years) or lifetime. A period starts as "12 months" only when the person picks it,
 * so nothing is chosen for them.
 */
export const CoverageEditor = ({ value, onChange, allowNone, disabled }: CoverageEditorProps) => {
  const isMobile = useIsMobile();
  const kinds: { value: CoverageKind; label: string }[] = [
    ...(allowNone ? [{ value: 'none' as const, label: t('No warranty') }] : []),
    { value: 'limited', label: t('Set a period') },
    { value: 'lifetime', label: t('Lifetime') },
  ];

  const pickKind = (kind: CoverageKind) => {
    if (kind === value.kind) return;
    if (kind === 'limited') onChange({ kind: 'limited', value: 12, unit: 'months' });
    else onChange({ kind });
  };

  return (
    <Stack gap="xs">
      <SegmentedToggle
        fullWidth
        size={isMobile ? 'md' : 'sm'}
        value={value.kind}
        onChange={(kind) => pickKind(kind as CoverageKind)}
        data={kinds}
        disabled={disabled}
        aria-label={t('How long is it covered?')}
      />
      {value.kind === 'limited' && (
        <Group gap="sm" grow wrap="nowrap" align="flex-start">
          <NumberInput
            label={t('How long')}
            min={1}
            allowDecimal={false}
            allowNegative={false}
            value={value.value}
            onChange={(next) => onChange({ ...value, value: typeof next === 'number' ? next : 0 })}
            disabled={disabled}
            size={isMobile ? 'md' : 'sm'}
          />
          <Select
            label={t('Counted in')}
            data={UNITS.map((unit) => ({ value: unit.value, label: t(unit.label) }))}
            value={value.unit}
            onChange={(unit) => {
              if (unit !== null) onChange({ ...value, unit: unit as WarrantyUnit });
            }}
            allowDeselect={false}
            disabled={disabled}
            size={isMobile ? 'md' : 'sm'}
            comboboxProps={{ withinPortal: false }}
          />
        </Group>
      )}
    </Stack>
  );
};
