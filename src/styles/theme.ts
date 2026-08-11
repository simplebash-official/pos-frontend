import {
  Card,
  Container,
  createTheme,
  DrawerContent,
  HoverCard,
  ModalContent,
  Notification,
  Paper,
  rem,
  SegmentedControl,
  Select,
  Table,
  Tooltip,
} from '@mantine/core';
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
  colors: {
    amber: [
      '#fff9db',
      '#fff3bf',
      '#ffec99',
      '#ffe066',
      '#ffd43b',
      '#fcc419',
      '#fab005',
      '#f59f00',
      '#f08c00',
      '#e67700',
    ],
  },
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
  primaryColor: 'blue',
  defaultRadius: 'md',
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
        shadow: 'none',
        radius: 'var(--mantine-radius-default)',
        withBorder: true,
      },
    }),

    ModalContent: ModalContent.extend({
      defaultProps: {
        p: 0,
      },
    }),

    DrawerContent: DrawerContent.extend({
      defaultProps: {
        p: 0,
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: 'xl',
        shadow: 'none',
        radius: 'var(--mantine-radius-default)',
        withBorder: true,
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        radius: 'var(--mantine-radius-default)',
        withArrow: true,
      },
    }),
    HoverCard: HoverCard.extend({
      defaultProps: {
        radius: 'var(--mantine-radius-default)',
        withArrow: true,
        shadow: 'md',
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: 'right',
      },
    }),
    Notification: Notification.extend({
      defaultProps: {
        radius: 'var(--mantine-radius-default)',
        withCloseButton: true,
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        radius: 'var(--mantine-radius-default)',
      },
    }),
    Table: Table.extend({
      styles: {
        th: {
          color: 'var(--text-secondary)',
          fontSize: 'var(--mantine-font-size-xs)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          height: '44px',
        },
        td: {
          verticalAlign: 'middle',
        },
      },
    }),
  },
  other: {
    style: 'mantine',
  },
});
