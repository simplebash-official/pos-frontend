import { ReactNode } from 'react';
import { Paper, Stack, Title, Text, Button, Center } from '@mantine/core';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <Paper p="xl" withBorder>
      <Center py="lg">
        <Stack align="center" gap="sm">
          {icon}
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
};
