export interface DailySalesReportSummary {
  date: string;
  totalSalesCents: number;
  totalInvoices: number;
  repairRevenueCents: number;
  printRevenueCents: number;
  retailRevenueCents: number;
}

/** One employee/technician's job performance and commission for the report period. */
export interface EmployeePerformanceEntry {
  /** Absent for the "unassigned" bucket — no real employee to key by. */
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
