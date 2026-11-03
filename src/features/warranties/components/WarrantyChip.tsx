import { Badge, Tooltip } from '@mantine/core';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { coverageLabel } from '../lib/warrantyView';
import type { WarrantyCoverage } from '../types';

export interface WarrantyChipProps {
  coverage: WarrantyCoverage;
  /** Extra line for the tooltip, for example the end date. */
  hint?: string;
}

/** A small tag saying how long an item is covered: "12 months", "Lifetime", "No warranty". */
export const WarrantyChip = ({ coverage, hint }: WarrantyChipProps) => {
  const covered = coverage.kind !== 'none';
  const chip = (
    <Badge
      size="xs"
      variant="light"
      color={covered ? 'teal' : 'gray'}
      leftSection={covered ? <IconShieldCheck size={11} /> : <IconShieldOff size={11} />}
      style={{ textTransform: 'none', flexShrink: 0 }}
    >
      {coverageLabel(coverage)}
    </Badge>
  );
  return (
    <Tooltip label={hint === undefined ? t('Warranty') : `${t('Warranty')} · ${hint}`} withArrow>
      {chip}
    </Tooltip>
  );
};
