import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackMeta } from '@/api/mutationFeedback';
import { queryKeys } from '@/api/queryKeys';
import { t } from '@/shared/i18n/t';
import {
  createPrintService,
  fetchPrintServices,
  updatePrintService,
} from '../api/printServicesApi';
import type { PrintService, SavePrintServiceInput } from '../types';

/** The services offered on the print form, or every one (`includeHidden`) for settings. */
export const usePrintServices = (includeHidden: boolean, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.printServices.list(includeHidden),
    queryFn: () => fetchPrintServices(includeHidden),
    enabled,
  });

export const useCreatePrintService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SavePrintServiceInput) => createPrintService(input),
    meta: feedbackMeta<PrintService>({
      successTitle: t('Print service added'),
      successMessage: (service) => service.name,
      failureTitle: t('Could not add the print service'),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printServices.all });
    },
  });
};

export const useUpdatePrintService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: SavePrintServiceInput }) =>
      updatePrintService(key, input),
    meta: feedbackMeta<PrintService>({
      successTitle: t('Print service saved'),
      successMessage: (service) => service.name,
      failureTitle: t('Could not save the print service'),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printServices.all });
    },
  });
};
