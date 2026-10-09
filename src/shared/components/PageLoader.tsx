import { Center, Loader, Stack, Text } from '@mantine/core';
import { ThinkingOrb, OrbState } from './ThinkingOrb';

export interface PageLoaderProps {
  title?: string;
  subtitle?: string;
  size?: number;
  height?: string | number;
  variant?: 'dots' | 'orb';
  orbState?: OrbState;
  orbTheme?: 'auto' | 'light' | 'dark';
  speed?: number;
}

/**
 * The one page loader for every SimpleBash app: the animated orb the POS login uses. Pass
 * `variant="dots"` only where a tiny inline spinner is wanted.
 */
export const PageLoader = ({
  title,
  subtitle,
  size = 45,
  height = '70vh',
  variant = 'orb',
  orbState = 'connecting',
  orbTheme = 'auto',
  speed = 1,
}: PageLoaderProps) => {
  const isOrb = variant === 'orb';

  const titleColor =
    orbTheme === 'dark' ? '#FFFFFF' : orbTheme === 'light' ? '#18181B' : 'var(--text-primary)';

  const subtitleColor =
    orbTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.75)'
      : orbTheme === 'light'
        ? '#6E6E73'
        : 'var(--text-secondary)';

  return (
    <Center h={height} style={{ width: '100%' }}>
      <Stack align="center" gap="sm">
        {isOrb ? (
          <ThinkingOrb state={orbState} size={size || 64} theme={orbTheme} speed={speed} />
        ) : (
          <Loader size={size} type="dots" />
        )}

        {(title || subtitle) && (
          <Stack align="center" gap={2}>
            {title && (
              <Text size="sm" fw={600} c={titleColor} ta="center">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text size="xs" c={subtitleColor} ta="center">
                {subtitle}
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Center>
  );
};
