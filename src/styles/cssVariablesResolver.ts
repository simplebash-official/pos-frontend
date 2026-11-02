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
  '--bg-hover': '#F8F9FA',
  '--bg-active': '#F1F3F5',

  // Borders
  '--border': '#E5E5E8',
  '--border-strong': '#D4D4D8',

  // Text
  '--text-primary': '#18181B',
  '--text-secondary': '#6E6E73',
  '--text-muted': '#A1A1A6',

  // Status. Named by meaning, not colour, so a status can be restyled in one
  // place. `warn` is the offline state — expected, not broken — while `error`
  // is reserved for "a person has to do something".
  '--status-ok': 'var(--mantine-color-green-7)',
  '--status-ok-bg': 'var(--mantine-color-green-0)',
  '--status-busy': 'var(--mantine-color-blue-7)',
  '--status-busy-bg': 'var(--mantine-color-blue-0)',
  '--status-warn': 'var(--mantine-color-orange-7)',
  '--status-warn-bg': 'var(--mantine-color-orange-0)',
  '--status-error': 'var(--mantine-color-red-7)',
  '--status-error-bg': 'var(--mantine-color-red-0)',
  '--status-idle': '#A1A1A6',
  '--status-idle-bg': '#F1F3F5',

  // Matched text inside a search result.
  '--search-highlight-bg': 'var(--mantine-color-amber-2)',
  '--search-highlight-text': 'var(--text-primary)',

  // Brand panel of the sign-in / onboarding screens, styled as a shop counter:
  // till green (money, "sale complete") with receipt-amber price tags on top.
  '--brand-grad-from': '#064E3B',
  '--brand-grad-via': '#047857',
  '--brand-grad-to': '#10B981',
  '--brand-grid-line': 'rgba(255, 255, 255, 0.07)',
  '--brand-accent': '#FBBF24',
  '--brand-accent-on': '#1C1917',
  '--receipt-paper': '#FFFDF7',
  '--receipt-ink': '#292524',
  '--brand-chip-bg': 'rgba(12, 20, 18, 0.88)',
  '--brand-chip-border': 'transparent',
  '--auth-page-bg': 'var(--bg-card)',
  '--brand-on': '#FFFFFF',
  '--brand-on-muted': 'rgba(255, 255, 255, 0.78)',
  '--glass-bg': 'rgba(255, 255, 255, 0.16)',
  '--glass-border': 'rgba(255, 255, 255, 0.32)',
  '--glass-active-bg': '#FFFFFF',
  '--glass-active-text': '#18181B',
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

  // Status — lighter foregrounds and darker grounds so they stay legible
  // against the dark surfaces.
  '--status-ok': 'var(--mantine-color-green-4)',
  '--status-ok-bg': 'var(--mantine-color-green-9)',
  '--status-busy': 'var(--mantine-color-blue-4)',
  '--status-busy-bg': 'var(--mantine-color-blue-9)',
  '--status-warn': 'var(--mantine-color-orange-4)',
  '--status-warn-bg': 'var(--mantine-color-orange-9)',
  '--status-error': 'var(--mantine-color-red-4)',
  '--status-error-bg': 'var(--mantine-color-red-9)',
  '--status-idle': 'var(--mantine-color-dark-2)',
  '--status-idle-bg': 'var(--mantine-color-dark-5)',

  // A translucent amber wash rather than a solid one: a filled amber block is
  // far too bright against a dark surface, and light text on it fails contrast.
  '--search-highlight-bg': 'rgba(250, 196, 25, 0.18)',
  '--search-highlight-text': 'var(--mantine-color-amber-3)',

  // A deep emerald (not black) so the panel still reads as green next to dark surfaces.
  '--brand-grad-from': '#022C22',
  '--brand-grad-via': '#064E3B',
  '--brand-grad-to': '#047857',
  '--brand-grid-line': 'rgba(255, 255, 255, 0.06)',
  '--brand-accent': '#F59E0B',
  '--brand-accent-on': '#1C1917',
  '--receipt-paper': '#F5F2EA',
  '--receipt-ink': '#1C1917',
  // Frosted glass: a dark slip would vanish on the dark panel.
  '--brand-chip-bg': 'rgba(255, 255, 255, 0.12)',
  '--brand-chip-border': 'rgba(255, 255, 255, 0.22)',
  // Near-black with a hint of the panel's green, so the two halves of the login belong together.
  '--auth-page-bg': '#0E1714',
  '--brand-on': '#FFFFFF',
  '--brand-on-muted': 'rgba(255, 255, 255, 0.72)',
  '--glass-bg': 'rgba(255, 255, 255, 0.08)',
  '--glass-border': 'rgba(255, 255, 255, 0.16)',
  '--glass-active-bg': 'var(--mantine-color-dark-6)',
  '--glass-active-text': 'var(--mantine-color-text)',
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
  '--mantine-color-table-hover-color': 'var(--bg-hover)',
  '--table-hover-color': 'var(--bg-hover)',
  '--mantine-color-table-striped-color': 'var(--bg-hover)',
  '--table-striped-color': 'var(--bg-hover)',
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
