import { Card, Container, createTheme, Paper, rem, Select } from '@mantine/core';
import type { MantineThemeOverride } from '@mantine/core';

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem('200px'),
  xs: rem('300px'),
  sm: rem('400px'),
  md: rem('500px'),
  lg: rem('600px'),
  xl: rem('1400px'),
  xxl: rem('1600px'),
};

export const mantineTheme: MantineThemeOverride = createTheme({
  /** Put your mantine theme override here */
  fontSizes: {
    xs: rem('12px'),
    sm: rem('14px'),
    md: rem('16px'),
    lg: rem('18px'),
    xl: rem('20px'),
    '2xl': rem('24px'),
    '3xl': rem('30px'),
    '4xl': rem('36px'),
    '5xl': rem('48px'),
  },
  spacing: {
    '3xs': rem('4px'),
    '2xs': rem('8px'),
    xs: rem('10px'),
    sm: rem('12px'),
    md: rem('16px'),
    lg: rem('20px'),
    xl: rem('24px'),
    '2xl': rem('28px'),
    '3xl': rem('32px'),
  },
  primaryColor: 'indigo',
  defaultRadius: 'lg',
  colors: {
    // near-black neutral scale for dark color scheme (replaces Mantine's default mid-gray dark palette).
    // Mirrors the dark tokens in `cssVariablesResolver.ts` — keep the two in sync: this palette feeds
    // Mantine's own `dark.N` lookups, the resolver feeds the semantic vars components should prefer.
    dark: [
      '#FAFAFA', // 0 --text-primary
      '#D4D4D8', // 1 bright emphasis text
      '#A1A1A6', // 2 --text-secondary (dimmed)
      '#6E6E73', // 3 --text-muted (placeholder)
      '#2E2E30', // 4 --border (default-border)
      '#1F1F22', // 5 --bg-hover (default-hover)
      '#18181A', // 6 --bg-card (default — Paper/Card/Table surface)
      '#0F0F10', // 7 --bg-app (body / page canvas)
      '#0A0A0B', // 8 disabled bg
      '#050506', // 9 darkest
    ],
  },
  components: {
    /** Put your mantine component override here */
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          '--container-size': fluid
            ? '100%'
            : size !== undefined && size in CONTAINER_SIZES
              ? CONTAINER_SIZES[size]
              : rem(size),
        },
      }),
    }),
    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        shadow: 'xl',
        radius: 'lg',
        withBorder: true,
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: 'xl',
        shadow: 'xl',
        radius: 'var(--mantine-radius-default)',
        withBorder: true,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: 'right',
      },
    }),
  },
  other: {
    style: 'mantine',
  },
});
