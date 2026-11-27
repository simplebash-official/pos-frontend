import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchCustomerPrintJobs } from '@/features/print-jobs/api/printJobsApi';
import { fetchCustomerRepairs } from '@/features/repairs/api/repairsApi';
import { customerJobs } from '../lib/customerJob';

/**
 * Every repair and print job of one customer, the newest first. Pass `null` to wait. The list is
 * only shown once both kinds have arrived, so it never reads as complete while half of it is
 * missing.
 */
export const useCustomerJobs = (customerKey: string | null) => {
  const enabled = customerKey !== null;
  const repairs = useQuery({
    queryKey: queryKeys.repairs.list({ customerKey }),
    queryFn: () => fetchCustomerRepairs(customerKey as string),
    enabled,
  });
  const printJobs = useQuery({
    queryKey: queryKeys.printJobs.list({ customerKey }),
    queryFn: () => fetchCustomerPrintJobs(customerKey as string),
    enabled,
  });

  const jobs = useMemo(
    () =>
      repairs.data === undefined || printJobs.data === undefined
        ? undefined
        : customerJobs(repairs.data, printJobs.data),
    [repairs.data, printJobs.data]
  );

  return {
    /** `undefined` until both lists have arrived. */
    jobs,
    isLoading: enabled && (repairs.isLoading || printJobs.isLoading),
    isError: enabled && (repairs.isError || printJobs.isError),
    retry: () => {
      void repairs.refetch();
      void printJobs.refetch();
    },
  };
};
