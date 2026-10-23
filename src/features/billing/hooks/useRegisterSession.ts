import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  closeSession,
  convertVariance,
  createCashMovement,
  reverseCashMovement,
  getCurrentSession,
  getDrawerState,
  getSession,
  getZReport,
  listCashMovements,
  listSessions,
  openSession,
  reopenSession,
  setPin,
  submitBlindCount,
  verifyPin,
} from '../api/sessionsApi';
import type {
  CashMovementListQuery,
  CloseSessionInput,
  ConvertVarianceInput,
  CreateCashMovementInput,
  ReverseCashMovementInput,
  OpenSessionInput,
  ReopenSessionInput,
  SessionListQuery,
  SetPinInput,
  SubmitBlindCountInput,
  VerifyPinInput,
} from '../types';

export const useCurrentSession = (terminalId?: string) => {
  const query = useQuery({
    queryKey: queryKeys.billing.sessions.current(terminalId),
    queryFn: () => getCurrentSession(terminalId),
    refetchInterval: 15_000,
  });
  return { ...query, session: query.data ?? null };
};

export const useDrawerState = (terminalId?: string) => {
  const query = useQuery({
    queryKey: queryKeys.billing.sessions.drawerState(terminalId ?? ''),
    queryFn: () => getDrawerState(terminalId as string),
    enabled: Boolean(terminalId),
  });
  return { ...query, drawerState: query.data ?? null };
};

export const useSessionDetail = (key?: string) => {
  const query = useQuery({
    queryKey: queryKeys.billing.sessions.detail(key ?? ''),
    queryFn: () => getSession(key as string),
    enabled: Boolean(key),
  });
  return { ...query, session: query.data ?? null };
};

export const useSessionList = (query?: SessionListQuery) => {
  return useQuery({
    queryKey: queryKeys.billing.sessions.list(query as Record<string, unknown>),
    queryFn: () => listSessions(query),
  });
};

export const useCashMovementList = (query?: CashMovementListQuery) => {
  return useQuery({
    queryKey: queryKeys.billing.sessions.movements(query as Record<string, unknown>),
    queryFn: () => listCashMovements(query),
  });
};

export const useZReport = (key?: string) => {
  return useQuery({
    queryKey: queryKeys.billing.sessions.zReport(key ?? ''),
    queryFn: () => getZReport(key as string),
    enabled: Boolean(key),
  });
};

export const useOpenSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OpenSessionInput) => openSession(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
    },
  });
};

export const useSubmitBlindCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: SubmitBlindCountInput }) =>
      submitBlindCount(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
    },
  });
};

export const useCloseSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: CloseSessionInput }) =>
      closeSession(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
    },
  });
};

export const useReopenSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: ReopenSessionInput }) =>
      reopenSession(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
    },
  });
};

export const useConvertVariance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: ConvertVarianceInput }) =>
      convertVariance(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
    },
  });
};

export const useCreateCashMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCashMovementInput) => createCashMovement(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
      // Movement counts rank the category and payee pickers.
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.cash.all });
      // A drawer payment is a cost on the Expenses page and counts towards a regular bill.
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
};

export const useReverseCashMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: ReverseCashMovementInput }) =>
      reverseCashMovement(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.cash.all });
      // A reversed drawer payment stops counting as a cost.
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
};

export const useVerifyPin = () => {
  return useMutation({
    mutationFn: (input: VerifyPinInput) => verifyPin(input),
  });
};

export const useSetPin = () => {
  return useMutation({
    mutationFn: (input: SetPinInput) => setPin(input),
  });
};
