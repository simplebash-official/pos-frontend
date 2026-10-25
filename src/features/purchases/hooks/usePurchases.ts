import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createReceipt,
  createSupplierCredit,
  fetchCreditsBySupplier,
  fetchOpenReceipts,
  fetchPurchasesByProduct,
  fetchPurchasesBySupplier,
  fetchReceiptsBySupplier,
  voidSupplierCredit,
} from '../api/purchasesApi';
import { offerLabelPrint, type LabelPrintOffer } from '@/features/labels';
import type {
  CreateReceiptInput,
  CreateSupplierCreditInput,
  EnrichedStockPurchase,
  PurchaseReceipt,
  ReceiptLineInput,
  SupplierCredit,
} from '../types';

const NO_PURCHASES: EnrichedStockPurchase[] = [];
const NO_RECEIPTS: PurchaseReceipt[] = [];
const NO_CREDITS: SupplierCredit[] = [];

export const usePurchasesBySupplier = (supplierKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.purchases.bySupplier(supplierKey ?? ''),
    queryFn: () => fetchPurchasesBySupplier(supplierKey as string),
    enabled: Boolean(supplierKey),
  });
  return { ...query, data: query.data ?? NO_PURCHASES };
};

export const usePurchasesByProduct = (productKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.purchases.byProduct(productKey ?? ''),
    queryFn: () => fetchPurchasesByProduct(productKey as string),
    enabled: Boolean(productKey),
  });
  return { ...query, data: query.data ?? NO_PURCHASES };
};

/** Every receipt of one supplier, newest first, with what is paid and due on each. */
export const useReceiptsBySupplier = (supplierKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.receipts.bySupplier(supplierKey ?? ''),
    queryFn: () => fetchReceiptsBySupplier(supplierKey as string),
    enabled: Boolean(supplierKey),
  });
  return { ...query, data: query.data ?? NO_RECEIPTS };
};

/** The supplier's receipts that still have something to pay, oldest first (the order they are paid in). */
export const useOpenReceipts = (supplierKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.receipts.open(supplierKey ?? ''),
    queryFn: () => fetchOpenReceipts(supplierKey as string),
    enabled: Boolean(supplierKey),
  });
  return { ...query, data: query.data ?? NO_RECEIPTS };
};

export const useCreditsBySupplier = (supplierKey: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.supplierCredits.bySupplier(supplierKey ?? ''),
    queryFn: () => fetchCreditsBySupplier(supplierKey as string),
    enabled: Boolean(supplierKey),
  });
  return { ...query, data: query.data ?? NO_CREDITS };
};

/**
 * The labels offered for one received line: one per unit received at its selling
 * price, and for a serial product one for each unit received.
 */
export const labelOfferFor = (line: ReceiptLineInput): LabelPrintOffer => {
  const serialNumbers = line.serialNumbers ?? null;
  return {
    productKey: line.productKey,
    copies: serialNumbers === null ? line.quantity : 1,
    priceCents: line.sellingPriceCents,
    serialNumbers,
  };
};

/** What a receipt (or a payment against receipts) changes on screens that are already open. */
const useInvalidateMoney = () => {
  const queryClient = useQueryClient();
  return () => {
    for (const queryKey of [
      queryKeys.purchases.all,
      queryKeys.receipts.all,
      queryKeys.supplierCredits.all,
      queryKeys.balances.all,
      queryKeys.moneyReports.all,
      queryKeys.inventory.all,
      queryKeys.accounts.all,
      queryKeys.expenses.all,
      queryKeys.billing.sessions.all,
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  };
};

/**
 * Records a receipt: every line comes into stock and the payment, if any, is made, in one save.
 * Each line then offers to print its labels.
 */
export const useCreateReceipt = () => {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateReceiptInput) => createReceipt(input),
    onSuccess: (_receipt, variables) => {
      invalidate();
      for (const line of variables.lines) offerLabelPrint(labelOfferFor(line));
    },
  });
};

export const useCreateSupplierCredit = () => {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateSupplierCreditInput) => createSupplierCredit(input),
    onSuccess: invalidate,
  });
};

export const useVoidSupplierCredit = () => {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (key: string) => voidSupplierCredit(key),
    onSuccess: invalidate,
  });
};
