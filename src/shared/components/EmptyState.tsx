import type { ReactNode } from 'react';
import { Paper, Stack, Title, Text, Button, Center, type MantineSpacing } from '@mantine/core';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  withBorder?: boolean;
  p?: MantineSpacing;
  py?: MantineSpacing;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  withBorder = true,
  p = 'xl',
  py = 'lg',
}: EmptyStateProps) => {
  const content = (
    <Center py={py}>
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
  );

  if (!withBorder) {
    return content;
  }

  return (
    <Paper p={p} withBorder>
      {content}
    </Paper>
  );
};
