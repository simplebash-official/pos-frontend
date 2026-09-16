import { describe, it, expect } from 'vitest';
import {
  REDACTED,
  TRUNCATED_KEY,
  isSensitiveKey,
  redactAndCap,
  redactText,
  redactValue,
} from '../redact';
import { isoWithOffset, timezoneName } from '../time';

describe('redactValue', () => {
  it('masks credentials at any depth and keeps customer data', () => {
    const input = {
      email: 'owner@shop.lk',
      password: 'hunter2',
      adminPassword: 'x',
      customer: { phone: '0771234567', address: 'Kandy' },
      nested: [{ token: 'abc', qty: 2 }],
      headers: { Authorization: 'Bearer abc' },
    };
    const out = redactValue(input) as typeof input;
    expect(out.email).toBe('owner@shop.lk');
    expect(out.password).toBe(REDACTED);
    expect(out.adminPassword).toBe(REDACTED);
    expect(out.customer).toEqual({ phone: '0771234567', address: 'Kandy' });
    expect(out.nested[0]).toEqual({ token: REDACTED, qty: 2 });
    expect(out.headers.Authorization).toBe(REDACTED);
    // never mutates the input
    expect(input.password).toBe('hunter2');
  });

  it('does not flag innocent keys', () => {
    expect(isSensitiveKey('spinner')).toBe(false);
    expect(isSensitiveKey('shipping')).toBe(false);
    expect(isSensitiveKey('user_pin')).toBe(true);
    expect(isSensitiveKey('X-Internal-Api-Key')).toBe(true);
  });

  it('scrubs secret-shaped text', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1In0.sig_abc';
    const hex = 'a'.repeat(64);
    const out = redactText(`token ${jwt} and ${hex}`);
    expect(out).not.toContain('eyJhbGci');
    expect(out).not.toContain(hex);
    expect(redactText('plain text')).toBe('plain text');
  });

  it('caps oversized payloads, keeping a redacted prefix and a truncation marker', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ key: `prod_${i}`, token: 't' }));
    const capped = redactAndCap({ items }, 500) as { items: Record<string, unknown>[] };
    expect(capped.items.length).toBeLessThan(100);
    expect(capped.items[0]).toEqual({ key: 'prod_0', token: REDACTED });
    const marker = capped.items[capped.items.length - 1];
    expect(String(marker[TRUNCATED_KEY])).toMatch(/more items$/);
    expect(JSON.stringify(capped).length).toBeLessThan(2000);
    expect(redactAndCap({ a: 1, password: 'x' }, 1000)).toEqual({ a: 1, password: REDACTED });
  });

  it('cuts long strings and stops walking huge objects early', () => {
    const cut = redactAndCap('x'.repeat(10_000), 100) as string;
    expect(cut.length).toBeLessThan(130);
    expect(cut).toMatch(/…\[10000 chars\]$/);
    const wide = Object.fromEntries(Array.from({ length: 5000 }, (_, i) => [`k${i}`, i]));
    const capped = redactAndCap(wide, 200) as Record<string, unknown>;
    expect(Object.keys(capped).length).toBeLessThan(40);
    expect(String(capped[TRUNCATED_KEY])).toMatch(/more fields$/);
  });

  it('costs O(cap), not O(payload): a ~6 MB response is capped quickly', () => {
    const items = Array.from({ length: 25_000 }, (_, i) => ({
      key: `prod_${i}`,
      name: `Product number ${i} with a longer display name`,
      sku: `PHO-SCR-${i}`,
      sellingPriceCents: 150_000 + i,
      supplier: { key: `sup_${i % 50}`, name: 'Supplier' },
    }));
    const payload = { success: true, data: { items } };
    const t0 = performance.now();
    for (let i = 0; i < 10; i += 1) {
      redactAndCap(payload, 64 * 1024);
    }
    const perCallMs = (performance.now() - t0) / 10;
    expect(perCallMs).toBeLessThan(15);
  });
});

describe('isoWithOffset', () => {
  it('renders local wall-clock time with the machine offset', () => {
    const date = new Date(2026, 8, 15, 10, 22, 1, 5);
    const iso = isoWithOffset(date);
    expect(iso.startsWith('2026-09-15T10:22:01.005')).toBe(true);
    expect(iso).toMatch(/[+-]\d{2}:\d{2}$/);
    // parses back to the same instant
    expect(new Date(iso).getTime()).toBe(date.getTime());
  });

  it('exposes an IANA timezone name', () => {
    expect(timezoneName().length).toBeGreaterThan(0);
  });
});
