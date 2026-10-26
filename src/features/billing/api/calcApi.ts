import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import type {
  CalcInvoiceBalanceReply,
  CalcInvoiceBalanceRequest,
  CalcCashCountReply,
  CalcCashCountRequest,
  CalcCashMovementReply,
  CalcCashMovementRequest,
  CalcShiftCountReply,
  CalcShiftCountRequest,
  CalcShiftTotalsReply,
  CalcShiftTotalsRequest,
  CalcCheckoutReply,
  CalcCheckoutRequest,
  CalcCreditNoteReply,
  CalcCreditNoteRequest,
} from '../types';

/** Every figure for the cart and its payment as they stand. Stores nothing. */
export const calcCheckout = async (
  request: CalcCheckoutRequest,
  signal: AbortSignal
): Promise<CalcCheckoutReply> => {
  const response = await apiClient.post<ApiResponse<CalcCheckoutReply>>('/calc/checkout', request, {
    signal,
  });
  return response.data;
};

/** What a return comes to, the refund, where it goes and whether the return window has passed. Stores nothing. */
export const calcCreditNote = async (
  request: CalcCreditNoteRequest,
  signal: AbortSignal
): Promise<CalcCreditNoteReply> => {
  const response = await apiClient.post<ApiResponse<CalcCreditNoteReply>>(
    '/calc/credit-note',
    request,
    { signal }
  );
  return response.data;
};

const post = async <Request, Reply>(
  path: string,
  request: Request,
  signal: AbortSignal
): Promise<Reply> => {
  const response = await apiClient.post<ApiResponse<Reply>>(path, request, { signal });
  return response.data;
};

/** What a drawer payment does to the drawer and what still stops it being saved. Stores nothing. */
export const calcCashMovement = (request: CalcCashMovementRequest, signal: AbortSignal) =>
  post<CalcCashMovementRequest, CalcCashMovementReply>('/calc/cash-movement', request, signal);

/** The total of a count of notes and coins. Stores nothing. */
export const calcCashCount = (request: CalcCashCountRequest, signal: AbortSignal) =>
  post<CalcCashCountRequest, CalcCashCountReply>('/calc/cash-count', request, signal);

/** A shift's counted cash against what the drawer should hold. Stores nothing. */
export const calcShiftCount = (request: CalcShiftCountRequest, signal: AbortSignal) =>
  post<CalcShiftCountRequest, CalcShiftCountReply>('/calc/shift-count', request, signal);

/** What has been paid on an invoice and what is still owed. Stores nothing. */
export const calcInvoiceBalance = (request: CalcInvoiceBalanceRequest, signal: AbortSignal) =>
  post<CalcInvoiceBalanceRequest, CalcInvoiceBalanceReply>(
    '/calc/invoice-balance',
    request,
    signal
  );

/** Totals over the shifts a list shows. Stores nothing. */
export const calcShiftTotals = async (
  request: CalcShiftTotalsRequest,
  signal: AbortSignal
): Promise<CalcShiftTotalsReply> => {
  const response = await apiClient.post<ApiResponse<CalcShiftTotalsReply>>(
    '/calc/shift-totals',
    request,
    { signal }
  );
  return response.data;
};
