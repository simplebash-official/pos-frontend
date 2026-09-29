import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser, selectIsAuthInitialized } from '@/store/slices/authSlice';
import { getSetupStatusApi, initializeSetupApi } from '../api/onboardingApi';
import type { SetupSystemPayload, SetupSystemResult, SetupStatus } from '../types';

/**
 * Setup status for whoever is signed in. In multi-tenant mode the backend can
 * only answer for a shop once it sees that shop's token — asked anonymously
 * (e.g. from the login page) it reports "not set up". So the cache is keyed by
 * the signed-in user and waits for the session restore; otherwise the guest
 * answer would be reused after login and send a set-up shop to /welcome.
 */
export const useSetupStatus = () => {
  const user = useAppSelector(selectAuthUser);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const scope = user ? user.id : 'guest';

  return useQuery<SetupStatus>({
    queryKey: queryKeys.system.setupStatus(scope),
    queryFn: getSetupStatusApi,
    enabled: isInitialized,
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
