import type { HistoryEntry, ModuleStatus, PendingRecord, SyncStatus, SyncStep } from '../types';

/** A sentence made of static phrases (translated by the caller) and numbers (shown as is). */
export type Phrase = ReadonlyArray<string | number>;

export type HeroTone = 'teal' | 'blue' | 'yellow' | 'gray' | 'orange' | 'red';
export type HeroIcon = 'ok' | 'working' | 'waiting' | 'offline' | 'attention' | 'error' | 'paused';

export interface HeroView {
  tone: HeroTone;
  icon: HeroIcon;
  title: string;
  detail: Phrase;
  /** Shown as a bar while data is moving; `total` 0 means "count only". */
  progress: { done: number; total: number } | null;
  /** What the primary call to action should do, if anything. */
  action: 'retry' | 'review' | null;
}

const changes = (n: number): string => (n === 1 ? 'change' : 'changes');

/** "Last checked 2:55 PM"-style tail, left to the caller to format the time. */
export const STEP_TEXT: Record<SyncStep, string> = {
  idle: '',
  preparing: 'Getting ready…',
  uploading: 'Sending your changes to the cloud…',
  downloading: 'Getting updates from your other devices…',
  finishing: 'Finishing up…',
};

/** The one-sentence answer to "what is sync doing right now?" */
export const heroView = (status: SyncStatus): HeroView => {
  const waiting = status.pendingOut;
  const base = { progress: null, action: null } as const;

  if (status.bootstrapRequired) {
    return {
      ...base,
      tone: 'orange',
      icon: 'attention',
      title: 'Your confirmation is needed',
      detail: ['The cloud already has data for this shop. Choose what to do below.'],
      action: 'review',
    };
  }
  if (status.state === 'error') {
    return {
      ...base,
      tone: 'red',
      icon: 'error',
      title: 'Sync stopped',
      detail: [status.lastError ?? 'Something went wrong. We will try again soon.'],
      action: 'retry',
    };
  }
  if (status.state === 'paused') {
    return {
      ...base,
      tone: 'yellow',
      icon: 'paused',
      title: 'Sync is paused',
      detail:
        waiting > 0
          ? [waiting, changes(waiting), 'are waiting to upload.']
          : ['Nothing is waiting.'],
    };
  }
  if (status.state === 'offline') {
    return {
      ...base,
      tone: 'gray',
      icon: 'offline',
      title: 'No internet connection',
      detail:
        waiting > 0
          ? [waiting, changes(waiting), 'will upload when the internet is back.']
          : ['You can keep selling. Everything syncs when the internet is back.'],
    };
  }
  if (status.state === 'syncing') {
    const uploading = status.step === 'uploading';
    const total = status.progress?.total ?? 0;
    // Name how many are on their way, so a slow first batch still reads as "working".
    const detail: Phrase =
      uploading && total > 0
        ? ['Sending', total, total === 1 ? 'change to the cloud…' : 'changes to the cloud…']
        : [STEP_TEXT[status.step] || 'Syncing…'];
    return {
      ...base,
      tone: 'blue',
      icon: 'working',
      title: uploading ? 'Sending your changes' : 'Syncing',
      detail,
      progress: status.progress,
    };
  }
  if (status.conflictsOpen > 0) {
    return {
      ...base,
      tone: 'orange',
      icon: 'attention',
      title: 'Some changes need a look',
      detail: [
        status.conflictsOpen,
        status.conflictsOpen === 1 ? 'change' : 'changes',
        'from other devices need review.',
      ],
      action: 'review',
    };
  }
  if (waiting > 0) {
    return {
      ...base,
      tone: 'yellow',
      icon: 'waiting',
      title: 'Changes are waiting',
      detail: [waiting, changes(waiting), 'will upload in a moment.'],
    };
  }
  return {
    ...base,
    tone: 'teal',
    icon: 'ok',
    title: 'Everything is saved to the cloud',
    detail: ['Your shop data is up to date on all your devices.'],
  };
};

// ---------------------------------------------------------------------------
// Modules: what the shop owner calls each kind of record
// ---------------------------------------------------------------------------

export interface ModuleDef {
  id: string;
  label: string;
  resources: readonly string[];
}

/** Display order; every module is always listed so "up to date" is visible too. */
export const MODULES: readonly ModuleDef[] = [
  { id: 'sales', label: 'Sales & Invoices', resources: ['invoices', 'payments', 'creditNotes'] },
  { id: 'repairs', label: 'Repair Jobs', resources: ['repairs'] },
  { id: 'printJobs', label: 'Print Jobs', resources: ['printJobs'] },
  {
    id: 'inventory',
    label: 'Inventory & Stock',
    resources: ['products', 'categories', 'stockMovements', 'productSerials', 'supplierProducts'],
  },
  { id: 'purchases', label: 'Purchases', resources: ['purchases'] },
  { id: 'customers', label: 'Customers', resources: ['customers'] },
  { id: 'suppliers', label: 'Suppliers', resources: ['suppliers'] },
  { id: 'employees', label: 'Employees', resources: ['employees'] },
  { id: 'users', label: 'Login Accounts', resources: ['users'] },
];

const OTHER_MODULE: ModuleDef = { id: 'other', label: 'Other records', resources: [] };

export const moduleOf = (resource: string): ModuleDef =>
  MODULES.find((m) => m.resources.includes(resource)) ?? OTHER_MODULE;

/** One record type in singular shop words, for "Payment" style fallback labels. */
const RECORD_NAMES: Record<string, string> = {
  invoices: 'Invoice',
  payments: 'Payment',
  creditNotes: 'Credit note',
  repairs: 'Repair job',
  printJobs: 'Print job',
  products: 'Product',
  categories: 'Category',
  stockMovements: 'Stock change',
  productSerials: 'Serial number',
  supplierProducts: 'Supplier price',
  purchases: 'Purchase',
  customers: 'Customer',
  suppliers: 'Supplier',
  employees: 'Employee',
  users: 'Login account',
};

export const recordName = (resource: string): string => RECORD_NAMES[resource] ?? 'Record';

export type ModuleChip = 'upToDate' | 'waiting' | 'sending' | 'review';

export interface ModuleRow {
  id: string;
  label: string;
  pending: number;
  conflicts: number;
  chip: ModuleChip;
  resources: readonly string[];
}

/** Rolls the per-record-type counts up into the shop-language module rows. */
export const moduleRows = (status: SyncStatus): ModuleRow[] => {
  const sending = status.state === 'syncing' && status.step === 'uploading';
  const defs = [...MODULES];
  const totals = new Map<string, { pending: number; conflicts: number }>();
  const add = (m: ModuleStatus) => {
    const id = moduleOf(m.resource).id;
    const cur = totals.get(id) ?? { pending: 0, conflicts: 0 };
    totals.set(id, { pending: cur.pending + m.pending, conflicts: cur.conflicts + m.conflicts });
  };
  status.modules.forEach(add);
  if (totals.has(OTHER_MODULE.id)) defs.push(OTHER_MODULE);
  return defs.map((def) => {
    const { pending, conflicts } = totals.get(def.id) ?? { pending: 0, conflicts: 0 };
    const chip: ModuleChip =
      conflicts > 0 ? 'review' : pending > 0 ? (sending ? 'sending' : 'waiting') : 'upToDate';
    return { id: def.id, label: def.label, pending, conflicts, chip, resources: def.resources };
  });
};

/** Groups a flat pending list by module, keeping each module's newest-first order. */
export const groupPending = (items: PendingRecord[]): Map<string, PendingRecord[]> => {
  const out = new Map<string, PendingRecord[]>();
  for (const item of items) {
    const id = moduleOf(item.resource).id;
    out.set(id, [...(out.get(id) ?? []), item]);
  }
  return out;
};

export const pendingLabel = (r: PendingRecord): string => r.label ?? recordName(r.resource);

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export interface ActivityView {
  tone: HeroTone;
  title: string;
  /** Extra numbers/phrases after the title, e.g. `['Sent', 12, '· Received', 3]`. */
  detail: Phrase;
}

/** One line of the "Recent activity" list in plain words. */
export const activityView = (entry: HistoryEntry): ActivityView => {
  switch (entry.kind) {
    case 'synced': {
      const detail: Array<string | number> = [];
      if (entry.sent > 0) detail.push('Sent', entry.sent);
      if (entry.received > 0)
        detail.push(entry.sent > 0 ? '· Received' : 'Received', entry.received);
      return {
        tone: entry.message ? 'orange' : 'teal',
        title: 'Synced',
        detail: entry.message ? [...detail, entry.message] : detail,
      };
    }
    case 'offline':
      return {
        tone: 'gray',
        title: 'Internet lost',
        detail: ['Changes will wait until it is back.'],
      };
    case 'online':
      return { tone: 'teal', title: 'Back online', detail: [] };
    case 'error':
      return { tone: 'red', title: 'Sync problem', detail: entry.message ? [entry.message] : [] };
    case 'paused':
      return { tone: 'yellow', title: 'Sync paused', detail: [] };
    case 'resumed':
      return { tone: 'blue', title: 'Sync resumed', detail: [] };
  }
};

/** Whole seconds from `now` until `iso` (never negative); null when there is no time. */
export const secondsUntil = (iso: string | null, now: number): number | null => {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil((ms - now) / 1000));
};
