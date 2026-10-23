import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { listAccounts, setAccountOpening } from '../api/accountsApi';
import type { AccountKind, SetAccountOpeningInput } from '../types';

export const useAccounts = () =>
  useQuery({ queryKey: queryKeys.accounts.list(), queryFn: listAccounts });

export const useSetAccountOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      kind,
      input,
    }: {
      kind: Exclude<AccountKind, 'drawer'>;
      input: SetAccountOpeningInput;
    }) => setAccountOpening(kind, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};
