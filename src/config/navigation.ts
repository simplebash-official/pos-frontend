import { ComponentType } from 'react';
import {
  IconReceipt,
  IconFileInvoice,
  IconHammer,
  IconPrinter,
  IconPackage,
  IconUsers,
  IconTruckDelivery,
  IconUserCheck,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';
import { ROUTES } from '@/constants';

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
    to: ROUTES.BILLING,
    color: 'blue',
  },
  {
    label: 'Sales & Invoices',
    icon: IconFileInvoice,
    to: ROUTES.INVOICES,
    color: 'gray',
  },
  {
    label: 'Repair Jobs',
    icon: IconHammer,
    to: ROUTES.REPAIRS,
    color: 'orange',
  },
  {
    label: 'Print Jobs',
    icon: IconPrinter,
    to: ROUTES.PRINT_JOBS,
    color: 'teal',
  },
  {
    label: 'Inventory & Stock',
    icon: IconPackage,
    to: ROUTES.INVENTORY,
    color: 'blue',
  },
  {
    label: 'Customers',
    icon: IconUsers,
    to: ROUTES.CUSTOMERS,
    color: 'violet',
  },
  {
    label: 'Suppliers',
    icon: IconTruckDelivery,
    to: ROUTES.SUPPLIERS,
    color: 'blue',
  },
  {
    label: 'Employees',
    icon: IconUserCheck,
    to: ROUTES.EMPLOYEES,
    color: 'indigo',
  },
  {
    label: 'Reports & Profit',
    icon: IconChartBar,
    to: ROUTES.REPORTS,
    color: 'green',
  },
  {
    label: 'Settings',
    icon: IconSettings,
    to: ROUTES.SETTINGS,
    color: 'blue',
  },
];
