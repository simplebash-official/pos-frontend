import { IconDeviceMobile, IconShirt, IconPrinter } from '@tabler/icons-react';

export const CATEGORY_ICONS: Record<string, typeof IconDeviceMobile> = {
  'Phone Repairs': IconDeviceMobile,
  'Mug, T-Shirt & Print Customization': IconShirt,
  'General Printing': IconPrinter,
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Phone Repairs': 'blue',
  'Mug, T-Shirt & Print Customization': 'grape',
  'General Printing': 'teal',
};
