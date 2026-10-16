import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchLabelCoverage, fetchLabelJobs } from '../api/labelsApi';
import type { LabelCoverageParams, LabelJobListParams } from '../types';

/** A page of the print history, newest first. */
export const useLabelJobs = (params: LabelJobListParams) =>
  useQuery({
    queryKey: queryKeys.labels.jobs(params),
    queryFn: () => fetchLabelJobs(params),
    placeholderData: keepPreviousData,
  });

/** Products with their label state. */
export const useLabelCoverage = (params: LabelCoverageParams) =>
  useQuery({
    queryKey: queryKeys.labels.coverage(params),
    queryFn: () => fetchLabelCoverage(params),
    placeholderData: keepPreviousData,
  });

/** Marks the print history and label states stale after something was printed. */
export const useRefreshLabelHistory = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['labels', 'jobs'] });
    void queryClient.invalidateQueries({ queryKey: ['labels', 'coverage'] });
  };
};
