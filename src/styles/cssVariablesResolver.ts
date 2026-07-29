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
  '--bg-app': 'var(--mantine-color-body)',
  '--bg-sidebar': 'var(--mantine-color-dark-8)',
  '--bg-card': 'var(--mantine-color-default)',
  '--bg-hover': 'var(--mantine-color-default-hover)',
  '--bg-active': 'var(--mantine-color-dark-5)',

  // Borders
  '--border': 'var(--mantine-color-default-border)',
  '--border-strong': 'var(--mantine-color-dark-4)',

  // Text
  '--text-primary': 'var(--mantine-color-text)',
  '--text-secondary': 'var(--mantine-color-dimmed)',
  '--text-muted': 'var(--mantine-color-placeholder)',
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
  },
});
