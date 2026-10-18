import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { DocumentDesignStatus } from '../../api/documentsApi';

vi.mock('@/shared/hooks/useResponsive', () => ({ useIsMobile: () => false }));

import { ReprintDesignChoices } from '../ReprintDesignDialog';

const status: DocumentDesignStatus = {
  stored: { templateRef: 'doc_a', title: 'Classic', version: 2, createdAt: '2026-03-01T10:00:00Z' },
  current: { templateRef: 'doc_b', title: 'Modern', version: 3 },
  differs: true,
};

const render = (current: DocumentDesignStatus = status) =>
  renderToString(
    <MantineProvider>
      <ReprintDesignChoices
        status={current}
        isMobile={false}
        onChoose={() => undefined}
        onCancel={() => undefined}
      />
    </MantineProvider>
  );

describe('ReprintDesignChoices', () => {
  it('offers the original and the current design, each with its name and version', () => {
    const html = render();
    expect(html).toContain('Original design');
    expect(html).toContain('Classic v2');
    expect(html).toContain('Current design');
    expect(html).toContain('Modern v3');
    expect(html).toContain('data-log-id="billing.reprint-original-design"');
    expect(html).toContain('data-log-id="billing.reprint-current-design"');
    expect(html).toContain('Cancel');
  });

  it('says so when the old print did not record its design', () => {
    const html = render({
      ...status,
      stored: { ...status.stored!, templateRef: null, title: null, version: null },
    });
    expect(html).toContain('the design it was first printed with');
  });
});
