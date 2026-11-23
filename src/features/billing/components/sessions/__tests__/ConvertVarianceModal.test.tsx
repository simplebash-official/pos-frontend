/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { ConvertVarianceModal } from '../ConvertVarianceModal';
import type { RegisterSession } from '../../../types';

installDrawerTestEnv();

const convert = vi.fn();
vi.mock('@/features/billing/hooks/useRegisterSession', () => ({
  useConvertVariance: () => ({ mutateAsync: convert, isPending: false }),
}));

const SESSION = {
  key: 'ses_1',
  sessionNumber: 'SES-000002',
  cashVarianceCents: -5000,
} as RegisterSession;

const text = () => document.body.textContent ?? '';
const button = (label: string) =>
  [...document.querySelectorAll('button')].find((b) => b.textContent === label) as
    HTMLButtonElement | undefined;

describe('ConvertVarianceModal approval', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    convert.mockReset();
    convert.mockResolvedValue({});
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const fill = async (selector: string, value: string) => {
    const field = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    await act(async () => {
      const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
      Object.getOwnPropertyDescriptor(proto.prototype, 'value')?.set?.call(field, value);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  const open = async (role: string) => {
    await act(async () => {
      root.render(
        <TestHarness role={role}>
          <ConvertVarianceModal opened onClose={vi.fn()} session={SESSION} />
        </TestHarness>
      );
    });
    await fill('input[placeholder*="Silva"]', 'Mr. Silva');
    await fill('textarea', 'Owner drawings');
  };

  it.each(['manager', 'admin'])('asks a signed-in %s for no PIN and sends none', async (role) => {
    await open(role);
    expect(text()).not.toContain('Manager PIN');
    expect(button('Apply Conversion')?.disabled).toBe(false);
    await act(async () => button('Apply Conversion')?.click());
    expect(convert).toHaveBeenCalledWith({
      key: 'ses_1',
      input: { recipient: 'Mr. Silva', reason: 'Owner drawings', managerPin: undefined },
    });
  });

  it('asks Staff for a manager PIN and sends it', async () => {
    await open('staff');
    expect(text()).toContain('Manager PIN');
    expect(button('Apply Conversion')?.disabled).toBe(true);
    await fill('input[type="password"]', '1234');
    await act(async () => button('Apply Conversion')?.click());
    expect(convert).toHaveBeenCalledWith({
      key: 'ses_1',
      input: { recipient: 'Mr. Silva', reason: 'Owner drawings', managerPin: '1234' },
    });
  });
});
