import { Box, Group, Text, Avatar, UnstyledButton } from '@mantine/core';
import {
  IconCheck,
  IconTools,
  IconPackage,
  IconAlertTriangle,
  IconUser,
  IconShoppingCart,
  IconPrinter,
  IconBell,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification } from '../types';
import { formatRelativeTime } from '@/shared/lib/date';
import { useAppDispatch } from '@/store/hooks';
import { markAsRead } from '@/store/slices/notificationSlice';

interface NotificationItemProps {
  notification: AppNotification;
  onItemClick?: () => void;
}

export const NotificationItem = ({ notification, onItemClick }: NotificationItemProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    if (onItemClick) {
      onItemClick();
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getActionBadge = () => {
    const iconProps = { size: 10, stroke: 2.5 };
    let icon: React.ReactNode;
    let bgColor: string;

    switch (notification.actionIconType) {
      case 'tool':
        icon = <IconTools {...iconProps} />;
        bgColor = 'var(--mantine-color-blue-6)';
        break;
      case 'box':
        icon = <IconPackage {...iconProps} />;
        bgColor = 'var(--mantine-color-orange-6)';
        break;
      case 'alert':
        icon = <IconAlertTriangle {...iconProps} />;
        bgColor = 'var(--mantine-color-red-6)';
        break;
      case 'cart':
        icon = <IconShoppingCart {...iconProps} />;
        bgColor = 'var(--mantine-color-orange-5)';
        break;
      case 'printer':
        icon = <IconPrinter {...iconProps} />;
        bgColor = 'var(--mantine-color-cyan-6)';
        break;
      case 'user':
        icon = <IconUser {...iconProps} />;
        bgColor = 'var(--mantine-color-blue-5)';
        break;
      case 'check':
      default:
        icon = <IconCheck {...iconProps} />;
        bgColor = 'var(--mantine-color-green-6)';
        break;
    }

    if (notification.category === 'inventory' && !notification.actionIconType) {
      icon = <IconPackage {...iconProps} />;
      bgColor = 'var(--mantine-color-orange-6)';
    } else if (notification.category === 'repair' && !notification.actionIconType) {
      icon = <IconTools {...iconProps} />;
      bgColor = 'var(--mantine-color-blue-6)';
    }

    return (
      <Box
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--bg-card)',
        }}
      >
        {icon}
      </Box>
    );
  };

  const actorName = notification.actor?.name || 'System';
  const initials = notification.actor?.initials || actorName.substring(0, 2).toUpperCase();

  return (
    <UnstyledButton
      onClick={handleClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--mantine-radius-default)',
        transition: 'background-color 150ms ease',
        backgroundColor: notification.read ? 'transparent' : 'var(--bg-hover)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.read
          ? 'transparent'
          : 'var(--bg-hover)';
      }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        {/* Avatar with status icon overlay */}
        <Box style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
          <Avatar
            size={36}
            radius="xl"
            src={notification.actor?.avatarUrl || null}
            color={notification.category === 'inventory' ? 'orange' : 'blue'}
          >
            {notification.actor?.avatarUrl ? null : notification.actor ? (
              initials
            ) : (
              <IconBell size={18} />
            )}
          </Avatar>
          {getActionBadge()}
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="center" gap="xs" wrap="nowrap" mb={2}>
            <Text size="sm" fw={notification.read ? 600 : 700} c="var(--text-primary)" truncate>
              {notification.actor ? notification.actor.name : notification.title}
            </Text>
            <Group gap={6} align="center" wrap="nowrap" style={{ flexShrink: 0 }}>
              <Text size="xs" c="var(--text-muted)" style={{ whiteSpace: 'nowrap' }}>
                {formatRelativeTime(notification.timestamp)}
              </Text>
              {!notification.read && (
                <Box
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mantine-color-blue-6)',
                  }}
                />
              )}
            </Group>
          </Group>

          <Text
            size="xs"
            c="var(--text-secondary)"
            style={{
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
            lineClamp={2}
          >
            {notification.message}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
};
