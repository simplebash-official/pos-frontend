/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { UrgentActionCenter } from '../UrgentActionCenter';
import type { UrgentActionItem } from '../../types';

const item = (over: Partial<UrgentActionItem> & Pick<UrgentActionItem, 'id' | 'type' | 'title'>) =>
  ({
    subtitle: 'detail',
    severity: 'warning',
    timestamp: 'now',
    referenceId: 'REF',
    actionLabel: 'Open',
    ...over,
  }) satisfies UrgentActionItem;

const ITEMS: UrgentActionItem[] = [
  item({ id: 'c1', type: 'credit_overdue', title: 'Payment overdue: Kamal' }),
  item({ id: 'w1', type: 'warranty_claim_late', title: 'Supplier is late: Galaxy A55' }),
  item({
    id: 'w2',
    type: 'warranties_ending',
    title: '3 warranties end this week',
    severity: 'info',
  }),
];

describe('warranty rows in the urgent action center', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('lists them and keeps only them under the Warranties filter', async () => {
    await act(async () => {
      root.render(
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter>
              <UrgentActionCenter items={ITEMS} />
            </MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      );
    });
    expect(document.body.textContent).toContain('Payment overdue: Kamal');
    expect(document.body.textContent).toContain('Supplier is late: Galaxy A55');

    const filter = [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(
      (input) => input.value === 'warranties'
    );
    expect(filter).toBeDefined();
    await act(async () => filter?.click());

    expect(document.body.textContent).not.toContain('Payment overdue: Kamal');
    expect(document.body.textContent).toContain('Supplier is late: Galaxy A55');
    expect(document.body.textContent).toContain('3 warranties end this week');
  });
});
