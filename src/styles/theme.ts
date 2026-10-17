import {
  Card,
  Container,
  createTheme,
  Drawer,
  DrawerContent,
  HoverCard,
  Menu,
  Modal,
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
    bordeaux: [
      '#fbe9ea',
      '#f2c9cc',
      '#e5a4a9',
      '#d67981',
      '#c7515c',
      '#a83a44',
      '#8c2e37',
      '#72222a',
      '#5a1a20',
      '#3f1216',
    ],
  },
  fontSizes: {
    '3xs': rem('10px'),
    '2xs': rem('11px'),
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
  respectReducedMotion: true,
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

    // One enter/exit for every dialog, menu and drawer: a short fade with a small scale/slide.
    // Mantine runs these as CSS transitions on opacity + transform, and
    // `respectReducedMotion` turns them off for people who ask the system for less motion.
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: {
          transition: 'pop',
          duration: 180,
          timingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      },
    }),
    Menu: Menu.extend({
      defaultProps: {
        transitionProps: { transition: 'fade-down', duration: 140 },
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

    Drawer: Drawer.extend({
      defaultProps: {
        position: 'right',
        offset: 16,
        radius: 'var(--mantine-radius-default)',
        shadow: 'xl',
        transitionProps: { duration: 200, timingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' },
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
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
      },
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
