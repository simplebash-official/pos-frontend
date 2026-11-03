import { useState } from 'react';
import { Badge, Button, Group, Popover, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { coverageLabel, endsOnIfStartedToday, profileProblem } from '../lib/warrantyView';
import type { ProductWarranty, WarrantyType } from '../types';
import { CoverageEditor } from './CoverageEditor';

export interface LineWarrantyControlProps {
  /** The product's own warranty. */
  warranty: ProductWarranty;
  /** The cashier's different warranty for this line, if any. */
  override: ProductWarranty | undefined;
  /** People without the permission only see the tag. */
  canAdjust: boolean;
  onOverride: (warranty: ProductWarranty | null) => void;
}

const TYPES: { value: WarrantyType; label: string }[] = [
  { value: 'shop', label: 'Shop' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'both', label: 'Both' },
];

/**
 * The warranty tag on a cart line ("12 months"). For a manager or owner it opens a small editor
 * to give this sale a different warranty; the change is sent with the sale and the product keeps
 * its own warranty.
 */
export const LineWarrantyControl = ({
  warranty,
  override,
  canAdjust,
  onOverride,
}: LineWarrantyControlProps) => {
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState<ProductWarranty>(override ?? warranty);
  const effective = override ?? warranty;
  const covered = effective.coverage.kind !== 'none';
  const endsOn = endsOnIfStartedToday(effective.coverage);
  const problem = profileProblem(draft);

  const tag = (
    <Badge
      size="xs"
      variant={override === undefined ? 'light' : 'filled'}
      color={covered ? 'teal' : 'gray'}
      leftSection={covered ? <IconShieldCheck size={11} /> : <IconShieldOff size={11} />}
      style={{ textTransform: 'none', flexShrink: 0, cursor: canAdjust ? 'pointer' : 'default' }}
      title={endsOn === null ? t('Warranty') : `${t('Warranty until')} ${formatDate(endsOn)}`}
    >
      {coverageLabel(effective.coverage)}
    </Badge>
  );

  if (!canAdjust) return tag;

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withArrow
      shadow="md"
      trapFocus
    >
      <Popover.Target>
        <UnstyledButton
          onClick={() => {
            setDraft(override ?? warranty);
            setOpened((open) => !open);
          }}
          aria-label={t('Change the warranty for this sale')}
          style={{ display: 'inline-flex', flexShrink: 0 }}
        >
          {tag}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown style={{ width: 'min(320px, calc(100vw - 32px))' }}>
        <Stack gap="sm">
          <Text size="sm" fw={700}>
            {t('Warranty for this sale')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('The product keeps its own warranty; this only changes this line.')}
          </Text>
          <CoverageEditor
            value={draft.coverage}
            allowNone
            onChange={(coverage) =>
              setDraft(
                coverage.kind === 'none'
                  ? { coverage }
                  : {
                      ...draft,
                      coverage,
                      warrantyType: draft.warrantyType ?? warranty.warrantyType,
                    }
              )
            }
          />
          {draft.coverage.kind !== 'none' && (
            <SegmentedToggle
              fullWidth
              size="xs"
              value={draft.warrantyType ?? ''}
              onChange={(type) => setDraft({ ...draft, warrantyType: type as WarrantyType })}
              data={TYPES.map((type) => ({ value: type.value, label: t(type.label) }))}
              aria-label={t('Who gives this warranty?')}
            />
          )}
          {problem !== null && (
            <Text size="xs" c="red">
              {problem}
            </Text>
          )}
          <Group justify="space-between" gap="xs">
            <Button
              variant="subtle"
              size="xs"
              disabled={override === undefined}
              onClick={() => {
                onOverride(null);
                setOpened(false);
              }}
            >
              {t("Use the product's warranty")}
            </Button>
            <Button
              size="xs"
              disabled={problem !== null}
              onClick={() => {
                onOverride({
                  coverage: draft.coverage,
                  warrantyType: draft.coverage.kind === 'none' ? undefined : draft.warrantyType,
                  terms: draft.coverage.kind === 'none' ? undefined : warranty.terms,
                });
                setOpened(false);
              }}
            >
              {t('Apply')}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
