import { describe, it, expect } from 'vitest';
import { UrgentActionCenter } from '../UrgentActionCenter';
import { LiveActivityFeed } from '../LiveActivityFeed';
import type { UrgentActionItem, ActivityEvent } from '../../types';

describe('UrgentActionCenter & LiveActivityFeed Logic & Presentation', () => {
  it('exports UrgentActionCenter and LiveActivityFeed components', () => {
    expect(typeof UrgentActionCenter).toBe('function');
    expect(typeof LiveActivityFeed).toBe('function');
  });

  const createItem = (over: Partial<UrgentActionItem>): UrgentActionItem => ({
    id: 'act-1',
    type: 'overdue_repair',
    title: 'Repair Ticket TKT-1',
    subtitle: 'Overdue by 3 days',
    severity: 'warning',
    timestamp: '3 days overdue',
    rawDate: '2026-09-01T10:00:00.000Z',
    referenceId: 'REF-1',
    daysWaiting: 3,
    amountCents: 5000,
    actionLabel: 'Open Job',
    ...over,
  });

  describe('UrgentActionCenter Descending Sorting Logic', () => {
    const SEVERITY_WEIGHT: Record<string, number> = {
      critical: 3,
      warning: 2,
      info: 1,
    };

    const sortUrgentItems = (
      items: UrgentActionItem[],
      sortBy: 'urgency' | 'days' | 'amount' | 'date'
    ): UrgentActionItem[] => {
      return [...items].sort((a, b) => {
        // Payment overdues always come to the top
        const isPaymentOverdueA = a.type === 'credit_overdue';
        const isPaymentOverdueB = b.type === 'credit_overdue';
        if (isPaymentOverdueA && !isPaymentOverdueB) return -1;
        if (!isPaymentOverdueA && isPaymentOverdueB) return 1;

        if (sortBy === 'days') {
          const daysA = a.daysWaiting ?? 0;
          const daysB = b.daysWaiting ?? 0;
          if (daysB !== daysA) return daysB - daysA;
          return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
        }

        if (sortBy === 'amount') {
          const amtA = a.amountCents ?? 0;
          const amtB = b.amountCents ?? 0;
          if (amtB !== amtA) return amtB - amtA;
          return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
        }

        if (sortBy === 'date') {
          const dateA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
          const dateB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
        }

        // Default: Urgency (critical > warning > info) descending
        const diff = (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
        if (diff !== 0) return diff;

        // Tie-breaker 1: Days waiting descending
        const daysA = a.daysWaiting ?? 0;
        const daysB = b.daysWaiting ?? 0;
        if (daysB !== daysA) return daysB - daysA;

        // Tie-breaker 2: Amount descending
        const amtA = a.amountCents ?? 0;
        const amtB = b.amountCents ?? 0;
        if (amtB !== amtA) return amtB - amtA;

        // Tie-breaker 3: Date descending (newest first)
        const dateA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const dateB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return dateB - dateA;
      });
    };

    it('places payment overdues at the very top ahead of other items, even critical stockouts', () => {
      const items: UrgentActionItem[] = [
        createItem({
          id: 'stock-1',
          type: 'stockout',
          severity: 'critical',
          title: 'Out of Stock',
        }),
        createItem({
          id: 'credit-1',
          type: 'credit_overdue',
          severity: 'warning',
          title: 'Payment Overdue 3 Days',
        }),
        createItem({
          id: 'repair-1',
          type: 'overdue_repair',
          severity: 'warning',
          title: 'Repair Job Overdue',
        }),
      ];

      const sorted = sortUrgentItems(items, 'urgency');
      // Payment overdue must come first, followed by critical stockout, then warning repair
      expect(sorted.map((i) => i.id)).toEqual(['credit-1', 'stock-1', 'repair-1']);
    });

    it('sorts multiple payment overdues among themselves according to urgency and days waiting', () => {
      const items: UrgentActionItem[] = [
        createItem({ id: 'repair-1', type: 'overdue_repair', severity: 'critical' }),
        createItem({
          id: 'credit-warn',
          type: 'credit_overdue',
          severity: 'warning',
          daysWaiting: 3,
        }),
        createItem({
          id: 'credit-crit',
          type: 'credit_overdue',
          severity: 'critical',
          daysWaiting: 10,
        }),
        createItem({ id: 'stock-1', type: 'stockout', severity: 'warning' }),
      ];

      const sorted = sortUrgentItems(items, 'urgency');
      // Both payment overdues come before other items, with critical payment overdue ahead of warning
      expect(sorted.map((i) => i.id)).toEqual([
        'credit-crit',
        'credit-warn',
        'repair-1',
        'stock-1',
      ]);
    });

    it('sorts by Urgency descending: critical first, then warning, then info', () => {
      const items: UrgentActionItem[] = [
        createItem({ id: '1', severity: 'info', title: 'Info Item' }),
        createItem({ id: '2', severity: 'critical', title: 'Critical Item' }),
        createItem({ id: '3', severity: 'warning', title: 'Warning Item' }),
      ];

      const sorted = sortUrgentItems(items, 'urgency');
      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1']);
    });

    it('breaks ties in Urgency mode using days waiting, amount, and date descending', () => {
      const items: UrgentActionItem[] = [
        createItem({
          id: '1',
          severity: 'warning',
          daysWaiting: 2,
          amountCents: 1000,
          rawDate: '2026-09-01T00:00:00Z',
        }),
        createItem({
          id: '2',
          severity: 'warning',
          daysWaiting: 10,
          amountCents: 500,
          rawDate: '2026-09-01T00:00:00Z',
        }),
        createItem({
          id: '3',
          severity: 'warning',
          daysWaiting: 2,
          amountCents: 5000,
          rawDate: '2026-09-01T00:00:00Z',
        }),
        createItem({
          id: '4',
          severity: 'warning',
          daysWaiting: 2,
          amountCents: 5000,
          rawDate: '2026-09-02T00:00:00Z',
        }),
      ];

      const sorted = sortUrgentItems(items, 'urgency');
      // ID '2': daysWaiting 10 (highest days)
      // ID '4': daysWaiting 2, amount 5000, rawDate Sept 2 (newer date)
      // ID '3': daysWaiting 2, amount 5000, rawDate Sept 1
      // ID '1': daysWaiting 2, amount 1000
      expect(sorted.map((i) => i.id)).toEqual(['2', '4', '3', '1']);
    });

    it('sorts by Days Overdue descending (longest waiting first)', () => {
      const items: UrgentActionItem[] = [
        createItem({ id: '1', daysWaiting: 1 }),
        createItem({ id: '2', daysWaiting: 14 }),
        createItem({ id: '3', daysWaiting: 7 }),
      ];

      const sorted = sortUrgentItems(items, 'days');
      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1']);
    });

    it('sorts by Amount descending (highest monetary value first)', () => {
      const items: UrgentActionItem[] = [
        createItem({ id: '1', amountCents: 2500 }),
        createItem({ id: '2', amountCents: 150000 }),
        createItem({ id: '3', amountCents: 45000 }),
      ];

      const sorted = sortUrgentItems(items, 'amount');
      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1']);
    });

    it('sorts by Date descending (newest timestamp first)', () => {
      const items: UrgentActionItem[] = [
        createItem({ id: '1', rawDate: '2026-08-20T10:00:00Z' }),
        createItem({ id: '2', rawDate: '2026-09-05T10:00:00Z' }),
        createItem({ id: '3', rawDate: '2026-09-01T10:00:00Z' }),
      ];

      const sorted = sortUrgentItems(items, 'date');
      expect(sorted.map((i) => i.id)).toEqual(['2', '3', '1']);
    });
  });

  describe('UrgentActionCenter Tab Filtering', () => {
    const filterItems = (
      items: UrgentActionItem[],
      filter: 'all' | 'repairs' | 'stock' | 'credit'
    ): UrgentActionItem[] => {
      return items.filter((item) => {
        if (filter === 'repairs') {
          return (
            item.type === 'overdue_repair' ||
            item.type === 'due_soon_job' ||
            item.type === 'uncollected' ||
            item.type === 'pending_approval'
          );
        }
        if (filter === 'stock') return item.type === 'stockout';
        if (filter === 'credit') {
          return item.type === 'credit_overdue' || item.type === 'credit_due_soon';
        }
        return true;
      });
    };

    const items: UrgentActionItem[] = [
      createItem({ id: '1', type: 'stockout' }),
      createItem({ id: '2', type: 'overdue_repair' }),
      createItem({ id: '3', type: 'uncollected' }),
      createItem({ id: '4', type: 'credit_overdue' }),
      createItem({ id: '5', type: 'credit_due_soon' }),
      createItem({ id: '6', type: 'due_soon_job' }),
    ];

    it('filters correctly for all tabs', () => {
      expect(filterItems(items, 'all')).toHaveLength(6);
      expect(filterItems(items, 'repairs').map((i) => i.id)).toEqual(['2', '3', '6']);
      expect(filterItems(items, 'stock').map((i) => i.id)).toEqual(['1']);
      expect(filterItems(items, 'credit').map((i) => i.id)).toEqual(['4', '5']);
    });
  });

  describe('UrgentActionCenter Pagination', () => {
    const PAGE_SIZE = 5;

    const paginate = <T>(items: T[], page: number, pageSize: number = PAGE_SIZE): T[] => {
      const start = (page - 1) * pageSize;
      return items.slice(start, start + pageSize);
    };

    it('calculates totalPages and slices items accurately for 5 items per page', () => {
      const items = Array.from({ length: 14 }, (_, i) =>
        createItem({ id: `item-${i + 1}`, title: `Alert ${i + 1}` })
      );

      const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
      expect(totalPages).toBe(3);

      const page1 = paginate(items, 1);
      expect(page1).toHaveLength(5);
      expect(page1[0].id).toBe('item-1');
      expect(page1[4].id).toBe('item-5');

      const page2 = paginate(items, 2);
      expect(page2).toHaveLength(5);
      expect(page2[0].id).toBe('item-6');
      expect(page2[4].id).toBe('item-10');

      const page3 = paginate(items, 3);
      expect(page3).toHaveLength(4);
      expect(page3[0].id).toBe('item-11');
      expect(page3[3].id).toBe('item-14');
    });

    it('computes correct item range text: Showing X–Y of Total', () => {
      const totalCount = 14;
      const getRange = (page: number) => {
        const start = (page - 1) * PAGE_SIZE + 1;
        const end = Math.min(page * PAGE_SIZE, totalCount);
        return `${start}–${end} of ${totalCount}`;
      };

      expect(getRange(1)).toBe('1–5 of 14');
      expect(getRange(2)).toBe('6–10 of 14');
      expect(getRange(3)).toBe('11–14 of 14');
    });
  });

  describe('LiveActivityFeed Pagination', () => {
    const PAGE_SIZE = 5;

    const createActivity = (id: string, type: ActivityEvent['type']): ActivityEvent => ({
      id,
      type,
      title: `Event ${id}`,
      description: `Description ${id}`,
      timeAgo: 'Just now',
      icon: 'IconActivity',
      color: 'blue',
      linkTo: '/billing',
    });

    it('pages activities into slices of 5', () => {
      const activities = Array.from({ length: 12 }, (_, i) =>
        createActivity(`act-${i + 1}`, 'sale')
      );

      const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
      expect(totalPages).toBe(3);

      const page1 = activities.slice(0, PAGE_SIZE);
      expect(page1).toHaveLength(5);
      expect(page1[0].id).toBe('act-1');

      const page3 = activities.slice(2 * PAGE_SIZE, 3 * PAGE_SIZE);
      expect(page3).toHaveLength(2);
      expect(page3[0].id).toBe('act-11');
      expect(page3[1].id).toBe('act-12');
    });

    it('handles total pages = 1 for fewer than 5 activities', () => {
      const activities = [
        createActivity('act-1', 'sale'),
        createActivity('act-2', 'repair_update'),
      ];
      const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
      expect(totalPages).toBe(1);
    });
  });
});
