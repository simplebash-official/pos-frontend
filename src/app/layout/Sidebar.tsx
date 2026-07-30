import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Stack, NavLink, Text, Divider, Switch, useMantineColorScheme } from '@mantine/core';
import { IconLock, IconMoon, IconSun } from '@tabler/icons-react';
import { NAV_ITEMS } from '@/config/navigation';
import { ROUTES } from '@/constants';

export interface SidebarProps {
  closeMobile?: () => void;
}

export function Sidebar({ closeMobile }: SidebarProps) {
  const location = useLocation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack h="100%" justify="space-between" p="sm">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" pt="xs">
          Feature Domains
        </Text>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              component={RouterNavLink}
              to={item.to}
              label={item.label}
              leftSection={<Icon size={20} stroke={1.5} />}
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
          component={RouterNavLink}
          to={ROUTES.LOGIN}
          label="Lock POS"
          leftSection={<IconLock size={20} stroke={1.5} />}
          active={location.pathname === ROUTES.LOGIN}
          color="gray"
          variant="subtle"
          onClick={closeMobile}
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
}
