import { t } from '@/shared/i18n/t';
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
  Indicator,
} from '@mantine/core';
import { IconLock, IconMoon, IconSun, IconSettings, IconLogout } from '@tabler/icons-react';
import { useMemo } from 'react';

import { NAV_CATEGORIES } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { useLowStockProducts } from '@/features/inventory/hooks/useProducts';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUserPermissions, selectUserRole } from '@/store/slices/authSlice';

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
  const permissions = useAppSelector(selectUserPermissions);

  const { data: lowStockProducts } = useLowStockProducts();
  const lowStockCount = lowStockProducts.length;
  const isMobile = useIsMobile();

  const isVisible = (item: { adminOnly?: boolean; requiredPermissions?: string[] }) => {
    if (item.adminOnly && !isAdmin) return false;
    if (
      item.requiredPermissions &&
      !item.requiredPermissions.some((permission) => permissions.includes(permission))
    ) {
      return false;
    }
    return true;
  };

  const visibleCategories = useMemo(
    () =>
      NAV_CATEGORIES.map((category) => ({
        ...category,
        items: category.items
          .filter(isVisible)
          .map((item) => ({ ...item, subItems: item.subItems?.filter(isVisible) })),
      })).filter((category) => category.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, permissions]
  );

  const handleLogout = () => {
    dispatch(logout());
    if (closeMobile) closeMobile();
    navigate(ROUTES.LOGIN);
  };

  if (isRail) {
    return (
      <Stack h="100%" justify="space-between" align="center" py="xs" px={4}>
        <Stack gap="md" align="center" style={{ width: '100%' }}>
          {visibleCategories.map((category, catIndex) => (
            <Stack key={category.id} gap="xs" align="center" style={{ width: '100%' }}>
              {catIndex > 0 && <Divider style={{ width: '60%' }} />}
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                const isInventory = item.to === ROUTES.INVENTORY;

                return (
                  <Tooltip
                    key={item.to}
                    label={`${t(category.title)} · ${t(item.label)}`}
                    position="right"
                    withArrow
                  >
                    <Indicator
                      inline
                      label={lowStockCount}
                      maxValue={99}
                      size={16}
                      color="red"
                      disabled={!isInventory || lowStockCount <= 0}
                      withBorder
                      offset={2}
                      styles={{
                        indicator: {
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '0 3px',
                          minWidth: 14,
                          height: 14,
                          lineHeight: '12px',
                          borderColor: 'var(--mantine-color-body)',
                        },
                      }}
                    >
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
                    </Indicator>
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>

        <Stack gap="xs" align="center">
          <Tooltip label={t('Settings')} position="right" withArrow>
            <ActionIcon
              component={RouterNavLink}
              to={ROUTES.SETTINGS}
              size="lg"
              variant={location.pathname.startsWith(ROUTES.SETTINGS) ? 'filled' : 'subtle'}
              color="gray"
              onClick={closeMobile}
            >
              <IconSettings size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('Lock / Logout POS')} position="right" withArrow>
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
    <Stack
      h="100%"
      justify={isMobile ? 'flex-start' : 'space-between'}
      p={isMobile ? 'md' : 'sm'}
      style={{ overflowY: 'auto' }}
    >
      <Stack gap="md">
        {visibleCategories.map((category, index) => (
          <Stack key={category.id} gap={4}>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              px="xs"
              pt={index === 0 ? 'xs' : 'sm'}
              style={{ letterSpacing: '0.05em' }}
            >
              {t(category.title)}
            </Text>
            {category.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              const isInventory = item.to === ROUTES.INVENTORY;

              if (item.subItems && item.subItems.length > 0) {
                const isChildActive = item.subItems.some((sub) =>
                  location.pathname.startsWith(sub.to)
                );
                return (
                  <NavLink
                    key={item.to}
                    label={t(item.label)}
                    leftSection={<Icon size={20} stroke={1.5} />}
                    defaultOpened={isActive || isChildActive}
                    color={item.color}
                    variant="light"
                    childrenOffset={28}
                    style={{
                      borderRadius: 'var(--mantine-radius-default)',
                      minHeight: isMobile ? 44 : undefined,
                    }}
                  >
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = location.pathname.startsWith(sub.to);
                      return (
                        <NavLink
                          key={sub.to}
                          component={RouterNavLink}
                          to={sub.to}
                          label={sub.label}
                          leftSection={<SubIcon size={18} stroke={1.5} />}
                          active={isSubActive}
                          color={sub.color}
                          variant="light"
                          onClick={closeMobile}
                          style={{
                            borderRadius: 'var(--mantine-radius-default)',
                            minHeight: isMobile ? 44 : undefined,
                          }}
                        />
                      );
                    })}
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  component={RouterNavLink}
                  to={item.to}
                  label={t(item.label)}
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
                  style={{
                    borderRadius: 'var(--mantine-radius-default)',
                    minHeight: isMobile ? 44 : undefined,
                  }}
                />
              );
            })}
          </Stack>
        ))}
      </Stack>

      <Stack gap="xs" mt={isMobile ? 'xl' : 'md'}>
        <Divider my="xs" />
        <Paper
          p="xs"
          withBorder
          radius="var(--mantine-radius-default)"
          bg="var(--mantine-color-body)"
        >
          <Stack gap="xs">
            <NavLink
              component={RouterNavLink}
              to={ROUTES.SETTINGS}
              label={t('Settings')}
              leftSection={<IconSettings size={20} stroke={1.5} />}
              active={location.pathname.startsWith(ROUTES.SETTINGS)}
              color="gray"
              variant="light"
              onClick={closeMobile}
              style={{
                borderRadius: 'var(--mantine-radius-default)',
                minHeight: isMobile ? 44 : undefined,
              }}
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
              label={t('Sign Out')}
              leftSection={<IconLogout size={20} stroke={1.5} />}
              active={false}
              color="gray"
              variant="subtle"
              onClick={handleLogout}
              style={{
                borderRadius: 'var(--mantine-radius-default)',
                minHeight: isMobile ? 44 : undefined,
              }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};
