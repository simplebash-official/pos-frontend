import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { DataChoiceStep } from '../components/DataChoiceStep';

// The admin fields are the desktop shell's; on web the signed-in session is used instead.
vi.mock('@/shared/lib/runtime', () => ({ isTauri: () => true }));

// React's server renderer separates adjacent text nodes with `<!-- -->`; drop those before matching.
const html = (props: Partial<Parameters<typeof DataChoiceStep>[0]> = {}) =>
  renderToString(
    <MantineProvider>
      <DataChoiceStep loading={false} onSubmit={() => {}} onPrev={() => {}} {...props} />
    </MantineProvider>
  ).replace(/<!-- -->/g, '');

describe('DataChoiceStep admin details', () => {
  it('starts empty when no cloud account is linked', () => {
    const out = html();
    expect(out).toContain('placeholder="owner@yourshop.com"');
    expect(out).toContain('value="System Administrator"');
  });

  it('offers the linked cloud account as the admin email and name', () => {
    const out = html({ suggested: { email: 'owner@shop.lk', name: 'Ann Perera' } });
    expect(out).toContain('value="owner@shop.lk"');
    expect(out).toContain('value="Ann Perera"');
  });

  it('keeps the default name when the cloud account has none', () => {
    const out = html({ suggested: { email: 'owner@shop.lk', name: null } });
    expect(out).toContain('value="owner@shop.lk"');
    expect(out).toContain('value="System Administrator"');
  });
});
