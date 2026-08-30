// API response shapes for the Analytics & Reports section. These mirror the
// backend's `src/domain/reports.rs` DTOs (camelCase, money as integer cents,
// dates as ISO strings). `*Bps` fields are basis points (1% = 100).

// ---------------------------------------------------------------------------
// Employee commissions (existing — used by the Staff tab)
// ---------------------------------------------------------------------------

/** One employee/technician's job performance and commission for the period. */
export interface EmployeePerformanceEntry {
  /** Absent for the "unassigned" bucket. */
  employeeKey?: string;
  employeeName: string;
  role: string;
  assignedJobsCount: number;
  revenueGeneratedCents: number;
  estimatedCostCents: number;
  profitCents: number;
  earnedCommissionCents: number;
  netShopContributionCents: number;
}

export interface EmployeeCommissionsReportResponse {
  employees: EmployeePerformanceEntry[];
  totalCommissionsCents: number;
  totalRevenueCents: number;
  totalJobsCount: number;
  periodStart: string;
  periodEnd: string;
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface PaymentMethodBreakdown {
  cashCents: number;
  cardCents: number;
  onlineCents: number;
  creditCents: number;
}

// ---------------------------------------------------------------------------
// /reports/analytics/summary
// ---------------------------------------------------------------------------

export interface AnalyticsKpis {
  totalRevenueCents: number;
  retailRevenueCents: number;
  repairRevenueCents: number;
  printRevenueCents: number;
  invoiceCount: number;
  itemsSold: number;
  avgBasketCents: number;
  discountCents: number;
  discountRateBps: number;
  retailCogsCents: number;
  serviceMaterialCostCents: number;
  grossProfitCents: number;
  grossMarginBps: number;
  commissionPayoutsCents: number;
  refundsCents: number;
  refundRateBps: number;
  netProfitCents: number;
  cogsCoverageBps: number;
}

export interface AnalyticsKpiDeltas {
  totalRevenueBps: number | null;
  grossProfitBps: number | null;
  netProfitBps: number | null;
  invoiceCountBps: number | null;
  avgBasketBps: number | null;
  grossMarginDeltaBps: number;
}

export interface AnalyticsSummaryResponse {
  periodStart: string;
  periodEnd: string;
  current: AnalyticsKpis;
  previous: AnalyticsKpis | null;
  deltas: AnalyticsKpiDeltas | null;
}

// ---------------------------------------------------------------------------
// /reports/analytics/timeseries
// ---------------------------------------------------------------------------

export interface TimeSeriesPoint {
  periodStart: string;
  label: string;
  revenueCents: number;
  retailRevenueCents: number;
  repairRevenueCents: number;
  printRevenueCents: number;
  discountCents: number;
  cogsCents: number;
  grossProfitCents: number;
  grossMarginBps: number;
  commissionCents: number;
  netProfitCents: number;
  invoiceCount: number;
}

export interface TimeSeriesResponse {
  granularity: string;
  periodStart: string;
  periodEnd: string;
  points: TimeSeriesPoint[];
  totals: TimeSeriesPoint;
}

// ---------------------------------------------------------------------------
// /reports/analytics/payment-methods
// ---------------------------------------------------------------------------

export interface AnalyticsPaymentMethodsResponse {
  periodStart: string;
  periodEnd: string;
  breakdown: PaymentMethodBreakdown;
  totalCents: number;
}

// ---------------------------------------------------------------------------
// /reports/analytics/top-customers
// ---------------------------------------------------------------------------

export interface TopCustomerEntry {
  customerKey?: string;
  customerName: string;
  customerPhone?: string;
  isWalkIn: boolean;
  invoiceCount: number;
  revenueCents: number;
  discountCents: number;
  grossProfitCents: number;
  outstandingCents: number;
  lastPurchaseAt: string;
}

export interface TopCustomersResponse {
  customers: TopCustomerEntry[];
  totalCustomers: number;
  totalRevenueCents: number;
}

// ---------------------------------------------------------------------------
// /reports/analytics/sales-by-category
// ---------------------------------------------------------------------------

export interface CategorySalesRow {
  categoryKey?: string;
  categoryName: string;
  subcategoryKey?: string;
  subcategoryName?: string;
  unitsSold: number;
  revenueCents: number;
  discountCents: number;
  cogsCents: number;
  grossProfitCents: number;
  grossMarginBps: number;
}

export interface SalesByCategoryResponse {
  rows: CategorySalesRow[];
  uncategorised: CategorySalesRow;
  totalRevenueCents: number;
  totalGrossProfitCents: number;
}

// ---------------------------------------------------------------------------
// /reports/analytics/cashier-performance
// ---------------------------------------------------------------------------

export interface CashierPerformanceEntry {
  cashierId: string;
  cashierName: string;
  invoiceCount: number;
  revenueCents: number;
  retailRevenueCents: number;
  itemsSold: number;
  discountGivenCents: number;
  discountRateBps: number;
  avgBasketCents: number;
  creditInvoiceCount: number;
  refundCount: number;
  refundedCents: number;
  grossProfitCents: number;
}

export interface CashierPerformanceResponse {
  cashiers: CashierPerformanceEntry[];
  totalRevenueCents: number;
  totalInvoices: number;
}

// ---------------------------------------------------------------------------
// /reports/analytics/sales-patterns
// ---------------------------------------------------------------------------

export interface PatternCell {
  weekday: number; // 1 = Mon .. 7 = Sun
  hour: number; // 0..23
  invoiceCount: number;
  revenueCents: number;
}

export interface PatternBucket {
  bucket: number;
  label: string;
  invoiceCount: number;
  revenueCents: number;
}

export interface SalesPatternsResponse {
  periodStart: string;
  periodEnd: string;
  cells: PatternCell[];
  byWeekday: PatternBucket[];
  byHour: PatternBucket[];
  busiest: PatternCell;
}

// ---------------------------------------------------------------------------
// /reports/analytics/receivables-aging
// ---------------------------------------------------------------------------

export interface AgingBucket {
  label: string;
  minDays: number;
  maxDays?: number;
  invoiceCount: number;
  amountCents: number;
}

export interface AgingDebtor {
  customerKey?: string;
  customerName: string;
  customerPhone?: string;
  outstandingCents: number;
  oldestDays: number;
  invoiceCount: number;
}

export interface ReceivablesAgingResponse {
  asOf: string;
  buckets: AgingBucket[];
  totalOutstandingCents: number;
  totalInvoices: number;
  topDebtors: AgingDebtor[];
}

// ---------------------------------------------------------------------------
// /reports/analytics/discounts
// ---------------------------------------------------------------------------

export interface DiscountTypeRow {
  discountType: string;
  invoiceCount: number;
  discountCents: number;
}

export interface DiscountCashierRow {
  cashierId: string;
  cashierName: string;
  discountCents: number;
  revenueCents: number;
  discountRateBps: number;
}

export interface DiscountProductRow {
  productKey?: string;
  name: string;
  discountCents: number;
  unitsSold: number;
}

export interface DiscountAnalyticsResponse {
  periodStart: string;
  periodEnd: string;
  totalDiscountCents: number;
  grossBeforeDiscountCents: number;
  discountRateBps: number;
  invoicesWithDiscount: number;
  invoiceCount: number;
  orderLevelDiscountCents: number;
  lineLevelDiscountCents: number;
  byType: DiscountTypeRow[];
  byCashier: DiscountCashierRow[];
  topDiscountedProducts: DiscountProductRow[];
}

// ---------------------------------------------------------------------------
// /reports/analytics/refunds
// ---------------------------------------------------------------------------

export interface RefundReasonRow {
  reason: string;
  creditNoteItemCount: number;
  amountCents: number;
}

export interface RefundMethodRow {
  method: string;
  amountCents: number;
}

export interface RefundProductRow {
  productKey?: string;
  name: string;
  quantity: number;
  amountCents: number;
}

export interface RefundAnalyticsResponse {
  periodStart: string;
  periodEnd: string;
  creditNoteCount: number;
  netRefundCents: number;
  refundCashCents: number;
  balanceReductionCents: number;
  refundRateBps: number;
  exchangeCount: number;
  noReceiptCount: number;
  managerOverrideCount: number;
  byReason: RefundReasonRow[];
  byMethod: RefundMethodRow[];
  topReturnedProducts: RefundProductRow[];
}

// ---------------------------------------------------------------------------
// Existing endpoints reused by the UI
// ---------------------------------------------------------------------------

/** `GET /reports/daily-sales` */
export interface DailySalesReportSummary {
  date: string;
  grossSalesCents: number;
  discountCents: number;
  totalSalesCents: number;
  totalInvoices: number;
  repairRevenueCents: number;
  printRevenueCents: number;
  retailRevenueCents: number;
  paymentMethods: PaymentMethodBreakdown;
}

export interface DailySalesReportResponse {
  summaries: DailySalesReportSummary[];
  totalSalesCents: number;
  totalInvoices: number;
  totalRepairRevenueCents: number;
  totalPrintRevenueCents: number;
  totalRetailRevenueCents: number;
  totalDiscountsCents: number;
  paymentMethods: PaymentMethodBreakdown;
}

/** `GET /reports/top-products` */
export interface TopProductEntry {
  productKey?: string;
  name: string;
  sku?: string;
  sourceType: string;
  unitsSold: number;
  totalRevenueCents: number;
  totalDiscountCents: number;
}

export interface TopProductsResponse {
  products: TopProductEntry[];
  totalUnitsSold: number;
  totalRevenueCents: number;
}

/** `GET /reports/outstanding` */
export interface OutstandingInvoiceEntry {
  id: string;
  key: string;
  invoiceNumber: string;
  customerKey?: string;
  customerName?: string;
  customerPhone?: string;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
  dueDate?: string;
  isOverdue: boolean;
  createdAt: string;
}

export interface OutstandingReceivablesResponse {
  totalOutstandingCents: number;
  totalCreditInvoicesCount: number;
  overdueInvoicesCount: number;
  overdueAmountCents: number;
  invoices: OutstandingInvoiceEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** `GET /reports/inventory-valuation` */
export interface CategoryValuationEntry {
  categoryKey: string;
  categoryName: string;
  productCount: number;
  totalUnits: number;
  costValuationCents: number;
  retailValuationCents: number;
  potentialProfitCents: number;
}

export interface InventoryValuationResponse {
  totalProductsCount: number;
  totalStockUnits: number;
  totalCostValuationCents: number;
  totalRetailValuationCents: number;
  potentialGrossProfitCents: number;
  potentialMarginPercentage: number;
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
  categories: CategoryValuationEntry[];
}
