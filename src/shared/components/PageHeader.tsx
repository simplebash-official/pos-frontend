import { ReactNode } from 'react';
import { Group, Title, Text, Box } from '@mantine/core';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="lg">
      <Box>
        <Title order={2}>{title}</Title>
        {description && (
          <Text size="sm" c="dimmed" mt={2}>
            {description}
          </Text>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Group>
  );
}
