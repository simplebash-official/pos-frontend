export interface DashboardPulseKpis {
  todaySalesCents: number;
  todayInvoicesCount: number;
  avgBasketCents: number;
  activeRepairsCount: number;
  readyRepairsCount: number;
  uncollectedReadyValueCents: number;
  activePrintJobsCount: number;
  cashDrawerBalanceCents: number;
  openingFloatCents: number;
  cashSalesCents: number;
  cardSalesCents: number;
  onlineSalesCents: number;
  creditSalesCents: number;
}

export type UrgentItemType =
  | 'stockout'
  | 'pending_approval'
  | 'overdue_repair'
  | 'due_soon_job'
  | 'uncollected'
  | 'credit_overdue'
  | 'credit_due_soon';

export interface UrgentActionItem {
  id: string;
  type: UrgentItemType;
  title: string;
  subtitle: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  referenceId: string;
  referenceKey?: string;
  customerName?: string;
  customerPhone?: string;
  amountCents?: number;
  daysWaiting?: number;
  actionLabel: string;
  linkTo?: string;
}

export interface PipelineStageCount {
  stage: string;
  label: string;
  count: number;
  color: string;
  percentage?: number;
}

export interface TechnicianWorkload {
  employeeKey: string;
  name: string;
  role: string;
  activeJobsCount: number;
  completedTodayCount: number;
  capacityPercentage: number; // 0 to 100
  currentTask?: string;
  status: 'available' | 'busy' | 'overloaded';
}

export interface FastMovingItem {
  productId: string;
  productKey: string;
  name: string;
  category: string;
  soldTodayUnits: number;
  remainingStock: number;
  sellingPriceCents: number;
  minThreshold: number;
}

export interface ActivityEvent {
  id: string;
  type: 'sale' | 'repair_update' | 'print_new' | 'stock_alert';
  title: string;
  description: string;
  amountCents?: number;
  timeAgo: string;
  icon: string;
  color: string;
  linkTo: string;
}

export interface CashDrawerShiftSummary {
  openingFloatCents: number;
  cashSalesCents: number;
  cardSalesCents: number;
  onlineSalesCents: number;
  creditSalesCents: number;
  cashOutCents: number;
  expectedDrawerCashCents: number;
}

export interface DashboardData {
  kpis: DashboardPulseKpis;
  urgentActions: UrgentActionItem[];
  repairPipeline: PipelineStageCount[];
  printPipeline: PipelineStageCount[];
  technicians: TechnicianWorkload[];
  fastMovingItems: FastMovingItem[];
  recentActivities: ActivityEvent[];
  shiftSummary: CashDrawerShiftSummary;
  lastRefreshed: string;
}
