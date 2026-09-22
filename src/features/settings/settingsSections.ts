import {
  IconBuildingBank,
  IconBuildingStore,
  IconAlertTriangle,
  IconCloud,
  IconCloudUpload,
  IconDatabase,
  IconDeviceDesktopAnalytics,
  IconFileText,
  IconListDetails,
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
  | 'account'
  | 'sync'
  | 'conflicts'
  | 'backup'
  | 'benchmark'
  | 'logs';

export interface SettingsSectionMeta {
  id: SettingsSectionId;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof IconBuildingStore;
  desktopOnly?: boolean;
  /** Hidden unless the desktop shell reports a configured cloud. */
  requiresCloud?: boolean;
  /** Hidden until this device is linked to a cloud account (implies requiresCloud). */
  requiresLink?: boolean;
  comingSoon?: boolean;
  disabled?: boolean;
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
    comingSoon: true,
    disabled: true,
  },
  {
    id: 'bank-details',
    label: 'Bank Details',
    shortLabel: 'Bank',
    description: 'Account details shown on invoices',
    icon: IconBuildingBank,
    comingSoon: true,
    disabled: true,
  },
  {
    id: 'printing',
    label: 'Printing & Documents',
    shortLabel: 'Printing',
    description: 'Receipt paper size and what prints by default',
    icon: IconPrinter,
    comingSoon: true,
    disabled: true,
  },
  {
    id: 'templates',
    label: 'Document Templates',
    shortLabel: 'Templates',
    description: 'Warranty terms and receipt footer text',
    icon: IconFileText,
    comingSoon: true,
    disabled: true,
  },
  {
    id: 'updates',
    label: 'Updates',
    shortLabel: 'Updates',
    description: 'App version and software updates',
    icon: IconRefresh,
  },
  {
    id: 'account',
    label: 'Cloud Account',
    shortLabel: 'Account',
    description: 'Optional free account for cloud backup and web access',
    icon: IconCloud,
    desktopOnly: true,
    requiresCloud: true,
  },
  {
    id: 'sync',
    label: 'Cloud Sync',
    shortLabel: 'Sync',
    description: 'Keep this computer and your other devices up to date',
    icon: IconCloudUpload,
    desktopOnly: true,
    requiresCloud: true,
    requiresLink: true,
  },
  {
    id: 'conflicts',
    label: 'Sync Conflicts',
    shortLabel: 'Conflicts',
    description: 'Changes from other devices that are worth a second look',
    icon: IconAlertTriangle,
    desktopOnly: true,
    requiresCloud: true,
    requiresLink: true,
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
  {
    id: 'logs',
    label: 'Activity Log',
    shortLabel: 'Log',
    description: 'Everything recorded on this computer, with date and time',
    icon: IconListDetails,
    desktopOnly: true,
  },
];

export const getVisibleSettingsSections = (
  isDesktop: boolean,
  cloudEnabled = false,
  cloudLinked = false
): SettingsSectionMeta[] =>
  SETTINGS_SECTIONS.filter(
    (section) =>
      (!section.desktopOnly || isDesktop) &&
      (!section.requiresCloud || cloudEnabled) &&
      (!section.requiresLink || cloudLinked)
  );
