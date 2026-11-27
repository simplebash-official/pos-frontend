import { useCallback, useEffect, useMemo } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchCustomerById } from '@/features/customers/api/customersApi';
import type { Customer } from '@/features/customers/types';
import { fetchPrintJob } from '@/features/print-jobs/api/printJobsApi';
import { fetchRepairJob } from '@/features/repairs/api/repairsApi';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { notify } from '@/shared/notify';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  confirmBillTo,
  selectBillToConfirmation,
  selectCartItems,
  selectCompletedSale,
  type CartItem,
} from '@/store/slices/cartSlice';
import { jobOwners, ownerState, type JobOwner, type TicketOwner } from '../lib/billTo';
import { isTicketLine } from '../lib/handover';
import { useCartCustomer } from './useCart';

/** `none`: no job is on the bill. `loading` and `error` hold payment: the owners are unknown. */
export type BillToStatus = 'none' | 'loading' | 'error' | 'ready';

const ticketQuery = (line: CartItem) =>
  line.sourceType === 'repair'
    ? {
        queryKey: queryKeys.repairs.detail(line.productId),
        queryFn: (): Promise<TicketOwner> => fetchRepairJob(line.productId),
      }
    : {
        queryKey: queryKeys.printJobs.detail(line.productId),
        queryFn: (): Promise<TicketOwner> => fetchPrintJob(line.productId),
      };

/** The customer's record is read fresh each time it goes on a bill: the balance must be today's. */
const customerQuery = (key: string) => ({
  queryKey: queryKeys.customers.detail(key),
  queryFn: () => fetchCustomerById(key),
  staleTime: 0,
  gcTime: 0,
});

/**
 * Who the jobs on the bill belong to, how each stands against the customer being billed, and the
 * ways to answer. A bill with no customer takes the first job's, unless the cashier chose a
 * walk-in (`useAttachJobCustomer` does that attaching, once, from the billing counter).
 */
export const useBillTo = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const items = useAppSelector(selectCartItems);
  const completedSale = useAppSelector(selectCompletedSale);
  const confirmation = useAppSelector(selectBillToConfirmation);
  const { customerId, customerName, attachCustomer } = useCartCustomer();

  // Newest lines are listed first; owners are read in the order their jobs were added.
  const lines = useMemo(
    () => (completedSale ? [] : items.filter(isTicketLine).reverse()),
    [items, completedSale]
  );
  const tickets = useQueries({ queries: lines.map(ticketQuery) });

  const loaded = tickets.flatMap((query) => (query.data === undefined ? [] : [query.data]));
  const allLoaded = loaded.length === lines.length;
  const owners = allLoaded ? jobOwners(loaded) : [];

  const walkInChosen = confirmation !== undefined && confirmation.billCustomerKey === null;
  const takesFirstOwner =
    owners.length > 0 && customerId === null && customerName === null && !walkInChosen;
  const firstOwner = useQuery({
    ...customerQuery(takesFirstOwner ? owners[0].key : ''),
    enabled: takesFirstOwner,
  });

  const failed = tickets.some((query) => query.isError) || (takesFirstOwner && firstOwner.isError);
  let status: BillToStatus = 'ready';
  if (lines.length === 0) status = 'none';
  else if (failed) status = 'error';
  else if (!allLoaded || takesFirstOwner) status = 'loading';

  const stateOf = (ownerKey: string) => ownerState(ownerKey, customerId, confirmation);
  const unanswered =
    status === 'ready' ? owners.filter((owner) => stateOf(owner.key) === 'unanswered') : [];

  const ownerOfLine = (lineId: string): JobOwner | undefined => {
    const index = lines.findIndex((line) => line.id === lineId);
    const key = index === -1 ? undefined : tickets[index].data?.customerKey;
    return owners.find((owner) => owner.key === key);
  };

  /** The owner the server must be told was confirmed for this line; absent when not needed. */
  const confirmedKeyOfLine = (lineId: string) => {
    const owner = ownerOfLine(lineId);
    return owner !== undefined && stateOf(owner.key) === 'confirmed' ? owner.key : undefined;
  };

  const attach = useCallback(
    (customer: Customer) =>
      attachCustomer(
        customer.key,
        customer.name,
        customer.primaryPhone,
        customer.address,
        customer.outstandingBalanceCents
      ),
    [attachCustomer]
  );

  const ownerKeys = owners.map((owner) => owner.key);

  /** Bill the customer already named, and let them pay for every job here. */
  const keepPayer = () => dispatch(confirmBillTo(ownerKeys));

  /** Bill one of the job owners. */
  const billOwner = async (key: string) => {
    try {
      attach(await queryClient.fetchQuery(customerQuery(key)));
      dispatch(confirmBillTo(ownerKeys));
    } catch (error) {
      notify.error({ title: t('Could not choose the customer'), message: getErrorMessage(error) });
    }
  };

  const retry = () => {
    tickets.filter((query) => query.isError).forEach((query) => void query.refetch());
    if (firstOwner.isError) void firstOwner.refetch();
  };

  return {
    status,
    owners,
    unanswered,
    /** True while payment must wait for the bill-to question. */
    blocked: status === 'loading' || status === 'error' || unanswered.length > 0,
    stateOf,
    ownerOfLine,
    confirmedKeyOfLine,
    keepPayer,
    billOwner,
    retry,
    /** The customer the bill should take by itself, once it has arrived. */
    arrivingCustomer: takesFirstOwner ? firstOwner.data : undefined,
    attach,
  };
};

export type BillTo = ReturnType<typeof useBillTo>;

/** Puts the first job's customer on a bill that names nobody. Used once, by the billing counter. */
export const useAttachJobCustomer = ({ arrivingCustomer, attach }: BillTo) => {
  useEffect(() => {
    if (arrivingCustomer !== undefined) attach(arrivingCustomer);
  }, [arrivingCustomer, attach]);
};
