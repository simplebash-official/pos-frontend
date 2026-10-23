/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { ReceiptsAction } from '../ReceiptsAction';
import type { Attachment } from '../../types';

installDrawerTestEnv();

const PHOTO: Attachment = {
  key: 'att_1',
  ownerKind: 'expense',
  ownerKey: 'exp_1',
  fileName: 'receipt.jpg',
  contentType: 'image/jpeg',
  sizeBytes: 1000,
  uploadedByNameSnapshot: 'Mgr',
  createdAt: '2026-10-23T00:00:00Z',
};
let PHOTOS: Attachment[] = [];
const upload = { mutateAsync: vi.fn(), isPending: false };
const shrink = vi.fn();

vi.mock('@/features/attachments/hooks/useAttachments', () => ({
  useAttachments: () => ({ data: PHOTOS, isLoading: false }),
  useAttachmentImage: () => ({ data: 'blob:photo', isLoading: false }),
  useUploadAttachment: () => upload,
}));
vi.mock('@/features/attachments/lib/shrinkImage', () => ({
  shrinkImage: (file: File) => shrink(file),
  blobToBase64: async () => '/9j/',
}));

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'manager', permissions },
        }),
      },
    })
  );
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider env="test">
          <LayoutTierProvider>{children}</LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const ATTACH = ['attachments:view', 'attachments:create'];

describe('Receipt photos', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    PHOTOS = [];
    upload.mutateAsync.mockReset();
    shrink.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[]) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <ReceiptsAction ownerKind="expense" ownerKey="exp_1" number="EXP-000001" />
        </Harness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const open = async () =>
    act(async () =>
      (document.querySelector('[aria-label="Receipts EXP-000001"]') as HTMLElement).click()
    );
  const pick = async () => {
    const input = document.body.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      value: [new File(['x'], 'shot.png', { type: 'image/png' })],
      configurable: true,
    });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  it('is hidden from people who may not see photos', async () => {
    await render([]);
    expect(document.querySelector('[aria-label="Receipts EXP-000001"]')).toBeNull();
  });

  it('says there are no photos, and offers to add one only to people who may attach to this record', async () => {
    await render([...ATTACH, 'expenses:manage']);
    await open();
    expect(text()).toContain('No receipt photos yet.');
    expect(text()).toContain('Add photo');

    act(() => root.unmount());
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await render(['attachments:view', 'attachments:create']);
    await open();
    expect(text()).not.toContain('Add photo');
  });

  it('shows the photos a record has', async () => {
    PHOTOS = [PHOTO];
    await render(ATTACH);
    await open();
    expect(document.querySelector('img[alt="receipt.jpg"]')).not.toBeNull();
  });

  it('sends a shrunk photo, and says so when the photo cannot be used', async () => {
    await render([...ATTACH, 'expenses:manage']);
    await open();

    shrink.mockResolvedValueOnce(null);
    await pick();
    expect(upload.mutateAsync).not.toHaveBeenCalled();
    expect(text()).toContain('That photo could not be used. Please try another one.');

    shrink.mockResolvedValueOnce(new Blob(['x']));
    upload.mutateAsync.mockResolvedValue(PHOTO);
    await pick();
    expect(upload.mutateAsync).toHaveBeenCalledWith({
      ownerKind: 'expense',
      ownerKey: 'exp_1',
      fileName: 'shot.png',
      contentType: 'image/jpeg',
      dataBase64: '/9j/',
    });
  });
});
