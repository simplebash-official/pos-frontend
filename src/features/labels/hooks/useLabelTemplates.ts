import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createLabelTemplate,
  deleteLabelTemplate,
  fetchLabelTemplates,
  updateLabelTemplate,
} from '../api/labelsApi';
import type { LabelTemplateInput } from '../types';

/** The ready-made designs first, then the shop's own. */
export const useLabelTemplates = () =>
  useQuery({ queryKey: queryKeys.labels.templates(), queryFn: fetchLabelTemplates });

interface SaveLabelTemplatePayload {
  /** The design being edited, or `null` to save a new one. */
  key: string | null;
  input: LabelTemplateInput;
}

export const useSaveLabelTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: SaveLabelTemplatePayload) =>
      key === null ? createLabelTemplate(input) : updateLabelTemplate(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.templates() });
    },
  });
};

export const useDeleteLabelTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteLabelTemplate(key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.templates() });
    },
  });
};
