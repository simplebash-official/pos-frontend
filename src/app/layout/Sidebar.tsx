import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Stack,
  NavLink,
  Text,
  Divider,
  Paper,
  useMantineColorScheme,
  useComputedColorScheme,
  Badge,
  Tooltip,
  ActionIcon,
  Box,
} from '@mantine/core';
import { IconLock, IconMoon, IconSun, IconSettings, IconLogout } from '@tabler/icons-react';
import { useMemo } from 'react';

import { NAV_ITEMS } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { useLowStockProducts } from '@/features/inventory/hooks/useProducts';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUserRole } from '@/store/slices/authSlice';

export interface SidebarProps {
  closeMobile?: () => void;
  isRail?: boolean;
}

export const Sidebar = ({ closeMobile, isRail = false }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = useComputedColorScheme('light') === 'dark';
  const role = useAppSelector(selectUserRole);
  const isAdmin = role === USER_ROLES.ADMIN;

  const { data: lowStockProducts } = useLowStockProducts();
  const lowStockCount = lowStockProducts.length;

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin]
  );

  // Settings has its own shortcut in the bottom support block below, so the
  // full-mode top list omits it to avoid listing it twice. Rail mode keeps it
  // (it has no bottom Settings shortcut of its own).
  const topNavItems = useMemo(
    () => visibleNavItems.filter((item) => item.to !== ROUTES.SETTINGS),
    [visibleNavItems]
  );

  const handleLogout = () => {
    dispatch(logout());
    if (closeMobile) closeMobile();
    navigate(ROUTES.LOGIN);
  };

  if (isRail) {
    return (
      <Stack h="100%" justify="space-between" align="center" py="xs" px={4}>
        <Stack gap="xs" align="center" style={{ width: '100%' }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            const isInventory = item.to === ROUTES.INVENTORY;

            return (
              <Tooltip key={item.to} label={item.label} position="right" withArrow>
                <Box style={{ position: 'relative' }}>
                  <ActionIcon
                    component={RouterNavLink}
                    to={item.to}
                    size="lg"
                    variant={isActive ? 'filled' : 'subtle'}
                    color={isActive ? item.color || 'blue' : 'gray'}
                    onClick={closeMobile}
                  >
                    <Icon size={20} stroke={1.5} />
                  </ActionIcon>
                  {isInventory && lowStockCount > 0 && (
                    <Badge
                      size="xs"
                      color="red"
                      variant="filled"
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        padding: '0 4px',
                        fontSize: 9,
                        minWidth: 14,
                        height: 14,
                      }}
                    >
                      {lowStockCount}
                    </Badge>
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Stack>

        <Stack gap="xs" align="center">
          <Tooltip label="Lock / Logout POS" position="right" withArrow>
            <ActionIcon size="lg" variant="subtle" color="gray" onClick={handleLogout}>
              <IconLock size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={isDark ? 'Light Mode' : 'Dark Mode'} position="right" withArrow>
            <ActionIcon
              size="lg"
              variant="subtle"
              color="gray"
              onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack h="100%" justify="space-between" p="sm">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" pt="xs">
          Feature Domains
        </Text>
        {topNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          const isInventory = item.to === ROUTES.INVENTORY;

          return (
            <NavLink
              key={item.to}
              component={RouterNavLink}
              to={item.to}
              label={item.label}
              leftSection={<Icon size={20} stroke={1.5} />}
              rightSection={
                isInventory && lowStockCount > 0 ? (
                  <Badge size="xs" color="red" variant="filled">
                    {lowStockCount}
                  </Badge>
                ) : undefined
              }
              active={isActive}
              color={item.color}
              variant="light"
              onClick={closeMobile}
              style={{ borderRadius: 'var(--mantine-radius-default)' }}
            />
          );
        })}
      </Stack>

      <Stack gap="xs">
        <Divider my="xs" />
        <Paper>
          <Stack gap="xs">
            <NavLink
              component={RouterNavLink}
              to={ROUTES.SETTINGS}
              label="Settings"
              leftSection={<IconSettings size={20} stroke={1.5} />}
              active={location.pathname.startsWith(ROUTES.SETTINGS)}
              color="blue"
              variant="light"
              onClick={closeMobile}
              style={{ borderRadius: 'var(--mantine-radius-default)' }}
            />
            <SegmentedToggle
              fullWidth
              value={colorScheme}
              onChange={(value) => setColorScheme(value as 'light' | 'dark' | 'auto')}
              data={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System', value: 'auto' },
              ]}
            />
            <Divider />
            <NavLink
              label="Sign Out"
              leftSection={<IconLogout size={20} stroke={1.5} />}
              active={false}
              color="gray"
              variant="subtle"
              onClick={handleLogout}
              style={{ borderRadius: 'var(--mantine-radius-default)' }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};
