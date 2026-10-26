import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import { calcShiftTotals } from '../api/calcApi';
import type { CalcShiftTotalsReply } from '../types';

/** Totals over the listed shifts (cash sales, running count, net cash difference), worked out by the server. */
export const useShiftTotals = (
  sessionKeys: string[],
  enabled: boolean
): LiveCalc<CalcShiftTotalsReply> =>
  useCalc('shift-totals', { sessionKeys }, calcShiftTotals, enabled);
