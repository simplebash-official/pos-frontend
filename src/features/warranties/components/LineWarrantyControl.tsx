import { useState } from 'react';
import { Badge, Box, Button, Group, Popover, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { coverageLabel, endsOnIfStartedToday, profileProblem } from '../lib/warrantyView';
import type { ProductWarranty, WarrantyType } from '../types';
import { CoverageEditor } from './CoverageEditor';

export interface LineWarrantyBadgeProps {
  /** The product's own warranty. */
  warranty: ProductWarranty;
  /** The cashier's different warranty for this line, if any. */
  override?: ProductWarranty;
}

export interface LineWarrantyControlProps {
  /** The product's own warranty. */
  warranty: ProductWarranty;
  /** The cashier's different warranty for this line, if any. */
  override: ProductWarranty | undefined;
  /** People without the permission only see the tag. */
  canAdjust: boolean;
  onOverride: (warranty: ProductWarranty | null) => void;
  /** Optional custom trigger, e.g. ActionIcon in the cart action rail. */
  children?: React.ReactNode;
}

const TYPES: { value: WarrantyType; label: string }[] = [
  { value: 'shop', label: 'Shop' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'both', label: 'Both' },
];

const warrantyBadgeText = (effective: ProductWarranty, endsOn: string | null): string => {
  if (effective.coverage.kind === 'none') {
    return t('No warranty');
  }
  const typeLabel =
    effective.warrantyType === 'manufacturer'
      ? t('Maker')
      : effective.warrantyType === 'both'
        ? t('Both')
        : t('Shop');

  if (effective.coverage.kind === 'lifetime') {
    return `${t('Lifetime')} · ${typeLabel}`;
  }
  if (endsOn !== null) {
    return `${coverageLabel(effective.coverage)} · ${t('ends')} ${formatDate(endsOn)}`;
  }
  return `${coverageLabel(effective.coverage)} · ${typeLabel}`;
};

/**
 * Informative, non-clickable status badge showing the warranty for this sale line.
 */
export const LineWarrantyBadge = ({ warranty, override }: LineWarrantyBadgeProps) => {
  const effective = override ?? warranty;
  const covered = effective.coverage.kind !== 'none';
  const endsOn = endsOnIfStartedToday(effective.coverage);

  return (
    <Badge
      size="xs"
      variant={override === undefined ? 'light' : 'filled'}
      color={covered ? 'teal' : 'gray'}
      leftSection={covered ? <IconShieldCheck size={11} /> : <IconShieldOff size={11} />}
      style={{
        textTransform: 'none',
        flexShrink: 0,
        fontWeight: 600,
      }}
      title={endsOn === null ? t('Warranty') : `${t('Warranty until')} ${formatDate(endsOn)}`}
    >
      {warrantyBadgeText(effective, endsOn)}
    </Badge>
  );
};

/**
 * The warranty tag on a cart line ("12 months · ends 5 Nov 2027"). For a manager or owner it opens
 * a small editor to give this sale a different warranty; the change is sent with the sale and the
 * product keeps its own warranty.
 */
export const LineWarrantyControl = ({
  warranty,
  override,
  canAdjust,
  onOverride,
  children,
}: LineWarrantyControlProps) => {
  const [opened, setOpened] = useState(false);
  const [tried, setTried] = useState(false);
  const effective = override ?? warranty;
  const initialType: WarrantyType = effective.warrantyType ?? warranty.warrantyType ?? 'shop';
  const [draft, setDraft] = useState<ProductWarranty>({
    ...effective,
    warrantyType: effective.coverage.kind === 'none' ? undefined : initialType,
  });

  const problem = profileProblem(draft);

  if (!canAdjust) {
    return children !== undefined ? null : (
      <LineWarrantyBadge warranty={warranty} override={override} />
    );
  }

  const handleOpen = () => {
    const currentEffective = override ?? warranty;
    const defaultType: WarrantyType =
      currentEffective.warrantyType ?? warranty.warrantyType ?? 'shop';
    setDraft({
      ...currentEffective,
      warrantyType: currentEffective.coverage.kind === 'none' ? undefined : defaultType,
    });
    setTried(false);
    setOpened((open) => !open);
  };

  const handleApply = () => {
    setTried(true);
    if (problem !== null) return;
    onOverride({
      coverage: draft.coverage,
      warrantyType: draft.coverage.kind === 'none' ? undefined : (draft.warrantyType ?? 'shop'),
      terms: draft.coverage.kind === 'none' ? undefined : warranty.terms,
    });
    setOpened(false);
  };

  return (
    <Popover
      opened={opened}
      onChange={(nextOpened) => {
        if (nextOpened) {
          handleOpen();
        } else {
          setOpened(false);
        }
      }}
      position={children !== undefined ? 'bottom-end' : 'bottom-start'}
      withArrow
      shadow="md"
      trapFocus
    >
      <Popover.Target>
        {children !== undefined ? (
          <Box
            component="span"
            onClick={handleOpen}
            style={{ display: 'inline-flex', height: '100%' }}
          >
            {children}
          </Box>
        ) : (
          <UnstyledButton
            onClick={handleOpen}
            aria-label={t('Change the warranty for this sale')}
            style={{ display: 'inline-flex', flexShrink: 0 }}
          >
            <LineWarrantyBadge warranty={warranty} override={override} />
          </UnstyledButton>
        )}
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
                      warrantyType: draft.warrantyType ?? warranty.warrantyType ?? 'shop',
                    }
              )
            }
          />
          {draft.coverage.kind !== 'none' && (
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">
                {t('Who gives the warranty?')}
              </Text>
              <SegmentedToggle
                fullWidth
                size="xs"
                value={draft.warrantyType ?? 'shop'}
                onChange={(type) => setDraft({ ...draft, warrantyType: type as WarrantyType })}
                data={TYPES.map((type) => ({ value: type.value, label: t(type.label) }))}
                aria-label={t('Who gives this warranty?')}
              />
            </Stack>
          )}
          {tried && problem !== null && (
            <Text size="xs" c="red" role="alert">
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
            <Button size="xs" onClick={handleApply}>
              {t('Apply')}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
