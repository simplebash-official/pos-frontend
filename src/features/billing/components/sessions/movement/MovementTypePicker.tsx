import { Button, Group, Kbd, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import type { CashMovementType } from '../../../types';
import {
  MOVEMENT_GROUPS,
  MOVEMENT_TYPES_IN_ORDER,
  getGroupLabel,
  getGroupOf,
  getTypeHint,
  getTypeLabel,
  type MovementGroupId,
} from './movementTypes';

export interface MovementTypePickerProps {
  value: CashMovementType;
  onChange: (type: CashMovementType) => void;
  /** Whether this person may record the kind of payment; the rest are shown but greyed out. */
  canUse: (type: CashMovementType) => boolean;
}

/**
 * Two taps pick any kind of drawer event: the group first (money out, money in, move cash,
 * other), then the type inside it. Groups with one type pick it directly. On a computer the
 * number keys 1 to 8 pick a type too.
 */
export const MovementTypePicker = ({ value, onChange, canUse }: MovementTypePickerProps) => {
  const isMobile = useIsMobile();
  const group = getGroupOf(value);
  const typesInGroup = MOVEMENT_GROUPS.find((g) => g.id === group)!.types;

  const pickGroup = (id: MovementGroupId) => {
    const types = MOVEMENT_GROUPS.find((g) => g.id === id)!.types;
    const first = types.find(canUse);
    if (first) onChange(first);
  };

  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('What are you recording?')}
      </Text>
      {isMobile ? (
        // Four labels do not fit one row on a phone, so the groups become a two by two grid.
        <SimpleGrid cols={2} spacing="xs" aria-label={t('Kind of cash movement')}>
          {MOVEMENT_GROUPS.map((g) => (
            <Button
              key={g.id}
              variant={g.id === group ? 'filled' : 'default'}
              h={44}
              disabled={!g.types.some(canUse)}
              onClick={() => pickGroup(g.id)}
              aria-pressed={g.id === group}
            >
              {getGroupLabel(g.id)}
            </Button>
          ))}
        </SimpleGrid>
      ) : (
        <SegmentedToggle
          fullWidth
          value={group}
          onChange={(id) => pickGroup(id as MovementGroupId)}
          data={MOVEMENT_GROUPS.map((g) => ({
            value: g.id,
            label: getGroupLabel(g.id),
            disabled: !g.types.some(canUse),
          }))}
          size="sm"
          aria-label={t('Kind of cash movement')}
        />
      )}

      {typesInGroup.length > 1 && (
        <Group gap="xs" data-testid="type-chips">
          {typesInGroup.map((type) => {
            const allowed = canUse(type);
            const button = (
              <Button
                key={type}
                size="sm"
                variant={type === value ? 'filled' : 'default'}
                h={isMobile ? 44 : undefined}
                disabled={!allowed}
                onClick={() => onChange(type)}
                aria-pressed={type === value}
                rightSection={
                  <Kbd size="xs" visibleFrom="sm">
                    {MOVEMENT_TYPES_IN_ORDER.indexOf(type) + 1}
                  </Kbd>
                }
              >
                {getTypeLabel(type)}
              </Button>
            );
            return allowed ? (
              button
            ) : (
              <Tooltip key={type} label={t('A manager can record this.')}>
                <span>{button}</span>
              </Tooltip>
            );
          })}
        </Group>
      )}

      <Text size="xs" c="dimmed">
        {getTypeHint(value)}
      </Text>
    </Stack>
  );
};
