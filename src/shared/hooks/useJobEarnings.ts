import { useMemo } from 'react';
import type { LiveCalc } from '@/shared/hooks/useCalc';
import type { ApiError } from '@/shared/types/common';
import { toCents } from '@/shared/lib/money';
import { calc_earnings, type CalcEarningsReply } from '@/wasm';

export interface CalcEarningsRequest {
  /** `null` until a price is typed. */
  priceCents: number | null;
  materialCostCents: number;
  /** `null` when no employee is assigned. */
  splitType: 'percentage' | 'fixed' | null;
  /** A percent (0-100) or, for a fixed split, cents. */
  splitValue: number;
}

export type { CalcEarningsReply };

/** The assigned employee's split as the calculator wants it (a fixed amount becomes cents). */
export const toSplit = (values: {
  assignedEmployeeId?: string;
  splitType?: 'percentage' | 'fixed';
  splitValueRupeesOrPercent?: number | string;
}): Pick<CalcEarningsRequest, 'splitType' | 'splitValue'> => {
  const assigned =
    values.assignedEmployeeId !== undefined &&
    values.assignedEmployeeId !== '' &&
    values.splitType !== undefined;
  const typed = Number(values.splitValueRupeesOrPercent);
  return {
    splitType: assigned ? (values.splitType as 'percentage' | 'fixed') : null,
    splitValue: Number.isFinite(typed)
      ? values.splitType === 'fixed'
        ? toCents(typed)
        : typed
      : 0,
  };
};

/** The job's profit and the assigned employee's commission, worked out via WASM. */
export const useJobEarnings = (request: CalcEarningsRequest): LiveCalc<CalcEarningsReply> => {
  return useMemo(() => {
    try {
      const data = calc_earnings({
        priceCents: request.priceCents ?? undefined,
        materialCostCents: request.materialCostCents,
        splitType: request.splitType ?? undefined,
        splitValue: request.splitValue,
      });
      return {
        data,
        isCurrent: true,
        error: null,
      };
    } catch (err) {
      return {
        data: undefined,
        isCurrent: false,
        error: err as ApiError,
      };
    }
  }, [request.priceCents, request.materialCostCents, request.splitType, request.splitValue]);
};
