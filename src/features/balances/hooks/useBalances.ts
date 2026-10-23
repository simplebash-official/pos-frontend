import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  getStaffAdvance,
  listStaffAdvances,
  listSupplierBalances,
  recoverAdvance,
  setBalanceOpening,
} from '../api/balancesApi';
import type { BalanceSubject, CreateAdvanceRecoveryInput, SetBalanceOpeningInput } from '../types';

export const useSupplierBalances = () =>
  useQuery({ queryKey: queryKeys.balances.suppliers(), queryFn: listSupplierBalances });

export const useStaffAdvances = () =>
  useQuery({ queryKey: queryKeys.balances.staff(), queryFn: listStaffAdvances });

/** One staff member's advances and recoveries; waits until a key is given. */
export const useStaffAdvanceDetail = (employeeKey: string | null) =>
  useQuery({
    queryKey: queryKeys.balances.staffDetail(employeeKey),
    queryFn: () => getStaffAdvance(employeeKey as string),
    enabled: employeeKey !== null,
  });

export const useSetBalanceOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subject,
      key,
      input,
    }: {
      subject: BalanceSubject;
      key: string;
      input: SetBalanceOpeningInput;
    }) => setBalanceOpening(subject, key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
    },
  });
};

export const useRecoverAdvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeKey,
      input,
    }: {
      employeeKey: string;
      input: CreateAdvanceRecoveryInput;
    }) => recoverAdvance(employeeKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances.all });
    },
  });
};
