/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { IconCoins } from '@tabler/icons-react';

import { SidebarSectionHeader } from '../SidebarSectionHeader';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// MantineProvider reads the colour scheme through matchMedia, which jsdom lacks.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList;

const renderHeader = (isOpen: boolean, holdsActive: boolean) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() =>
    createRoot(container).render(
      <MantineProvider>
        <SidebarSectionHeader
          title="Money"
          Icon={IconCoins}
          count={6}
          isOpen={isOpen}
          holdsActive={holdsActive}
          controlsId="sidebar-section-money"
          isMobile={false}
          onToggle={() => {}}
        />
      </MantineProvider>
    )
  );
  return container;
};

const marker = '[aria-label="Current page is in here"]';

describe('SidebarSectionHeader', () => {
  it('open: shows the section icon on its tile and no count', () => {
    const c = renderHeader(true, true);
    expect(c.querySelector('.sidebar-section-tile svg')).not.toBeNull();
    expect(c.querySelector('button')?.getAttribute('aria-label')).toBe('Money, 6');
    expect(c.querySelector('.sidebar-section-count')).toBeNull();
    // An open section shows the page's own item, so the header does not point at it.
    expect(c.querySelector(marker)).toBeNull();
  });

  it('folded: shows how many items it hides', () => {
    const c = renderHeader(false, false);
    expect(c.querySelector('.sidebar-section-count')?.textContent).toBe('6');
    expect(c.querySelector('button')?.getAttribute('data-holds-active')).toBe('false');
    expect(c.querySelector(marker)).toBeNull();
  });

  it('folded with the open page inside: the header points at it', () => {
    const c = renderHeader(false, true);
    expect(c.querySelector('button')?.getAttribute('data-holds-active')).toBe('true');
    expect(c.querySelector(marker)).not.toBeNull();
  });
});
