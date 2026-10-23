import { SimpleGrid, Tooltip } from '@mantine/core';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { SPRING, useMotionPresets } from '@/shared/motion';
import type { CashMovementType } from '../../../types';
import { ChoiceCard, ChoiceGroup } from './ChoiceCard';
import {
  MOVEMENT_GROUPS,
  MOVEMENT_TYPES_IN_ORDER,
  getGroupIcon,
  getGroupLabel,
  getGroupOf,
  getTypeHint,
  getTypeIcon,
  getTypeLabel,
  type MovementGroupId,
} from './movementTypes';

export interface MovementTypePickerProps {
  value: CashMovementType;
  onChange: (type: CashMovementType) => void;
  /** Whether this person may record the kind of payment; the rest are shown but locked. */
  canUse: (type: CashMovementType) => boolean;
}

/**
 * Picks what happened in two parts that look different on purpose: a tab strip for the direction
 * (money out, money in, move cash, other) and, under it, one card per kind with a picture, its
 * name and what it is for. A group with one kind shows that one card. On a computer the number
 * keys 1 to 8 pick a kind too (the cards say so in their tooltip).
 */
export const MovementGroupTabs = ({ value, onChange, canUse }: MovementTypePickerProps) => {
  const isMobile = useIsMobile();
  const { reduced } = useMotionPresets();
  const group = getGroupOf(value);

  const pickGroup = (id: MovementGroupId) => {
    const types = MOVEMENT_GROUPS.find((g) => g.id === id)!.types;
    const first = types.find(canUse);
    if (first) onChange(first);
  };

  return (
    <ChoiceGroup
      label={t('Kind of cash movement')}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 4,
        padding: 4,
        background: 'var(--bg-active)',
        borderRadius: 'var(--mantine-radius-default)',
      }}
    >
      {MOVEMENT_GROUPS.map((g) => {
        const selected = g.id === group;
        const allowed = g.types.some(canUse);
        return (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!allowed}
            onClick={() => pickGroup(g.id)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: isMobile ? 44 : 36,
              padding: '0 2px',
              border: 0,
              background: 'transparent',
              color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: selected ? 600 : 500,
              fontSize: isMobile ? 'var(--mantine-font-size-xs)' : 'var(--mantine-font-size-sm)',
              whiteSpace: 'nowrap',
              cursor: allowed ? 'pointer' : 'not-allowed',
              opacity: allowed ? 1 : 0.55,
            }}
          >
            {selected && (
              <motion.span
                layoutId="cash-group-pill"
                transition={reduced ? { duration: 0 } : SPRING}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--bg-card)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  borderRadius: 'calc(var(--mantine-radius-default) - 2px)',
                }}
              />
            )}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
              {!isMobile && getGroupIcon(g.id)}
              {getGroupLabel(g.id)}
            </span>
          </button>
        );
      })}
    </ChoiceGroup>
  );
};

/** The cards of the chosen group's kinds. */
export const MovementKindCards = ({ value, onChange, canUse }: MovementTypePickerProps) => {
  const isMobile = useIsMobile();
  const typesInGroup = MOVEMENT_GROUPS.find((g) => g.id === getGroupOf(value))!.types;
  return (
    <ChoiceGroup label={t('Which one?')}>
      <SimpleGrid
        cols={{ base: 1, sm: typesInGroup.length === 1 ? 1 : 2 }}
        spacing="xs"
        data-testid="type-chips"
      >
        {typesInGroup.map((type) => {
          const allowed = canUse(type);
          const card = (
            <ChoiceCard
              key={type}
              label={getTypeLabel(type)}
              // On a phone only the chosen card explains itself, so the amount stays near the top.
              hint={isMobile && type !== value ? undefined : getTypeHint(type)}
              icon={getTypeIcon(type)}
              selected={type === value}
              allowed={allowed}
              tall={isMobile}
              onSelect={() => onChange(type)}
            />
          );
          if (!allowed) {
            return (
              <Tooltip key={type} label={t('A manager can record this.')}>
                <span style={{ display: 'flex' }}>{card}</span>
              </Tooltip>
            );
          }
          return isMobile ? (
            card
          ) : (
            <Tooltip
              key={type}
              label={`${t('Press')} ${MOVEMENT_TYPES_IN_ORDER.indexOf(type) + 1}`}
              openDelay={600}
            >
              <span style={{ display: 'flex' }}>{card}</span>
            </Tooltip>
          );
        })}
      </SimpleGrid>
    </ChoiceGroup>
  );
};
