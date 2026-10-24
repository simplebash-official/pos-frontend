import { t } from '@/shared/i18n/t';
import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { Stack, NavLink, Divider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';

import { SHELL_NAVBAR_RAIL_WIDTH } from './constants';
import { SidebarFooter } from './SidebarFooter';
import { SidebarSectionHeader } from './SidebarSectionHeader';
import { FullNavItem, IconTile, RailNavItem } from './SidebarNavItem';
import { SIDEBAR_DENSITY_PRESETS, useSidebarDensity } from './sidebarDensity';
import { NAV_CATEGORIES } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { STORAGE_KEYS } from '@/constants/storage';
import { useLowStockProducts } from '@/features/inventory/hooks/useProducts';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUserPermissions, selectUserRole } from '@/store/slices/authSlice';

export interface SidebarProps {
  closeMobile?: () => void;
  isRail?: boolean;
  /** Collapses/expands the bar. Leave out where the width is not the user's to choose (Billing, tablet, phone). */
  onToggleCollapse?: () => void;
  /** Whether the mobile drawer is open; its items slide in each time it opens. */
  drawerOpen?: boolean;
}

export const Sidebar = ({
  closeMobile,
  isRail = false,
  onToggleCollapse,
  drawerOpen = false,
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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

  // Sections the user folded shut (any of them, including the one holding the open page).
  const [folded, setFolded] = useLocalStorage<string[]>({
    key: STORAGE_KEYS.SIDEBAR_FOLDED,
    defaultValue: [],
  });
  const [justOpened, setJustOpened] = useState<string | null>(null);
  const toggleFold = (id: string) => {
    setJustOpened(folded.includes(id) ? id : null);
    setFolded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allFolded = visibleCategories.every((c) => folded.includes(c.id));
  const toggleFoldAll = () => setFolded(allFolded ? [] : visibleCategories.map((c) => c.id));

  const handleLogout = () => {
    dispatch(logout());
    if (closeMobile) closeMobile();
    navigate(ROUTES.LOGIN);
  };

  const footer = (
    <SidebarFooter
      isRail={isRail}
      isMobile={isMobile}
      onLogout={handleLogout}
      onNavigate={closeMobile}
      onToggleCollapse={onToggleCollapse}
      allFolded={allFolded}
      onToggleFoldAll={toggleFoldAll}
    />
  );

  if (isRail) {
    return renderLayout(
      'rail',
      <Stack h="100%" gap={0} style={{ minHeight: 0 }}>
        <Stack
          ref={densityRef}
          component="nav"
          aria-label={t('Main menu')}
          className="sidebar-scroll"
          align="center"
          gap={railTight ? 'xs' : 'md'}
          py={railTight ? 0 : 'xs'}
          px={4}
          style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', width: '100%' }}
        >
          {visibleCategories.map((category, catIndex) => (
            <Stack
              key={category.id}
              gap={railTight ? 4 : 'xs'}
              align="center"
              style={{ width: '100%' }}
            >
              {catIndex > 0 && <Divider style={{ width: '60%' }} />}
              {category.items.map((item) => (
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
              ))}
            </Stack>
          ))}
        </Stack>

        <Divider />
        {footer}
      </Stack>
    );
  }

  let enterIndex = 0;
  return renderLayout(
    'full',
    <Stack h="100%" gap={0} style={{ minHeight: 0 }}>
      <Stack
        ref={densityRef}
        component="nav"
        aria-label={t('Main menu')}
        className="sidebar-scroll"
        data-density={density}
        p={isMobile ? 'md' : preset.rootPad}
        gap={preset.groupGap}
        style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}
      >
        {visibleCategories.map((category, index) => {
          const isOpen = !folded.includes(category.id);
          return (
            <Stack key={category.id} gap={preset.itemGap}>
              {preset.showLabels ? (
                <SidebarSectionHeader
                  title={t(category.title)}
                  Icon={category.icon}
                  count={category.items.length}
                  isOpen={isOpen}
                  holdsActive={category.items.some((item) => location.pathname.startsWith(item.to))}
                  controlsId={`sidebar-section-${category.id}`}
                  paddingTop={preset.labelPt}
                  isMobile={isMobile}
                  onToggle={() => toggleFold(category.id)}
                />
              ) : index > 0 ? (
                <Divider />
              ) : null}
              {isOpen && (
                <motion.div
                  id={`sidebar-section-${category.id}`}
                  className="sidebar-section-items"
                  // Rises in only when the user opens it, never on first paint or a layout swap.
                  initial={fadeIn && justOpened === category.id ? { opacity: 0, y: 4 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  <Stack gap={preset.itemGap}>
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
                            leftSection={<IconTile Icon={Icon} color={item.color} />}
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
                                  leftSection={
                                    <IconTile
                                      Icon={SubIcon}
                                      color={sub.color}
                                      isActive={isSubActive}
                                    />
                                  }
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
                </motion.div>
              )}
            </Stack>
          );
        })}
      </Stack>

      <Divider />
      {footer}
    </Stack>
  );
};
