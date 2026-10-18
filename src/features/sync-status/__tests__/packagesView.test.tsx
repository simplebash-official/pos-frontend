import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DISABLED_SYNC_STATUS, NOT_CHECKED_PACKAGES, type PackagesStatus } from '../types';
import { packagesView } from '../lib/packagesView';

vi.mock('@/store', () => ({ store: { getState: () => ({ settings: { appLanguage: 'en' } }) } }));

import { PackagesLine } from '../components/CustomDesignsSyncLine';

const status = (over: Partial<PackagesStatus>): PackagesStatus => ({
  ...NOT_CHECKED_PACKAGES,
  ...over,
});

describe('packagesView', () => {
  it.each([
    [{ state: 'notChecked' }, 'gray', 'Not checked yet', null],
    [{ state: 'upToDate', installed: 3 }, 'teal', 'Up to date', 3],
    [{ state: 'upToDate', installed: 0 }, 'teal', 'Up to date', null],
    [{ state: 'pending', pending: 2 }, 'blue', 'Downloading', 2],
    [{ state: 'needsAppUpdate', needsAppUpdate: 1 }, 'orange', 'Needs an app update', 1],
    [{ state: 'error', lastError: 'boom' }, 'red', 'Could not download', null],
    [{ state: 'paused' }, 'yellow', 'Cloud paused', null],
  ] as const)('maps %j to %s / %s', (over, color, label, count) => {
    expect(packagesView(status(over as Partial<PackagesStatus>))).toMatchObject({
      color,
      label,
      count,
    });
  });

  it('shows the shell’s own error text untranslated, or a generic line when there is none', () => {
    expect(packagesView(status({ state: 'error', lastError: 'disk full' }))).toMatchObject({
      hint: 'disk full',
      hintIsRaw: true,
    });
    expect(packagesView(status({ state: 'error', lastError: null }))).toMatchObject({
      hint: 'We will try again after the next sync.',
      hintIsRaw: false,
    });
  });

  it('explains an up-to-date shop that has no custom designs', () => {
    expect(packagesView(status({ state: 'upToDate' })).hint).toBe(
      'Your shop has no custom designs yet.'
    );
  });
});

describe('PackagesLine', () => {
  const render = (packages: PackagesStatus) =>
    renderToString(
      <MantineProvider>
        <PackagesLine packages={packages} />
      </MantineProvider>
    );

  it('shows the state with its count and the last check time', () => {
    const html = render(
      status({ state: 'pending', pending: 2, checkedAt: '2026-03-01T10:00:00Z' })
    );
    expect(html).toContain('Custom designs on this computer');
    expect(html).toContain('Downloading');
    expect(html).toContain('· 2');
    expect(html).toContain('Checked');
  });

  it('shows a download error as the shell reported it', () => {
    const html = render(status({ state: 'error', lastError: 'disk full' }));
    expect(html).toContain('Could not download');
    expect(html).toContain('disk full');
  });
});

describe('the disabled status', () => {
  it('starts with nothing checked', () => {
    expect(DISABLED_SYNC_STATUS.packages).toEqual(NOT_CHECKED_PACKAGES);
  });
});
