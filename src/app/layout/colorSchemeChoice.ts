import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

/**
 * The one definition of the theme controls, shared by the Billing header button and the
 * sidebar (rail button and segmented control) so they always show the same mode: the icon
 * and label name the mode in force, and a click moves to the next one.
 */
export type SchemeChoice = 'light' | 'dark' | 'auto';

export const NEXT_SCHEME: Record<SchemeChoice, SchemeChoice> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
};

export const SCHEME_LABEL: Record<SchemeChoice, string> = {
  light: 'Light Mode',
  dark: 'Dark Mode',
  auto: 'System',
};

export const SCHEME_ICON = { light: IconSun, dark: IconMoon, auto: IconDeviceDesktop } as const;
