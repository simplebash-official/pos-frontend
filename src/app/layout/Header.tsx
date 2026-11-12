import { t } from '@/shared/i18n/t';
import { SERVICE_CENTER_NAME } from '@/config/branding';
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
  IconCalculator,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';

import { useCartItems, useHeldCarts, useCartSound } from '@/features/billing/hooks/useCart';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { ROUTES } from '@/constants/routes';
import { formatUserRole } from '@/constants/roles';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useColorSchemeReveal } from '@/shared/hooks/useColorSchemeReveal';
import { NEXT_SCHEME, SCHEME_ICON, SCHEME_LABEL, type SchemeChoice } from './colorSchemeChoice';
import { getActionShortcut } from '@/shared/lib/shortcuts';
import { ModernClock } from '@/shared/components/ModernClock';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SyncBadge } from '@/features/sync-status';
import { HeaderUpdateIndicator } from './HeaderUpdateIndicator';
import { useCloudState } from '@/features/account';
import { RegisterSessionBadge } from '@/features/billing/components/sessions';

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
  const reduceMotion = useReducedMotion();
  const showHeaderClock = isDashboard ? !heroClockVisible : true;

  const user = useAppSelector(selectAuthUser);
  const userName = user?.name || user?.username || 'Operator';
  const initial = userName.charAt(0).toUpperCase();
  const roleLabel = user?.role ? formatUserRole(user.role) : '';
  const userLabel = roleLabel ? `${userName} (${roleLabel})` : userName;

  const shopProfile = useAppSelector(selectShopProfile);
  const { state: cloudState } = useCloudState();
  const shopName =
    shopProfile?.tradingName?.trim() ||
    shopProfile?.legalName?.trim() ||
    (cloudState.linked ? cloudState.shopName?.trim() : null);
  const headerTitle = shopName || SERVICE_CENTER_NAME;

  const { itemCount: cartItemsCount } = useCartItems();
  const { heldCarts } = useHeldCarts();
  const { soundEnabled, toggleSoundFeedback } = useCartSound();
  const { colorScheme } = useMantineColorScheme();
  const revealColorScheme = useColorSchemeReveal();
  const scheme = colorScheme as SchemeChoice;
  const SchemeIcon = SCHEME_ICON[scheme];

  if (isBillingPage) {
    return (
      <Group
        h="100%"
        px="sm"
        justify="space-between"
        align="center"
        style={{ userSelect: 'none', position: 'relative' }}
      >
        {/* Left: Brand */}
        <Group gap="xs" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="xs" />
          <Title
            order={5}
            style={{
              cursor: 'pointer',
              letterSpacing: '-0.3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? 140 : 280,
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
            onClick={() => navigate(ROUTES.DASHBOARD)}
            title={headerTitle}
          >
            {headerTitle}
          </Title>
        </Group>

        {/* Center: Styled Compact Clock */}
        <Box
          visibleFrom="sm"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            zIndex: 1,
          }}
        >
          <ModernClock variant="compact" />
        </Box>

        {/* Right: Cashier, Held Sales, Sound, Focus Mode, Shortcuts */}
        <Group gap="xs" align="center" wrap="nowrap">
          <RegisterSessionBadge />
          <AnimatePresence initial={false}>
            {heldCarts.length > 0 && (
              <motion.div
                key="held"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.85 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

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

          <Tooltip label={t(SCHEME_LABEL[scheme])}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={t(SCHEME_LABEL[scheme])}
              onClick={(event) => revealColorScheme(NEXT_SCHEME[scheme], event.currentTarget)}
            >
              <SchemeIcon size={16} />
            </ActionIcon>
          </Tooltip>

          <HeaderUpdateIndicator cartItemsCount={cartItemsCount} />
          <SyncBadge />
          <NotificationPopover size={isMobile ? 44 : 32} variant="subtle" color="gray" />

          <Tooltip label={`Cashier: ${userLabel}`}>
            <Group
              gap={6}
              style={{ cursor: 'default' }}
              wrap="nowrap"
              aria-label={`Cashier: ${userLabel}`}
            >
              <Avatar size={28} radius="xl" color="blue">
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
    <Group
      h="100%"
      px="md"
      justify="space-between"
      wrap="nowrap"
      align="center"
      style={{ position: 'relative' }}
    >
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, overflow: 'hidden' }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title
          order={isMobile ? 5 : 3}
          style={{
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isMobile ? 180 : 360,
          }}
          onClick={() => navigate(ROUTES.DASHBOARD)}
          title={headerTitle}
        >
          {headerTitle}
        </Title>
      </Group>

      {/* Dynamic Header Clock: centered in header bar, smoothly shown on scroll or on other screens */}
      <Box
        visibleFrom="sm"
        style={{
          position: 'absolute',
          left: '50%',
          transform: showHeaderClock
            ? 'translateX(-50%) translateY(0) scale(1)'
            : 'translateX(-50%) translateY(-6px) scale(0.96)',
          opacity: showHeaderClock ? 1 : 0,
          pointerEvents: showHeaderClock ? 'auto' : 'none',
          transition: 'opacity 220ms ease, transform 220ms ease, visibility 220ms ease',
          visibility: showHeaderClock ? 'visible' : 'hidden',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <ModernClock variant="header" />
      </Box>

      <Group gap="xs" wrap="nowrap" align="center">
        <RegisterSessionBadge />
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

        <HeaderUpdateIndicator cartItemsCount={cartItemsCount} />
        <SyncBadge />
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
      </Group>
    </Group>
  );
};
