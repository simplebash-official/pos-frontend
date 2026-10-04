import { describe, it, expect } from 'vitest';
import {
  activityView,
  chipText,
  groupPending,
  heroView,
  moduleOf,
  moduleRows,
  pendingLabel,
  secondsUntil,
} from '../lib/syncView';
import { normalizePending } from '../lib/statusView';
import { phraseText } from '../lib/phrase';
import { DISABLED_SYNC_STATUS, type PendingRecord, type SyncStatus } from '../types';

const linked = (over: Partial<SyncStatus> = {}): SyncStatus => ({
  ...DISABLED_SYNC_STATUS,
  linked: true,
  ...over,
});

const record = (over: Partial<PendingRecord> = {}): PendingRecord => ({
  resource: 'invoices',
  key: 'k1',
  op: 'upsert',
  enqueuedAt: '2026-10-04T09:00:00Z',
  label: 'INV-2026-0042',
  ...over,
});

describe('heroView', () => {
  it('says everything is saved when nothing is waiting', () => {
    expect(heroView(linked())).toMatchObject({ tone: 'teal', icon: 'ok', action: null });
  });

  it('counts waiting changes with the right plural', () => {
    expect(phraseText(heroView(linked({ pendingOut: 1 })).detail, (s) => s)).toBe(
      '1 change will upload in a moment.'
    );
    expect(phraseText(heroView(linked({ pendingOut: 14 })).detail, (s) => s)).toBe(
      '14 changes will upload in a moment.'
    );
  });

  it('shows what is being sent, with progress, while syncing', () => {
    const view = heroView(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 8, total: 12 } })
    );
    expect(view).toMatchObject({ tone: 'blue', icon: 'working', progress: { done: 8, total: 12 } });
    expect(view.detail.join(' ')).toMatch(/Sending/);
  });

  it('names how many changes are on their way while uploading', () => {
    const view = heroView(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 0, total: 183 } })
    );
    expect(phraseText(view.detail, (x) => x)).toBe('Sending 183 changes to the cloud…');
    const one = heroView(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 0, total: 1 } })
    );
    expect(phraseText(one.detail, (x) => x)).toBe('Sending 1 change to the cloud…');
  });

  it('tells an offline shop that selling is fine and what is waiting', () => {
    const view = heroView(linked({ state: 'offline', pendingOut: 5 }));
    expect(view).toMatchObject({ tone: 'gray', icon: 'offline' });
    expect(view.detail.join(' ')).toContain('5');
    expect(heroView(linked({ state: 'offline' })).detail.join(' ')).toMatch(/keep selling/);
  });

  it('offers a retry on errors and shows the reason', () => {
    const view = heroView(linked({ state: 'error', lastError: 'Cloud said no' }));
    expect(view).toMatchObject({ tone: 'red', action: 'retry' });
    expect(view.detail).toEqual(['Cloud said no']);
  });

  it('mentions the waiting changes while paused', () => {
    expect(heroView(linked({ state: 'paused', pendingOut: 3 })).detail.join(' ')).toContain('3');
  });

  it('asks for review when conflicts exist or the cloud copy needs confirming', () => {
    expect(heroView(linked({ conflictsOpen: 2 }))).toMatchObject({
      tone: 'orange',
      action: 'review',
    });
    expect(heroView(linked({ bootstrapRequired: true, state: 'paused' }))).toMatchObject({
      tone: 'orange',
      action: 'review',
      title: 'Your confirmation is needed',
    });
  });
});

describe('modules', () => {
  it('maps record types to the words a shop owner uses', () => {
    expect(moduleOf('invoices').label).toBe('Sales & Invoices');
    expect(moduleOf('payments').id).toBe('sales');
    expect(moduleOf('stockMovements').id).toBe('inventory');
    expect(moduleOf('mystery').id).toBe('other');
  });

  it('lists every module, up to date unless something is waiting', () => {
    const rows = moduleRows(linked());
    expect(rows.length).toBeGreaterThanOrEqual(9);
    expect(rows.every((r) => r.chip === 'upToDate')).toBe(true);
  });

  it('rolls counts up per module and picks the chip', () => {
    const rows = moduleRows(
      linked({
        pendingOut: 11,
        modules: [
          { resource: 'invoices', pending: 5, conflicts: 0 },
          { resource: 'payments', pending: 3, conflicts: 0 },
          { resource: 'products', pending: 3, conflicts: 1 },
        ],
      })
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId.sales).toMatchObject({ pending: 8, chip: 'waiting' });
    expect(byId.inventory).toMatchObject({ pending: 3, conflicts: 1, chip: 'review' });
    expect(byId.repairs.chip).toBe('upToDate');
  });

  it('marks waiting modules as sending while uploading', () => {
    const rows = moduleRows(
      linked({
        state: 'syncing',
        step: 'uploading',
        modules: [{ resource: 'repairs', pending: 2, conflicts: 0 }],
      })
    );
    expect(rows.find((r) => r.id === 'repairs')?.chip).toBe('sending');
  });

  it('adds an "Other records" row only when needed', () => {
    const rows = moduleRows(
      linked({ modules: [{ resource: 'newThing', pending: 1, conflicts: 0 }] })
    );
    expect(rows[rows.length - 1]).toMatchObject({ id: 'other', pending: 1 });
  });

  it('groups pending records by module, keeping order', () => {
    const grouped = groupPending([
      record({ key: 'a' }),
      record({ key: 'b', resource: 'payments', label: null }),
      record({ key: 'c', resource: 'repairs' }),
    ]);
    expect(grouped.get('sales')?.map((r) => r.key)).toEqual(['a', 'b']);
    expect(grouped.get('repairs')).toHaveLength(1);
  });

  it('names a record by its label, else by what kind of record it is', () => {
    expect(pendingLabel(record())).toBe('INV-2026-0042');
    expect(pendingLabel(record({ resource: 'payments', label: null }))).toBe('Payment');
  });
});

describe('module chips follow what is happening to each row', () => {
  const NOW = Date.parse('2026-10-04T12:00:00Z');
  const row = (status: SyncStatus, id: string, now = NOW) =>
    moduleRows(status, now).find((r) => r.id === id)!;
  const uploading = (modules: SyncStatus['modules']) =>
    linked({ state: 'syncing', step: 'uploading', modules });
  const text = (r: ReturnType<typeof row>) => chipText(r, (x) => x);

  it('shows Sending x / y for a row with data on its way, and others stay quiet', () => {
    const s = uploading([{ resource: 'invoices', pending: 5, conflicts: 0, sent: 3, received: 0 }]);
    expect(row(s, 'sales')).toMatchObject({ chip: 'sending', total: 8 });
    expect(text(row(s, 'sales'))).toBe('Sending 3 / 8');
    expect(row(s, 'repairs').chip).toBe('upToDate');
  });

  it('lets a row settle to Sent N while another row is still sending', () => {
    const s = uploading([
      { resource: 'invoices', pending: 0, conflicts: 0, sent: 8, received: 0 },
      { resource: 'products', pending: 4, conflicts: 0, sent: 6, received: 0 },
    ]);
    expect(row(s, 'sales').chip).toBe('done');
    expect(text(row(s, 'sales'))).toBe('Sent 8');
    expect(row(s, 'inventory').chip).toBe('sending');
  });

  it('shows Receiving N for a row whose data is coming down', () => {
    const s = linked({
      state: 'syncing',
      step: 'downloading',
      modules: [{ resource: 'customers', pending: 0, conflicts: 0, sent: 0, received: 40 }],
    });
    expect(row(s, 'customers').chip).toBe('receiving');
    expect(text(row(s, 'customers'))).toBe('Receiving 40');
  });

  it('reports both directions once the row is done', () => {
    const s = linked({
      modules: [{ resource: 'invoices', pending: 0, conflicts: 0, sent: 8, received: 3 }],
    });
    expect(text(row(s, 'sales'))).toBe('Sent 8 · Received 3');
  });

  it('keeps a finished row green for 30 s after a quiet cycle reset its counters, then settles', () => {
    const at = '2026-10-04T11:59:50Z';
    const s = linked({
      modules: [
        {
          resource: 'invoices',
          pending: 0,
          conflicts: 0,
          sent: 0,
          received: 0,
          lastChange: { at, sent: 8, received: 0 },
        },
      ],
    });
    expect(row(s, 'sales', NOW).chip).toBe('done');
    expect(text(row(s, 'sales', NOW))).toBe('Sent 8');
    const later = row(s, 'sales', NOW + 30_000);
    expect(later.chip).toBe('upToDate');
    expect(later.lastChangeAt).toBe(at);
  });

  it('prefers waiting over done, and review over everything', () => {
    const waiting = linked({
      state: 'offline',
      modules: [{ resource: 'invoices', pending: 2, conflicts: 0, sent: 5, received: 0 }],
    });
    expect(row(waiting, 'sales').chip).toBe('waiting');
    const review = uploading([
      { resource: 'invoices', pending: 2, conflicts: 1, sent: 5, received: 0 },
    ]);
    expect(row(review, 'sales').chip).toBe('review');
  });

  it('reads an older shell that sends only pending and conflicts', () => {
    const s = uploading([{ resource: 'invoices', pending: 4, conflicts: 0 }]);
    expect(row(s, 'sales')).toMatchObject({ chip: 'sending', sent: 0, total: 4 });
    expect(row(linked({ modules: [] }), 'sales').chip).toBe('upToDate');
  });

  it('adds up record types that share one row', () => {
    const s = uploading([
      { resource: 'stockMovements', pending: 3, conflicts: 0, sent: 1, received: 0 },
      { resource: 'products', pending: 2, conflicts: 0, sent: 4, received: 0 },
    ]);
    expect(row(s, 'inventory')).toMatchObject({ pending: 5, sent: 5, total: 10 });
  });
});

describe('activityView', () => {
  const entry = (over: Partial<Parameters<typeof activityView>[0]>) =>
    ({
      at: '2026-10-04T09:00:00Z',
      kind: 'synced',
      sent: 0,
      received: 0,
      message: null,
      ...over,
    }) as Parameters<typeof activityView>[0];

  it('summarises what was sent and received', () => {
    const v = activityView(entry({ sent: 12, received: 3 }));
    expect(v).toMatchObject({ tone: 'teal', title: 'Synced' });
    expect(phraseText(v.detail, (s) => s)).toBe('Sent 12 · Received 3');
    expect(phraseText(activityView(entry({ received: 4 })).detail, (s) => s)).toBe('Received 4');
  });

  it('turns refused changes into an orange line', () => {
    expect(activityView(entry({ sent: 1, message: '2 change(s) were refused.' })).tone).toBe(
      'orange'
    );
  });

  it.each([
    ['offline', 'Internet lost'],
    ['online', 'Back online'],
    ['paused', 'Sync paused'],
    ['resumed', 'Sync resumed'],
    ['error', 'Sync problem'],
  ] as const)('describes %s', (kind, title) => {
    expect(activityView(entry({ kind })).title).toBe(title);
  });
});

describe('helpers', () => {
  it('counts whole seconds until a time and never goes negative', () => {
    const now = Date.parse('2026-10-04T09:00:00Z');
    expect(secondsUntil('2026-10-04T09:00:14.200Z', now)).toBe(15);
    expect(secondsUntil('2026-10-04T08:59:00Z', now)).toBe(0);
    expect(secondsUntil(null, now)).toBeNull();
    expect(secondsUntil('nonsense', now)).toBeNull();
  });

  it('keeps numbers as they are and translates words', () => {
    expect(phraseText(['Sent', 12], (s) => s.toUpperCase())).toBe('SENT 12');
  });

  it('reads the pending list from the shell and survives garbage', () => {
    expect(normalizePending({ items: [record()], total: 40 })).toEqual({
      items: [record()],
      total: 40,
    });
    expect(normalizePending({ items: [{ nope: 1 }, record()] })).toMatchObject({ total: 1 });
    expect(normalizePending(null)).toEqual({ items: [], total: 0 });
  });
});
