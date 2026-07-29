import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants';
import { ApiError } from '@/shared/types/common';

export interface RequestOptions extends Omit<AxiosRequestConfig, 'params' | 'url'> {
  params?: Record<string, string | number | boolean | undefined>;
}

function isApiErrorLike(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  );
}

function buildParams(params?: RequestOptions['params']) {
  if (!params) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && !config.headers.Authorization) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.status === 204) {
          response.data = {};
        }
        return response;
      },
      (error: unknown) => {
        if (axios.isAxiosError(error)) {
          if (error.response) {
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
        return Promise.reject({
          message: 'Network error or unreachable server.',
          statusCode: 0,
        } as ApiError);
      }
    );
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...restOptions } = options;
    const response = await this.axiosInstance.request<T>({
      url: endpoint,
      ...restOptions,
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
