import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { getSetupStatusApi, initializeSetupApi } from '../api/onboardingApi';
import type { SetupSystemPayload, SetupSystemResult, SetupStatus } from '../types';

export const useSetupStatus = () => {
  return useQuery<SetupStatus>({
    queryKey: queryKeys.system.setupStatus(),
    queryFn: getSetupStatusApi,
    staleTime: 10_000,
    retry: 2,
  });
};

export const useInitializeSetup = () => {
  const queryClient = useQueryClient();

  return useMutation<SetupSystemResult, Error, SetupSystemPayload>({
    mutationFn: initializeSetupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.system.all });
    },
  });
};
