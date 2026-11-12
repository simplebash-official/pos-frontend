import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createRepairJobRaw,
  deleteRepairsRaw,
  fetchRepairs,
  updateRepairJobRaw,
} from '../api/repairsApi';
import type { RepairJob, RepairJobInput } from '../types';

export interface UpdateRepairPayload {
  repairKey: string;
  input: Partial<RepairJobInput>;
}
export interface DeleteRepairsPayload {
  repairKeys: string[];
}

const NO_REPAIRS: RepairJob[] = [];

export const useAllRepairs = () => {
  const query = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: () => fetchRepairs(),
  });
  return { ...query, data: query.data ?? NO_REPAIRS };
};

export const useCreateRepairJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RepairJobInput) => createRepairJobRaw(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
    },
  });
};

export const useUpdateRepairJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repairKey, input }: UpdateRepairPayload) => updateRepairJobRaw(repairKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      // Handing back a warranty rework takes its parts out of stock.
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      // Handing a job back issues its work warranties, and a rework's parts are this month's
      // warranty cost on the warranty desk.
      void queryClient.invalidateQueries({ queryKey: queryKeys.warranties.all });
    },
  });
};

export const useDeleteRepairs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repairKeys }: DeleteRepairsPayload) => deleteRepairsRaw(repairKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
    },
  });
};
