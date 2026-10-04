import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { queryKeys } from '@/api/queryKeys';
import { useAllInvoices } from '@/features/billing/hooks/useInvoices';
import { useAllRepairs } from '@/features/repairs/hooks/useRepairs';
import { useAllPrintJobs } from '@/features/print-jobs/hooks/usePrintJobs';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import { useReminders } from '@/features/reports/hooks/useAnalyticsQueries';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { ReminderEntry } from '@/features/reports/types';
import { JOB_STATUS } from '@/constants/jobs';
import { EMPLOYEE_ROLE_LABELS } from '@/features/employees/types';
import { formatRelativeTime } from '@/shared/lib/date';
import type { Invoice } from '@/features/billing/types';
import type { RepairJob } from '@/features/repairs/types';
import type { PrintJob } from '@/features/print-jobs/types';
import type { Product } from '@/features/inventory/types';
import type { Employee } from '@/features/employees/types';
import type {
  DashboardData,
  DashboardPulseKpis,
  UrgentActionItem,
  PipelineStageCount,
  TechnicianWorkload,
  FastMovingItem,
  ActivityEvent,
  CashDrawerShiftSummary,
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
    cashOutCents: 0,
    expectedDrawerCashCents: 0,
  },
};

export interface RawDashboardEntities {
  invoices: Invoice[];
  repairs: RepairJob[];
  printJobs: PrintJob[];
  products: Product[];
  employees: Employee[];
  now?: dayjs.Dayjs;
}

/**
 * Pure aggregation function that calculates all 7 Dashboard metric zones
 * from raw in-memory entity arrays with zero side-effects.
 *
 * There is no backend endpoint for "every payment across every invoice" (the
 * only route is `GET /billing/invoices/{id}/payments`, scoped to one
 * invoice), so same-day installment top-ups against an already-existing
 * credit invoice are not reflected here — only the sale itself, at the
 * moment it was made, is. A live pulse over every invoice's payments would
 * mean one request per invoice; not worth it for a best-effort dashboard.
 */
export const computeDashboardData = ({
  invoices,
  repairs,
  printJobs,
  products,
  employees,
  now = dayjs(),
}: RawDashboardEntities): DashboardData => {
  // -----------------------------------------------------------------------
  // 1. Time-filtered sets (Today)
  // -----------------------------------------------------------------------
  const todayInvoices = invoices.filter(
    (inv) => inv.status !== 'voided' && dayjs(inv.createdAt).isSame(now, 'day')
  );

  // -----------------------------------------------------------------------
  // 2. High-Velocity KPIs
  // -----------------------------------------------------------------------
  const todaySalesCents = todayInvoices.reduce((sum, inv) => sum + (inv.totalCents || 0), 0);
  const todayInvoicesCount = todayInvoices.length;
  const avgBasketCents =
    todayInvoicesCount > 0 ? Math.round(todaySalesCents / todayInvoicesCount) : 0;

  const activeRepairStatuses: string[] = [
    JOB_STATUS.RECEIVED,
    JOB_STATUS.DIAGNOSING,
    JOB_STATUS.IN_REPAIR,
  ];
  const activeRepairs = repairs.filter((r) => activeRepairStatuses.includes(r.status));
  const activeRepairsCount = activeRepairs.length;

  const readyRepairs = repairs.filter((r) => r.status === JOB_STATUS.READY);
  const readyRepairsCount = readyRepairs.length;
  const uncollectedReadyValueCents = readyRepairs.reduce(
    (sum, r) => sum + (r.estimatedCostCents || 0) + (r.materialCostCents || 0),
    0
  );

  const activePrintStatuses: string[] = [JOB_STATUS.RECEIVED, JOB_STATUS.IN_REPAIR];
  const activePrintJobsCount = printJobs.filter((pj) =>
    activePrintStatuses.includes(pj.status)
  ).length;

  // -----------------------------------------------------------------------
  // 3. Shift Inflow & Cash Drawer Reconciliation
  // -----------------------------------------------------------------------
  let cashSalesCents = 0;
  let cardSalesCents = 0;
  let onlineSalesCents = 0;
  let creditSalesCents = 0;

  for (const inv of todayInvoices) {
    if (inv.isCredit) {
      creditSalesCents += Math.max(0, (inv.totalCents || 0) - (inv.amountReceivedCents || 0));
    }

    if (inv.splitPayments && inv.splitPayments.length > 0) {
      for (const split of inv.splitPayments) {
        if (split.method === 'cash') cashSalesCents += split.amountCents || 0;
        else if (split.method === 'card') cardSalesCents += split.amountCents || 0;
        else if (split.method === 'online') onlineSalesCents += split.amountCents || 0;
      }
    } else if (inv.isCredit) {
      // A credit sale's up-front deposit is real money in the till. Bucket
      // it by card vs cash using the last-4 the invoice carries for a card
      // deposit (nothing recorded ⇒ nothing collected up front).
      const deposit = inv.amountReceivedCents || 0;
      if (deposit > 0) {
        if (inv.cardLast4) cardSalesCents += deposit;
        else cashSalesCents += deposit;
      }
    } else {
      const collected = inv.amountReceivedCents || inv.totalCents || 0;
      if (inv.paymentMethod === 'cash') cashSalesCents += collected;
      else if (inv.paymentMethod === 'card') cardSalesCents += collected;
      else if (inv.paymentMethod === 'online') onlineSalesCents += collected;
    }
  }

  const openingFloatCents = 0;
  const cashDrawerBalanceCents = openingFloatCents + cashSalesCents;

  const kpis: DashboardPulseKpis = {
    todaySalesCents,
    todayInvoicesCount,
    avgBasketCents,
    activeRepairsCount,
    readyRepairsCount,
    uncollectedReadyValueCents,
    activePrintJobsCount,
    cashDrawerBalanceCents,
    openingFloatCents,
    cashSalesCents,
    cardSalesCents,
    onlineSalesCents,
    creditSalesCents,
  };

  const shiftSummary: CashDrawerShiftSummary = {
    openingFloatCents,
    cashSalesCents,
    cardSalesCents,
    onlineSalesCents,
    creditSalesCents,
    cashOutCents: 0,
    expectedDrawerCashCents: cashDrawerBalanceCents,
  };

  // -----------------------------------------------------------------------
  // 4. Urgent Action Center (Actionable Blockers)
  // -----------------------------------------------------------------------
  const urgentActions: UrgentActionItem[] = [];

  // A) Critical Stockouts & Low Stock
  for (const prod of products) {
    const threshold = prod.minStockThreshold || 5;
    if (prod.stockQuantity <= threshold) {
      const isOut = prod.stockQuantity <= 0;
      const daysSinceUpdate = prod.updatedAt
        ? Math.max(0, now.diff(dayjs(prod.updatedAt), 'day'))
        : 0;
      urgentActions.push({
        id: `stock-${prod.id}`,
        type: 'stockout',
        title: isOut ? `${prod.name} is OUT OF STOCK` : `Low Stock Alert: ${prod.name}`,
        subtitle: `${prod.stockQuantity} units remaining on shelf (Threshold: ${threshold}) · SKU: ${prod.sku || 'N/A'}`,
        severity: isOut ? 'critical' : 'warning',
        timestamp: prod.updatedAt ? formatRelativeTime(prod.updatedAt) : 'Recently updated',
        rawDate: prod.updatedAt || prod.createdAt,
        daysWaiting: daysSinceUpdate,
        referenceId: prod.sku || prod.key || prod.id,
        actionLabel: 'Restock Stock',
        linkTo: '/inventory',
      });
    }
  }

  // B) Uncollected Ready Repairs
  for (const rep of readyRepairs) {
    const daysReady = now.diff(dayjs(rep.createdAt), 'day');
    const cost = (rep.estimatedCostCents || 0) + (rep.materialCostCents || 0);
    urgentActions.push({
      id: `ready-${rep.id}`,
      type: 'uncollected',
      title: `Uncollected Device: ${rep.deviceModel} Ready for Pickup`,
      subtitle: `Customer: ${rep.customerName} (${rep.customerPhone || 'N/A'}) · Balance: Rs. ${(cost / 100).toLocaleString()}`,
      severity: daysReady >= 3 ? 'critical' : 'warning',
      timestamp: daysReady > 0 ? `${daysReady}d ready` : 'Ready today',
      rawDate: rep.createdAt,
      referenceId: rep.ticketNumber,
      customerName: rep.customerName,
      customerPhone: rep.customerPhone,
      amountCents: cost,
      daysWaiting: daysReady,
      actionLabel: 'View Ticket',
      linkTo: '/repairs',
    });
  }

  // Credit-sale and repair/print "due" reminders come from the server-side
  // `/reports/reminders` feed (installment-aware balances, a "due soon" lead
  // window, one place for all of it) — merged in by `useDashboardLivePulse`,
  // not computed here.

  // -----------------------------------------------------------------------
  // 5. Service Pipelines
  // -----------------------------------------------------------------------
  const repairReceived = repairs.filter((r) => r.status === JOB_STATUS.RECEIVED).length;
  const repairDiagnosing = repairs.filter((r) => r.status === JOB_STATUS.DIAGNOSING).length;
  const repairInRepair = repairs.filter((r) => r.status === JOB_STATUS.IN_REPAIR).length;
  const repairReady = readyRepairsCount;
  const totalRepairsTracked = repairReceived + repairDiagnosing + repairInRepair + repairReady;

  const repairPipeline: PipelineStageCount[] = [
    {
      stage: 'received',
      label: 'Received',
      count: repairReceived,
      color: 'blue',
      percentage:
        totalRepairsTracked > 0 ? Math.round((repairReceived / totalRepairsTracked) * 100) : 0,
    },
    {
      stage: 'diagnosing',
      label: 'Diagnosing',
      count: repairDiagnosing,
      color: 'yellow',
      percentage:
        totalRepairsTracked > 0 ? Math.round((repairDiagnosing / totalRepairsTracked) * 100) : 0,
    },
    {
      stage: 'in_repair',
      label: 'In Repair',
      count: repairInRepair,
      color: 'orange',
      percentage:
        totalRepairsTracked > 0 ? Math.round((repairInRepair / totalRepairsTracked) * 100) : 0,
    },
    {
      stage: 'ready',
      label: 'Ready for Pickup',
      count: repairReady,
      color: 'teal',
      percentage:
        totalRepairsTracked > 0 ? Math.round((repairReady / totalRepairsTracked) * 100) : 0,
    },
  ];

  const printReceived = printJobs.filter((pj) => pj.status === JOB_STATUS.RECEIVED).length;
  const printInRepair = printJobs.filter((pj) => pj.status === JOB_STATUS.IN_REPAIR).length;
  const printReady = printJobs.filter((pj) => pj.status === JOB_STATUS.READY).length;
  const printDeliveredToday = printJobs.filter(
    (pj) => pj.status === JOB_STATUS.DELIVERED && dayjs(pj.createdAt).isSame(now, 'day')
  ).length;
  const totalPrintsTracked = printReceived + printInRepair + printReady + printDeliveredToday;

  const printPipeline: PipelineStageCount[] = [
    {
      stage: 'received',
      label: 'Queued',
      count: printReceived,
      color: 'blue',
      percentage:
        totalPrintsTracked > 0 ? Math.round((printReceived / totalPrintsTracked) * 100) : 0,
    },
    {
      stage: 'in_repair',
      label: 'In Production',
      count: printInRepair,
      color: 'orange',
      percentage:
        totalPrintsTracked > 0 ? Math.round((printInRepair / totalPrintsTracked) * 100) : 0,
    },
    {
      stage: 'ready',
      label: 'Ready for Collection',
      count: printReady,
      color: 'teal',
      percentage: totalPrintsTracked > 0 ? Math.round((printReady / totalPrintsTracked) * 100) : 0,
    },
    {
      stage: 'delivered',
      label: 'Delivered Today',
      count: printDeliveredToday,
      color: 'green',
      percentage:
        totalPrintsTracked > 0 ? Math.round((printDeliveredToday / totalPrintsTracked) * 100) : 0,
    },
  ];

  // -----------------------------------------------------------------------
  // 6. Technician Workload & Capacity
  // -----------------------------------------------------------------------
  const activeTechs = employees.filter(
    (e) => e.status === 'active' && (e.role === 'technician' || e.role === 'printer')
  );

  const technicians: TechnicianWorkload[] = activeTechs.map((tech) => {
    const assignedRepairs = repairs.filter(
      (r) =>
        (r.assignedEmployeeId === tech.id || r.assignedEmployeeName === tech.name) &&
        activeRepairStatuses.includes(r.status)
    );
    const assignedCompletedToday = repairs.filter(
      (r) =>
        (r.assignedEmployeeId === tech.id || r.assignedEmployeeName === tech.name) &&
        (r.status === JOB_STATUS.READY || r.status === JOB_STATUS.DELIVERED) &&
        dayjs(r.createdAt).isSame(now, 'day')
    );

    const activeJobsCount = assignedRepairs.length;
    const completedTodayCount = assignedCompletedToday.length;
    // 5 active jobs is 100% capacity benchmark
    const capacityPercentage = Math.min(100, Math.round((activeJobsCount / 5) * 100));
    const status =
      activeJobsCount >= 5 ? 'overloaded' : activeJobsCount >= 2 ? 'busy' : 'available';

    const latestJob = assignedRepairs[0];
    const currentTask = latestJob
      ? `${latestJob.deviceModel} (${latestJob.ticketNumber})`
      : undefined;

    return {
      employeeKey: tech.key || tech.id,
      name: tech.name,
      role: EMPLOYEE_ROLE_LABELS[tech.role] || tech.role,
      activeJobsCount,
      completedTodayCount,
      capacityPercentage,
      currentTask,
      status,
    };
  });

  // -----------------------------------------------------------------------
  // 7. Fast-Moving Products Today
  // -----------------------------------------------------------------------
  const productSalesMap = new Map<
    string,
    { quantity: number; item: (typeof todayInvoices)[0]['items'][0] }
  >();

  for (const inv of todayInvoices) {
    if (!inv.items) continue;
    for (const item of inv.items) {
      if (item.sourceType && item.sourceType !== 'retail') continue;
      const key = item.productId || item.name;
      const existing = productSalesMap.get(key);
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        productSalesMap.set(key, { quantity: item.quantity || 1, item });
      }
    }
  }

  const productLookup = new Map(products.map((p) => [p.id, p]));
  const fastMovingItems: FastMovingItem[] = Array.from(productSalesMap.entries())
    .map(([idOrName, { quantity, item }]) => {
      const matchedProd = productLookup.get(item.productId);
      return {
        productId: item.productId || idOrName,
        productKey: matchedProd?.key || item.productId || idOrName,
        name: matchedProd?.name || item.name,
        category: matchedProd?.category || item.category || 'Accessories',
        soldTodayUnits: quantity,
        remainingStock: matchedProd?.stockQuantity ?? 0,
        sellingPriceCents: matchedProd?.sellingPriceCents ?? item.unitPriceCents ?? 0,
        minThreshold: matchedProd?.minStockThreshold ?? 5,
      };
    })
    .sort((a, b) => b.soldTodayUnits - a.soldTodayUnits)
    .slice(0, 5);

  // -----------------------------------------------------------------------
  // 8. Live Activity Stream
  // -----------------------------------------------------------------------
  const activities: ActivityEvent[] = [];

  // Recent Sales
  for (const inv of invoices.slice(-10)) {
    activities.push({
      id: `sale-${inv.id}`,
      type: 'sale',
      title: `Sale Completed · ${inv.invoiceNumber}`,
      description: `Rs. ${((inv.totalCents || 0) / 100).toLocaleString()} (${inv.paymentMethod}) · Cashier: ${inv.cashierName || 'Staff'}`,
      amountCents: inv.totalCents,
      timeAgo: formatRelativeTime(inv.createdAt),
      icon: 'IconReceipt',
      color: 'blue',
      linkTo: '/invoices',
    });
  }

  // Recent Repair Tickets
  for (const rep of repairs.slice(-10)) {
    activities.push({
      id: `rep-${rep.id}`,
      type: 'repair_update',
      title: `Repair ${rep.status.toUpperCase()} · ${rep.ticketNumber}`,
      description: `${rep.deviceModel} · Customer: ${rep.customerName}`,
      amountCents: (rep.estimatedCostCents || 0) + (rep.materialCostCents || 0),
      timeAgo: formatRelativeTime(rep.createdAt),
      icon: 'IconHammer',
      color: 'teal',
      linkTo: '/repairs',
    });
  }

  // Recent Print Jobs
  for (const pj of printJobs.slice(-10)) {
    activities.push({
      id: `print-${pj.id}`,
      type: 'print_new',
      title: `Print Job · ${pj.ticketNumber}`,
      description: `${pj.jobType.toUpperCase()} (${pj.quantity} units) · Customer: ${pj.customerName}`,
      amountCents: pj.estimatedCostCents,
      timeAgo: formatRelativeTime(pj.createdAt),
      icon: 'IconPrinter',
      color: 'orange',
      linkTo: '/print-jobs',
    });
  }

  const recentActivities = activities.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 25);

  return {
    lastRefreshed: new Date().toISOString(),
    kpis,
    urgentActions,
    repairPipeline,
    printPipeline,
    technicians,
    fastMovingItems,
    recentActivities,
    shiftSummary,
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
  const invoicesQuery = useAllInvoices();
  const repairsQuery = useAllRepairs();
  const printJobsQuery = useAllPrintJobs();
  const productsQuery = useAllProducts();
  const employeesQuery = useAllEmployees();
  const remindersQuery = useReminders({ dueWithinDays: 7, limit: 100 });

  const data = useMemo(() => {
    const computed = computeDashboardData({
      invoices: invoicesQuery.data,
      repairs: repairsQuery.data,
      printJobs: printJobsQuery.data,
      products: productsQuery.data,
      employees: employeesQuery.data,
    });
    return {
      ...computed,
      urgentActions: [
        ...toReminderItems(remindersQuery.data?.reminders),
        ...computed.urgentActions,
      ],
    };
  }, [
    invoicesQuery.data,
    repairsQuery.data,
    printJobsQuery.data,
    productsQuery.data,
    employeesQuery.data,
    remindersQuery.data,
  ]);

  const isLoading =
    invoicesQuery.isLoading ||
    repairsQuery.isLoading ||
    printJobsQuery.isLoading ||
    productsQuery.isLoading ||
    employeesQuery.isLoading;

  const error =
    invoicesQuery.error ||
    repairsQuery.error ||
    printJobsQuery.error ||
    productsQuery.error ||
    employeesQuery.error ||
    remindersQuery.error;

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }),
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
