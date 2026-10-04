import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants';
import {
  HEADER_DEVICE_ID,
  HEADER_IDEMPOTENCY_KEY,
  HEADER_SERVER_TIME,
  REQUEST_TIMEOUT_MS,
} from '@/offline/constants';
import { reportNetworkObservation } from '@/offline/connectivity/networkSignal';
import { getDeviceId } from '@/api/deviceId';
import { createIdempotencyKey } from '@/shared/lib/id';
import { ApiError } from '@/shared/types/common';
import { sanitizeErrorMessage } from '@/shared/lib/error';
import { installHttpCapture } from '@/shared/logging/capture/http';
import { isTauri } from '@/shared/lib/runtime';
import { syncNow } from '@/features/sync-status/api/syncStatusApi';

export interface RequestOptions extends Omit<AxiosRequestConfig, 'params' | 'url'> {
  params?: Record<string, string | number | boolean | undefined>;
}

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
const triggerAutoSync = () => {
  if (!isTauri()) return;
  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => {
    autoSyncTimer = null;
    syncNow().catch(() => {});
    // Only a backup now: the shell hears about every local write straight
    // from the backend and uploads at once.
  }, 100);
};

const isApiErrorLike = (data: unknown): data is ApiError => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  );
};

/**
 * Axios lowercases response header names, which is why HEADER_SERVER_TIME is
 * declared lowercase. Absent until the backend ships it, hence the null.
 */
const readServerTime = (headers: unknown): string | null => {
  if (typeof headers !== 'object' || headers === null) {
    return null;
  }
  const value = (headers as Record<string, unknown>)[HEADER_SERVER_TIME];
  return typeof value === 'string' ? value : null;
};

const buildParams = (params?: RequestOptions['params']) => {
  if (!params) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
};

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json' },
      timeout: REQUEST_TIMEOUT_MS,
    });

    // First, so its response interceptor sees the raw AxiosError before the
    // one below reshapes it (desktop activity log; no-op on the web).
    installHttpCapture(this.axiosInstance, { client: 'api', successLevel: 'info' });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && !config.headers.Authorization) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      config.headers.set(HEADER_DEVICE_ID, getDeviceId());
      // A replay guard on every mutating request: if a response is lost (a
      // power cut mid-request) and the caller retries with the same config,
      // the backend returns the original response instead of double-applying
      // the write. Only set when the caller hasn't already supplied one.
      const method = config.method?.toLowerCase();
      if (method && MUTATING_METHODS.has(method) && !config.headers.has(HEADER_IDEMPOTENCY_KEY)) {
        config.headers.set(HEADER_IDEMPOTENCY_KEY, createIdempotencyKey());
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.status === 204) {
          response.data = {};
        }
        // A completed round trip is the strongest possible proof of reachability.
        reportNetworkObservation('reachable', readServerTime(response.headers));
        const method = response.config.method?.toLowerCase();
        if (method && MUTATING_METHODS.has(method)) {
          triggerAutoSync();
        }
        return response;
      },
      (error: unknown) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // The server answered, so the network is fine — this is a real API error.
            reportNetworkObservation('reachable', readServerTime(error.response.headers));
            const data = error.response.data;
            if (isApiErrorLike(data)) {
              return Promise.reject({
                ...data,
                message: sanitizeErrorMessage(
                  data.message,
                  data.statusCode ?? error.response.status
                ),
              });
            }
            return Promise.reject({
              message: sanitizeErrorMessage(
                error.response.statusText || 'An error occurred during request execution',
                error.response.status
              ),
              statusCode: error.response.status,
            } as ApiError);
          }
        }
        // A cancelled request says nothing about the network — we cancelled
        // it (TanStack cancels queries routinely, e.g. on unmount or a
        // changed query key); counting those as evidence of an outage would
        // flip the whole app to "Working offline" on an ordinary navigation.
        if (axios.isCancel(error)) {
          return Promise.reject({
            message: 'Request cancelled.',
            statusCode: 0,
          } as ApiError);
        }

        // No response at all: timeout, DNS failure, or genuinely offline.
        reportNetworkObservation('unreachable', null);
        return Promise.reject({
          message: 'Network error or unreachable server.',
          statusCode: 0,
        } as ApiError);
      }
    );
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...restOptions } = options;
    const response = await this.axiosInstance.request<T>({
      url: endpoint,
      ...restOptions,
      headers,
      params: buildParams(params),
    });
    return response.data;
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(env.apiBaseUrl);
