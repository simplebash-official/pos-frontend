import { ComponentType } from 'react';
import {
  IconReceipt,
  IconHammer,
  IconPrinter,
  IconPackage,
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react';

export interface NavItemConfig {
  label: string;
  icon: ComponentType<{ size?: number | string; stroke?: number | string }>;
  to: string;
  color: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Billing Counter',
    icon: IconReceipt,
    to: '/billing',
    color: 'blue',
  },
  {
    label: 'Repair Jobs',
    icon: IconHammer,
    to: '/repairs',
    color: 'orange',
  },
  {
    label: 'Print Jobs',
    icon: IconPrinter,
    to: '/print-jobs',
    color: 'teal',
  },
  {
    label: 'Inventory & Stock',
    icon: IconPackage,
    to: '/inventory',
    color: 'blue',
  },
  {
    label: 'Customers',
    icon: IconUsers,
    to: '/customers',
    color: 'violet',
  },
  {
    label: 'Reports & Profit',
    icon: IconChartBar,
    to: '/reports',
    color: 'green',
  },
];
