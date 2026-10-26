import type { QueryClient } from '@tanstack/react-query';
import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import { calcInvoiceBalance } from '../api/calcApi';
import type { CalcInvoiceBalanceReply } from '../types';

const KEY = ['calc', 'invoice-balance'] as const;

/** What the customer has paid on an invoice and still owes, worked out by the server. */
export const useInvoiceBalance = (
  invoiceKey: string,
  enabled: boolean
): LiveCalc<CalcInvoiceBalanceReply> =>
  useCalc('invoice-balance', { invoiceKey }, calcInvoiceBalance, enabled);

/** Call after anything that changes an invoice's payments or returns, so the balance is asked again. */
export const invalidateInvoiceBalance = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: KEY });
