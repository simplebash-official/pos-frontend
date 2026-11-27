import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackMeta } from '@/api/mutationFeedback';
import { queryKeys } from '@/api/queryKeys';
import { t } from '@/shared/i18n/t';
import {
  createPrintFrameSize,
  fetchPrintFrameSizes,
  setPrintFrameSizeActive,
} from '../api/printFrameSizesApi';
import { frameName } from '../lib/frameSizes';
import type { CreatePrintFrameSizeInput, PrintFrameSize } from '../types';

/** The sizes offered on the print form, or every one (`includeHidden`) for settings. */
export const usePrintFrameSizes = (includeHidden: boolean) =>
  useQuery({
    queryKey: queryKeys.printFrameSizes.list(includeHidden),
    queryFn: () => fetchPrintFrameSizes(includeHidden),
  });

export const useCreatePrintFrameSize = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePrintFrameSizeInput) => createPrintFrameSize(input),
    meta: feedbackMeta<PrintFrameSize>({
      successTitle: t('Frame size added'),
      successMessage: frameName,
      failureTitle: t('Could not add the frame size'),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printFrameSizes.all });
    },
  });
};

export const useSetPrintFrameSizeActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, active }: { key: string; active: boolean }) =>
      setPrintFrameSizeActive(key, active),
    meta: feedbackMeta<PrintFrameSize>({
      successTitle: t('Frame size saved'),
      successMessage: frameName,
      failureTitle: t('Could not save the frame size'),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.printFrameSizes.all });
    },
  });
};
