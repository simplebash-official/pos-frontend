import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants';
import {
  HEADER_DEVICE_ID,
  HEADER_IDEMPOTENCY_KEY,
  HEADER_IF_MATCH,
  HEADER_SERVER_TIME,
  REQUEST_TIMEOUT_MS,
} from '@/offline/constants';
import { reportNetworkObservation } from '@/offline/connectivity/networkSignal';
import { getDeviceId } from '@/offline/ids/deviceId';
import { ApiError } from '@/shared/types/common';

export interface RequestOptions extends Omit<AxiosRequestConfig, 'params' | 'url'> {
  params?: Record<string, string | number | boolean | undefined>;
  /**
   * Replay guard for outboxed mutations. The same key on a retry makes the
   * backend return the original response instead of applying the write twice.
   */
  idempotencyKey?: string;
  /**
   * Server `version` the caller's change was based on, for optimistic
   * concurrency. A mismatch comes back as a 409 with the current entity.
   */
  baseVersion?: number;
}

/**
 * The subset of request options a synced mutation forwards. Feature `api/`
 * functions accept this so the outbox can attach a replay guard and an
 * optimistic-concurrency token without knowing anything about axios.
 */
export type MutationRequestOptions = Pick<RequestOptions, 'idempotencyKey' | 'baseVersion'>;

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

const buildSyncHeaders = (
  idempotencyKey?: string,
  baseVersion?: number
): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (idempotencyKey !== undefined) {
    headers[HEADER_IDEMPOTENCY_KEY] = idempotencyKey;
  }
  if (baseVersion !== undefined) {
    headers[HEADER_IF_MATCH] = String(baseVersion);
  }
  return headers;
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

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && !config.headers.Authorization) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      config.headers.set(HEADER_DEVICE_ID, getDeviceId());
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.status === 204) {
          response.data = {};
        }
        // A completed round trip is the strongest possible proof of reachability.
        reportNetworkObservation('reachable', readServerTime(response.headers));
        return response;
      },
      (error: unknown) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // The server answered, so the network is fine — this is a real API error.
            reportNetworkObservation('reachable', readServerTime(error.response.headers));
            const data = error.response.data;
            if (isApiErrorLike(data)) {
              return Promise.reject(data);
            }
            return Promise.reject({
              message: error.response.statusText || 'An error occurred during request execution',
              statusCode: error.response.status,
            } as ApiError);
          }
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
    const { params, idempotencyKey, baseVersion, headers, ...restOptions } = options;
    const response = await this.axiosInstance.request<T>({
      url: endpoint,
      ...restOptions,
      headers: { ...headers, ...buildSyncHeaders(idempotencyKey, baseVersion) },
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
