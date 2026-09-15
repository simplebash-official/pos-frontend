import { describe, it, expect } from 'vitest';
import { REDACTED, capForLog, isSensitiveKey, redactText, redactValue } from '../redact';
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

  it('caps oversized payloads with a preview', () => {
    const big = { note: 'x'.repeat(500) };
    const capped = capForLog(big, 100) as { truncated: boolean; bytes: number; preview: string };
    expect(capped.truncated).toBe(true);
    expect(capped.preview).toHaveLength(100);
    expect(capForLog({ a: 1 }, 100)).toEqual({ a: 1 });
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
