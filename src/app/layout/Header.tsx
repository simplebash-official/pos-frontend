import { useState, useEffect } from 'react';
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
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMantineColorScheme } from '@mantine/core';

import { useCart } from '@/features/billing/hooks/useCart';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  onOpenHeldDrawer?: () => void;
  onOpenShortcuts?: () => void;
}

export function Header({
  opened,
  toggle,
  focusMode = false,
  onToggleFocusMode,
  onOpenHeldDrawer,
  onOpenShortcuts,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isBillingPage = location.pathname === ROUTES.BILLING;

  const user = useAppSelector(selectAuthUser);
  const userName = user?.name || user?.email?.split('@')[0] || 'Operator';
  const initial = userName.charAt(0).toUpperCase();
  const userLabel = `${userName} (${user?.role || 'user'})`;

  const { itemCount: cartItemsCount, heldCarts, soundEnabled, toggleSoundFeedback } = useCart();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  // Live ticking clock for billing strip
  const [timeStr, setTimeStr] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isBillingPage) {
    return (
      <Group h="100%" px="sm" justify="space-between" align="center" style={{ userSelect: 'none' }}>
        {/* Left: Brand & Connection Status */}
        <Group gap="xs" align="center">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="xs" />
          <Title
            order={5}
            style={{ cursor: 'pointer', letterSpacing: '-0.3px' }}
            onClick={() => navigate(ROUTES.BILLING)}
          >
            JANA2U POS
          </Title>
          <Badge
            size="xs"
            color="green"
            variant="light"
            visibleFrom="sm"
            leftSection={
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-green-6)',
                  display: 'inline-block',
                }}
              />
            }
          >
            Online
          </Badge>
          <Text
            size="xs"
            c="dimmed"
            fw={600}
            visibleFrom="sm"
            style={{ fontFamily: 'monospace', marginLeft: 8 }}
          >
            {timeStr}
          </Text>
        </Group>

        {/* Right: Cashier, Held Sales, Sound, Focus Mode, Shortcuts */}
        <Group gap="xs" align="center">
          {heldCarts.length > 0 && (
            <Button
              size="xs"
              color="orange"
              variant="filled"
              leftSection={<IconPlayerPause size={14} />}
              onClick={onOpenHeldDrawer}
            >
              Held ({heldCarts.length})
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
          <Tooltip label={focusMode ? 'Exit Focus Mode (F11)' : 'Focus Mode (F11)'}>
            <ActionIcon
              variant={focusMode ? 'filled' : 'light'}
              color="blue"
              size="sm"
              visibleFrom="sm"
              onClick={onToggleFocusMode}
            >
              {focusMode ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Keyboard Shortcuts (?)">
            <ActionIcon
              variant="light"
              color="gray"
              size="sm"
              visibleFrom="sm"
              onClick={onOpenShortcuts}
            >
              <IconHelpCircle size={16} />
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

          <Tooltip label={`Cashier: ${userLabel}`}>
            <Group gap={6} style={{ cursor: 'default' }}>
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
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate(ROUTES.BILLING)}>
          Jana2U Service Center
        </Title>
      </Group>

      <Group gap="xs">
        <Button
          leftSection={<IconShoppingCart size={18} />}
          variant="filled"
          color="blue"
          size="sm"
          onClick={() => navigate(ROUTES.BILLING)}
        >
          Billing Counter
          {cartItemsCount > 0 && (
            <Badge color="white" c="blue" size="xs" ml="xs">
              {cartItemsCount}
            </Badge>
          )}
        </Button>

        <Tooltip label={`Active User: ${userLabel}`}>
          <Avatar size={32} radius="xl" color="blue">
            {initial}
          </Avatar>
        </Tooltip>
      </Group>
    </Group>
  );
}
