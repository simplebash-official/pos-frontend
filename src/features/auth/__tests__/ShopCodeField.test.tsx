import { describe, it, expect, afterEach } from 'vitest';
import { vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ShopCodeField } from '../components/ShopCodeField';

const html = (value = '') =>
  renderToString(
    <MantineProvider>
      <ShopCodeField value={value} onChange={() => {}} />
    </MantineProvider>
  );

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('ShopCodeField', () => {
  it('renders a required shop code input on a multi-tenant web build', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    const out = html('test-shop');
    expect(out).toContain('Shop code');
    expect(out).toContain('data-log-id="login-shop-code"');
    expect(out).toContain('value="test-shop"');
    expect(out).toContain('required');
  });

  it('renders nothing when the flag is off', () => {
    expect(html()).not.toContain('login-shop-code');
    expect(html()).not.toContain('Shop code');
  });

  it('renders nothing inside the desktop shell', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    vi.stubGlobal('window', { __TAURI_INTERNALS__: {} });
    expect(html()).not.toContain('login-shop-code');
  });
});
