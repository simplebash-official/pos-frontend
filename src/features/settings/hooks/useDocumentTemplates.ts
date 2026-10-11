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

// Saving changes what every print looks like, so documents already fetched in this session are
// dropped too — otherwise an invoice opened before the change would keep showing the old design.
export const useUpdateDocumentTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDocumentTemplatesApi,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.documentTemplates(), settings);
      void queryClient.invalidateQueries({ queryKey: ['billing', 'invoiceDocument'] });
      void queryClient.invalidateQueries({ queryKey: ['billing', 'creditNoteDocument'] });
    },
  });
};

// A PDF of one design's sample, for the "Preview" button. A design's sample never changes while
// the app is open, so it is fetched once.
export const useDocumentTemplatePreview = (name: string | null) => {
  const {
    data: blob,
    isLoading,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: queryKeys.settings.documentTemplatePreview(name ?? ''),
    queryFn: () => getDocumentTemplatePreviewApi(name as string),
    enabled: name !== null,
    staleTime: Infinity,
  });
  const enabled = name !== null;
  return {
    blob: blob ?? null,
    loading: enabled && isLoading,
    error: enabled && isError,
    isPaused: enabled && fetchStatus === 'paused',
  };
};
