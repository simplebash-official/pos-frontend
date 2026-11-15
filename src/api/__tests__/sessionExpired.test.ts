import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/constants';
import { apiClient, setSessionExpiredHandler } from '../client';

const answer401 = () => {
  const instance = (apiClient as unknown as { axiosInstance: { defaults: { adapter: unknown } } })
    .axiosInstance;
  instance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('401', 'ERR_BAD_REQUEST', config, null, {
      status: 401,
      statusText: 'Unauthorized',
      data: {},
      headers: {},
      config,
    });
  };
};

describe('a rejected login token', () => {
  const handler = vi.fn();
  beforeEach(() => {
    handler.mockClear();
    setSessionExpiredHandler(handler);
    answer401();
  });

  it('signs the user out when the stored token gets a 401', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'old');
    await expect(apiClient.post('/billing/sales', {})).rejects.toMatchObject({ statusCode: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not sign out for a wrong password at the login form', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'old');
    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({ statusCode: 401 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('does nothing when nobody is signed in', async () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await expect(apiClient.get('/x')).rejects.toMatchObject({ statusCode: 401 });
    expect(handler).not.toHaveBeenCalled();
  });
});
