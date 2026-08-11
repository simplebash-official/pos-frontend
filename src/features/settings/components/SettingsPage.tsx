import { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  TextInput,
  Textarea,
  Button,
  Switch,
  SegmentedControl,
  NumberInput,
  SimpleGrid,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import { IconSettings, IconCheck, IconBuildingStore, IconPrinter } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SyncSettingsSection } from '@/features/sync/components/SyncSettingsSection';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectPrintSettings,
  updateShopProfile,
  updatePrintSettings,
} from '@/store/slices/settingsSlice';

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);
  const printSettings = useAppSelector(selectPrintSettings);

  const [profileForm, setProfileForm] = useState({
    legalName: shopProfile.legalName,
    tradingName: shopProfile.tradingName,
    addressLine1: shopProfile.addressLines[0] || '',
    addressLine2: shopProfile.addressLines[1] || '',
    primaryPhone: shopProfile.primaryPhone,
    secondaryPhone: shopProfile.secondaryPhone,
    email: shopProfile.email,
    website: shopProfile.website,
    businessRegNo: shopProfile.businessRegNo,
    isVatRegistered: shopProfile.isVatRegistered,
    vatNo: shopProfile.vatNo,
    vatRate: shopProfile.vatRate * 100, // as percentage
    bankName: shopProfile.bankName,
    bankBranch: shopProfile.bankBranch,
    accountName: shopProfile.accountName,
    accountNumber: shopProfile.accountNumber,
    defaultWarrantyText: shopProfile.defaultWarrantyText,
    receiptFooterText: shopProfile.receiptFooterText,
    defaultFooterText: shopProfile.defaultFooterText,
  });

  const [printForm, setPrintForm] = useState({
    receiptPaper: printSettings.receiptPaper,
    autoPrintOnCheckout: printSettings.autoPrintOnCheckout,
    receiptCopies: printSettings.receiptCopies,
    invoiceCopies: printSettings.invoiceCopies,
    defaultDocumentForWalkIn: printSettings.defaultDocumentForWalkIn,
    defaultDocumentForAccountCustomer: printSettings.defaultDocumentForAccountCustomer,
    previewBeforePrinting: printSettings.previewBeforePrinting ?? false,
  });

  const handleSaveProfile = () => {
    dispatch(
      updateShopProfile({
        legalName: profileForm.legalName,
        tradingName: profileForm.tradingName,
        addressLines: [profileForm.addressLine1, profileForm.addressLine2].filter(Boolean),
        primaryPhone: profileForm.primaryPhone,
        secondaryPhone: profileForm.secondaryPhone,
        email: profileForm.email,
        website: profileForm.website,
        businessRegNo: profileForm.businessRegNo,
        isVatRegistered: profileForm.isVatRegistered,
        vatNo: profileForm.vatNo,
        vatRate: profileForm.vatRate / 100,
        bankName: profileForm.bankName,
        bankBranch: profileForm.bankBranch,
        accountName: profileForm.accountName,
        accountNumber: profileForm.accountNumber,
        defaultWarrantyText: profileForm.defaultWarrantyText,
        receiptFooterText: profileForm.receiptFooterText,
        defaultFooterText: profileForm.defaultFooterText,
      })
    );

    notifications.show({
      title: 'Settings Saved',
      message: 'Shop profile & document templates updated successfully.',
      color: 'green',
    });
  };

  const handleSavePrintSettings = () => {
    dispatch(
      updatePrintSettings({
        receiptPaper: printForm.receiptPaper,
        autoPrintOnCheckout: printForm.autoPrintOnCheckout,
        receiptCopies: printForm.receiptCopies,
        invoiceCopies: printForm.invoiceCopies,
        defaultDocumentForWalkIn: printForm.defaultDocumentForWalkIn,
        defaultDocumentForAccountCustomer: printForm.defaultDocumentForAccountCustomer,
        previewBeforePrinting: printForm.previewBeforePrinting,
      })
    );

    notifications.show({
      title: 'Print Preferences Saved',
      message: 'Printing defaults updated.',
      color: 'green',
    });
  };

  return (
    <Box p="md" style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <Stack gap="lg" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size="lg" radius="lg" color="blue" variant="light">
              <IconSettings size={24} />
            </ThemeIcon>
            <div>
              <Title order={2} style={{ fontSize: 20, fontWeight: 700 }}>
                POS & Document Settings
              </Title>
              <Text size="xs" c="dimmed">
                Configure shop profile, VAT settings, bank details, and printing behavior.
              </Text>
            </div>
          </Group>
        </Group>

        {/* 1. Shop Identity Section */}
        <Paper p="lg" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon radius="md" color="blue" variant="light">
                <IconBuildingStore size={20} />
              </ThemeIcon>
              <Text fw={700} size="md">
                Shop Profile & Branding
              </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Legal Business Name"
                value={profileForm.legalName}
                onChange={(e) => setProfileForm({ ...profileForm, legalName: e.target.value })}
              />
              <TextInput
                label="Trading Name / Store Name"
                value={profileForm.tradingName}
                onChange={(e) => setProfileForm({ ...profileForm, tradingName: e.target.value })}
              />
              <TextInput
                label="Address Line 1"
                value={profileForm.addressLine1}
                onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
              />
              <TextInput
                label="Address Line 2"
                value={profileForm.addressLine2}
                onChange={(e) => setProfileForm({ ...profileForm, addressLine2: e.target.value })}
              />
              <TextInput
                label="Primary Phone"
                value={profileForm.primaryPhone}
                onChange={(e) => setProfileForm({ ...profileForm, primaryPhone: e.target.value })}
              />
              <TextInput
                label="Secondary Phone"
                value={profileForm.secondaryPhone}
                onChange={(e) => setProfileForm({ ...profileForm, secondaryPhone: e.target.value })}
              />
              <TextInput
                label="Store Email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
              <TextInput
                label="Website URL"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
              />
            </SimpleGrid>

            <Divider my="xs" />

            {/* VAT & Reg No */}
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600} size="sm">
                  VAT Registration
                </Text>
                <Text size="xs" c="dimmed">
                  Enable if your shop is VAT registered to include tax columns on invoices.
                </Text>
              </div>
              <Switch
                checked={profileForm.isVatRegistered}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, isVatRegistered: e.currentTarget.checked })
                }
              />
            </Group>

            {profileForm.isVatRegistered && (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <TextInput
                  label="Business Reg No"
                  value={profileForm.businessRegNo}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, businessRegNo: e.target.value })
                  }
                />
                <TextInput
                  label="VAT Registration Number"
                  value={profileForm.vatNo}
                  onChange={(e) => setProfileForm({ ...profileForm, vatNo: e.target.value })}
                />
                <NumberInput
                  label="VAT Rate (%)"
                  suffix="%"
                  value={profileForm.vatRate}
                  onChange={(v) =>
                    setProfileForm({ ...profileForm, vatRate: typeof v === 'number' ? v : 8 })
                  }
                />
              </SimpleGrid>
            )}

            <Divider my="xs" />

            {/* Bank Details */}
            <Text fw={600} size="sm">
              Bank Account Details (Prints on Invoices)
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Bank Name"
                value={profileForm.bankName}
                onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
              />
              <TextInput
                label="Branch"
                value={profileForm.bankBranch}
                onChange={(e) => setProfileForm({ ...profileForm, bankBranch: e.target.value })}
              />
              <TextInput
                label="Account Name"
                value={profileForm.accountName}
                onChange={(e) => setProfileForm({ ...profileForm, accountName: e.target.value })}
              />
              <TextInput
                label="Account Number"
                value={profileForm.accountNumber}
                onChange={(e) => setProfileForm({ ...profileForm, accountNumber: e.target.value })}
              />
            </SimpleGrid>

            <Divider my="xs" />

            {/* Terms & Footers */}
            <Textarea
              label="Default Warranty & Terms Policy (A4 Invoice)"
              rows={3}
              value={profileForm.defaultWarrantyText}
              onChange={(e) =>
                setProfileForm({ ...profileForm, defaultWarrantyText: e.target.value })
              }
            />

            <TextInput
              label="Thermal Receipt Footer Text"
              value={profileForm.receiptFooterText}
              onChange={(e) =>
                setProfileForm({ ...profileForm, receiptFooterText: e.target.value })
              }
            />

            <Group justify="flex-end">
              <Button
                color="blue"
                leftSection={<IconCheck size={16} />}
                onClick={handleSaveProfile}
              >
                Save Shop Profile
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* 2. Print Preferences Section */}
        <Paper p="lg" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon radius="md" color="teal" variant="light">
                <IconPrinter size={20} />
              </ThemeIcon>
              <Text fw={700} size="md">
                Printing & Output Preferences
              </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={4}>
                  THERMAL RECEIPT PAPER
                </Text>
                <SegmentedControl
                  fullWidth
                  value={printForm.receiptPaper}
                  onChange={(v) =>
                    setPrintForm({ ...printForm, receiptPaper: v as '80mm' | '58mm' })
                  }
                  data={[
                    { label: '80mm Standard', value: '80mm' },
                    { label: '58mm Compact', value: '58mm' },
                  ]}
                />
              </Box>

              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={4}>
                  A4 INVOICE COPY MODE
                </Text>
                <SegmentedControl
                  fullWidth
                  value={printForm.invoiceCopies}
                  onChange={(v) =>
                    setPrintForm({
                      ...printForm,
                      invoiceCopies: v as 'customer' | 'customer+office',
                    })
                  }
                  data={[
                    { label: 'Customer Copy Only', value: 'customer' },
                    { label: 'Customer + Office Copy', value: 'customer+office' },
                  ]}
                />
              </Box>

              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={4}>
                  DEFAULT DOCUMENT (WALK-IN GUEST)
                </Text>
                <SegmentedControl
                  fullWidth
                  value={printForm.defaultDocumentForWalkIn}
                  onChange={(v) =>
                    setPrintForm({
                      ...printForm,
                      defaultDocumentForWalkIn: v as 'receipt' | 'invoice' | 'both' | 'none',
                    })
                  }
                  data={[
                    { label: 'Receipt', value: 'receipt' },
                    { label: 'Invoice', value: 'invoice' },
                    { label: 'Both', value: 'both' },
                    { label: 'None', value: 'none' },
                  ]}
                />
              </Box>

              <Box>
                <Text size="xs" fw={700} c="dimmed" mb={4}>
                  DEFAULT DOCUMENT (ACCOUNT CUSTOMER)
                </Text>
                <SegmentedControl
                  fullWidth
                  value={printForm.defaultDocumentForAccountCustomer}
                  onChange={(v) =>
                    setPrintForm({
                      ...printForm,
                      defaultDocumentForAccountCustomer: v as
                        'receipt' | 'invoice' | 'both' | 'none',
                    })
                  }
                  data={[
                    { label: 'Receipt', value: 'receipt' },
                    { label: 'Invoice', value: 'invoice' },
                    { label: 'Both', value: 'both' },
                    { label: 'None', value: 'none' },
                  ]}
                />
              </Box>

              <Box style={{ gridColumn: 'span 2' }}>
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={600} size="sm">
                      Preview Before Printing
                    </Text>
                    <Text size="xs" c="dimmed">
                      Automatically open document preview modal after checkout instead of direct
                      printing.
                    </Text>
                  </div>
                  <Switch
                    checked={printForm.previewBeforePrinting}
                    onChange={(e) =>
                      setPrintForm({
                        ...printForm,
                        previewBeforePrinting: e.currentTarget.checked,
                      })
                    }
                  />
                </Group>
              </Box>
            </SimpleGrid>

            <Group justify="flex-end">
              <Button
                color="teal"
                leftSection={<IconCheck size={16} />}
                onClick={handleSavePrintSettings}
              >
                Save Print Preferences
              </Button>
            </Group>
          </Stack>
        </Paper>

        <SyncSettingsSection />
      </Stack>
    </Box>
  );
};
