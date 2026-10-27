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
  | 'credit_due_soon'
  | 'quotation_stock_needed'
  | 'quotation_ready_to_fill';

export interface UrgentActionItem {
  id: string;
  type: UrgentItemType;
  title: string;
  subtitle: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  rawDate?: string;
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
  productKey: string | null;
  name: string;
  /** The product's own figures are `null` when the product no longer exists. */
  category: string | null;
  soldTodayUnits: number;
  remainingStock: number | null;
  sellingPriceCents: number;
  minThreshold: number | null;
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

/** The server's grouping of the shop's records (`GET /reports/dashboard-pulse`). */
export interface DashboardPulseReply {
  activeRepairsCount: number;
  readyRepairsCount: number;
  uncollectedReadyValueCents: number;
  activePrintJobsCount: number;
  repairPipeline: PulseStage[];
  printPipeline: PulseStage[];
  technicians: PulseTechnician[];
  fastMovers: PulseFastMover[];
  lowStock: PulseLowStock[];
  readyRepairs: PulseReadyRepair[];
  recentActivity: PulseActivity[];
  pendingStockQuotations?: PulseQuotation[];
}

export interface PulseQuotationItem {
  productKey: string | null;
  name: string;
  sku: string | null;
  quotedQuantity: number;
  currentStockQuantity: number;
  unitPriceCents: number;
  hasSufficientStock: boolean;
}

export interface PulseQuotation {
  key: string;
  quotationNumber: string;
  customerName: string;
  customerPhone: string | null;
  totalCents: number;
  createdAt: string;
  validUntil: string;
  items: PulseQuotationItem[];
  isReadyToFill: boolean;
}

export interface PulseStage {
  stage: string;
  count: number;
  percent: number;
}

export interface PulseTechnician {
  employeeKey: string;
  name: string;
  role: 'technician' | 'printer';
  activeJobsCount: number;
  completedTodayCount: number;
  capacityPercent: number;
  status: 'available' | 'busy' | 'overloaded';
  currentDeviceModel: string | null;
  currentTicketNumber: string | null;
}

export interface PulseFastMover {
  productKey: string | null;
  name: string;
  soldTodayUnits: number;
  sellingPriceCents: number;
  category: string | null;
  remainingStock: number | null;
  minThreshold: number | null;
}

export interface PulseLowStock {
  productId: string;
  reference: string;
  name: string;
  stockQuantity: number;
  threshold: number;
  outOfStock: boolean;
  updatedAt: string;
  daysSinceUpdate: number;
}

export interface PulseReadyRepair {
  id: string;
  ticketNumber: string;
  deviceModel: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  daysWaiting: number;
  severity: 'critical' | 'warning';
  amountCents: number;
}

export interface PulseActivity {
  kind: 'sale' | 'repair' | 'print';
  id: string;
  reference: string;
  amountCents: number;
  createdAt: string;
  paymentMethod: string | null;
  cashierName: string | null;
  status: string | null;
  deviceModel: string | null;
  customerName: string | null;
  jobType: string | null;
  quantity: number | null;
}
