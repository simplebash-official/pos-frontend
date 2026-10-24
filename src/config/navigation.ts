import { ComponentType } from 'react';
import {
  IconLayoutDashboard,
  IconReceipt,
  IconFileInvoice,
  IconCashRegister,
  IconHammer,
  IconPrinter,
  IconFileText,
  IconWallet,
  IconCashBanknote,
  IconBuildingBank,
  IconReportMoney,
  IconChartHistogram,
  IconPackage,
  IconTags,
  IconUsers,
  IconTruckDelivery,
  IconUserCheck,
  IconChartBar,
  IconSettings,
  IconKey,
  IconLayoutGrid,
  IconShoppingCart,
  IconTool,
  IconCoins,
  IconBox,
  IconUsersGroup,
  IconChartPie,
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
  icon: NavItemConfig['icon'];
  items: NavItemConfig[];
}

export const NAV_CATEGORIES: NavCategoryGroup[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: IconLayoutGrid,
    items: [
      {
        label: 'Dashboard',
        icon: IconLayoutDashboard,
        to: ROUTES.DASHBOARD,
        color: 'blue',
      },
    ],
  },
  {
    id: 'sell',
    title: 'Sell',
    icon: IconShoppingCart,
    items: [
      {
        label: 'Billing Counter',
        icon: IconReceipt,
        to: ROUTES.BILLING,
        color: 'cyan',
      },
      {
        label: 'Sales & Invoices',
        icon: IconFileInvoice,
        to: ROUTES.INVOICES,
        color: 'grape',
      },
      {
        label: 'Quotations',
        icon: IconFileText,
        to: ROUTES.QUOTATIONS,
        color: 'lime',
        requiredPermissions: [PERMISSIONS.QUOTATIONS_MANAGE],
      },
    ],
  },
  {
    id: 'workshop',
    title: 'Workshop',
    icon: IconTool,
    items: [
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
    id: 'money',
    title: 'Money',
    icon: IconCoins,
    items: [
      {
        label: 'Register Shifts',
        icon: IconCashRegister,
        to: ROUTES.SHIFTS,
        color: 'teal',
        requiredPermissions: [PERMISSIONS.REGISTER_SESSIONS_VIEW],
      },
      {
        label: 'Expenses',
        icon: IconWallet,
        to: ROUTES.EXPENSES,
        color: 'red',
        requiredPermissions: [PERMISSIONS.EXPENSES_VIEW],
      },
      {
        label: 'Income',
        icon: IconCashBanknote,
        to: ROUTES.INCOME,
        color: 'green',
        requiredPermissions: [PERMISSIONS.INCOME_VIEW],
      },
      {
        label: 'Money Accounts',
        icon: IconBuildingBank,
        to: ROUTES.MONEY_ACCOUNTS,
        color: 'indigo',
        requiredPermissions: [PERMISSIONS.ACCOUNTS_VIEW],
      },
      {
        label: 'Money Reports',
        icon: IconChartHistogram,
        to: ROUTES.MONEY_REPORTS,
        color: 'teal',
        requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
      },
      {
        label: 'Balances',
        icon: IconReportMoney,
        to: ROUTES.BALANCES,
        color: 'orange',
        requiredPermissions: [PERMISSIONS.BALANCES_VIEW],
      },
    ],
  },
  {
    id: 'stock',
    title: 'Stock',
    icon: IconBox,
    items: [
      {
        label: 'Inventory & Stock',
        icon: IconPackage,
        to: ROUTES.INVENTORY,
        color: 'indigo',
        badgeCountKey: 'lowStock',
      },
      {
        label: 'Labels',
        icon: IconTags,
        to: ROUTES.LABELS,
        color: 'blue',
        requiredPermissions: [PERMISSIONS.INVENTORY_WRITE],
      },
      {
        label: 'Suppliers',
        icon: IconTruckDelivery,
        to: ROUTES.SUPPLIERS,
        color: 'amber',
        adminOnly: true,
      },
    ],
  },
  {
    id: 'people-staff',
    title: 'People & Staff',
    icon: IconUsersGroup,
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
        color: 'pink',
        requiredPermissions: [PERMISSIONS.EMPLOYEES_READ],
      },
      {
        label: 'Login Accounts',
        icon: IconKey,
        to: ROUTES.ACCOUNTS,
        color: 'red',
        requiredPermissions: [PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_MANAGE_STAFF],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    icon: IconChartPie,
    items: [
      {
        label: 'Analytics & Reports',
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
    color: 'gray',
    adminOnly: true,
  },
];
