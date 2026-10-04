import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { SyncHero } from '../components/SyncHero';
import { SyncModulesList } from '../components/SyncModulesList';
import { SyncActivityList } from '../components/SyncActivityList';
import { DISABLED_SYNC_STATUS, type SyncStatus } from '../types';

// The layout hook reads a media query; these tests render on the server, which has none.
const desktopScreen = {
  matches: false,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
};
(globalThis as { window?: unknown }).window = { matchMedia: () => desktopScreen };

const html = (node: ReactElement) =>
  renderToString(
    <MantineProvider>
      <LayoutTierProvider>{node}</LayoutTierProvider>
    </MantineProvider>
  );

const linked = (over: Partial<SyncStatus> = {}): SyncStatus => ({
  ...DISABLED_SYNC_STATUS,
  linked: true,
  ...over,
});

const noop = () => undefined;
const hero = (status: SyncStatus) =>
  html(
    <SyncHero status={status} busy={false} onSyncNow={noop} onTogglePause={noop} onReview={noop} />
  );

describe('SyncHero', () => {
  it('reassures when everything is saved', () => {
    const out = hero(linked({ lastSyncAt: '2026-10-04T09:00:00Z' }));
    expect(out).toContain('Everything is saved to the cloud');
    expect(out).toContain('Last checked');
    expect(out).toContain('Sync now');
    expect(out).toContain('Pause sync');
  });

  it('shows a determinate bar and the count while sending', () => {
    const out = hero(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 8, total: 12 } })
    );
    expect(out).toContain('Sending your changes');
    expect(out).toContain('8 / 12');
    expect(out).toContain('role="progressbar"');
  });

  it('keeps the bar moving and says why while the first batch is with the cloud', () => {
    const out = hero(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 0, total: 183 } })
    );
    expect(out).toContain('Sending 183 changes to the cloud…');
    expect(out).toContain('Waiting for the cloud to confirm the first batch…');
    expect(out).toContain('data-animated="true"');
    expect(out).not.toContain('0 / 183');
  });

  it('switches to a real bar once a batch is confirmed', () => {
    const out = hero(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 50, total: 183 } })
    );
    expect(out).toContain('50 / 183');
    expect(out).not.toContain('data-animated="true"');
  });

  it('keeps the button label visible while syncing instead of showing only a spinner', () => {
    const out = hero(
      linked({ state: 'syncing', step: 'uploading', progress: { done: 0, total: 5 } })
    );
    expect(out).toMatch(/data-log-id="sync.now"[^>]*>.*Syncing…/s);
    expect(out).toMatch(
      /<button[^>]*disabled[^>]*data-log-id="sync.now"|data-log-id="sync.now"[^>]*disabled/
    );
    expect(hero(linked())).toContain('Sync now');
  });

  it('shows only a count while receiving an unknown amount', () => {
    const out = hero(
      linked({ state: 'syncing', step: 'downloading', progress: { done: 30, total: 0 } })
    );
    expect(out).toContain('30 received');
  });

  it('offers Resume and disables Sync now while paused', () => {
    const out = hero(linked({ state: 'paused', pendingOut: 2 }));
    expect(out).toContain('Resume sync');
    expect(out).toMatch(
      /<button[^>]*disabled[^>]*data-log-id="sync.now"|data-log-id="sync.now"[^>]*disabled/
    );
  });

  it('shows the retry countdown and Try again after an error', () => {
    const soon = new Date(Date.now() + 60_000).toISOString();
    const out = hero(linked({ state: 'error', lastError: 'Boom', nextRetryAt: soon }));
    expect(out).toContain('Boom');
    expect(out).toContain('Try again');
    expect(out).toContain('Trying again in');
  });

  it('has a Review button when the user must act', () => {
    expect(hero(linked({ conflictsOpen: 2 }))).toContain('data-log-id="sync.review"');
    expect(hero(linked())).not.toContain('data-log-id="sync.review"');
  });
});

describe('SyncModulesList', () => {
  it('lists every module as up to date on a quiet shop', () => {
    const out = html(<SyncModulesList status={linked()} />);
    expect(out).toContain('Sales &amp; Invoices');
    expect(out).toContain('Repair Jobs');
    expect(out).toContain('Login Accounts');
    expect(out).not.toContain('data-module-chip="waiting"');
  });

  it('shows what is waiting per module', () => {
    const out = html(
      <SyncModulesList
        status={linked({
          pendingOut: 8,
          modules: [{ resource: 'invoices', pending: 8, conflicts: 0 }],
        })}
      />
    );
    expect(out).toContain('data-module-chip="waiting"');
    expect(out).toContain('Waiting 8');
  });

  it('flags modules that need review', () => {
    const out = html(
      <SyncModulesList
        status={linked({ modules: [{ resource: 'products', pending: 0, conflicts: 2 }] })}
      />
    );
    expect(out).toContain('Needs review 2');
  });
});

describe('SyncActivityList', () => {
  it('explains the empty state', () => {
    expect(html(<SyncActivityList history={[]} />)).toContain('Nothing yet');
  });

  it('lists entries newest first as given', () => {
    const out = html(
      <SyncActivityList
        history={[
          { at: '2026-10-04T09:05:00Z', kind: 'synced', sent: 12, received: 3, message: null },
          { at: '2026-10-04T09:00:00Z', kind: 'offline', sent: 0, received: 0, message: null },
        ]}
      />
    );
    expect(out.indexOf('Synced')).toBeLessThan(out.indexOf('Internet lost'));
    expect(out).toContain('Sent 12 · Received 3');
  });
});
