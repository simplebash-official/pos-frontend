import { describe, expect, it } from 'vitest';
import {
  IconCashRegister,
  IconClockDollar,
  IconFileDollar,
  IconMessage2Dollar,
} from '@tabler/icons-react';
import { ROUTES } from '@/constants';
import { NAV_CATEGORIES } from '../navigation';

const items = NAV_CATEGORIES.flatMap((category) => category.items);
const iconOf = (to: string) => {
  const item = items.find((candidate) => candidate.to === to);
  if (item === undefined) throw new Error(`no sidebar item for ${to}`);
  return item.icon;
};

const allIcons = items.map((item) => item.icon);

describe('sidebar icons', () => {
  it('gives the till, the money page and the price quote their own pictures', () => {
    expect(iconOf(ROUTES.BILLING)).toBe(IconCashRegister);
    expect(iconOf(ROUTES.INVOICES)).toBe(IconFileDollar);
    expect(iconOf(ROUTES.QUOTATIONS)).toBe(IconMessage2Dollar);
    expect(iconOf(ROUTES.SHIFTS)).toBe(IconClockDollar);
  });

  it('never shows two sidebar items with the same icon', () => {
    expect(new Set(allIcons).size).toBe(allIcons.length);
  });
});
