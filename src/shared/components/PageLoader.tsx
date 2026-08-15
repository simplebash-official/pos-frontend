import { Center, Loader, Stack, Text } from '@mantine/core';

export interface PageLoaderProps {
  title?: string;
  size?: number;
  height?: string | number;
}

export const PageLoader = ({ title, size = 45, height = '70vh' }: PageLoaderProps) => {
  return (
    <Center h={height} style={{ width: '100%' }}>
      <Stack align="center" gap="sm">
        <Loader size={size} type="dots" />
        {title && (
          <Text size="sm" fw={600} c="var(--text-primary)">
            {title}
          </Text>
        )}
      </Stack>
    </Center>
  );
};
