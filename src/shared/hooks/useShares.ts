import { apiClient } from '@/api/client';
import { useCalc, type LiveCalc } from '@/shared/hooks/useCalc';
import type { ApiResponse } from '@/shared/types/common';

export interface SharePart {
  /** Echoed back so a reply line is found by name, never by position. */
  key: string;
  cents: number;
  /** What this part is a share of; `null` means the total of all the parts sent. */
  wholeCents: number | null;
}

export interface CalcSharesReply {
  /** The total of all the parts sent. */
  totalCents: number;
  parts: { key: string; basisPoints: number; percent: number }[];
}

const calcShares = async (
  request: { parts: SharePart[] },
  signal: AbortSignal
): Promise<CalcSharesReply> => {
  const response = await apiClient.post<ApiResponse<CalcSharesReply>>('/calc/shares', request, {
    signal,
  });
  return response.data;
};

/** How big each part is next to its whole, worked out by the server (for progress and split bars). */
export const useShares = (parts: SharePart[], enabled: boolean): LiveCalc<CalcSharesReply> =>
  useCalc('shares', { parts }, calcShares, enabled);

/** One part's reply line, found by its key; `undefined` until the server has answered. */
export const shareOf = (reply: CalcSharesReply | undefined, key: string) =>
  reply?.parts.find((part) => part.key === key);
