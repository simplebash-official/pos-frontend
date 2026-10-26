import { apiClient } from '@/api/client';
import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import { toCents } from '@/shared/lib/money';
import type { ApiResponse } from '@/shared/types/common';

export interface CalcEarningsRequest {
  /** `null` until a price is typed. */
  priceCents: number | null;
  materialCostCents: number;
  /** `null` when no employee is assigned. */
  splitType: 'percentage' | 'fixed' | null;
  /** A percent (0-100) or, for a fixed split, cents. */
  splitValue: number;
}

export interface CalcEarningsReply {
  priceEntered: boolean;
  profitCents: number;
  commissionCents: number;
  /** A fixed commission bigger than the profit, cut down to the profit. */
  capped: boolean;
  shopKeepsCents: number;
}

const calcEarnings = async (
  request: CalcEarningsRequest,
  signal: AbortSignal
): Promise<CalcEarningsReply> => {
  const response = await apiClient.post<ApiResponse<CalcEarningsReply>>('/calc/earnings', request, {
    signal,
  });
  return response.data;
};

/** A job form's typed values as the calculator wants them (rupee boxes become cents here, nothing else). */
export const toEarningsRequest = (values: {
  estimatedPriceRupees: number | string;
  materialCostRupees: number | string;
  assignedEmployeeId?: string;
  splitType?: 'percentage' | 'fixed';
  splitValueRupeesOrPercent?: number | string;
}): CalcEarningsRequest => {
  const assigned =
    values.assignedEmployeeId !== undefined &&
    values.assignedEmployeeId !== '' &&
    values.splitType !== undefined;
  const typed = Number(values.splitValueRupeesOrPercent);
  return {
    priceCents:
      values.estimatedPriceRupees === '' ? null : toCents(Number(values.estimatedPriceRupees)),
    materialCostCents:
      values.materialCostRupees === '' ? 0 : toCents(Number(values.materialCostRupees)),
    splitType: assigned ? (values.splitType as 'percentage' | 'fixed') : null,
    splitValue: Number.isFinite(typed)
      ? values.splitType === 'fixed'
        ? toCents(typed)
        : typed
      : 0,
  };
};

/** The job's profit and the assigned employee's commission, worked out by the server. */
export const useJobEarnings = (request: CalcEarningsRequest): LiveCalc<CalcEarningsReply> =>
  useCalc('earnings', request, calcEarnings);
