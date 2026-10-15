import type { ReactNode } from 'react';
import { Box, Stack } from '@mantine/core';

/** The scrolling area of a drawer; also the container the two-column grid measures itself against. */
export const DrawerScroll = ({ children }: { children: ReactNode }) => (
  <Box className="rich-drawer-scroll">{children}</Box>
);

/** Two columns (left rail 5fr, main 7fr) that fold to one when the drawer is narrow. */
export const DrawerGrid = ({ children }: { children: ReactNode }) => (
  <Box className="rich-drawer-grid">{children}</Box>
);

/** The left column: sticky while the main column scrolls, and its cards fall below the main content when narrow. */
export const DrawerRail = ({ children }: { children: ReactNode }) => (
  <Stack gap="md" className="rich-drawer-rail">
    {children}
  </Stack>
);

/** A card in the left rail that moves below the main column when the drawer is narrow. */
export const DrawerAfter = ({ children }: { children: ReactNode }) => (
  <Box className="rich-drawer-after">{children}</Box>
);

/** The right column. */
export const DrawerMain = ({ children }: { children: ReactNode }) => (
  <Stack gap="md" className="rich-drawer-main">
    {children}
  </Stack>
);
