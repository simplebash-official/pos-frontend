import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Stack,
  NavLink,
  Text,
  Divider,
  Switch,
  useMantineColorScheme,
  Badge,
  Tooltip,
  ActionIcon,
  Box,
} from '@mantine/core';
import { IconLock, IconMoon, IconSun } from '@tabler/icons-react';
import { useMemo } from 'react';

import { NAV_ITEMS } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { useLowStockProducts } from '@/features/inventory/hooks/useProducts';
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
  const isDark = colorScheme === 'dark';
  const role = useAppSelector(selectUserRole);
  const isAdmin = role === USER_ROLES.ADMIN;

  const { data: lowStockProducts } = useLowStockProducts();
  const lowStockCount = lowStockProducts.length;

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin]
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

          <Divider my="xs" style={{ width: '80%' }} />

          <Tooltip label="Lock / Logout POS" position="right" withArrow>
            <ActionIcon size="lg" variant="subtle" color="gray" onClick={handleLogout}>
              <IconLock size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Stack>

        <Stack gap="xs" align="center">
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
        {visibleNavItems.map((item) => {
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

        <Divider my="sm" />

        <NavLink
          label="Lock / Logout POS"
          leftSection={<IconLock size={20} stroke={1.5} />}
          active={false}
          color="gray"
          variant="subtle"
          onClick={handleLogout}
          style={{ borderRadius: 'var(--mantine-radius-default)' }}
        />
      </Stack>

      <Stack gap="xs">
        <Divider my="xs" />
        <NavLink
          label="Dark Mode"
          leftSection={
            isDark ? <IconMoon size={20} stroke={1.5} /> : <IconSun size={20} stroke={1.5} />
          }
          rightSection={
            <Switch
              checked={isDark}
              onChange={() => {}}
              size="sm"
              aria-label="Toggle dark mode"
              style={{ pointerEvents: 'none' }}
            />
          }
          variant="subtle"
          color="gray"
          onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
          style={{ borderRadius: 'var(--mantine-radius-default)' }}
        />
      </Stack>
    </Stack>
  );
};
