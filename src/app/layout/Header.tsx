import { t } from '@/shared/i18n/t';
import { PRODUCT_NAME, SERVICE_CENTER_NAME } from '@/config/branding';
import {
  Group,
  Burger,
  Title,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
  Text,
  Avatar,
  Indicator,
  Box,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconMaximize,
  IconMinimize,
  IconVolume,
  IconVolumeOff,
  IconHelpCircle,
  IconPlayerPause,
  IconMoon,
  IconSun,
  IconCalculator,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';

import { useCartItems, useHeldCarts, useCartSound } from '@/features/billing/hooks/useCart';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getActionShortcut } from '@/shared/lib/shortcuts';
import { ModernClock } from '@/shared/components/ModernClock';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
  focusMode?: boolean;
  heroClockVisible?: boolean;
  onToggleFocusMode?: () => void;
  onOpenHeldDrawer?: () => void;
  onOpenShortcuts?: () => void;
  onOpenCalculator?: () => void;
}

export const Header = ({
  opened,
  toggle,
  focusMode = false,
  heroClockVisible = false,
  onToggleFocusMode,
  onOpenHeldDrawer,
  onOpenShortcuts,
  onOpenCalculator,
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === ROUTES.DASHBOARD || location.pathname === '/';
  const isBillingPage = location.pathname === ROUTES.BILLING;
  const isMobile = useIsMobile();
  const showHeaderClock = isDashboard ? !heroClockVisible : true;

  const user = useAppSelector(selectAuthUser);
  const userName = user?.name || user?.email?.split('@')[0] || 'Operator';
  const initial = userName.charAt(0).toUpperCase();
  const userLabel = `${userName} (${user?.role || 'user'})`;

  const { itemCount: cartItemsCount } = useCartItems();
  const { heldCarts } = useHeldCarts();
  const { soundEnabled, toggleSoundFeedback } = useCartSound();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  if (isBillingPage) {
    return (
      <Group h="100%" px="sm" justify="space-between" align="center" style={{ userSelect: 'none' }}>
        {/* Left: Brand & Styled Clock */}
        <Group gap="xs" align="center" wrap="nowrap">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="xs" />
          <Title
            order={5}
            style={{ cursor: 'pointer', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            {t(PRODUCT_NAME)}
          </Title>
          <Box visibleFrom="xs" ml={6}>
            <ModernClock
              variant="compact"
              withBorder={false}
              style={{ backgroundColor: 'transparent', padding: 0 }}
            />
          </Box>
        </Group>

        {/* Right: Cashier, Held Sales, Sound, Focus Mode, Shortcuts */}
        <Group gap="xs" align="center" wrap="nowrap">
          {heldCarts.length > 0 && (
            <Button
              size="xs"
              color="orange"
              variant="filled"
              leftSection={<IconPlayerPause size={14} />}
              onClick={onOpenHeldDrawer}
            >
              {t('Held (')}
              {heldCarts.length})
            </Button>
          )}

          <Tooltip label={`Sound Feedback: ${soundEnabled ? 'ON' : 'OFF'}`}>
            <ActionIcon
              variant={soundEnabled ? 'light' : 'subtle'}
              color={soundEnabled ? 'blue' : 'gray'}
              size="sm"
              onClick={toggleSoundFeedback}
            >
              {soundEnabled ? <IconVolume size={16} /> : <IconVolumeOff size={16} />}
            </ActionIcon>
          </Tooltip>

          {/* Focus mode is an F11 toggle and the shortcuts sheet only lists keys — neither is
              reachable on a touch device, so both drop away with the rest of the keyboard chrome. */}
          <Tooltip
            label={
              focusMode
                ? `${t('Exit Focus Mode')} (${getActionShortcut('focusMode').formattedPrimary})`
                : `${t('Focus Mode')} (${getActionShortcut('focusMode').formattedPrimary})`
            }
          >
            <ActionIcon
              variant={focusMode ? 'light' : 'subtle'}
              color={focusMode ? 'blue' : 'gray'}
              size="sm"
              visibleFrom="sm"
              onClick={onToggleFocusMode}
            >
              {focusMode ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('Keyboard Shortcuts (?)')}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              visibleFrom="sm"
              onClick={onOpenShortcuts}
            >
              <IconHelpCircle size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('Calculator (Alt+C)')}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={isMobile ? 44 : 'sm'}
              onClick={onOpenCalculator}
              aria-label={t('Calculator')}
            >
              <IconCalculator size={isMobile ? 20 : 16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
            </ActionIcon>
          </Tooltip>

          <NotificationPopover size={isMobile ? 44 : 32} variant="subtle" color="gray" />

          <Tooltip label={`Cashier: ${userLabel}`}>
            <Group gap={6} style={{ cursor: 'default' }} wrap="nowrap">
              <Avatar size={24} radius="xl" color="blue" src={null}>
                {initial}
              </Avatar>
              <Text size="xs" fw={700} visibleFrom="xs">
                {userName}
              </Text>
            </Group>
          </Tooltip>
        </Group>
      </Group>
    );
  }

  // Non-billing standard header
  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap" align="center">
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, overflow: 'hidden' }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title
          order={isMobile ? 5 : 3}
          style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          {isMobile ? PRODUCT_NAME : SERVICE_CENTER_NAME}
        </Title>
      </Group>

      {/* Dynamic Header Clock: smoothly shown on scroll or on other screens */}
      <Box
        style={{
          opacity: showHeaderClock ? 1 : 0,
          transform: showHeaderClock ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
          pointerEvents: showHeaderClock ? 'auto' : 'none',
          transition: 'opacity 220ms ease, transform 220ms ease, visibility 220ms ease',
          visibility: showHeaderClock ? 'visible' : 'hidden',
          flexShrink: 0,
        }}
      >
        <ModernClock variant="header" />
      </Box>

      <Group gap="xs" wrap="nowrap" align="center">
        <Tooltip label={t('Calculator (Alt+C)')}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={isMobile ? 44 : 32}
            onClick={onOpenCalculator}
            aria-label={t('Calculator')}
          >
            <IconCalculator size={isMobile ? 20 : 18} />
          </ActionIcon>
        </Tooltip>

        <NotificationPopover size={isMobile ? 44 : 32} variant="subtle" color="gray" />

        {isMobile ? (
          <Tooltip label={t('Billing Counter')}>
            <Indicator
              inline
              label={cartItemsCount}
              maxValue={99}
              size={18}
              color="red"
              disabled={cartItemsCount <= 0}
              withBorder
              offset={4}
              styles={{
                indicator: {
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '0 4px',
                  minWidth: 18,
                  height: 18,
                  lineHeight: '16px',
                  borderColor: 'var(--mantine-color-body)',
                },
              }}
            >
              <ActionIcon
                variant="filled"
                color="blue"
                size={44}
                aria-label={t('Billing Counter')}
                onClick={() => navigate(ROUTES.BILLING)}
              >
                <IconShoppingCart size={20} />
              </ActionIcon>
            </Indicator>
          </Tooltip>
        ) : (
          <Button
            leftSection={<IconShoppingCart size={18} />}
            variant="filled"
            color="blue"
            size="sm"
            onClick={() => navigate(ROUTES.BILLING)}
          >
            {t('Billing Counter')}
            {cartItemsCount > 0 && (
              <Badge color="white" c="blue" size="xs" ml="xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        )}

        <Tooltip label={`Active User: ${userLabel}`}>
          <Avatar size={isMobile ? 28 : 32} radius="xl" color="blue">
            {initial}
          </Avatar>
        </Tooltip>
      </Group>
    </Group>
  );
};
