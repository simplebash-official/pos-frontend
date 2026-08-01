import { useState } from 'react';
import {
  Modal,
  Box,
  Group,
  Button,
  SegmentedControl,
  Text,
  Paper,
  Stack,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { IconPrinter, IconDownload, IconFileText, IconX } from '@tabler/icons-react';
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

export function A4InvoicePreviewModal({ opened, onClose, invoice }: A4InvoicePreviewModalProps) {
  const isMobile = useIsMobile();
  const currentShopProfile = useAppSelector(selectShopProfile);
  const shopProfileVersions = useAppSelector(selectShopProfileVersions);
  const printSettings = useAppSelector(selectPrintSettings);

  const [paper, setPaper] = useState<'a4' | 'a5'>(printSettings.defaultInvoicePaper || 'a4');
  const [copyMode, setCopyMode] = useState<'customer' | 'office'>('customer');

  const buildPayload = (inv: Invoice) => {
    const printCount = getPrintCountForInvoice(inv.invoiceNumber, paper);
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
    printA4Invoice(buildPayload(invoice), paper, copyMode);
  };

  // Bound via the shared shortcut engine (not a focused-button click) so pressing
  // Enter never puts a visible focus ring on the Print button.
  useAppShortcuts([{ key: 'Enter', handler: handlePrint, ignoreInput: true }], opened);

  if (!invoice) return null;

  const paperProfile = paper === 'a5' ? PAPER_PROFILES.a5 : PAPER_PROFILES.a4;
  const payload = buildPayload(invoice);

  const handleDownloadPDF = () => {
    const invoiceId = invoice.id || invoice.invoiceNumber;
    window.open(
      `/print/invoice/${encodeURIComponent(invoiceId)}?paper=${paper}&copy=${copyMode}`,
      '_blank'
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" align="center" style={{ width: '100%' }}>
          <Group gap="xs" align="center">
            <ThemeIcon size="md" radius="md" color="violet" variant="light">
              <IconFileText size={18} />
            </ThemeIcon>
            <Text fw={700} size="md" c="var(--text-primary)">
              Invoice Preview
            </Text>
            <Badge size="sm" color="blue" variant="light">
              #{invoice.invoiceNumber}
            </Badge>
          </Group>
          {invoice.customerName && (
            <Text size="xs" c="dimmed" fw={600} style={{ marginRight: 16 }}>
              Customer: {invoice.customerName}
            </Text>
          )}
        </Group>
      }
      size="xl"
      fullScreen={isMobile}
      radius="var(--mantine-radius-default)"
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
        <Paper
          p="sm"
          radius="var(--mantine-radius-default)"
          withBorder
          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border)' }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="md" wrap="wrap">
              <Box>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  mb={4}
                  tt="uppercase"
                  style={{ letterSpacing: '0.04em' }}
                >
                  PAPER SIZE
                </Text>
                <SegmentedControl
                  size="xs"
                  value={paper}
                  onChange={(val) => setPaper(val as 'a4' | 'a5')}
                  data={[
                    { label: 'A4 Standard', value: 'a4' },
                    { label: 'A5 Compact', value: 'a5' },
                  ]}
                  styles={{
                    root: { backgroundColor: 'var(--bg-card)' },
                    label: { fontWeight: 600, fontSize: 11 },
                  }}
                />
              </Box>

              <Box>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  mb={4}
                  tt="uppercase"
                  style={{ letterSpacing: '0.04em' }}
                >
                  COPY TYPE
                </Text>
                <SegmentedControl
                  size="xs"
                  value={copyMode}
                  onChange={(val) => setCopyMode(val as 'customer' | 'office')}
                  data={[
                    { label: 'Customer Copy', value: 'customer' },
                    { label: 'Office Duplicate', value: 'office' },
                  ]}
                  styles={{
                    root: { backgroundColor: 'var(--bg-card)' },
                    label: { fontWeight: 600, fontSize: 11 },
                  }}
                />
              </Box>
            </Group>

            <Group gap="xs" align="center">
              <Button
                size="sm"
                color="blue"
                leftSection={<IconPrinter size={16} />}
                onClick={handlePrint}
                style={{ fontWeight: 700 }}
              >
                Print Invoice (↵)
              </Button>
              <Button
                size="sm"
                variant="light"
                color="gray"
                leftSection={<IconDownload size={16} />}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
              <Button
                size="sm"
                variant="subtle"
                color="gray"
                leftSection={<IconX size={14} />}
                onClick={onClose}
              >
                Close
              </Button>
            </Group>
          </Group>
        </Paper>

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
            <A4Invoice payload={payload} paperProfile={paperProfile} />
          </Box>
        </Box>
      </Stack>
    </Modal>
  );
}
