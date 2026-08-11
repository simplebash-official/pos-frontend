import { Drawer, DrawerProps } from '@mantine/core';
import { useState } from 'react';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface DetailDrawerProps<T> {
  data: T | null;
  opened: boolean;
  onClose: () => void;
  title: React.ReactNode;
  size?: DrawerProps['size'];
  children: (item: T) => React.ReactNode;
}

export const DetailDrawer = <T,>({
  data,
  opened,
  onClose,
  title,
  size = 'md',
  children,
}: DetailDrawerProps<T>) => {
  const isMobile = useIsMobile();
  const [cachedData, setCachedData] = useState<T | null>(data);

  if (data && data !== cachedData) {
    setCachedData(data);
  }

  const activeData = data || cachedData;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isMobile ? '100%' : size}
      title={title}
    >
      {activeData ? children(activeData) : null}
    </Drawer>
  );
};
