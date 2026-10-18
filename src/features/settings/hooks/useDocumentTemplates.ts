import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  getDocumentTemplatePreviewApi,
  getDocumentTemplatesApi,
  updateDocumentTemplatesApi,
} from '../api/documentTemplatesApi';

// The shop's document designs, from the backend. Not a synced resource, so a plain query.
// `enabled` lets a modal fetch it only while it is open.
export const useDocumentTemplateSettings = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.settings.documentTemplates(),
    queryFn: getDocumentTemplatesApi,
    enabled,
  });

// Saving changes what every print looks like, so documents (and the "was it printed with another
// design?" answers) already fetched in this session are dropped too — otherwise an invoice opened
// before the change would keep showing the old design.
export const useUpdateDocumentTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDocumentTemplatesApi,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.documentTemplates(), settings);
      void queryClient.invalidateQueries({ queryKey: ['billing', 'invoiceDocument'] });
      void queryClient.invalidateQueries({ queryKey: ['billing', 'creditNoteDocument'] });
      void queryClient.invalidateQueries({ queryKey: ['quotations', 'document'] });
      void queryClient.invalidateQueries({ queryKey: ['documentDesign'] });
    },
  });
};

// A PDF of one design's sample, for the "Preview" button. A version's sample never changes, so it
// is fetched once per version.
export const useDocumentTemplatePreview = (family: string | null, version: number) => {
  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: queryKeys.settings.documentTemplatePreview(family ?? '', version),
    queryFn: () => getDocumentTemplatePreviewApi(family as string),
    enabled: family !== null,
    staleTime: Infinity,
  });
  const enabled = family !== null;
  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    isPaused: enabled && fetchStatus === 'paused',
  };
};
