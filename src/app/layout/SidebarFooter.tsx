import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  ActionIcon,
  Avatar,
  Badge,
  Center,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconBriefcase,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconChevronsDown,
  IconChevronsUp,
  IconDeviceDesktop,
  IconLogout,
  IconMoon,
  IconSettings,
  IconShieldCheck,
  IconSun,
  IconUser,
} from '@tabler/icons-react';

import { ROUTES } from '@/constants/routes';
import { USER_ROLES, formatUserRole, type UserRole } from '@/constants/roles';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { t } from '@/shared/i18n/t';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser, selectUserPermissions, selectUserRole } from '@/store/slices/authSlice';
import { canOpenSettings } from '@/features/settings/settingsSections';

type SchemeChoice = 'light' | 'dark' | 'auto';
const NEXT_SCHEME: Record<SchemeChoice, SchemeChoice> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
};
const SCHEME_LABEL: Record<SchemeChoice, string> = {
  light: 'Light Mode',
  dark: 'Dark Mode',
  auto: 'System',
};
const SCHEME_ICON = { light: IconSun, dark: IconMoon, auto: IconDeviceDesktop } as const;

/** The role pill under the name, so the role never reads as part of the name. */
const ROLE_LOOK: Record<UserRole, { color: string; Icon: typeof IconUser }> = {
  [USER_ROLES.ADMIN]: { color: 'blue', Icon: IconShieldCheck },
  [USER_ROLES.MANAGER]: { color: 'violet', Icon: IconBriefcase },
  [USER_ROLES.STAFF]: { color: 'gray', Icon: IconUser },
};

export interface SidebarFooterProps {
  isRail: boolean;
  isMobile: boolean;
  onLogout: () => void;
  /** Closes the phone drawer after a link is followed. */
  onNavigate?: () => void;
  /** Leave out where the width is not the user's to choose. */
  onToggleCollapse?: () => void;
  /** Section folding; the rail has no section headers, so it ignores these. */
  allFolded: boolean;
  onToggleFoldAll: () => void;
}

/**
 * The pinned strip under the scrolling nav list. Every height here is fixed on purpose: a footer
 * that changed size with the sidebar density would change the list's height and make the density
 * hook oscillate (React #185).
 */
export const SidebarFooter = ({
  isRail,
  isMobile,
  onLogout,
  onNavigate,
  onToggleCollapse,
  allFolded,
  onToggleFoldAll,
}: SidebarFooterProps) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const scheme = colorScheme as SchemeChoice;
  const user = useAppSelector(selectAuthUser);
  const role = useAppSelector(selectUserRole);
  const canSettings = canOpenSettings({
    isAdmin: role === USER_ROLES.ADMIN,
    permissions: useAppSelector(selectUserPermissions),
  });

  const name = user?.name || user?.username || 'Operator';
  const roleLabel = user?.role ? formatUserRole(user.role) : '';
  const roleLook = user?.role ? ROLE_LOOK[user.role as UserRole] : undefined;
  const tap = isMobile ? 44 : 34;

  const foldAllLabel = allFolded ? t('Expand All') : t('Collapse All');
  const collapseLabel = isRail ? t('Expand sidebar') : t('Collapse sidebar');
  const collapseButton = onToggleCollapse && (
    <Tooltip label={collapseLabel} position="right" withArrow>
      <ActionIcon
        size={tap}
        variant="subtle"
        color="gray"
        aria-label={collapseLabel}
        aria-expanded={!isRail}
        onClick={onToggleCollapse}
      >
        {isRail ? (
          <IconChevronRight size={20} stroke={1.5} />
        ) : (
          <IconChevronLeft size={20} stroke={1.5} />
        )}
      </ActionIcon>
    </Tooltip>
  );

  const signOut = (
    <Tooltip label={t('Sign Out')} position={isRail ? 'right' : 'top'} withArrow>
      <ActionIcon
        size={isRail || isMobile ? tap : 28}
        variant="subtle"
        color="red"
        aria-label={t('Sign Out')}
        onClick={onLogout}
        className="sidebar-footer-signout"
      >
        <IconLogout size={20} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );

  const avatar = (
    <Avatar size={isRail ? 34 : 30} radius="xl" color="blue">
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );

  if (isRail) {
    const SchemeIcon = SCHEME_ICON[scheme];
    const schemeLabel = t(SCHEME_LABEL[scheme]);
    return (
      <Stack gap="xs" align="center" py="xs" style={{ flexShrink: 0 }}>
        <Tooltip label={roleLabel ? `${name} · ${roleLabel}` : name} position="right" withArrow>
          {canSettings ? (
            <UnstyledButton
              component={RouterNavLink}
              to={ROUTES.SETTINGS}
              aria-label={t('Settings')}
              onClick={onNavigate}
            >
              {avatar}
            </UnstyledButton>
          ) : (
            <div>{avatar}</div>
          )}
        </Tooltip>
        <Tooltip label={schemeLabel} position="right" withArrow>
          <ActionIcon
            size={tap}
            variant="subtle"
            color="gray"
            aria-label={schemeLabel}
            onClick={() => setColorScheme(NEXT_SCHEME[scheme])}
          >
            <SchemeIcon size={20} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
        {signOut}
        {collapseButton}
      </Stack>
    );
  }

  const settingsButton = canSettings ? (
    <Tooltip label={t('Settings')} position="top" withArrow>
      <ActionIcon
        component={RouterNavLink}
        to={ROUTES.SETTINGS}
        size={isMobile ? tap : 32}
        variant="subtle"
        color="gray"
        aria-label={t('Settings')}
        onClick={onNavigate}
        className="sidebar-footer-settings"
      >
        <IconSettings size={19} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  ) : null;

  return (
    <Stack gap="xs" p="xs" style={{ flexShrink: 0 }}>
      <Group
        wrap="nowrap"
        gap={6}
        p={8}
        className="sidebar-footer-card"
        data-clickable="true"
        title={name}
        style={{ height: isMobile ? 76 : 72 }}
      >
        <Menu
          position="top-start"
          offset={8}
          shadow="lg"
          radius="md"
          width={240}
          withArrow
          withinPortal
        >
          <Menu.Target>
            <UnstyledButton
              className="sidebar-footer-identity"
              aria-label={t('User profile menu')}
            >
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                <div className="sidebar-footer-avatar-wrapper">{avatar}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text fz={13} fw={600} lh={1.2} lineClamp={1}>
                    {name}
                  </Text>
                  {roleLook && (
                    <Badge
                      size="xs"
                      variant="light"
                      color={roleLook.color}
                      tt="none"
                      mt={3}
                      leftSection={<roleLook.Icon size={11} stroke={2} />}
                      className="sidebar-footer-role"
                    >
                      {roleLabel}
                    </Badge>
                  )}
                </div>
                <IconChevronUp size={14} stroke={1.75} className="sidebar-footer-chevron" />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <div className="sidebar-footer-menu-header">
              <Group gap={10} wrap="nowrap">
                {avatar}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text fz={13} fw={600} truncate>
                    {name}
                  </Text>
                  {user?.username && (
                    <Text fz={11} c="dimmed" truncate>
                      @{user.username}
                    </Text>
                  )}
                </div>
              </Group>
            </div>
            <Menu.Divider />
            {canSettings && (
              <Menu.Item
                component={RouterNavLink}
                to={ROUTES.SETTINGS}
                leftSection={<IconSettings size={16} stroke={1.5} />}
                onClick={onNavigate}
                className="sidebar-footer-menu-settings"
              >
                {t('Settings')}
              </Menu.Item>
            )}
            <Menu.Item
              color="red"
              leftSection={<IconLogout size={16} stroke={1.5} />}
              onClick={onLogout}
              className="sidebar-footer-signout-item"
            >
              {t('Sign Out')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {settingsButton}
      </Group>

      <Group gap="xs" wrap="nowrap">
        <SegmentedToggle
          style={{ flex: 1 }}
          size={isMobile ? 'md' : 'xs'}
          value={scheme}
          onChange={(value) => setColorScheme(value as SchemeChoice)}
          data={(Object.keys(SCHEME_ICON) as SchemeChoice[]).map((value) => {
            const Icon = SCHEME_ICON[value];
            return {
              value,
              label: (
                <Center aria-label={t(SCHEME_LABEL[value])} title={t(SCHEME_LABEL[value])}>
                  <Icon size={16} stroke={1.5} />
                </Center>
              ),
            };
          })}
        />
        <Tooltip label={foldAllLabel} position="top" withArrow>
          <ActionIcon
            size={tap}
            variant="subtle"
            color="gray"
            aria-label={foldAllLabel}
            onClick={onToggleFoldAll}
          >
            {allFolded ? (
              <IconChevronsDown size={20} stroke={1.5} />
            ) : (
              <IconChevronsUp size={20} stroke={1.5} />
            )}
          </ActionIcon>
        </Tooltip>
        {collapseButton}
      </Group>
    </Stack>
  );
};
