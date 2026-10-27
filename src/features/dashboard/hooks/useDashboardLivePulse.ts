import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useBillingStats } from '@/features/billing/hooks/useBillingStats';
import { useCurrentSession } from '@/features/billing/hooks/useRegisterSession';
import { getDeviceId } from '@/api/deviceId';
import { useReminders } from '@/features/reports/hooks/useAnalyticsQueries';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { ReminderEntry } from '@/features/reports/types';
import { EMPLOYEE_ROLE_LABELS } from '@/features/employees/types';
import { formatRelativeTime } from '@/shared/lib/date';
import { fetchDashboardPulse } from '../api/dashboardApi';
import type {
  DashboardData,
  DashboardPulseKpis,
  DashboardPulseReply,
  UrgentActionItem,
  PipelineStageCount,
  TechnicianWorkload,
  FastMovingItem,
  ActivityEvent,
  CashDrawerShiftSummary,
  PulseActivity,
} from '../types';

export const INITIAL_DASHBOARD_DATA: DashboardData = {
  lastRefreshed: new Date().toISOString(),
  kpis: {
    todaySalesCents: 0,
    todayInvoicesCount: 0,
    avgBasketCents: 0,
    activeRepairsCount: 0,
    readyRepairsCount: 0,
    uncollectedReadyValueCents: 0,
    activePrintJobsCount: 0,
    cashDrawerBalanceCents: 0,
    openingFloatCents: 0,
    cashSalesCents: 0,
    cardSalesCents: 0,
    onlineSalesCents: 0,
    creditSalesCents: 0,
  },
  urgentActions: [],
  repairPipeline: [
    { stage: 'received', label: 'Received', count: 0, color: 'blue', percentage: 0 },
    { stage: 'diagnosing', label: 'Diagnosing', count: 0, color: 'yellow', percentage: 0 },
    { stage: 'in_repair', label: 'In Repair', count: 0, color: 'orange', percentage: 0 },
    { stage: 'ready', label: 'Ready for Pickup', count: 0, color: 'teal', percentage: 0 },
  ],
  printPipeline: [
    { stage: 'received', label: 'Queued', count: 0, color: 'blue', percentage: 0 },
    { stage: 'in_repair', label: 'In Production', count: 0, color: 'orange', percentage: 0 },
    { stage: 'ready', label: 'Ready for Collection', count: 0, color: 'teal', percentage: 0 },
    { stage: 'delivered', label: 'Delivered Today', count: 0, color: 'green', percentage: 0 },
  ],
  technicians: [],
  fastMovingItems: [],
  recentActivities: [],
  shiftSummary: {
    openingFloatCents: 0,
    cashSalesCents: 0,
    cardSalesCents: 0,
    onlineSalesCents: 0,
    creditSalesCents: 0,
    expectedDrawerCashCents: 0,
  },
};

/** What was sold today and what the open shift holds, as the server worked them out. */
export interface DashboardMoney {
  todaySalesCents: number;
  todayInvoicesCount: number;
  avgBasketCents: number;
  /** `null` when no shift is open: nothing is in a drawer to report. */
  shift: CashDrawerShiftSummary | null;
}

const NO_SHIFT: CashDrawerShiftSummary = {
  openingFloatCents: 0,
  cashSalesCents: 0,
  cardSalesCents: 0,
  onlineSalesCents: 0,
  creditSalesCents: 0,
  expectedDrawerCashCents: 0,
};

const REPAIR_STAGES: Record<string, { label: string; color: string }> = {
  received: { label: 'Received', color: 'blue' },
  diagnosing: { label: 'Diagnosing', color: 'yellow' },
  in_repair: { label: 'In Repair', color: 'orange' },
  ready: { label: 'Ready for Pickup', color: 'teal' },
};

const PRINT_STAGES: Record<string, { label: string; color: string }> = {
  received: { label: 'Queued', color: 'blue' },
  in_repair: { label: 'In Production', color: 'orange' },
  ready: { label: 'Ready for Collection', color: 'teal' },
  delivered: { label: 'Delivered Today', color: 'green' },
};

const toActivity = (row: PulseActivity): ActivityEvent => {
  const common = {
    amountCents: row.amountCents,
    timeAgo: formatRelativeTime(row.createdAt),
  };
  if (row.kind === 'sale') {
    return {
      ...common,
      id: `sale-${row.id}`,
      type: 'sale',
      title: `Sale Completed · ${row.reference}`,
      description: `${formatMoney(row.amountCents)} (${row.paymentMethod}) · Cashier: ${row.cashierName}`,
      icon: 'IconReceipt',
      color: 'blue',
      linkTo: '/invoices',
    };
  }
  if (row.kind === 'repair') {
    return {
      ...common,
      id: `rep-${row.id}`,
      type: 'repair_update',
      title: `Repair ${row.status?.toUpperCase()} · ${row.reference}`,
      description: `${row.deviceModel} · Customer: ${row.customerName}`,
      icon: 'IconHammer',
      color: 'teal',
      linkTo: '/repairs',
    };
  }
  return {
    ...common,
    id: `print-${row.id}`,
    type: 'print_new',
    title: `Print Job · ${row.reference}`,
    description: `${row.jobType?.toUpperCase()} (${row.quantity} units) · Customer: ${row.customerName}`,
    icon: 'IconPrinter',
    color: 'orange',
    linkTo: '/print-jobs',
  };
};

/**
 * Lays the server's groupings out as the dashboard's cards: wording, colours and "time ago" only.
 * Every count, share, severity and total arrives from the server already worked out.
 */
export const toDashboardData = (
  pulse: DashboardPulseReply,
  money: DashboardMoney
): DashboardData => {
  const shift = money.shift === null ? NO_SHIFT : money.shift;

  const kpis: DashboardPulseKpis = {
    todaySalesCents: money.todaySalesCents,
    todayInvoicesCount: money.todayInvoicesCount,
    avgBasketCents: money.avgBasketCents,
    activeRepairsCount: pulse.activeRepairsCount,
    readyRepairsCount: pulse.readyRepairsCount,
    uncollectedReadyValueCents: pulse.uncollectedReadyValueCents,
    activePrintJobsCount: pulse.activePrintJobsCount,
    cashDrawerBalanceCents: shift.expectedDrawerCashCents,
    openingFloatCents: shift.openingFloatCents,
    cashSalesCents: shift.cashSalesCents,
    cardSalesCents: shift.cardSalesCents,
    onlineSalesCents: shift.onlineSalesCents,
    creditSalesCents: shift.creditSalesCents,
  };

  const stockItems: UrgentActionItem[] = pulse.lowStock.map((item) => ({
    id: `stock-${item.productId}`,
    type: 'stockout',
    title: item.outOfStock ? `${item.name} is OUT OF STOCK` : `Low Stock Alert: ${item.name}`,
    subtitle: `${item.stockQuantity} units remaining on shelf (Threshold: ${item.threshold}) · SKU: ${item.reference}`,
    severity: item.outOfStock ? 'critical' : 'warning',
    timestamp: formatRelativeTime(item.updatedAt),
    rawDate: item.updatedAt,
    daysWaiting: item.daysSinceUpdate,
    referenceId: item.reference,
    actionLabel: 'Restock Stock',
    linkTo: '/inventory',
  }));

  const readyItems: UrgentActionItem[] = pulse.readyRepairs.map((rep) => ({
    id: `ready-${rep.id}`,
    type: 'uncollected',
    title: `Uncollected Device: ${rep.deviceModel} Ready for Pickup`,
    subtitle: `Customer: ${rep.customerName}${rep.customerPhone === '' ? '' : ` (${rep.customerPhone})`} · Balance: ${formatMoney(rep.amountCents)}`,
    severity: rep.severity,
    timestamp: rep.daysWaiting > 0 ? `${rep.daysWaiting}d ready` : 'Ready today',
    rawDate: rep.createdAt,
    referenceId: rep.ticketNumber,
    customerName: rep.customerName,
    customerPhone: rep.customerPhone,
    amountCents: rep.amountCents,
    daysWaiting: rep.daysWaiting,
    actionLabel: 'View Ticket',
    linkTo: '/repairs',
  }));

  const quotationItems: UrgentActionItem[] = (pulse.pendingStockQuotations ?? []).map((q) => {
    const isReady = q.isReadyToFill;
    const itemsSummary = q.items.map((i) => `${i.name} (x${i.quotedQuantity})`).join(', ');
    return {
      id: `quotation-${q.key}`,
      type: isReady ? 'quotation_ready_to_fill' : 'quotation_stock_needed',
      title: isReady
        ? `Quotation ${q.quotationNumber} is ready to fill!`
        : `Quotation ${q.quotationNumber} awaiting stock`,
      subtitle: `${q.customerName}${q.customerPhone ? ` (${q.customerPhone})` : ''} · ${formatMoney(q.totalCents)} · Items: ${itemsSummary}`,
      severity: isReady ? 'info' : 'warning',
      timestamp: formatRelativeTime(q.createdAt),
      rawDate: q.createdAt,
      referenceId: q.quotationNumber,
      referenceKey: q.key,
      customerName: q.customerName,
      customerPhone: q.customerPhone ?? undefined,
      amountCents: q.totalCents,
      actionLabel: isReady ? 'Fill Quotation' : 'View Quotation',
      linkTo: isReady ? `/billing?fillQuotation=${q.key}` : '/quotations',
    };
  });

  const pipeline = (
    stages: DashboardPulseReply['repairPipeline'],
    look: Record<string, { label: string; color: string }>
  ): PipelineStageCount[] =>
    stages.map((s) => ({
      stage: s.stage,
      label: look[s.stage].label,
      count: s.count,
      color: look[s.stage].color,
      percentage: s.percent,
    }));

  const technicians: TechnicianWorkload[] = pulse.technicians.map((tech) => ({
    employeeKey: tech.employeeKey,
    name: tech.name,
    role: EMPLOYEE_ROLE_LABELS[tech.role],
    activeJobsCount: tech.activeJobsCount,
    completedTodayCount: tech.completedTodayCount,
    capacityPercentage: tech.capacityPercent,
    currentTask:
      tech.currentDeviceModel === null
        ? undefined
        : `${tech.currentDeviceModel} (${tech.currentTicketNumber})`,
    status: tech.status,
  }));

  const fastMovingItems: FastMovingItem[] = pulse.fastMovers.map((m) => ({
    productId: m.productKey === null ? m.name : m.productKey,
    productKey: m.productKey,
    name: m.name,
    category: m.category,
    soldTodayUnits: m.soldTodayUnits,
    remainingStock: m.remainingStock,
    sellingPriceCents: m.sellingPriceCents,
    minThreshold: m.minThreshold,
  }));

  return {
    lastRefreshed: new Date().toISOString(),
    kpis,
    urgentActions: [...quotationItems, ...stockItems, ...readyItems],
    repairPipeline: pipeline(pulse.repairPipeline, REPAIR_STAGES),
    printPipeline: pipeline(pulse.printPipeline, PRINT_STAGES),
    technicians,
    fastMovingItems,
    recentActivities: pulse.recentActivity.map(toActivity),
    shiftSummary: shift,
  };
};

/**
 * Safety-net refresh. Changes made on other computers or the website reach the
 * dashboard as they happen (`LiveRefresh` marks these queries stale); this
 * only covers a lost realtime connection and the time-based reminders.
 */
const LIVE_PULSE_REFETCH_MS = 5 * 60_000;

const REMINDER_TYPE: Record<ReminderEntry['kind'], UrgentActionItem['type']> = {
  credit_overdue: 'credit_overdue',
  credit_due_soon: 'credit_due_soon',
  job_overdue: 'overdue_repair',
  job_due_soon: 'due_soon_job',
};

/** Maps the server reminders feed into the dashboard's urgent-action rows. */
export const toReminderItems = (reminders: ReminderEntry[] | undefined): UrgentActionItem[] => {
  if (!reminders) return [];
  return reminders.map((r) => {
    const isCredit = r.kind === 'credit_overdue' || r.kind === 'credit_due_soon';
    const isOverdue = r.kind === 'credit_overdue' || r.kind === 'job_overdue';
    const titlePrefix = isCredit
      ? isOverdue
        ? t('Payment overdue')
        : t('Payment due soon')
      : isOverdue
        ? t('Job overdue')
        : t('Job due soon');
    const owedLabel = isCredit ? t('Still owed') : t('Estimate');
    const timing = isOverdue
      ? `${r.daysFromDue} ${t('days overdue')}`
      : `${t('due in')} ${Math.abs(r.daysFromDue)} ${t('days')}`;
    return {
      id: `${r.kind}-${r.key}`,
      type: REMINDER_TYPE[r.kind],
      title: `${titlePrefix}: ${r.title}`,
      subtitle: `${owedLabel} ${formatMoney(r.amountCents)} · ${timing}`,
      severity: r.severity,
      timestamp: timing,
      rawDate: r.dueDate,
      referenceId: r.referenceNumber,
      referenceKey: r.key,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      amountCents: r.amountCents,
      daysWaiting: isOverdue ? r.daysFromDue : -Math.abs(r.daysFromDue),
      actionLabel: isCredit ? t('Record Payment') : t('Open Job'),
      linkTo: r.linkTo,
    };
  });
};

export const useDashboardLivePulse = () => {
  const queryClient = useQueryClient();
  const pulseQuery = useQuery({
    queryKey: queryKeys.reports.dashboardPulse(),
    queryFn: fetchDashboardPulse,
  });
  const remindersQuery = useReminders({ dueWithinDays: 7, limit: 100 });
  const statsQuery = useBillingStats();
  const stats = statsQuery.data;
  const { session } = useCurrentSession(getDeviceId());

  const data = useMemo(() => {
    if (pulseQuery.data === undefined) return INITIAL_DASHBOARD_DATA;
    const computed = toDashboardData(pulseQuery.data, {
      // Zero only while the server's answer is on its way (`isLoading` covers it).
      todaySalesCents: stats === undefined ? 0 : stats.todaySalesCents,
      todayInvoicesCount: stats === undefined ? 0 : stats.todayInvoiceCount,
      avgBasketCents: stats === undefined ? 0 : stats.avgBasketCents,
      shift:
        session === null
          ? null
          : {
              openingFloatCents: session.openingFloatCents,
              cashSalesCents: session.totalCashSalesCents,
              cardSalesCents: session.totalCardSalesCents,
              onlineSalesCents: session.totalOnlineSalesCents,
              creditSalesCents: session.totalCreditSalesCents,
              expectedDrawerCashCents: session.expectedCashCents,
            },
    });
    return {
      ...computed,
      urgentActions: [
        ...toReminderItems(remindersQuery.data?.reminders),
        ...computed.urgentActions,
      ],
    };
  }, [pulseQuery.data, remindersQuery.data, stats, session]);

  const isLoading = pulseQuery.isLoading || statsQuery.isLoading;

  const error = pulseQuery.error || remindersQuery.error;

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboardPulse() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.reminders() }),
    ]);
  }, [queryClient]);

  // A slow fallback poll; live updates arrive through `LiveRefresh`. Scoped to
  // this hook's own lifetime so it only polls while the dashboard is mounted.
  useEffect(() => {
    const interval = setInterval(() => {
      void refresh();
    }, LIVE_PULSE_REFETCH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, isLoading, error, refresh };
};
