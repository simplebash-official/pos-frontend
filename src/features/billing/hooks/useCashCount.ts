import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import { calcCashCount } from '../api/calcApi';
import type { CalcCashCountReply } from '../types';

/** The server's total (and each note's subtotal) for a count of notes and coins. */
export const useCashCount = (
  counts: Record<string, number>,
  enabled?: boolean
): LiveCalc<CalcCashCountReply> => useCalc('cash-count', { counts }, calcCashCount, enabled);
