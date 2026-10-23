import type { ReactNode } from 'react';
import { IconActivity, IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import type { CashDirection, CashMovementType } from '../../../types';

export type MovementGroupId = 'out' | 'in' | 'transfer' | 'other';

/** The groups in the order the picker shows them, each with its movement types. */
export const MOVEMENT_GROUPS: ReadonlyArray<{ id: MovementGroupId; types: CashMovementType[] }> = [
  {
    id: 'out',
    types: [
      'petty_expense',
      'rent_and_bills',
      'staff_payment',
      'supplier_payment',
      'owner_withdrawal',
    ],
  },
  { id: 'in', types: ['add_cash'] },
  { id: 'transfer', types: ['cash_drop'] },
  { id: 'other', types: ['no_sale'] },
];

/** Every type in picker order, so number keys 1 to 8 map onto it. */
export const MOVEMENT_TYPES_IN_ORDER: CashMovementType[] = MOVEMENT_GROUPS.flatMap((g) => g.types);

/**
 * The kinds of payment a cashier may add a category for, mirroring the server's rule
 * (`cash_categories::service::CASHIER_TYPES`). The server decides; this only decides
 * whether to offer the "create" footer or an "ask a manager" hint.
 */
export const CASHIER_CATEGORY_TYPES: ReadonlySet<CashMovementType> = new Set([
  'petty_expense',
  'add_cash',
  'cash_drop',
  'no_sale',
]);

/** Types that need `cash_movements:create:managed` on top of the basic permission. */
export const MANAGED_TYPES: ReadonlySet<CashMovementType> = new Set([
  'rent_and_bills',
  'staff_payment',
  'supplier_payment',
]);

/** Types that always need a manager or owner PIN, whatever the amount. */
export const ALWAYS_PIN_TYPES: ReadonlySet<CashMovementType> = new Set([
  'owner_withdrawal',
  'staff_payment',
]);

export const getGroupLabel = (id: MovementGroupId): string => {
  switch (id) {
    case 'out':
      return t('Money out');
    case 'in':
      return t('Money in');
    case 'transfer':
      return t('Move cash');
    case 'other':
      return t('Other');
  }
};

export const getGroupOf = (type: CashMovementType): MovementGroupId =>
  MOVEMENT_GROUPS.find((g) => g.types.includes(type))!.id;

export const getTypeLabel = (type: CashMovementType): string => {
  switch (type) {
    case 'petty_expense':
      return t('Small expense');
    case 'rent_and_bills':
      return t('Rent and bills');
    case 'staff_payment':
      return t('Staff payment');
    case 'supplier_payment':
      return t('Supplier payment');
    case 'owner_withdrawal':
      return t('Owner withdrawal');
    case 'add_cash':
      return t('Add cash to drawer');
    case 'cash_drop':
      return t('Cash drop');
    case 'no_sale':
      return t('Open drawer, no sale');
  }
};

/** One line saying what the type is for, shown under the picker. */
export const getTypeHint = (type: CashMovementType): string => {
  switch (type) {
    case 'petty_expense':
      return t('Small daily spends such as tea, fuel or stationery.');
    case 'rent_and_bills':
      return t('Shop rent, electricity, water, licences and other regular bills.');
    case 'staff_payment':
      return t('Salary, advances, bonus and other pay for a staff member.');
    case 'supplier_payment':
      return t('Cash paid to a supplier for stock or an old balance.');
    case 'owner_withdrawal':
      return t('Cash the owner takes out of the shop for personal use.');
    case 'add_cash':
      return t(
        'Cash put into the drawer, such as change, the owner’s money, a bank withdrawal or money you received that is not a sale.'
      );
    case 'cash_drop':
      return t('Extra cash moved from the drawer to the safe or the bank.');
    case 'no_sale':
      return t('Opens the drawer without a sale. It is written in the shift record.');
  }
};

/** The label of the category field, which reads differently for each kind of payment. */
export const getCategoryLabel = (type: CashMovementType): string => {
  switch (type) {
    case 'no_sale':
      return t('Why are you opening the drawer?');
    case 'cash_drop':
      return t('Where is it going?');
    case 'add_cash':
      return t('Where is the cash from?');
    default:
      return t('What is it for?');
  }
};

/** Badge colour and icon for a movement in lists: by direction, not by type. */
export const getDirectionLook = (
  direction: CashDirection
): { color: string; icon: ReactNode; label: string } => {
  switch (direction) {
    case 'in':
      return { color: 'green', icon: <IconArrowDownRight size={14} />, label: t('Money in') };
    case 'out':
      return { color: 'orange', icon: <IconArrowUpRight size={14} />, label: t('Money out') };
    case 'neutral':
      return { color: 'gray', icon: <IconActivity size={14} />, label: t('Not counted') };
  }
};
