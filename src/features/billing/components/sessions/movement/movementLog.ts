// Pure filtering of a shift's movement list for the shift screen: by kind and by words typed. No React.
import type { CashMovement, CashMovementType } from '../../../types';
import { compactText } from '@/shared/lib/compactText';

export type KindFilter = 'all' | CashMovementType;

export interface MovementLogFilter {
  kind: KindFilter;
  /** What the person typed; matched against the voucher number, category, payee, note and who recorded it. */
  search: string;
}

/** The kinds that appear in `movements`, in the order they are first seen, for the kind dropdown. */
export const kindsPresent = (movements: CashMovement[]): CashMovementType[] => {
  const seen: CashMovementType[] = [];
  for (const m of movements) if (!seen.includes(m.movementType)) seen.push(m.movementType);
  return seen;
};

export const filterMovements = (
  movements: CashMovement[],
  filter: MovementLogFilter
): CashMovement[] => {
  const query = compactText(filter.search);
  return movements.filter((m) => {
    if (filter.kind !== 'all' && m.movementType !== filter.kind) return false;
    if (query === '') return true;
    return [
      m.movementNumber,
      m.categoryName,
      m.customLabel,
      m.payeeName,
      m.note,
      m.recordedByNameSnapshot,
    ].some((text) => text !== undefined && compactText(text).includes(query));
  });
};
