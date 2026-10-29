import { useMemo } from 'react';
import type { LiveCalc } from '@/shared/hooks/useCalc';
import type { ApiError } from '@/shared/types/common';
import { calc_cash_count, type CalcCashCountReply } from '@/wasm';

/** The worked-out total (and each note's subtotal) for a count of notes and coins via WASM. */
export const useCashCount = (
  counts: Record<string, number>,
  enabled?: boolean
): LiveCalc<CalcCashCountReply> => {
  return useMemo(() => {
    if (enabled === false) {
      return { data: undefined, isCurrent: false, error: null };
    }
    try {
      const data = calc_cash_count({ counts: counts ?? {} });
      return { data, isCurrent: true, error: null };
    } catch (err) {
      return { data: undefined, isCurrent: false, error: err as ApiError };
    }
  }, [counts, enabled]);
};
