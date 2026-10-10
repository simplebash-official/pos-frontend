import { Text, ThemeIcon } from '@mantine/core';
import { IconBuildingStore, IconCloudOff } from '@tabler/icons-react';
import { shopInitial } from '../lib/shopLabel';

export interface ShopAvatarProps {
  shop: { shopName: string | null; shopCode: string | null };
  /** Has a SimpleBash link. A shop that is not linked shows a "cloud off" mark instead of its letter. */
  linked: boolean;
  size?: number;
}

/** The shop's letter in a tinted tile (radius from the theme), shared by the login card and the dialog. */
export const ShopAvatar = ({ shop, linked, size = 44 }: ShopAvatarProps) => {
  const initial = shopInitial(shop);
  return (
    <ThemeIcon
      size={size}
      variant={linked ? 'filled' : 'light'}
      color={linked ? 'blue' : 'gray'}
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      {!linked ? (
        <IconCloudOff size={size * 0.5} stroke={1.75} />
      ) : initial ? (
        <Text fw={800} fz={size * 0.42} lh={1}>
          {initial}
        </Text>
      ) : (
        <IconBuildingStore size={size * 0.5} stroke={1.75} />
      )}
    </ThemeIcon>
  );
};
