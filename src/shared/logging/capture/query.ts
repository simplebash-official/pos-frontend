/**
 * TanStack Query capture: query failures and every mutation's lifecycle
 * (start, success, failure) with its key and variables. Successful query
 * fetches are recorded at `debug` — the HTTP entries already hold their
 * bodies — so a busy screen doesn't bury the interesting lines.
 */

import { MutationCache, QueryCache } from '@tanstack/react-query';
import { logger } from '@/shared/logging/logger';

export const createLoggingQueryCache = (): QueryCache =>
  new QueryCache({
    onSuccess: (_data, query) => {
      logger.event('query', 'query.success', { queryKey: query.queryKey }, { level: 'debug' });
    },
    onError: (error, query) => {
      logger.error('query', 'query.error', error, { queryKey: query.queryKey });
    },
  });

export const createLoggingMutationCache = (): MutationCache =>
  new MutationCache({
    onMutate: (variables, mutation) => {
      logger.info('query', 'mutation.start', {
        mutationKey: mutation.options.mutationKey,
        variables,
      });
    },
    onSuccess: (_data, variables, _context, mutation) => {
      logger.info('query', 'mutation.success', {
        mutationKey: mutation.options.mutationKey,
        variables,
      });
    },
    onError: (error, variables, _context, mutation) => {
      logger.error('query', 'mutation.error', error, {
        mutationKey: mutation.options.mutationKey,
        variables,
      });
    },
  });
