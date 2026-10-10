import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  cloudLinkCancel,
  cloudLinkStart,
  cloudListDevices,
  cloudLoginAndLink,
  cloudRegister,
  cloudRevokeDevice,
  cloudSetTelemetry,
  cloudUnlink,
  getCloudState,
  profileActivate,
  profilesList,
  type CloudCommandError,
} from '../api/accountApi';
import type {
  CloudState,
  DeviceInfo,
  LoginPayload,
  PendingLink,
  RegisterPayload,
  RegisterResult,
  ShopProfile,
} from '../types';
import { DISABLED_CLOUD_STATE } from '../types';
import { syncNow } from '@/features/sync-status/api/syncStatusApi';

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
    onSuccess: (data) => {
      write(data);
      void syncNow().catch(() => {});
    },
  });
};

export const useCloudLinkStart = () => {
  const queryClient = useQueryClient();
  return useMutation<PendingLink, CloudCommandError, void>({
    mutationFn: cloudLinkStart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cloud.state() }),
  });
};

/** Cancels a link request that is waiting for approval; a linked shop stays linked. */
export const useCloudLinkCancel = () => {
  const write = useCloudStateWriter();
  return useMutation<CloudState, CloudCommandError, void>({
    mutationFn: cloudLinkCancel,
    onSuccess: write,
  });
};

/** The shops stored on this computer. Enabled only when the cloud is (desktop shell). */
export const useProfiles = (enabled: boolean) =>
  useQuery<ShopProfile[], CloudCommandError>({
    queryKey: queryKeys.cloud.profiles(),
    queryFn: profilesList,
    enabled,
    staleTime: 5_000,
  });

/** Opens another stored shop. The app restarts by itself once this succeeds. */
export const useProfileActivate = () =>
  useMutation<void, CloudCommandError, string>({ mutationFn: profileActivate });

export const useCloudUnlink = () => {
  const write = useCloudStateWriter();
  return useMutation<CloudState, CloudCommandError, void>({
    mutationFn: cloudUnlink,
    onSuccess: write,
  });
};

/** Devices linked to this tenant, including this one. Enabled only while linked. */
export const useCloudDevices = (enabled: boolean) =>
  useQuery<DeviceInfo[], CloudCommandError>({
    queryKey: queryKeys.cloud.devices(),
    queryFn: cloudListDevices,
    enabled,
    staleTime: 5_000,
  });

export const useCloudRevokeDevice = () => {
  const queryClient = useQueryClient();
  return useMutation<void, CloudCommandError, string>({
    mutationFn: cloudRevokeDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cloud.devices() }),
  });
};

export const useCloudTelemetry = () => {
  const write = useCloudStateWriter();
  return useMutation<CloudState, CloudCommandError, boolean>({
    mutationFn: cloudSetTelemetry,
    onSuccess: write,
  });
};
