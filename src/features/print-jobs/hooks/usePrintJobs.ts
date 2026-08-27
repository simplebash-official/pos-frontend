import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createPrintJobRaw,
  deletePrintJobsRaw,
  fetchPrintJobs,
  updatePrintJobRaw,
} from '../api/printJobsApi';
import type { PrintJob, PrintJobInput } from '../types';

export interface UpdatePrintJobPayload {
  printJobKey: string;
  input: Partial<PrintJobInput>;
}
export interface DeletePrintJobsPayload {
  printJobKeys: string[];
}

const NO_PRINT_JOBS: PrintJob[] = [];

export const useAllPrintJobs = () => {
  const query = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: () => fetchPrintJobs(),
  });
  return { ...query, data: query.data ?? NO_PRINT_JOBS };
};

export const useCreatePrintJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrintJobInput) => createPrintJobRaw(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
    },
  });
};

export const useUpdatePrintJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ printJobKey, input }: UpdatePrintJobPayload) =>
      updatePrintJobRaw(printJobKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
    },
  });
};

export const useDeletePrintJobs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ printJobKeys }: DeletePrintJobsPayload) => deletePrintJobsRaw(printJobKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
    },
  });
};
