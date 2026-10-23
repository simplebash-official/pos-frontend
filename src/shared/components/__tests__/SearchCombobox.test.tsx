/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { compactText } from '@/shared/lib/compactText';
import {
  SearchCombobox,
  type SearchComboboxCreate,
  type SearchComboboxItem,
} from '../SearchCombobox';

const ITEMS: SearchComboboxItem[] = [
  { value: 'tea', label: 'Tea and refreshments' },
  { value: 'fuel', label: 'Fuel', searchText: 'ඉන්ධන' },
  { value: 'sup', label: 'ABC Traders', description: '0771234567', meta: 'Rs. 45,000 due' },
];

const Harness = ({
  create,
  noCreateHint,
  onValue,
  onTypedCommit,
}: {
  create?: SearchComboboxCreate;
  noCreateHint?: string;
  onValue?: (v: string | null) => void;
  onTypedCommit?: (typed: string) => void;
}) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <MantineProvider env="test">
      <LayoutTierProvider>
        <SearchCombobox
          label="Category"
          items={ITEMS}
          emptyText="Nothing found."
          value={value}
          onChange={(v) => {
            setValue(v);
            onValue?.(v);
          }}
          create={create}
          onTypedCommit={onTypedCommit}
          noCreateHint={noCreateHint}
        />
      </LayoutTierProvider>
    </MantineProvider>
  );
};

describe('SearchCombobox', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    window.matchMedia ??= ((q: string) => ({
      matches: false,
      media: q,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    window.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    // jsdom has no layout, so it lacks the scrolling Mantine does when it highlights an option.
    Element.prototype.scrollIntoView ??= () => undefined;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const input = () => document.querySelector('input') as HTMLInputElement;
  const optionTexts = () =>
    [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent ?? '');
  const type = (text: string) => {
    const el = input();
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      el.focus();
      setter.call(el, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const press = (key: string) =>
    act(() => {
      input().dispatchEvent(
        new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true })
      );
    });

  it('normalizes case and spacing for search', () => {
    expect(compactText('  Tea  And ')).toBe('teaand');
  });

  it('lists everything on focus and filters ignoring case and spacing', () => {
    act(() => root.render(<Harness />));
    act(() => input().focus());
    expect(optionTexts()).toHaveLength(3);

    type('TEA and');
    expect(optionTexts()).toEqual(['Tea and refreshments']);
  });

  it('matches the extra search text such as the Sinhala name', () => {
    act(() => root.render(<Harness />));
    type('ඉන්ධන');
    expect(optionTexts()).toEqual(['Fuel']);
  });

  it('shows the second line and the right-hand note of a row', () => {
    act(() => root.render(<Harness />));
    act(() => input().focus());
    const row = [...document.querySelectorAll('[role="option"]')].find((o) =>
      o.textContent?.includes('ABC Traders')
    );
    expect(row?.textContent).toContain('0771234567');
    expect(row?.textContent).toContain('Rs. 45,000 due');
  });

  it('selects the first match with Enter and shows its name', () => {
    const onValue = vi.fn();
    act(() => root.render(<Harness onValue={onValue} />));
    type('fuel');
    press('Enter');
    expect(onValue).toHaveBeenCalledWith('fuel');
    expect(input().value).toBe('Fuel');
  });

  it('pins a create footer that names the typed text', () => {
    const onCreate = vi.fn();
    act(() =>
      root.render(
        <Harness
          create={{
            labelFor: (typed) => `+ Create "${typed}"`,
            emptyLabel: '+ Create new category',
            onCreate,
          }}
        />
      )
    );
    act(() => input().focus());
    expect(document.querySelector('[data-testid="combobox-create"]')?.textContent).toContain(
      '+ Create new category'
    );

    type('Generator diesel');
    const footer = document.querySelector('[data-testid="combobox-create"]') as HTMLElement;
    expect(footer.textContent).toContain('+ Create "Generator diesel"');
    act(() => footer.click());
    expect(onCreate).toHaveBeenCalledWith('Generator diesel');
  });

  it('creates on Enter only when nothing matches', () => {
    const onCreate = vi.fn();
    act(() =>
      root.render(<Harness create={{ labelFor: (x) => x, emptyLabel: 'new', onCreate }} />)
    );
    type('fuel');
    press('Enter');
    expect(onCreate).not.toHaveBeenCalled();

    type('Generator diesel');
    press('Enter');
    expect(onCreate).toHaveBeenCalledWith('Generator diesel');
  });

  it('keeps a typed name when the list closes without a choice, but not after a choice', () => {
    const onTypedCommit = vi.fn();
    act(() => root.render(<Harness onTypedCommit={onTypedCommit} />));
    type('Corner shop');
    act(() => input().blur());
    expect(onTypedCommit).toHaveBeenCalledWith('Corner shop');

    onTypedCommit.mockClear();
    type('fuel');
    press('Enter');
    act(() => input().blur());
    expect(onTypedCommit).not.toHaveBeenCalled();
  });

  it('shows a hint instead of the footer to someone who may not add entries', () => {
    act(() => root.render(<Harness noCreateHint="Ask a manager to add a new one." />));
    act(() => input().focus());
    expect(document.querySelector('[data-testid="combobox-create"]')).toBeNull();
    expect(document.body.textContent).toContain('Ask a manager to add a new one.');
  });
});
