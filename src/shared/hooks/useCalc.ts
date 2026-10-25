import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/types/common';

export interface LiveCalc<Reply> {
  /** The latest answer. While a newer one is on its way this is the one before it. */
  data: Reply | undefined;
  /** True only when `data` answers the request as it stands now. Save and Pay wait for this. */
  isCurrent: boolean;
  error: ApiError | null;
}

/**
 * Asks the server to work out a form's figures. One request per change, no debounce: the one still
 * in flight is cancelled when the form changes again, so only the newest answer lands. Nothing is
 * worked out here if the server cannot answer; the screen shows the error and Save stays off.
 */
export const useCalc = <Request, Reply>(
  name: string,
  request: Request,
  fetcher: (request: Request, signal: AbortSignal) => Promise<Reply>
): LiveCalc<Reply> => {
  const query = useQuery({
    queryKey: ['calc', name, request],
    queryFn: ({ signal }) => fetcher(request, signal),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return {
    data: query.data,
    isCurrent: query.isSuccess && !query.isPlaceholderData,
    error: query.error === null ? null : (query.error as unknown as ApiError),
  };
};
