import { ReactNode } from 'react';
import { Paper, Stack, Title, Text, Button, Center } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Paper p="xl" withBorder radius="md">
      <Center py="lg">
        <Stack align="center" gap="sm">
          {icon || <IconInbox size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />}
          <Title order={4}>{title}</Title>
          {description && (
            <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 400 }}>
              {description}
            </Text>
          )}
          {actionLabel && onAction && (
            <Button mt="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </Stack>
      </Center>
    </Paper>
  );
}
