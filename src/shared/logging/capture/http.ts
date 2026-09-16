/**
 * API call capture for an axios instance. Every request gets an
 * `X-Request-Id`; the backend adopts it, forwards it to document-server, and
 * both log under it — so "Trace this request" in Settings → Logs shows the
 * click, this call, the backend handler, its SQL and any PDF render as one
 * chain. Bodies are logged redacted and capped (Settings → Logs can turn body
 * logging off); binary responses are logged by size only.
 *
 * Install before any other interceptor on the instance: axios runs response
 * interceptors in registration order, so this one sees the raw AxiosError
 * before `apiClient` reshapes it into an `ApiError`.
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { randomUuid } from '@/shared/lib/id';
import { logger } from '@/shared/logging/logger';
import type { LogLevel } from '@/shared/logging/types';

export const REQUEST_ID_HEADER = 'X-Request-Id';

interface RequestMeta {
  requestId: string;
  startedAt: number;
}

const metaByConfig = new WeakMap<InternalAxiosRequestConfig, RequestMeta>();

export const newRequestId = (): string => `req_${randomUuid().replace(/-/g, '')}`;

const describeUrl = (config: InternalAxiosRequestConfig): string => {
  const base = config.baseURL ?? '';
  const url = config.url ?? '';
  return /^https?:\/\//.test(url) ? url : `${base}${url}`;
};

const parseBody = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const isBinary = (data: unknown): boolean =>
  (typeof Blob !== 'undefined' && data instanceof Blob) ||
  data instanceof ArrayBuffer ||
  ArrayBuffer.isView(data) ||
  (typeof FormData !== 'undefined' && data instanceof FormData);

/**
 * Size of a response as sent, without serializing it: the `content-length`
 * header, else the raw text axios parsed from.
 */
export const responseBytes = (response: AxiosResponse): number | undefined => {
  const header = Number(response.headers['content-length']);
  if (Number.isFinite(header) && header > 0) {
    return header;
  }
  const request = response.request as { responseText?: unknown } | undefined;
  if (request !== undefined && typeof request.responseText === 'string') {
    return request.responseText.length;
  }
  return undefined;
};

/**
 * The body to put in the log entry. It is passed through as a reference; the
 * logger's `redactAndCap` walks only the first `bodyCapBytes` of it, so a
 * multi-MB list costs the same as a small one.
 */
const responseBody = (response: AxiosResponse): unknown => {
  if (!logger.config.httpBodies) {
    return undefined;
  }
  if (isBinary(response.data)) {
    return { binary: true };
  }
  return response.data;
};

const levelForStatus = (status: number): LogLevel => {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
};

export interface HttpCaptureOptions {
  /** Label for this instance in the log (`api`, `health-probe`, …). */
  client: string;
  /** Level for successful calls; background polling uses `trace`. */
  successLevel: LogLevel;
}

export const installHttpCapture = (instance: AxiosInstance, options: HttpCaptureOptions): void => {
  instance.interceptors.request.use((config) => {
    const existing = config.headers.get(REQUEST_ID_HEADER);
    const requestId = typeof existing === 'string' && existing !== '' ? existing : newRequestId();
    config.headers.set(REQUEST_ID_HEADER, requestId);
    metaByConfig.set(config, { requestId, startedAt: performance.now() });

    const method = (config.method ?? 'get').toUpperCase();
    const url = describeUrl(config);
    logger.event(
      'http',
      'request',
      {
        client: options.client,
        method,
        url,
        params: config.params,
        body:
          logger.config.httpBodies && !isBinary(config.data) ? parseBody(config.data) : undefined,
        binaryBody: isBinary(config.data),
      },
      { level: options.successLevel, requestId, msg: `${method} ${url}` }
    );
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const meta = metaByConfig.get(response.config);
      const method = (response.config.method ?? 'get').toUpperCase();
      const url = describeUrl(response.config);
      const durationMs =
        meta === undefined ? undefined : Math.round(performance.now() - meta.startedAt);
      const level = response.status >= 400 ? levelForStatus(response.status) : options.successLevel;
      logger.event(
        'http',
        'response',
        {
          client: options.client,
          method,
          url,
          status: response.status,
          durationMs,
          bytes: responseBytes(response),
          body: responseBody(response),
        },
        {
          level,
          requestId: meta?.requestId,
          msg: `${method} ${url} → ${response.status} in ${durationMs}ms`,
        }
      );
      return response;
    },
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.config) {
        logFailure(error, error.config, options);
      } else {
        logger.error('http', 'error', error, { client: options.client });
      }
      return Promise.reject(error);
    }
  );
};

const logFailure = (
  error: AxiosError,
  config: InternalAxiosRequestConfig,
  options: HttpCaptureOptions
): void => {
  const meta = metaByConfig.get(config);
  const method = (config.method ?? 'get').toUpperCase();
  const url = describeUrl(config);
  const durationMs =
    meta === undefined ? undefined : Math.round(performance.now() - meta.startedAt);

  if (axios.isCancel(error)) {
    logger.event(
      'http',
      'cancelled',
      { client: options.client, method, url, durationMs },
      { level: 'debug', requestId: meta?.requestId, msg: `${method} ${url} cancelled` }
    );
    return;
  }

  const status = error.response?.status;
  logger.event(
    'http',
    status === undefined ? 'network_error' : 'response',
    {
      client: options.client,
      method,
      url,
      status,
      durationMs,
      bytes: error.response ? responseBytes(error.response) : undefined,
      code: error.code,
      error: error.message,
      body: error.response ? responseBody(error.response) : undefined,
    },
    {
      level: status === undefined ? 'error' : levelForStatus(status),
      requestId: meta?.requestId,
      msg:
        status === undefined
          ? `${method} ${url} failed: ${error.message}`
          : `${method} ${url} → ${status} in ${durationMs}ms`,
    }
  );
};
