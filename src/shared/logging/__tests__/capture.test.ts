/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios, { type AxiosAdapter } from 'axios';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { logger } from '../logger';
import { describeElement, isSensitiveField, actionableElement } from '../describeElement';
import { fieldValue, installDomCapture, isLoggableKey } from '../capture/dom';
import { installHttpCapture, REQUEST_ID_HEADER } from '../capture/http';
import { installNavigationCapture, type SubscribableRouter } from '../capture/navigation';
import { loggingMiddleware } from '../capture/state';
import type { LogEntry } from '../types';

let sent: LogEntry[];

beforeEach(() => {
  logger.reset();
  sent = [];
  logger.start(async (events) => {
    sent.push(...events);
  });
  document.body.innerHTML = '';
});

afterEach(() => {
  logger.reset();
});

const flushed = async () => {
  await logger.flush();
  return sent;
};

describe('describeElement', () => {
  it('prefers data-log-id, then aria-label, then visible text', () => {
    document.body.innerHTML = `
      <button id="a" data-log-id="billing.complete-sale">Complete · Rs 500</button>
      <button id="b" aria-label="Close dialog"><svg></svg></button>
      <button id="c" class="mantine-Button-root"><span>Save   changes</span></button>`;
    expect(describeElement(document.getElementById('a')!).label).toBe('billing.complete-sale');
    expect(describeElement(document.getElementById('b')!).label).toBe('Close dialog');
    const c = describeElement(document.getElementById('c')!);
    expect(c.label).toBe('Save changes');
    expect(c.component).toBe('Button');
  });

  it('labels fields from their <label> and never from their value', () => {
    document.body.innerHTML = `<label for="phone">Customer phone</label><input id="phone" value="0771234567" />`;
    const input = document.getElementById('phone')!;
    expect(describeElement(input).label).toBe('Customer phone');
  });

  it('resolves the actionable ancestor of an inner node', () => {
    document.body.innerHTML = `<button id="btn"><span id="inner">Pay</span></button>`;
    expect(actionableElement(document.getElementById('inner'))?.id).toBe('btn');
  });

  it('treats passwords, card fields and data-log-redact as sensitive', () => {
    document.body.innerHTML = `
      <input id="p" type="password" />
      <input id="cc" autocomplete="cc-number" />
      <div data-log-redact><input id="r" /></div>
      <input id="n" name="customerName" />`;
    const el = (id: string) => document.getElementById(id)!;
    expect(isSensitiveField(el('p'))).toBe(true);
    expect(isSensitiveField(el('cc'))).toBe(true);
    expect(isSensitiveField(el('r'))).toBe(true);
    expect(isSensitiveField(el('n'))).toBe(false);
  });
});

describe('DOM capture', () => {
  it('logs clicks with the element description', async () => {
    const stop = installDomCapture(document);
    document.body.innerHTML = `<button data-log-id="inventory.delete"><span id="t">Delete</span></button>`;
    document.getElementById('t')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    stop();
    const [click] = await flushed();
    expect(click.category).toBe('ui');
    expect(click.event).toBe('click');
    expect((click.data as { element: { logId: string } }).element.logId).toBe('inventory.delete');
  });

  it('logs committed changes and masks sensitive values', async () => {
    const stop = installDomCapture(document);
    document.body.innerHTML = `
      <select id="s" name="method"><option value="cash">Cash</option><option value="card" selected>Card</option></select>`;
    document.getElementById('s')!.dispatchEvent(new Event('change', { bubbles: true }));
    stop();
    const [change] = await flushed();
    expect(change.event).toBe('change');
    expect((change.data as { value: string }).value).toBe('card');

    document.body.innerHTML = `<input id="pw" type="password" value="hunter2" />`;
    expect(fieldValue(document.getElementById('pw') as HTMLInputElement)).toEqual({
      value: '[REDACTED]',
      length: 7,
    });
  });

  it('only logs named keys and modifier combos', () => {
    expect(isLoggableKey(new KeyboardEvent('keydown', { key: 'a' }))).toBe(false);
    expect(isLoggableKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(true);
    expect(isLoggableKey(new KeyboardEvent('keydown', { key: 'F2' }))).toBe(true);
    expect(isLoggableKey(new KeyboardEvent('keydown', { key: 'h', ctrlKey: true }))).toBe(true);
    expect(isLoggableKey(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }))).toBe(
      false
    );
  });
});

describe('HTTP capture', () => {
  it('adds X-Request-Id and logs request + response under it with redacted bodies', async () => {
    let seenRequestId: string | undefined;
    const adapter: AxiosAdapter = async (config) => {
      seenRequestId = config.headers.get(REQUEST_ID_HEADER) as string;
      return {
        data: { success: true, data: { key: 'inv_1' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };
    const instance = axios.create({ baseURL: 'http://127.0.0.1:8080/api', adapter });
    installHttpCapture(instance, { client: 'api', successLevel: 'info' });

    await instance.post('/auth/login', { email: 'a@b.c', password: 'hunter2' });
    const [request, response] = await flushed();

    expect(seenRequestId).toMatch(/^req_[0-9a-f]{32}$/);
    expect(request.event).toBe('request');
    expect(request.request_id).toBe(seenRequestId);
    expect((request.data as { body: Record<string, string> }).body).toEqual({
      email: 'a@b.c',
      password: '[REDACTED]',
    });
    expect(response.event).toBe('response');
    expect(response.request_id).toBe(seenRequestId);
    expect((response.data as { status: number }).status).toBe(200);
  });

  it('logs failures with status-based level', async () => {
    const adapter: AxiosAdapter = async (config) => {
      const error = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
        data: { message: 'nope' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      });
      throw error;
    };
    const instance = axios.create({ adapter });
    installHttpCapture(instance, { client: 'api', successLevel: 'info' });
    await expect(instance.get('/missing')).rejects.toBeTruthy();
    const entries = await flushed();
    const failure = entries.find((e) => e.event === 'response');
    expect(failure?.level).toBe('warn');
    expect((failure?.data as { status: number }).status).toBe(404);
  });
});

describe('navigation capture', () => {
  it('records route changes and keeps the route context current', async () => {
    let listener: ((state: SubscribableRouter['state']) => void) | undefined;
    const location = (pathname: string, key: string) => ({ pathname, search: '', hash: '', key });
    const router: SubscribableRouter = {
      state: { location: location('/billing', 'k1'), historyAction: 'POP', matches: [] },
      subscribe: (fn) => {
        listener = fn;
        return () => undefined;
      },
    };
    installNavigationCapture(router);
    listener?.({
      location: location('/reports', 'k2'),
      historyAction: 'PUSH',
      matches: [{ route: { id: 'reports' } }],
    });
    logger.info('ui', 'after');
    const entries = await flushed();
    const change = entries.find((e) => e.event === 'route_change');
    expect(change?.data).toMatchObject({ from: '/billing', to: '/reports', action: 'PUSH' });
    expect(entries.find((e) => e.event === 'after')?.route).toBe('/reports');
  });
});

describe('Redux capture', () => {
  it('logs actions and tracks the signed-in user', async () => {
    const auth = createSlice({
      name: 'auth',
      initialState: { user: null as { id: string } | null },
      reducers: {
        login: (state, action: { payload: { id: string; password: string } }) => {
          state.user = { id: action.payload.id };
        },
      },
    });
    const store = configureStore({
      reducer: { auth: auth.reducer },
      middleware: (getDefault) => getDefault().concat(loggingMiddleware),
    });
    store.dispatch(auth.actions.login({ id: 'usr_7', password: 'secret' }));
    const entries = await flushed();
    expect(entries.find((e) => e.event === 'session.signed_in')?.data).toMatchObject({
      user: 'usr_7',
    });
    const action = entries.find((e) => e.event === 'action');
    expect(action?.session_user).toBe('usr_7');
    expect(action?.data).toMatchObject({
      type: 'auth/login',
      payload: { id: 'usr_7', password: '[REDACTED]' },
    });
  });
});
