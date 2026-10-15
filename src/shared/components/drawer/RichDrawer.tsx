import { useState, type ReactNode } from 'react';
import { Drawer, Group, Text, ThemeIcon } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { DrawerScroll } from './DrawerLayout';

/** Desktop widths: wide is two columns, standard one roomy column, narrow a list. Phones are always full-screen. */
export type RichDrawerWidth = 'wide' | 'standard' | 'narrow';

export interface RichDrawerProps<T> {
  /** The item shown. The last one is kept while the drawer slides shut, so it does not go blank. */
  data: T | null;
  opened: boolean;
  onClose: () => void;
  width: RichDrawerWidth;
  title: { icon: ReactNode; text: string; subtitle: string };
  /** The scrolling content. */
  children: (item: T) => ReactNode;
  /** A pinned bar under the content; render a `DrawerFooter`. */
  footer?: (item: T) => ReactNode;
}

/**
 * The shell every right-hand detail drawer shares: header with an icon, text and subtitle,
 * an app-coloured canvas that scrolls, and an optional pinned footer. See `global.css`
 * (`.rich-drawer-*`) for the width and layout rules.
 */
export const RichDrawer = <T,>({
  data,
  opened,
  onClose,
  width,
  title,
  children,
  footer,
}: RichDrawerProps<T>) => {
  const isMobile = useIsMobile();
  const [cached, setCached] = useState<T | null>(data);
  if (data !== null && data !== cached) setCached(data);
  const item = data !== null ? data : cached;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isMobile ? '100%' : 'md'}
      classNames={{ content: `rich-drawer rich-drawer--${width}` }}
      title={
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon color="blue" variant="light" size="lg" style={{ flexShrink: 0 }}>
            {title.icon}
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text fw={800} size="md">
              {title.text}
            </Text>
            <Text size="xs" c="dimmed">
              {title.subtitle}
            </Text>
          </div>
        </Group>
      }
    >
      {item !== null && (
        <>
          <DrawerScroll>{children(item)}</DrawerScroll>
          {footer?.(item)}
        </>
      )}
    </Drawer>
  );
};
