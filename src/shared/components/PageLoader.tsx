import ReactJsLoaderImport from 'react-js-loader';
import { Center, useMantineColorScheme, useMantineTheme } from '@mantine/core';

// Ensure compatibility with Vite CJS/ESM interop where CommonJS default exports may be wrapped in an object
const ReactJsLoader: typeof ReactJsLoaderImport =
  (ReactJsLoaderImport as unknown as { default?: typeof ReactJsLoaderImport })
    .default || ReactJsLoaderImport;

export interface PageLoaderProps {
  title?: string;
  size?: number;
  height?: string | number;
}

export function PageLoader({ title, size = 45, height = '70vh' }: PageLoaderProps) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  // Dynamically adapt project primary color for both light and dark modes:
  // - In dark mode, shade 4 provides bright, clear contrast against dark surfaces.
  // - In light mode, shade 6 represents the default solid primary brand color.
  const primaryShade = colorScheme === 'dark' ? 4 : 6;
  const loaderColor =
    theme.colors[theme.primaryColor || 'indigo']?.[primaryShade] || '#4c6ef5';

  return (
    <Center h={height} style={{ width: '100%', transition: 'all 0.2s ease' }}>
      <ReactJsLoader
        type="bubble-top"
        bgColor={loaderColor}
        color={loaderColor}
        title={title}
        size={size}
      />
    </Center>
  );
}
