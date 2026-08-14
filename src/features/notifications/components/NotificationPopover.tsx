import { useState } from 'react';
import {
  Popover,
  ActionIcon,
  Badge,
  Box,
  Text,
  Group,
  Button,
  ScrollArea,
  Tabs,
  Menu,
  Tooltip,
  Divider,
  Stack,
} from '@mantine/core';
import {
  IconBell,
  IconFilter,
  IconCheck,
  IconBellOff,
  IconChecklist,
  IconTools,
  IconPackage,
  IconShoppingCart,
  IconPrinter,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAllNotifications,
  selectUnreadNotificationCount,
  markAllAsRead,
} from '@/store/slices/notificationSlice';
import { NotificationItem } from './NotificationItem';
import type { NotificationCategory } from '../types';
import { useIsMobile } from '@/shared/hooks/useResponsive';

interface NotificationPopoverProps {
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'subtle' | 'light' | 'filled';
  color?: string;
}

export const NotificationPopover = ({
  size = 'sm',
  variant = 'subtle',
  color = 'gray',
}: NotificationPopoverProps) => {
  const [opened, setOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectAllNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const isMobile = useIsMobile();

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  // Filter items based on active tab and category
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread' && notif.read) {
      return false;
    }
    if (selectedCategory !== 'all' && notif.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    all: { label: 'All Categories', icon: <IconChecklist size={14} /> },
    repair: { label: 'Phone Repairs', icon: <IconTools size={14} /> },
    inventory: { label: 'Inventory & Stock', icon: <IconPackage size={14} /> },
    billing: { label: 'Billing & Sales', icon: <IconShoppingCart size={14} /> },
    print: { label: 'Print Jobs', icon: <IconPrinter size={14} /> },
    system: { label: 'Sync & System', icon: <IconAlertTriangle size={14} /> },
    general: { label: 'General', icon: <IconBell size={14} /> },
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={8}
      withArrow={false}
      shadow="lg"
      trapFocus={false}
      closeOnEscape
    >
      <Popover.Target>
        <Tooltip label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
          <Box style={{ position: 'relative', display: 'inline-flex' }}>
            <ActionIcon
              variant={opened ? 'light' : variant}
              color={opened ? 'blue' : color}
              size={size}
              aria-label="View notifications"
              onClick={() => setOpened((o) => !o)}
            >
              <IconBell size={18} />
            </ActionIcon>
            {unreadCount > 0 && (
              <Badge
                color="blue"
                variant="filled"
                size="xs"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  padding: '0 4px',
                  minWidth: 16,
                  height: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  pointerEvents: 'none',
                  border: '2px solid var(--bg-sidebar)',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Box>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown
        p={0}
        style={{
          width: 'min(380px, calc(100vw - 24px))',
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          borderRadius: 'var(--mantine-radius-default)',
          boxShadow: 'var(--mantine-shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Group justify="space-between" align="center" px="md" py="sm">
          <Group gap="xs" align="center">
            <Text fw={800} size="md" c="var(--text-primary)">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Badge color="blue" variant="light" size="sm">
                {unreadCount} new
              </Badge>
            )}
          </Group>

          {unreadCount > 0 ? (
            <Button
              variant="subtle"
              size="xs"
              color="blue"
              p={0}
              onClick={handleMarkAllRead}
              style={{ fontWeight: 600, height: 'auto' }}
            >
              Mark all as read
            </Button>
          ) : (
            <Text size="xs" fw={600} c="var(--text-muted)">
              Mark all as read
            </Text>
          )}
        </Group>

        <Divider color="var(--border)" />

        {/* Filter and Tabs Strip */}
        <Group justify="space-between" align="center" px="md" pt="xs" pb={4} wrap="nowrap">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="pills"
            color="blue"
            style={{ flex: 1 }}
          >
            <Tabs.List style={{ gap: 4 }}>
              <Tabs.Tab value="all" style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px' }}>
                All Notifications
              </Tabs.Tab>
              <Tabs.Tab
                value="unread"
                style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px' }}
              >
                Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Category Filter Menu */}
          <Menu position="bottom-end" shadow="md" width={180}>
            <Menu.Target>
              <Tooltip label="Filter category">
                <ActionIcon
                  variant={selectedCategory !== 'all' ? 'filled' : 'light'}
                  color={selectedCategory !== 'all' ? 'blue' : 'gray'}
                  size="sm"
                  aria-label="Filter notifications by category"
                >
                  <IconFilter size={14} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Filter by Category</Menu.Label>
              {Object.entries(categoryLabels).map(([catKey, { label, icon }]) => (
                <Menu.Item
                  key={catKey}
                  leftSection={icon}
                  rightSection={
                    selectedCategory === catKey ? (
                      <IconCheck size={14} color="var(--mantine-color-blue-6)" />
                    ) : null
                  }
                  onClick={() => setSelectedCategory(catKey as NotificationCategory | 'all')}
                  style={{
                    fontWeight: selectedCategory === catKey ? 700 : 500,
                  }}
                >
                  {label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Divider color="var(--border)" mt={6} />

        {/* Notification Items List */}
        <ScrollArea.Autosize
          mah={isMobile ? '50dvh' : 360}
          type="auto"
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          {filteredNotifications.length === 0 ? (
            <Stack align="center" justify="center" py="xl" px="md" gap="xs">
              <IconBellOff size={36} color="var(--text-muted)" stroke={1.5} />
              <Text size="sm" fw={600} c="var(--text-secondary)">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
              </Text>
              <Text size="xs" c="var(--text-muted)" ta="center">
                {activeTab === 'unread'
                  ? "You've read all your alerts."
                  : selectedCategory !== 'all'
                    ? 'No notifications found for this category.'
                    : 'When you get alerts or updates, they will show up here.'}
              </Text>
            </Stack>
          ) : (
            <Box p={6}>
              <Stack gap={2}>
                {filteredNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onItemClick={() => {
                      if (isMobile) {
                        setOpened(false);
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
};
