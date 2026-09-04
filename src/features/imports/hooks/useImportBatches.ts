import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  fetchImportBatchByKey,
  fetchImportBatches,
  ImportBatchListParams,
  processImportBatch,
} from '../api/importsApi';
import type { ImportBatchRecord, ProcessImportPayload } from '../types';

export const useProcessImport = () => {
  const queryClient = useQueryClient();
  return useMutation<ImportBatchRecord, Error, ProcessImportPayload>({
    mutationFn: processImportBatch,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.imports.all });
      if (variables.target === 'inventory') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      }
    },
  });
};

export const useImportBatches = (params: ImportBatchListParams = {}) => {
  return useQuery({
    queryKey: queryKeys.imports.batches(params.target),
    queryFn: () => fetchImportBatches(params),
  });
};

export const useImportBatch = (key?: string) => {
  return useQuery({
    queryKey: queryKeys.imports.batchDetail(key ?? ''),
    queryFn: () => fetchImportBatchByKey(key!),
    enabled: Boolean(key),
  });
};
