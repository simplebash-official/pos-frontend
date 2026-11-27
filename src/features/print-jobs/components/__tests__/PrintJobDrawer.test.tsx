/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useLocation } from 'react-router-dom';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { PrintJobFormHost } from '../../testing/PrintJobFormHost';
import type { PrintJob, PrintJobInput } from '../../types';

installDrawerTestEnv();

// jsdom has no font loading API; Mantine's growing text box listens to it.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { addEventListener: () => undefined, removeEventListener: () => undefined },
  });
}

// The assignment block has its own tests; this file is about the order, its items and the note.
vi.mock('@/features/employees/components/AssigneeSection', () => ({
  AssigneeSection: () => null,
}));

// The real picker has its own tests; here it just hands back one customer.
vi.mock('@/features/customers/components/CustomerPickerModal', () => ({
  CustomerPickerModal: ({
    opened,
    onSelectCustomer,
  }: {
    opened: boolean;
    onSelectCustomer: (customer: unknown) => void;
  }) =>
    opened ? (
      <button
        type="button"
        onClick={() =>
          onSelectCustomer({ key: 'cust_1', name: 'Sunil Silva', primaryPhone: '0777654321' })
        }
      >
        pick Sunil
      </button>
    ) : null,
}));

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useAllProducts: () => ({ data: [], isLoading: false }),
}));
vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
  useCategoryIcons: () => null,
  useCategoryLookup: () => ({ getCategory: () => undefined, getCategoryName: () => '' }),
}));
vi.mock('../../hooks/usePrintServices', () => ({
  usePrintServices: () => ({
    data: [
      {
        key: 'pst_1',
        name: 'Design fee',
        unitPriceCents: 50_000,
        warranty: { coverage: { kind: 'none' }, warrantyType: 'shop' },
        active: true,
      },
    ],
    isLoading: false,
  }),
}));
vi.mock('@/shared/hooks/useJobEarnings', () => ({
  useJobEarnings: () => ({ data: undefined }),
  toSplit: () => ({ splitType: null, splitValue: 0 }),
}));
vi.mock('@/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

const makeJob = (overrides: Partial<PrintJob> = {}): PrintJob => ({
  id: 'prn_1',
  ticketNumber: 'PRN-000001',
  customerKey: 'cus_dhanushka',
  customerName: 'Dhanushka Fernando',
  customerPhone: '0712345678',
  jobType: 'mug',
  quantity: 1,
  status: 'received',
  kind: { kind: 'standard' },
  items: [],
  priceCents: 0,
  costCents: 0,
  createdAt: '2026-08-20T10:00:00.000Z',
  ...overrides,
});

/** Shows where the form sent the browser. */
const Address = () => {
  const location = useLocation();
  return <output data-testid="address">{`${location.pathname}${location.search}`}</output>;
};

describe('the print job panel form', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
    vi.clearAllMocks();
  });

  const renderModal = (
    props: {
      opened?: boolean;
      onClose?: () => void;
      onSubmit?: (val: PrintJobInput) => Promise<void>;
      jobToEdit?: PrintJob | null;
    } = {}
  ) => {
    const defaultProps = {
      opened: true,
      onClose: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue(undefined),
      jobToEdit: null,
      ...props,
    };

    act(() => {
      root!.render(
        <TestHarness role="admin">
          <PrintJobFormHost {...defaultProps} />
          <Address />
        </TestHarness>
      );
    });

    return defaultProps;
  };

  const buttons = () => [...document.querySelectorAll('button')];
  const fee = () => buttons().find((b) => b.textContent?.includes('Design fee'));
  const button = (label: string) => buttons().find((b) => b.textContent?.trim() === label);
  const typeNote = async (value: string) => {
    const note = document.querySelector<HTMLTextAreaElement>('textarea');
    expect(note).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(note, value);
      note?.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const submitForm = async () => {
    await act(async () => {
      document
        .querySelector('form')
        ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  };

  it('leaves at once when nothing was typed, and asks first when something was', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await act(async () => button('Cancel')?.click());
    expect(onClose).toHaveBeenCalledTimes(1);

    renderModal({ onClose });
    await typeNote('Two boxes');
    await act(async () => button('Cancel')?.click());
    await vi.waitFor(() => expect(document.body.textContent).toContain('Discard unsaved changes?'));
    expect(onClose).toHaveBeenCalledTimes(1);
    await act(async () => button('Discard')?.click());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('asks for a registered customer to be chosen, with no name or phone to type', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit });

    expect(document.body.textContent).toContain('No customer chosen');
    expect(document.body.textContent).toContain('Customer *');
    expect(document.querySelector('input[placeholder="e.g. 0712345678"]')).toBeNull();

    await submitForm();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Choose the customer for this print order.');

    await act(async () => button('Choose customer')?.click());
    await act(async () => button('pick Sunil')?.click());
    expect(document.body.textContent).toContain('Sunil Silva');
    expect(document.body.textContent).toContain('0777654321');
    expect(document.body.textContent).toContain('Change customer');
  });

  it('offers only the print job steps, with in production in place of in repair', async () => {
    renderModal({ onSubmit: vi.fn(), jobToEdit: makeJob({ status: 'in_repair' }) });

    const status = document.querySelector<HTMLInputElement>('input[value="In Production"]');
    expect(status).not.toBeNull();
    // jsdom has no layout, so the dropdown's scroll-to-selected call needs a stand-in.
    const scrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = () => undefined;
    await act(async () => status?.click());
    const options = Array.from(document.body.querySelectorAll('[role="option"]')).map(
      (option) => option.textContent
    );
    Element.prototype.scrollIntoView = scrollIntoView;
    // The job type's options are mounted too; the steps are the last five.
    expect(options.slice(-5)).toEqual([
      'Received',
      'In Production',
      'Ready for Pickup',
      'Delivered',
      'Cancelled',
    ]);
    expect(options).not.toContain('Diagnosing');
    expect(options).not.toContain('In Repair');
  });

  it('sends only the key of the customer when a job is saved, keeping its items and note', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit, jobToEdit: makeJob({ note: 'Saved note' }) });
    expect(document.body.textContent).toContain('Dhanushka Fernando');

    await act(async () => button('Change customer')?.click());
    await act(async () => button('pick Sunil')?.click());
    await submitForm();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const sent = onSubmit.mock.calls[0][0] as PrintJobInput;
    expect(sent.customer).toEqual({ customerKey: 'cust_1' });
    expect(sent.items).toBeUndefined();
    expect(sent.note).toBeUndefined();
  });

  it('sends the items and the note once they are changed', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit, jobToEdit: makeJob() });

    await act(async () => fee()?.click());
    await typeNote('  Deliver in two boxes  ');
    await submitForm();

    const sent = onSubmit.mock.calls[0][0] as PrintJobInput;
    expect(sent.items).toMatchObject([
      {
        description: 'Design fee',
        quantity: 1,
        source: { type: 'service', unitPriceCents: 50_000 },
      },
    ]);
    expect(sent.note).toBe('Deliver in two boxes');
  });

  it('saves the optional cost of a service line, and leaves it out when empty', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit, jobToEdit: makeJob() });
    await act(async () => fee()?.click());
    const box = () =>
      document.querySelector<HTMLInputElement>(
        'input[aria-label="Cost to shop, each: Design fee"]'
      );
    expect(box()?.placeholder).toBe('Optional');
    expect(document.body.textContent).not.toContain('Profit Rs.');
    // Both boxes are named on screen, in one row: the cost and then the price.
    const labels = Array.from(document.querySelectorAll('label'), (label) => label.textContent);
    expect(labels).toEqual(expect.arrayContaining(['Cost to shop, each', 'Price for one']));
    const price = document.querySelector('input[aria-label="Price for one: Design fee"]')!;
    expect(box()!.compareDocumentPosition(price)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(box(), '200');
      box()?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(document.body.textContent).toContain('Profit Rs. 300.00');
    await submitForm();
    expect((onSubmit.mock.calls[0][0] as PrintJobInput).items).toMatchObject([
      { source: { type: 'service', unitPriceCents: 50_000, unitCostCents: 20_000 } },
    ]);
  });

  it('refuses a note that is too long, and says the limit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit, jobToEdit: makeJob() });

    await typeNote('a'.repeat(1001));
    await submitForm();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('A note can be at most 1000 characters.');
    expect(document.body.textContent).toContain('1001 / 1000');
  });

  it('will not mark a job with no items ready', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit, jobToEdit: makeJob({ status: 'ready' }) });

    await submitForm();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain(
      'Add the items before marking this job ready or delivered.'
    );
  });

  it('saves first, then opens the bill for the job', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderModal({ onSubmit, jobToEdit: makeJob() });
    // Nothing to bill until it has an item.
    expect(button('Update & bill')).toBeUndefined();

    await act(async () => fee()?.click());
    await act(async () => button('Update & bill')?.click());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-testid="address"]')?.textContent).toBe(
      '/billing?billPrint=prn_1'
    );
  });

  it('stays on the form when the save before billing fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Not enough stock'));
    renderModal({ onSubmit, jobToEdit: makeJob() });

    await act(async () => fee()?.click());
    await act(async () => button('Update & bill')?.click());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-testid="address"]')?.textContent).not.toContain(
      'billPrint'
    );
  });
});
