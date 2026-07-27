import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Stack, NavLink, Box, Text, Divider } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { NAV_ITEMS } from '@/config/navigation';

export interface SidebarProps {
  closeMobile?: () => void;
}

export function Sidebar({ closeMobile }: SidebarProps) {
  const location = useLocation();

  return (
    <Box p="sm">
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
              style={{ borderRadius: 'var(--mantine-radius-lg)' }}
            />
          );
        })}

        <Divider my="sm" />

        <NavLink
          component={RouterNavLink}
          to="/login"
          label="Lock POS"
          leftSection={<IconLock size={20} stroke={1.5} />}
          active={location.pathname === '/login'}
          color="gray"
          variant="subtle"
          onClick={closeMobile}
          style={{ borderRadius: 'var(--mantine-radius-lg)' }}
        />
      </Stack>
    </Box>
  );
}
