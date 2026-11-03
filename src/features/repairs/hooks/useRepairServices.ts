import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackMeta } from '@/api/mutationFeedback';
import { queryKeys } from '@/api/queryKeys';
import { t } from '@/shared/i18n/t';
import {
  createRepairService,
  fetchRepairServices,
  updateRepairService,
} from '../api/repairServicesApi';
import type { RepairService, SaveRepairServiceInput } from '../types';

/** The services offered on the repair form, or every one (`includeHidden`) for settings. */
export const useRepairServices = (includeHidden: boolean, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.repairServices.list(includeHidden),
    queryFn: () => fetchRepairServices(includeHidden),
    enabled,
  });

export const useCreateRepairService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveRepairServiceInput) => createRepairService(input),
    meta: feedbackMeta<RepairService>({
      successTitle: t('Repair service added'),
      successMessage: (service) => service.name,
      failureTitle: t('Could not add the repair service'),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repairServices.all });
    },
  });
};

export const useUpdateRepairService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: SaveRepairServiceInput }) =>
      updateRepairService(key, input),
    meta: feedbackMeta<RepairService>({
      successTitle: t('Repair service saved'),
      successMessage: (service) => service.name,
      failureTitle: t('Could not save the repair service'),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repairServices.all });
    },
  });
};
