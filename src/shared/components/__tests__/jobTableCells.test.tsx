/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { JOB_STATUS } from '@/constants';
import { toDateValue } from '@/shared/lib/jobDueDate';
import { AmountCell, StatusCell, TechnicianCell } from '../jobTableCells';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

const render = (node: ReactNode): string => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root!.render(<MantineProvider>{node}</MantineProvider>));
  // Mantine adds a <style> tag; read only the rendered text.
  const copy = host.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('style').forEach((el) => el.remove());
  return (copy.textContent ?? '').trim();
};

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateValue(d);
};

describe('StatusCell', () => {
  it('says Overdue under a past date while the job is open', () => {
    expect(
      render(
        <StatusCell promisedReadyAt={yesterday()} status={JOB_STATUS.IN_REPAIR} label="In Repair" />
      )
    ).toContain('Overdue');
  });

  it('shows only the date once the job is delivered', () => {
    expect(
      render(
        <StatusCell promisedReadyAt={yesterday()} status={JOB_STATUS.DELIVERED} label="Delivered" />
      )
    ).not.toContain('Overdue');
  });

  it('tags a job that is billed but still in the shop', () => {
    expect(
      render(
        <StatusCell
          status={JOB_STATUS.READY}
          label="Ready for Pickup"
          billedInvoiceNumber="INV-000034"
        />
      )
    ).toContain('Billed');
  });

  it('has no Billed tag on an unbilled job, nor on one already handed back', () => {
    expect(render(<StatusCell status={JOB_STATUS.READY} label="Ready for Pickup" />)).not.toContain(
      'Billed'
    );
    expect(
      render(
        <StatusCell
          status={JOB_STATUS.DELIVERED}
          label="Delivered"
          billedInvoiceNumber="INV-000034"
        />
      )
    ).not.toContain('Billed');
  });

  it('shows only the status when no date was promised', () => {
    expect(render(<StatusCell status={JOB_STATUS.RECEIVED} label="Received" />)).toContain(
      'No due date'
    );
  });

  it('says the words it is given, so a print job reads In Production', () => {
    const shown = render(<StatusCell status={JOB_STATUS.IN_REPAIR} label="In Production" />);
    expect(shown).toContain('In Production');
    expect(shown).not.toContain('In Repair');
  });
});

describe('AmountCell', () => {
  it('shows a note in place of the amount', () => {
    expect(render(<AmountCell note="Pending diagnosis" />)).toContain('Pending diagnosis');
  });

  it('formats cents as money', () => {
    expect(render(<AmountCell cents={504800} />)).toContain('5,048.00');
  });
});

describe('TechnicianCell', () => {
  it('says Unassigned without a name', () => {
    expect(render(<TechnicianCell />)).toBe('Unassigned');
  });

  it('shows the name and earnings', () => {
    const text = render(<TechnicianCell name="Asha Perera" earnedCents={50000} />);
    expect(text).toContain('Asha Perera');
    expect(text).toContain('500.00');
  });
});
