/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { quickDates } from '@/shared/lib/jobDueDate';
import { PromisedDatePicker } from '../PromisedDatePicker';

const store = configureStore({ reducer: { settings: () => ({ appLanguage: 'en' }) } });

describe('PromisedDatePicker', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onChange = vi.fn();
  const onNested = vi.fn();

  const Host = ({ start }: { start: string | null }) => {
    const [value, setValue] = useState(start);
    return (
      <PromisedDatePicker
        label="Promised ready by"
        onNestedWindowChange={onNested}
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  };

  const render = (start: string | null) =>
    act(() => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LayoutTierProvider>
              <Host start={start} />
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      );
    });

  const click = (element: Element | null) =>
    act(() => {
      element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

  beforeEach(() => {
    onChange.mockClear();
    onNested.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows the placeholder when no date was promised', () => {
    render(null);
    expect(container.textContent).toContain('Pick a date (optional)');
    expect(container.querySelector('[aria-label="Clear"]')).toBeNull();
  });

  it('sets the day when a quick choice is tapped, and marks it chosen', () => {
    render(null);
    const [, tomorrow] = quickDates();
    click(container.querySelector(`input[value="${tomorrow.value}"]`));
    expect(onChange).toHaveBeenCalledWith(tomorrow.value);
    expect(container.textContent).toContain('Tomorrow');
    expect(
      container.querySelector<HTMLInputElement>(`input[value="${tomorrow.value}"]`)?.checked
    ).toBe(true);
  });

  it('clears the date', () => {
    const [today] = quickDates();
    render(today.value);
    click(container.querySelector('[aria-label="Clear"]'));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(container.textContent).toContain('Pick a date (optional)');
  });

  it('flags a date that has already passed', () => {
    render('2020-01-05');
    expect(container.textContent).toMatch(/days late/);
    expect(container.textContent).toContain('Sun, 05 Jan 2020');
  });

  it('opens the calendar and sets a chosen day', async () => {
    render(null);
    click(container.querySelector('button[aria-label="Promised ready by"]'));
    await vi.waitFor(() =>
      expect(document.body.querySelector('.mantine-DatePicker-day')).not.toBeNull()
    );
    const days = document.body.querySelectorAll<HTMLButtonElement>(
      '.mantine-DatePicker-day:not([data-disabled])'
    );
    expect(onNested).toHaveBeenLastCalledWith(true);
    click(days[days.length - 1]);
    expect(onNested).toHaveBeenLastCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('keeps the calendar one height in every month', async () => {
    render('2027-02-10');
    click(container.querySelector('button[aria-label^="Promised ready by"]'));
    await vi.waitFor(() =>
      expect(document.body.querySelector('.mantine-DatePicker-day')).not.toBeNull()
    );
    // February 2027 only needs four weeks, but all six are drawn.
    expect(document.body.querySelectorAll('.mantine-DatePicker-day')).toHaveLength(42);
  });
});
