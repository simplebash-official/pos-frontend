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
