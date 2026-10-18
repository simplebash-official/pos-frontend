import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { DocumentKindSettings } from '../types';
import { NO_EDITS } from '../lib/designOptions';

vi.mock('@/store', () => ({ store: { getState: () => ({ settings: { appLanguage: 'en' } }) } }));
vi.mock('@/shared/hooks/useResponsive', () => ({ useIsMobile: () => false }));
// The preview modal pulls in the PDF viewer, which needs a browser.
vi.mock('../components/DocumentDesignPreviewModal', () => ({
  DocumentDesignPreviewModal: () => null,
}));

import { KindCard } from '../components/sections/DocumentDesignsSection';

const kind = (overrides: Partial<DocumentKindSettings> = {}): DocumentKindSettings => ({
  kind: 'a4-invoice',
  label: 'A4 Invoice',
  selected: 'fam_client',
  effective: 'fam_client',
  families: [
    { family: 'doc_classic', title: 'A4 Invoice', version: 1, isDefault: true, options: [] },
    {
      family: 'fam_client',
      title: 'Client Invoice',
      version: 4,
      isDefault: false,
      options: [
        { key: 'showSign', type: 'toggle', label: 'Signature box', default: true },
        {
          key: 'accent',
          type: 'select',
          label: 'Accent colour',
          default: 'blue',
          choices: [
            { value: 'blue', label: 'Blue' },
            { value: 'red', label: 'Red' },
          ],
        },
        { key: 'tint', type: 'color', label: 'Tint', default: '#112233' },
        { key: 'note', type: 'text', label: 'Footer note', default: '', maxLength: 40 },
      ],
    },
  ],
  optionValues: { fam_client: { showSign: false, accent: 'red', tint: '#112233', note: 'Thanks' } },
  ...overrides,
});

const render = (k: DocumentKindSettings, edits = NO_EDITS) =>
  renderToString(
    <MantineProvider>
      <KindCard
        kind={k}
        edits={edits}
        isMobile={false}
        onPickDesign={() => undefined}
        onSetOption={() => undefined}
        onPreview={() => undefined}
      />
    </MantineProvider>
  );

describe('KindCard', () => {
  it('shows a custom design with its version and a control for every setting', () => {
    const html = render(kind());
    expect(html).toContain('A4 Invoice');
    expect(html).toContain('Your design');
    expect(html).toContain('Client Invoice');
    expect(html).toContain('Version 4');
    expect(html).toContain('Settings for this design');
    expect(html).toContain('Signature box');
    expect(html).toContain('Accent colour');
    expect(html).toContain('Tint');
    expect(html).toContain('Footer note');
    // The saved text value is in the field, with its length counter.
    expect(html).toContain('value="Thanks"');
    expect(html).toContain('6 / 40');
  });

  it('shows the standard design without a settings form', () => {
    const html = render(kind({ selected: null, effective: 'doc_classic' }));
    expect(html).toContain('Standard design');
    expect(html).not.toContain('Settings for this design');
  });

  it('tells the admin to choose again when the saved design is gone', () => {
    const html = render(kind({ selected: 'fam_revoked', effective: null }));
    expect(html).toContain('The design you chose is no longer available');
    expect(html).toContain('Printing this document is paused until you choose a design and save.');
    expect(html).not.toContain('Settings for this design');
  });

  it('prefers an unsaved pick over the saved choice', () => {
    const html = render(kind(), { designs: { 'a4-invoice': 'doc_classic' }, options: {} });
    expect(html).toContain('Standard design');
    expect(html).not.toContain('Settings for this design');
  });
});
