import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  cloudLinkStart,
  cloudLoginAndLink,
  cloudRegister,
  cloudSetTelemetry,
  cloudUnlink,
  getCloudState,
  type CloudCommandError,
} from '../api/accountApi';
import type { CloudState, LoginPayload, PendingLink, RegisterPayload, RegisterResult } from '../types';
import { DISABLED_CLOUD_STATE } from '../types';

/** Cloud link state from the desktop shell. Disabled (and inert) on web. */
export const useCloudState = () => {
  const query = useQuery<CloudState>({
    queryKey: queryKeys.cloud.state(),
    queryFn: getCloudState,
    staleTime: 5_000,
  });
  return { ...query, state: query.data ?? DISABLED_CLOUD_STATE };
};

const useCloudStateWriter = () => {
  const queryClient = useQueryClient();
  return (state: CloudState) => queryClient.setQueryData(queryKeys.cloud.state(), state);
};

export const useCloudRegister = () =>
  useMutation<RegisterResult, CloudCommandError, RegisterPayload>({ mutationFn: cloudRegister });

export const useCloudLogin = () => {
  const write = useCloudStateWriter();
  return useMutation<CloudState, CloudCommandError, LoginPayload>({
    mutationFn: cloudLoginAndLink,
    onSuccess: write,
  });
};

export const useCloudLinkStart = () => {
  const queryClient = useQueryClient();
  return useMutation<PendingLink, CloudCommandError, void>({
    mutationFn: cloudLinkStart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cloud.state() }),
  });
};

export const useCloudUnlink = () => {
  const write = useCloudStateWriter();
  return useMutation<CloudState, CloudCommandError, void>({
    mutationFn: cloudUnlink,
    onSuccess: write,
  });
};

export const useCloudTelemetry = () => {
  const write = useCloudStateWriter();
  return useMutation<CloudState, CloudCommandError, boolean>({
    mutationFn: cloudSetTelemetry,
    onSuccess: write,
  });
};
