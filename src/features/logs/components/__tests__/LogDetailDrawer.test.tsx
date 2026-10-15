/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { LogDetailDrawer } from '../LogDetailDrawer';
import type { LogRecord } from '../../types';

installDrawerTestEnv();

const makeRecord = (overrides: Partial<LogRecord> = {}): LogRecord => ({
  v: 1,
  seq: 42,
  ts: '2026-10-15T16:20:30.123+05:30',
  ts_utc: '2026-10-15T10:50:30.123Z',
  tz: 'Asia/Colombo',
  source: 'frontend',
  level: 'error',
  category: 'http',
  event: 'response',
  msg: 'Request failed with status 500',
  boot_id: 'boot_1',
  app_version: '0.16.0',
  os: 'macos',
  session_user: 'admin',
  route: '/billing',
  request_id: 'req_abc123',
  data: { status: 500, path: '/api/billing/sales' },
  ...overrides,
});

describe('LogDetailDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onTraceRequest = vi.fn();
  const writeText = vi.fn();

  beforeEach(() => {
    [onClose, onTraceRequest, writeText].forEach((fn) => fn.mockReset());
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (record: LogRecord | null) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <LogDetailDrawer record={record} onClose={onClose} onTraceRequest={onTraceRequest} />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;

  it('shows nothing until an entry is chosen', async () => {
    await open(null);
    expect(text()).not.toContain('Request failed');
  });

  it('shows the message, level, where it came from and every detail', async () => {
    await open(makeRecord());
    expect(text()).toContain('Request failed with status 500');
    expect(text()).toContain('error');
    expect(text()).toContain('frontend');
    expect(text()).toContain('http/response');
    expect(text()).toContain('2026-10-15 16:20:30.123 +05:30');
    expect(text()).toContain('Asia/Colombo');
    expect(text()).toContain('/billing');
    expect(text()).toContain('req_abc123');
    expect(text()).toContain('0.16.0');
    expect(text()).toContain('"status": 500');
  });

  it('falls back to category/event when there is no message, and leaves out missing details', async () => {
    await open(makeRecord({ msg: undefined, route: undefined, data: undefined }));
    expect(text()).toContain('http/response');
    expect(text()).not.toContain('Screen');
    expect(text()).not.toContain('Data');
  });

  it('copies the whole entry as JSON', async () => {
    const record = makeRecord();
    await open(record);
    await act(async () => button('Copy')!.click());
    expect(writeText).toHaveBeenCalledWith(JSON.stringify(record, null, 2));
  });

  it('traces the request when it has an id, and offers no trace when it has none', async () => {
    await open(makeRecord());
    await act(async () => button('Trace this request')!.click());
    expect(onTraceRequest).toHaveBeenCalledWith('req_abc123');

    act(() => root.unmount());
    root = createRoot(container);
    await open(makeRecord({ request_id: undefined }));
    expect(button('Trace this request')).toBeUndefined();
  });
});
