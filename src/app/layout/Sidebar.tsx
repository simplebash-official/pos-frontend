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
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { IconLock, IconMoon, IconSun, IconSettings, IconLogout } from '@tabler/icons-react';
import { useCallback, useMemo } from 'react';

import { SHELL_NAVBAR_RAIL_WIDTH } from './constants';
import { FullNavItem, RailNavItem } from './SidebarNavItem';
import { SIDEBAR_DENSITY_PRESETS, useSidebarDensity } from './sidebarDensity';
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
  /** Whether the mobile drawer is open; its items slide in each time it opens. */
  drawerOpen?: boolean;
}

export const Sidebar = ({ closeMobile, isRail = false, drawerOpen = false }: SidebarProps) => {
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

  const isVisible = useCallback(
    (item: { adminOnly?: boolean; requiredPermissions?: string[] }) => {
      if (item.adminOnly && !isAdmin) return false;
      if (
        item.requiredPermissions &&
        !item.requiredPermissions.some((permission) => permissions.includes(permission))
      ) {
        return false;
      }
      return true;
    },
    [isAdmin, permissions]
  );

  const visibleCategories = useMemo(
    () =>
      NAV_CATEGORIES.map((category) => ({
        ...category,
        items: category.items
          .filter(isVisible)
          .map((item) => ({ ...item, subItems: item.subItems?.filter(isVisible) })),
      })).filter((category) => category.items.length > 0),
    [isVisible]
  );

  const { ref: densityRef, density } = useSidebarDensity(
    !isMobile,
    visibleCategories.length + (lowStockCount > 0 ? 1 : 0)
  );
  const preset = SIDEBAR_DENSITY_PRESETS[density];
  const railTight = density !== 'comfortable';
  const navLinkStyles = useMemo(
    () => ({ root: { paddingTop: preset.navlinkPy, paddingBottom: preset.navlinkPy } }),
    [preset.navlinkPy]
  );

  // Switching between the rail and the full list fades the new one in (reduced motion: at once).
  // Fade only — an exit would keep two sidebars in the DOM.
  const reduceMotion = useReducedMotion();
  const fadeIn = !reduceMotion;
  const renderLayout = (layout: 'rail' | 'full', content: React.ReactNode) => (
    <motion.div
      key={layout}
      initial={fadeIn ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14 }}
      // The rail keeps its own width: while the bar is held wider for the closing wipe, its icons
      // must not re-centre and then jump back.
      style={{ height: '100%', width: layout === 'rail' ? SHELL_NAVBAR_RAIL_WIDTH : undefined }}
    >
      <LayoutGroup id="sidebar">{content}</LayoutGroup>
    </motion.div>
  );

  const handleLogout = () => {
    dispatch(logout());
    if (closeMobile) closeMobile();
    navigate(ROUTES.LOGIN);
  };

  if (isRail) {
    return renderLayout(
      'rail',
      <Stack
        ref={densityRef}
        h="100%"
        align="center"
        py={railTight ? 0 : 'xs'}
        px={4}
        style={{ overflowY: 'auto' }}
      >
        <Stack
          gap={railTight ? 'xs' : 'md'}
          align="center"
          style={{ width: '100%', flex: '1 0 auto' }}
        >
          {visibleCategories.map((category, catIndex) => (
            <Stack
              key={category.id}
              gap={railTight ? 4 : 'xs'}
              align="center"
              style={{ width: '100%' }}
            >
              {catIndex > 0 && <Divider style={{ width: '60%' }} />}
              {category.items.map((item) => {
                return (
                  <RailNavItem
                    key={item.to}
                    to={item.to}
                    label={`${t(category.title)} · ${t(item.label)}`}
                    Icon={item.icon}
                    color={item.color}
                    isActive={location.pathname.startsWith(item.to)}
                    badgeCount={item.to === ROUTES.INVENTORY ? lowStockCount : 0}
                    onClick={closeMobile}
                  />
                );
              })}
            </Stack>
          ))}
        </Stack>

        <Stack gap="xs" align="center" style={{ flexShrink: 0 }}>
          {isAdmin && (
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
          )}

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

  let enterIndex = 0;
  return renderLayout(
    'full',
    <Stack
      ref={densityRef}
      h="100%"
      p={isMobile ? 'md' : preset.rootPad}
      style={{ overflowY: 'auto' }}
    >
      <Stack gap={preset.groupGap} style={{ flex: '1 0 auto' }}>
        {visibleCategories.map((category, index) => (
          <Stack key={category.id} gap={preset.itemGap}>
            {preset.showLabels ? (
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                px="xs"
                pt={preset.labelPt}
                style={{ letterSpacing: '0.05em' }}
              >
                {t(category.title)}
              </Text>
            ) : index > 0 ? (
              <Divider />
            ) : null}
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
                    styles={navLinkStyles}
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
                          styles={navLinkStyles}
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
                <FullNavItem
                  key={`${item.to}-${drawerOpen}`}
                  to={item.to}
                  label={t(item.label)}
                  Icon={item.icon}
                  color={item.color}
                  isActive={isActive}
                  badgeCount={isInventory ? lowStockCount : 0}
                  onClick={closeMobile}
                  linkStyles={navLinkStyles}
                  minHeight={isMobile ? 44 : undefined}
                  enterIndex={isMobile && drawerOpen ? enterIndex++ : undefined}
                />
              );
            })}
          </Stack>
        ))}
      </Stack>

      <Stack gap="xs" mt={isMobile ? 'xl' : preset.footerMt} style={{ flexShrink: 0 }}>
        <Divider my={preset.footerDividerMy} />
        <Paper
          p={isMobile ? 'xs' : preset.footerPad}
          withBorder
          radius="var(--mantine-radius-default)"
          bg="var(--mantine-color-body)"
        >
          <Stack gap={isMobile ? 'xs' : preset.itemGap}>
            {isAdmin && (
              <NavLink
                component={RouterNavLink}
                to={ROUTES.SETTINGS}
                label={t('Settings')}
                leftSection={<IconSettings size={20} stroke={1.5} />}
                active={location.pathname.startsWith(ROUTES.SETTINGS)}
                color="gray"
                variant="light"
                onClick={closeMobile}
                styles={navLinkStyles}
                style={{
                  borderRadius: 'var(--mantine-radius-default)',
                  minHeight: isMobile ? 44 : undefined,
                }}
              />
            )}
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
              styles={navLinkStyles}
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
