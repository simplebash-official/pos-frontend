import { useState } from 'react';
import { Modal, Box, Group, Button, Text, Stack, Divider } from '@mantine/core';
import { IconPrinter, IconDownload, IconX } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import type { Invoice } from '../types';
import { buildPrintPayload } from '../lib/buildPrintPayload';
import { getShopProfileForInvoice } from '../lib/getShopProfileForInvoice';
import { A4Invoice } from '@/shared/print/documents/A4Invoice';
import { PAPER_PROFILES } from '@/shared/print/paperProfiles';
import { useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectShopProfileVersions,
  selectPrintSettings,
} from '@/store/slices/settingsSlice';
import { printA4Invoice } from '@/shared/print/printService';
import { getPrintCountForInvoice } from '@/features/invoices/api/printLogStore';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';

export interface A4InvoicePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const A4InvoicePreviewModal = ({ opened, onClose, invoice }: A4InvoicePreviewModalProps) => {
  const isMobile = useIsMobile();
  const currentShopProfile = useAppSelector(selectShopProfile);
  const shopProfileVersions = useAppSelector(selectShopProfileVersions);
  const printSettings = useAppSelector(selectPrintSettings);

  const [copyMode, setCopyMode] = useState<'customer' | 'office'>('customer');

  const buildPayload = (inv: Invoice) => {
    const printCount = getPrintCountForInvoice(inv.invoiceNumber, 'a4');
    const isDuplicate = printCount > 0 || copyMode === 'office';
    const copyLabel =
      copyMode === 'office'
        ? 'DUPLICATE — OFFICE COPY'
        : isDuplicate
          ? 'DUPLICATE — CUSTOMER COPY'
          : 'ORIGINAL — CUSTOMER COPY';
    const shopProfile = getShopProfileForInvoice(inv, shopProfileVersions, currentShopProfile);
    return buildPrintPayload(inv, shopProfile, printSettings, copyLabel, isDuplicate);
  };

  const handlePrint = () => {
    if (!invoice) return;
    printA4Invoice(buildPayload(invoice), copyMode);
  };

  // Bound via the shared shortcut engine (not a focused-button click) so pressing
  // Enter never puts a visible focus ring on the Print button.
  useAppShortcuts([{ key: 'Enter', handler: handlePrint, ignoreInput: true }], opened);

  if (!invoice) return null;

  const payload = buildPayload(invoice);

  const handleDownloadPDF = () => {
    const invoiceId = invoice.id || invoice.invoiceNumber;
    window.open(`/print/invoice/${encodeURIComponent(invoiceId)}?copy=${copyMode}`, '_blank');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          Invoice Preview — {invoice.invoiceNumber}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
      padding="md"
      scrollAreaComponent={Box}
      styles={{
        content: {
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        },
        header: {
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 12,
        },
      }}
    >
      <Stack gap="md" mt="xs">
        {/* Controls Toolbar */}
        <Stack gap="sm">
          <Box style={{ maxWidth: 320 }}>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              mb={6}
              tt="uppercase"
              style={{ letterSpacing: '0.04em' }}
            >
              Copy type
            </Text>
            <SegmentedToggle
              fullWidth
              size="sm"
              value={copyMode}
              onChange={(val) => setCopyMode(val as 'customer' | 'office')}
              data={[
                { label: 'Customer copy', value: 'customer' },
                { label: 'Office duplicate', value: 'office' },
              ]}
            />
          </Box>

          <Group gap="xs" wrap="wrap">
            <Button
              size="md"
              color="blue"
              leftSection={<IconPrinter size={18} />}
              onClick={handlePrint}
              style={{ fontWeight: 700, flex: 2, minWidth: 200 }}
            >
              Print invoice (↵)
            </Button>
            <Button
              size="md"
              variant="outline"
              color="gray"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownloadPDF}
              style={{ flex: 1, minWidth: 150 }}
            >
              Download PDF
            </Button>
            <Button
              size="md"
              variant="subtle"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={onClose}
              style={{ flex: 1, minWidth: 100 }}
            >
              Close
            </Button>
          </Group>
        </Stack>

        <Divider color="var(--border)" />

        {/* Scaled Preview Box */}
        <Box
          style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--mantine-radius-default)',
            border: '1px solid var(--border)',
            padding: '24px 12px',
            maxHeight: '65vh',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Box
            style={{
              transform: `scale(${isMobile ? 0.5 : 0.85})`,
              transformOrigin: 'top center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <A4Invoice payload={payload} paperProfile={PAPER_PROFILES.a4} />
          </Box>
        </Box>
      </Stack>
    </Modal>
  );
};
