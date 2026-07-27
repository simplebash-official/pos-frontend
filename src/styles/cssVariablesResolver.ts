import { CSSVariablesResolver } from '@mantine/core';

/**
 * App design tokens. Components reference the token name (`var(--bg-card)`,
 * `var(--text-primary)`, …) and never a raw hex, so switching color scheme
 * only flips the values below — no component code changes.
 *
 * The Mantine semantic vars are re-pointed at the same tokens so built-in
 * Mantine components (Paper, Table, Input, …) pick up the palette too.
 */
const lightTokens: Record<string, string> = {
  // Surfaces
  '--bg-app': '#F5F5F7',
  '--bg-sidebar': '#FAFAFA',
  '--bg-card': '#FFFFFF',
  '--bg-hover': '#F0F0F2',
  '--bg-active': '#E8E8EB',

  // Borders
  '--border': '#E5E5E8',
  '--border-strong': '#D4D4D8',

  // Text
  '--text-primary': '#18181B',
  '--text-secondary': '#6E6E73',
  '--text-muted': '#A1A1A6',
};

const darkTokens: Record<string, string> = {
  // Surfaces
  '--bg-app': '#0F0F10',
  '--bg-sidebar': '#141416',
  '--bg-card': '#18181A',
  '--bg-hover': '#1F1F22',
  '--bg-active': '#232326',

  // Borders
  '--border': '#2E2E30',
  '--border-strong': '#3A3A3D',

  // Text
  '--text-primary': '#FAFAFA',
  '--text-secondary': '#A1A1A6',
  '--text-muted': '#6E6E73',
};

/** Mantine's scheme-adaptive semantic vars, expressed in terms of the tokens above. */
const semanticVars: Record<string, string> = {
  '--mantine-color-body': 'var(--bg-app)',
  '--mantine-color-default': 'var(--bg-card)',
  '--mantine-color-default-hover': 'var(--bg-hover)',
  '--mantine-color-default-border': 'var(--border)',
  '--mantine-color-text': 'var(--text-primary)',
  '--mantine-color-default-color': 'var(--text-primary)',
  '--mantine-color-dimmed': 'var(--text-secondary)',
  '--mantine-color-placeholder': 'var(--text-muted)',
};

export const mantineCssVariableResolver: CSSVariablesResolver = () => ({
  variables: {
    //  variables that do not depend on color scheme
  },
  light: {
    ...lightTokens,
    ...semanticVars,
  },
  dark: {
    ...darkTokens,
    ...semanticVars,
  },
});
