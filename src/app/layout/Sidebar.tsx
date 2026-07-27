import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Stack, NavLink, Box, Text, Divider } from '@mantine/core';
import {
  IconReceipt,
  IconHammer,
  IconPrinter,
  IconPackage,
  IconUsers,
  IconChartBar,
  IconLock,
} from '@tabler/icons-react';

export interface SidebarProps {
  closeMobile?: () => void;
}

export function Sidebar({ closeMobile }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    {
      label: 'Billing Counter',
      icon: IconReceipt,
      to: '/billing',
      color: 'indigo',
    },
    {
      label: 'Repair Jobs',
      icon: IconHammer,
      to: '/repairs',
      color: 'orange',
    },
    {
      label: 'Print Jobs',
      icon: IconPrinter,
      to: '/print-jobs',
      color: 'teal',
    },
    {
      label: 'Inventory & Stock',
      icon: IconPackage,
      to: '/inventory',
      color: 'blue',
    },
    {
      label: 'Customers',
      icon: IconUsers,
      to: '/customers',
      color: 'violet',
    },
    {
      label: 'Reports & Profit',
      icon: IconChartBar,
      to: '/reports',
      color: 'green',
    },
  ];

  return (
    <Box p="sm">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" pt="xs">
          Feature Domains
        </Text>
        {navItems.map((item) => {
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
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
          );
        })}

        <Divider my="sm" />

        <NavLink
          component={RouterNavLink}
          to="/login"
          label="PIN Lock"
          leftSection={<IconLock size={20} stroke={1.5} />}
          active={location.pathname === '/login'}
          color="gray"
          variant="subtle"
          onClick={closeMobile}
          style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
      </Stack>
    </Box>
  );
}
