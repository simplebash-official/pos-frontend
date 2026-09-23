/**
 * Data hooks for the log viewer: stats, available days, paged queries
 * (newest first, loading older pages on demand), config, and the live tail.
 */

import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { logger, type LogConfig } from '@/shared/logging';
import {
  fetchLogConfig,
  fetchLogDays,
  fetchLogStats,
  listenLogTail,
  queryLogs,
  saveLogConfig,
  setLogTail,
} from '../api/logsApi';
import type { LogFilters, LogRecord } from '../types';

const PAGE_SIZE = 300;

export const useLogStats = () =>
  useQuery({ queryKey: queryKeys.logs.stats(), queryFn: fetchLogStats, staleTime: 10_000 });

export const useLogDays = () =>
  useQuery({ queryKey: queryKeys.logs.days(), queryFn: fetchLogDays, staleTime: 10_000 });

export const useLogQuery = (filters: LogFilters) =>
  useInfiniteQuery({
    queryKey: queryKeys.logs.query({ ...filters }),
    queryFn: ({ pageParam }) => queryLogs(filters, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.nextOffset === null ? undefined : last.nextOffset),
    staleTime: 0,
  });

export const useLogConfig = () =>
  useQuery({ queryKey: queryKeys.logs.config(), queryFn: fetchLogConfig });

export const useSaveLogConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['logs', 'config', 'save'],
    mutationFn: saveLogConfig,
    onSuccess: (config: LogConfig) => {
      logger.setConfig(config);
      queryClient.setQueryData(queryKeys.logs.config(), config);
    },
  });
};

/**
 * Streams new entries while `enabled`. The shell only emits tail events while
 * at least one viewer asked for them, so this switches the tail on and off.
 */
export const useLiveTail = (enabled: boolean, onEntries: (entries: LogRecord[]) => void) => {
  const handlerRef = useRef(onEntries);
  useEffect(() => {
    handlerRef.current = onEntries;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    void setLogTail(true);
    void listenLogTail((entries) => handlerRef.current(entries)).then((stop) => {
      if (cancelled) {
        stop();
      } else {
        unlisten = stop;
      }
    });
    return () => {
      cancelled = true;
      unlisten?.();
      void setLogTail(false);
    };
  }, [enabled]);
};
