import { t } from '@/shared/i18n/t';
import React from 'react';
import { Group, Stack, Badge, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export interface PhoneDisplayProps {
  primaryPhone?: string;
  secondaryPhone?: string;
  layout?: 'stack' | 'row';
  badgeWidth?: number;
  secondaryLabel?: string;
}

export const PhoneDisplay = ({
  primaryPhone,
  secondaryPhone,
  layout = 'stack',
  badgeWidth = 84,
  secondaryLabel = 'Secondary',
}: PhoneDisplayProps) => {
  const displayPrimary = primaryPhone?.trim() || 'N/A';

  const handleCopyPhone = (e: React.MouseEvent, phone: string, label: string) => {
    e.stopPropagation();
    if (!phone || phone === 'N/A') return;
    navigator.clipboard.writeText(phone);
    notifications.show({
      title: 'Copied!',
      message: `${label} phone (${phone}) copied to clipboard`,
      color: 'teal',
      icon: <IconCheck size={16} />,
    });
  };

  const primaryItem = (
    <Group gap={6} wrap="nowrap" align="center">
      <Badge
        size="xs"
        variant="light"
        color={displayPrimary === 'N/A' ? 'gray' : 'teal'}
        radius="var(--mantine-radius-default)"
        fw={700}
        w={badgeWidth}
        style={{ justifyContent: 'center', flexShrink: 0 }}
      >
        {t('Primary')}
      </Badge>
      <Group gap={4} wrap="nowrap" align="center">
        <Text size="xs">{displayPrimary}</Text>
        {displayPrimary !== 'N/A' && (
          <Tooltip label={t('Copy Primary Phone')} withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={(e) => handleCopyPhone(e, displayPrimary, 'Primary')}
              style={{ width: 14, height: 14, minWidth: 14, minHeight: 14, opacity: 0.6 }}
            >
              <IconCopy size={10} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Group>
  );

  const secondaryItem = secondaryPhone?.trim() ? (
    <Group gap={6} wrap="nowrap" align="center">
      <Badge
        size="xs"
        variant="light"
        color="orange"
        radius="var(--mantine-radius-default)"
        fw={700}
        w={badgeWidth}
        style={{ justifyContent: 'center', flexShrink: 0 }}
      >
        {secondaryLabel}
      </Badge>
      <Group gap={4} wrap="nowrap" align="center">
        <Text size="xs" fw={600} c="dimmed">
          {secondaryPhone}
        </Text>
        <Tooltip label={`Copy ${secondaryLabel} Phone`} withArrow position="top">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={(e) => handleCopyPhone(e, secondaryPhone, secondaryLabel)}
            style={{ width: 14, height: 14, minWidth: 14, minHeight: 14, opacity: 0.6 }}
          >
            <IconCopy size={10} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  ) : null;

  if (layout === 'row') {
    return (
      <Group gap="md">
        {primaryItem}
        {secondaryItem}
      </Group>
    );
  }

  return (
    <Stack gap={4} justify="center">
      {primaryItem}
      {secondaryItem}
    </Stack>
  );
};
