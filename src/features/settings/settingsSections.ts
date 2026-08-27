import {
  IconBuildingBank,
  IconBuildingStore,
  IconFileText,
  IconPhoto,
  IconPrinter,
  IconReceiptTax,
} from '@tabler/icons-react';

export type SettingsSectionId =
  'shop-profile' | 'branding' | 'tax-vat' | 'bank-details' | 'printing' | 'templates';

export interface SettingsSectionMeta {
  id: SettingsSectionId;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof IconBuildingStore;
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
    id: 'tax-vat',
    label: 'Tax & VAT',
    shortLabel: 'Tax & VAT',
    description: 'VAT registration and tax rate',
    icon: IconReceiptTax,
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
];
