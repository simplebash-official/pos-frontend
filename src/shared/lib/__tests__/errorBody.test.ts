/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { readErrorBody } from '../errorBody';

describe('readErrorBody', () => {
  it('parses a JSON error body that arrived as a blob', async () => {
    const blob = new Blob([JSON.stringify({ message: 'Too narrow', statusCode: 422 })], {
      type: 'application/json',
    });
    expect(await readErrorBody(blob)).toEqual({ message: 'Too narrow', statusCode: 422 });
  });

  it('leaves an already-parsed body untouched', async () => {
    const body = { message: 'Nope' };
    expect(await readErrorBody(body)).toBe(body);
  });

  it('leaves a non-JSON blob untouched', async () => {
    const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
    expect(await readErrorBody(pdf)).toBe(pdf);
  });

  it('returns the blob itself when its JSON is malformed', async () => {
    const broken = new Blob(['{not json'], { type: 'application/json' });
    expect(await readErrorBody(broken)).toBe(broken);
  });
});
