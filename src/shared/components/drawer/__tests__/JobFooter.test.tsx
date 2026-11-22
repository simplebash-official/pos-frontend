/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconPrinter, IconReceipt, IconArrowRight } from '@tabler/icons-react';
import { installDrawerTestEnv } from '../testEnv';
import { TestHarness } from '../TestHarness';
import { FooterMain, JobFooter, type FooterAction } from '../JobFooter';

installDrawerTestEnv();

const action = (id: string, label: string, onClick: () => void): FooterAction => ({
  id,
  label,
  onClick,
});

describe('JobFooter', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onPrint = vi.fn();
  const onEdit = vi.fn();
  const onBill = vi.fn();
  const onMain = vi.fn();
  const realMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.matchMedia = realMatchMedia;
  });

  const show = async (node: ReactNode) => {
    await act(async () => {
      root.render(<TestHarness role="admin">{node}</TestHarness>);
    });
  };
  const buttons = () => Array.from(container.ownerDocument.body.querySelectorAll('button'));
  const labels = () => buttons().map((b) => b.textContent);
  const find = (label: string) => buttons().find((b) => b.textContent === label);

  const phone = () => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  };

  const footer = (props: { bill?: boolean; main?: ReactNode } = {}) => (
    <JobFooter
      tools={[
        {
          id: 'print',
          label: 'Print receipt',
          icon: <IconPrinter size={16} />,
          onClick: onPrint,
        },
        action('edit', 'Edit', onEdit),
      ]}
      bill={
        props.bill === false
          ? null
          : { id: 'bill', label: 'Bill', icon: <IconReceipt size={16} />, onClick: onBill }
      }
      main={
        props.main === undefined ? (
          <FooterMain
            label="Mark ready for pickup"
            icon={<IconArrowRight size={16} />}
            color="teal"
            onClick={onMain}
            logId="repairs.next-status"
          />
        ) : (
          props.main
        )
      }
    />
  );

  it('puts the outlined tools first, then Bill and the main action', async () => {
    await show(footer());
    expect(labels()).toEqual(['Print receipt', 'Edit', 'Bill', 'Mark ready for pickup']);
    expect(find('Mark ready for pickup')?.getAttribute('data-variant')).toBe('filled');
    expect(find('Bill')?.getAttribute('data-variant')).toBe('default');
    expect(find('Close')).toBeUndefined();
    expect(find('Print receipt')?.getAttribute('data-variant')).toBe('default');
    expect(find('Edit')?.getAttribute('data-variant')).toBe('default');
    expect(find('Edit')?.querySelector('svg')).toBeNull();
    expect(find('Mark ready for pickup')?.getAttribute('data-log-id')).toBe('repairs.next-status');
  });

  it('runs each action', async () => {
    await show(footer());
    for (const label of ['Print receipt', 'Edit', 'Bill', 'Mark ready for pickup']) {
      await act(async () => find(label)?.click());
    }
    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onBill).toHaveBeenCalledTimes(1);
    expect(onMain).toHaveBeenCalledTimes(1);
  });

  it('leaves out Bill and the main action when there are none', async () => {
    await show(footer({ bill: false, main: null }));
    expect(labels()).toEqual(['Print receipt', 'Edit']);
  });

  it('disables the main action when it is blocked', async () => {
    await show(
      footer({
        main: (
          <FooterMain
            label="Mark ready for pickup"
            icon={<IconArrowRight size={16} />}
            color="teal"
            blockedMessage="Add the work first."
            onClick={onMain}
          />
        ),
      })
    );
    const main = find('Mark ready for pickup');
    expect(main?.disabled).toBe(true);
    await act(async () => main?.click());
    expect(onMain).not.toHaveBeenCalled();
  });

  it('on a phone shows the main action on top, then equal cells, and no Close', async () => {
    phone();
    await show(footer());
    expect(labels()).toEqual(['Mark ready for pickup', 'Print receipt', 'Edit', 'Bill']);
    const grid = document.body.querySelector<HTMLElement>('.job-footer-grid');
    expect(grid?.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect(find('Close')).toBeUndefined();
    await act(async () => find('Bill')?.click());
    expect(onBill).toHaveBeenCalledTimes(1);
  });

  it('on a phone sizes the grid to the cells it has, and drops it when there are none', async () => {
    phone();
    await show(footer({ bill: false }));
    expect(
      document.body.querySelector<HTMLElement>('.job-footer-grid')?.style.gridTemplateColumns
    ).toBe('repeat(2, minmax(0, 1fr))');

    await show(<JobFooter tools={[]} bill={null} main={null} />);
    expect(document.body.querySelector('.job-footer-grid')).toBeNull();
  });
});
