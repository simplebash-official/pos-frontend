import { useState } from 'react';
import { Button, Checkbox, Group, Paper, Stack } from '@mantine/core';
import { IconClipboardCheck } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import type { Warranty } from '../types';
import { BatchClaimModal } from './BatchClaimModal';

export interface BatchClaimBarProps {
  /** Every warranty of the invoice that can be claimed now, in the order they are listed. */
  claimable: Warranty[];
  /** The keys of the ticked warranties, all of them claimable. */
  selected: ReadonlySet<string>;
  /** The person ticked or cleared warranties: the whole new selection. */
  onSelectionChange: (next: Set<string>) => void;
  /** These warranties now have a claim, so they are no longer offered. */
  onOpened: (warrantyKeys: string[]) => void;
  /** Told when the claim window opens or closes, so a drawer around it ignores Escape. */
  onNestedWindowChange: (open: boolean) => void;
}

/**
 * The toolbar above an invoice's items for claiming several warranties at once: one checkbox to
 * tick all or none, how many are ticked, and the button that starts one claim for each. It owns
 * the window that opens, so a screen only keeps the ticked keys and draws a checkbox on each
 * claimable warranty.
 */
export const BatchClaimBar = ({
  claimable,
  selected,
  onSelectionChange,
  onOpened,
  onNestedWindowChange,
}: BatchClaimBarProps) => {
  const isMobile = useIsMobile();
  const [batch, setBatch] = useState<Warranty[] | null>(null);

  const ticked = claimable.filter((w) => selected.has(w.key));
  const count = ticked.length;
  const all = claimable.length > 0 && count === claimable.length;

  const show = (next: Warranty[] | null) => {
    setBatch(next);
    onNestedWindowChange(next !== null);
  };

  const checkbox = (
    <Checkbox
      size={isMobile ? 'md' : 'sm'}
      label={count > 0 ? `${count} ${t('selected')}` : t('Select all')}
      description={count === 0 ? t('Tick the items the customer is bringing back') : undefined}
      checked={all}
      indeterminate={count > 0 && !all}
      onChange={() => onSelectionChange(all ? new Set() : new Set(claimable.map((w) => w.key)))}
      styles={{
        root: { minHeight: isMobile ? 44 : undefined },
        body: { alignItems: 'center' },
        label: { fontWeight: 600 },
      }}
    />
  );
  const clear = count > 0 && (
    <Button
      variant="subtle"
      color="gray"
      size={isMobile ? 'md' : 'xs'}
      h={isMobile ? 44 : undefined}
      onClick={() => onSelectionChange(new Set())}
    >
      {t('Clear')}
    </Button>
  );
  const claim = (
    <Button
      size={isMobile ? 'md' : 'sm'}
      h={isMobile ? 44 : undefined}
      fullWidth={isMobile}
      leftSection={<IconClipboardCheck size={16} />}
      disabled={count === 0}
      onClick={() => show(ticked)}
      data-log-id="warranties.claim-selected"
    >
      {`${t('Claim selected')} (${count})`}
    </Button>
  );

  return (
    <>
      <Paper withBorder px="sm" py="xs" bg="var(--bg-card)">
        {isMobile ? (
          <Stack gap="xs">
            <Group justify="space-between" align="center" wrap="nowrap">
              {checkbox}
              {clear}
            </Group>
            {claim}
          </Stack>
        ) : (
          <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
            {checkbox}
            <Group gap="xs" wrap="nowrap">
              {clear}
              {claim}
            </Group>
          </Group>
        )}
      </Paper>
      {batch !== null && (
        <BatchClaimModal warranties={batch} onClose={() => show(null)} onOpened={onOpened} />
      )}
    </>
  );
};
