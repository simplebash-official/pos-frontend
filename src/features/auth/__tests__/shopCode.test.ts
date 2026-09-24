import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '@/api/client';
import { loginApi } from '../api/authApi';
import {
  getInitialShopCode,
  getRememberedShopCode,
  getShopCodeFromLink,
  isShopCodeRequired,
  isValidShopCode,
  loginErrorMessage,
  normalizeShopCode,
  rememberShopCode,
} from '../lib/shopCode';

vi.mock('@/api/client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));

const loginResponse = {
  data: { token: 't', user: { id: 'u', name: 'N', email: 'e', role: 'admin' } },
};

beforeEach(() => {
  vi.mocked(apiClient.post).mockReset();
  vi.mocked(apiClient.post).mockResolvedValue(loginResponse);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('isShopCodeRequired', () => {
  it('is off by default', () => {
    expect(isShopCodeRequired()).toBe(false);
  });

  it('is on for a multi-tenant web build', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    expect(isShopCodeRequired()).toBe(true);
  });

  it('is off inside the desktop shell even when the flag is set', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    vi.stubGlobal('window', { __TAURI_INTERNALS__: {} });
    expect(isShopCodeRequired()).toBe(false);
  });
});

describe('shop code validation', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeShopCode('  Test-Shop ')).toBe('test-shop');
  });

  it('accepts slugs and rejects everything else', () => {
    for (const ok of ['test-shop', 'ab', 'shop1', 'a-b-c']) expect(isValidShopCode(ok)).toBe(true);
    for (const bad of [
      '',
      'a',
      '-shop',
      'shop-',
      'my--shop',
      'my shop',
      'shop_1',
      'a'.repeat(64),
    ]) {
      expect(isValidShopCode(bad)).toBe(false);
    }
    expect(isValidShopCode('  TEST-SHOP ')).toBe(true);
  });
});

describe('loginApi', () => {
  const payload = { email: 'a@b.co', password: 'secret123', shopCode: 'test-shop' };

  it('sends shopCode only on a multi-tenant web build', async () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    await loginApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
  });

  it('drops shopCode when the flag is off', async () => {
    await loginApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.co',
      password: 'secret123',
    });
  });

  it('drops shopCode inside the desktop shell', async () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    vi.stubGlobal('window', { __TAURI_INTERNALS__: {} });
    await loginApi(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.co',
      password: 'secret123',
    });
  });
});

describe('remembered shop code', () => {
  it('round-trips through storage, normalized, and never stores anything else', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
    rememberShopCode('  Test-Shop ', storage);
    expect(getRememberedShopCode(storage)).toBe('test-shop');
    expect([...store.keys()]).toEqual(['pos_shop_code']);
  });

  it('survives unavailable storage', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(getRememberedShopCode(blocked)).toBe('');
    expect(() => rememberShopCode('x-y', blocked)).not.toThrow();
  });
});

describe('loginErrorMessage', () => {
  it('explains a missing shop code (400) and a bad login (401) in multi-tenant mode', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    expect(loginErrorMessage({ statusCode: 400, message: 'Shop code is required' }, 'x')).toBe(
      'Please enter your shop code.'
    );
    expect(
      loginErrorMessage({ statusCode: 401, message: 'Invalid shop code, email or password' }, 'x')
    ).toBe('Invalid shop code, email or password. Please try again.');
  });

  it('keeps the existing behaviour on single-shop builds', () => {
    expect(loginErrorMessage({ statusCode: 401, message: 'Invalid credentials' }, 'fallback')).toBe(
      'Invalid credentials'
    );
    expect(loginErrorMessage(undefined, 'fallback')).toBe('fallback');
  });
});

describe('shop code from an "Open POS" link', () => {
  const storage = (value: string | null) => ({
    getItem: vi.fn().mockReturnValue(value),
    setItem: vi.fn(),
  });

  it('reads and normalizes ?shop=', () => {
    expect(getShopCodeFromLink('?shop=Ann-S-Phones')).toBe('ann-s-phones');
    expect(getShopCodeFromLink('?foo=1&shop=test-shop')).toBe('test-shop');
  });

  it('ignores a missing or invalid code', () => {
    expect(getShopCodeFromLink('')).toBe('');
    expect(getShopCodeFromLink('?other=1')).toBe('');
    expect(getShopCodeFromLink('?shop=')).toBe('');
    expect(getShopCodeFromLink('?shop=bad code!')).toBe('');
    expect(getShopCodeFromLink('?shop=-leading')).toBe('');
  });

  it('prefers the link over the remembered code', () => {
    expect(getInitialShopCode('?shop=from-link', storage('remembered'))).toBe('from-link');
  });

  it('falls back to the remembered code, then to empty', () => {
    expect(getInitialShopCode('', storage('remembered'))).toBe('remembered');
    expect(getInitialShopCode('?shop=bad code!', storage('remembered'))).toBe('remembered');
    expect(getInitialShopCode('', storage(null))).toBe('');
  });
});
