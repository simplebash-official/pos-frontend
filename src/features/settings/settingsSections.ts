import {
  IconBuildingBank,
  IconBuildingStore,
  IconDatabase,
  IconDeviceDesktopAnalytics,
  IconFileText,
  IconPhoto,
  IconPrinter,
  IconRefresh,
} from '@tabler/icons-react';

export type SettingsSectionId =
  | 'shop-profile'
  | 'branding'
  | 'bank-details'
  | 'printing'
  | 'templates'
  | 'updates'
  | 'backup'
  | 'benchmark';

export interface SettingsSectionMeta {
  id: SettingsSectionId;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof IconBuildingStore;
  desktopOnly?: boolean;
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  {
    id: 'shop-profile',
    label: 'Shop Profile',
    shortLabel: 'Profile',
    description: 'Business name, address and contact details',
    icon: IconBuildingStore,
  },
  {
    id: 'branding',
    label: 'Branding & Logo',
    shortLabel: 'Branding',
    description: 'The logo shown on your printed documents',
    icon: IconPhoto,
  },
  {
    id: 'bank-details',
    label: 'Bank Details',
    shortLabel: 'Bank',
    description: 'Account details shown on invoices',
    icon: IconBuildingBank,
  },
  {
    id: 'printing',
    label: 'Printing & Documents',
    shortLabel: 'Printing',
    description: 'Receipt paper size and what prints by default',
    icon: IconPrinter,
  },
  {
    id: 'templates',
    label: 'Document Templates',
    shortLabel: 'Templates',
    description: 'Warranty terms and receipt footer text',
    icon: IconFileText,
  },
  {
    id: 'updates',
    label: 'Updates',
    shortLabel: 'Updates',
    description: 'App version and software updates',
    icon: IconRefresh,
  },
  {
    id: 'backup',
    label: 'Data Backup & Restore',
    shortLabel: 'Data',
    description: 'Export all shop records or restore from a backup file',
    icon: IconDatabase,
    desktopOnly: true,
  },
  {
    id: 'benchmark',
    label: 'System Benchmark',
    shortLabel: 'Benchmark',
    description: 'Test computer performance, POS speed & document rendering',
    icon: IconDeviceDesktopAnalytics,
    desktopOnly: true,
  },
];

export const getVisibleSettingsSections = (isDesktop: boolean): SettingsSectionMeta[] =>
  SETTINGS_SECTIONS.filter((section) => !section.desktopOnly || isDesktop);
