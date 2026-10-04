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

  describe("with the shop's existing admin (downloaded from the cloud)", () => {
    const existing = html({ existingAdmin: { email: 'owner@shop.lk' } });

    it('shows the cloud email read-only and asks for the POS password', () => {
      expect(existing).toContain('value="owner@shop.lk"');
      expect(existing).toMatch(/readonly/i);
      expect(existing).toContain('POS password');
    });

    it('does not ask for a name or a new admin', () => {
      expect(existing).not.toContain('Admin Full Name');
      expect(existing).not.toContain('owner@yourshop.com');
      expect(existing).not.toContain('Initial Administrator Account');
    });

    it('still offers the demo vs clean choice', () => {
      expect(existing).toContain('Load Sample / Demo Data');
      expect(existing).toContain('Clean Database');
    });
  });
});
