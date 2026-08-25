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
  IconKey,
} from '@tabler/icons-react';
import { ROUTES, PERMISSIONS } from '@/constants';
import type { Permission } from '@/constants/permissions';

export interface NavItemConfig {
  label: string;
  icon: ComponentType<{ size?: number | string; stroke?: number | string }>;
  to: string;
  color: string;
  /** Reserved for routes backed by the backend's `AdminUser` extractor (e.g. Suppliers). */
  adminOnly?: boolean;
  /** OR semantics — any one of these grants visibility. For routes backed by a permission check. */
  requiredPermissions?: Permission[];
  badgeCountKey?: 'lowStock';
  description?: string;
  subItems?: NavItemConfig[];
}

export interface NavCategoryGroup {
  id: string;
  title: string;
  items: NavItemConfig[];
}

export const NAV_CATEGORIES: NavCategoryGroup[] = [
  {
    id: 'sales-operations',
    title: 'Sales & Operations',
    items: [
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
    ],
  },
  {
    id: 'inventory-supply',
    title: 'Inventory & Supply',
    items: [
      {
        label: 'Inventory & Stock',
        icon: IconPackage,
        to: ROUTES.INVENTORY,
        color: 'blue',
        badgeCountKey: 'lowStock',
      },
      {
        label: 'Suppliers',
        icon: IconTruckDelivery,
        to: ROUTES.SUPPLIERS,
        color: 'blue',
        adminOnly: true,
      },
    ],
  },
  {
    id: 'people-staff',
    title: 'People & Staff',
    items: [
      {
        label: 'Customers',
        icon: IconUsers,
        to: ROUTES.CUSTOMERS,
        color: 'violet',
      },
      {
        label: 'Employees',
        icon: IconUserCheck,
        to: ROUTES.EMPLOYEES,
        color: 'indigo',
        requiredPermissions: [PERMISSIONS.EMPLOYEES_READ],
      },
      {
        label: 'Login Accounts',
        icon: IconKey,
        to: ROUTES.ACCOUNTS,
        color: 'indigo',
        requiredPermissions: [PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_MANAGE_STAFF],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    items: [
      {
        label: 'Reports & Profit',
        icon: IconChartBar,
        to: ROUTES.REPORTS,
        color: 'green',
        requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
      },
    ],
  },
];

export const NAV_ITEMS: NavItemConfig[] = [
  ...NAV_CATEGORIES.flatMap((category) => category.items),
  {
    label: 'Settings',
    icon: IconSettings,
    to: ROUTES.SETTINGS,
    color: 'blue',
  },
];
