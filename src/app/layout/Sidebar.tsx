import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Stack, NavLink, Text, Divider, Switch, useMantineColorScheme, Badge } from '@mantine/core';
import { IconLock, IconMoon, IconSun } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { NAV_ITEMS } from '@/config/navigation';
import { ROUTES } from '@/constants';
import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';

export interface SidebarProps {
  closeMobile?: () => void;
}

export function Sidebar({ closeMobile }: SidebarProps) {
  const location = useLocation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockThreshold).length;

  return (
    <Stack h="100%" justify="space-between" p="sm">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" pt="xs">
          Feature Domains
        </Text>
        {NAV_ITEMS.map((item) => {
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
