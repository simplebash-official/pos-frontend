import { describe, it, expect, afterEach } from 'vitest';
import { vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ShopCodeField } from '../components/ShopCodeField';

const html = (value = '', locked = false) =>
  renderToString(
    <MantineProvider>
      <ShopCodeField value={value} onChange={() => {}} locked={locked} onChangeShop={() => {}} />
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

  it('shows a locked code as text with a Change button instead of an input', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    const out = html('simplebash-shop', true);
    expect(out).toContain('simplebash-shop');
    expect(out).toContain('Not your shop? Change');
    expect(out).toContain('data-log-id="login-shop-code-change"');
    expect(out).not.toContain('<input');
  });

  it('falls back to the input when a locked field has no code', () => {
    vi.stubEnv('VITE_MULTI_TENANT', 'true');
    expect(html('', true)).toContain('data-log-id="login-shop-code"');
  });

  it('renders nothing when locked but a shop code is not needed', () => {
    expect(html('simplebash-shop', true)).not.toContain('simplebash-shop');
  });
});
