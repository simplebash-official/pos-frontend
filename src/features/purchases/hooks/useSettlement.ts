import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import { calcSettlement } from '../api/purchasesApi';
import type { CalcSettlementReply, ReceiptSettlementInput } from '../types';

/** The server's count of a supplier payment against that supplier's open bills. */
export const useSettlement = (
  supplierKey: string,
  paymentCents: number,
  settlements: ReceiptSettlementInput[],
  enabled?: boolean
): LiveCalc<CalcSettlementReply> =>
  useCalc('settlement', { supplierKey, paymentCents, settlements }, calcSettlement, enabled);
