import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Group, Text, Paper, Container, Skeleton, Stack } from '@mantine/core';
import { IconPrinter, IconX } from '@tabler/icons-react';
import { fetchInvoiceById } from '../api/mockInvoices';
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
import { recordPrintEvent, getPrintCountForInvoice } from '@/features/invoices/api/printLogStore';

export const StandalonePrintView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const copyParam = searchParams.get('copy') || 'customer';

  const currentShopProfile = useAppSelector(selectShopProfile);
  const shopProfileVersions = useAppSelector(selectShopProfileVersions);
  const printSettings = useAppSelector(selectPrintSettings);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const printedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetchInvoiceById(id)
      .then((data) => {
        setInvoice(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (invoice && !printedRef.current) {
      printedRef.current = true;

      const printCount = getPrintCountForInvoice(invoice.invoiceNumber, 'a4');

      recordPrintEvent({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        format: 'a4',
        copy:
          copyParam === 'office'
            ? 'DUPLICATE — OFFICE COPY'
            : printCount > 0
              ? 'DUPLICATE — CUSTOMER COPY'
              : 'ORIGINAL — CUSTOMER COPY',
        printedBy: invoice.cashierName,
      });

      // Auto trigger print after render
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [invoice, copyParam]);

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Skeleton height={32} width={180} radius="xs" />
              <Skeleton height={24} width={100} radius="xs" />
            </Group>
            <Skeleton height={1} width="100%" my="xs" />
            <Skeleton height={20} width="60%" radius="xs" />
            <Skeleton height={20} width="40%" radius="xs" />
            <Stack gap="xs" mt="lg">
              <Skeleton height={24} width="100%" radius="xs" />
              <Skeleton height={24} width="100%" radius="xs" />
              <Skeleton height={24} width="100%" radius="xs" />
            </Stack>
            <Group justify="flex-end" mt="md">
              <Skeleton height={28} width={120} radius="xs" />
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container size="sm" py={100} style={{ textAlign: 'center' }}>
        <Paper p="xl" radius="var(--mantine-radius-default)" withBorder>
          <Text size="lg" fw={700} c="red">
            Invoice Not Found
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            No invoice matching identifier &quot;{id}&quot; was found.
          </Text>
          <Button mt="md" onClick={() => window.close()}>
            Close Window
          </Button>
        </Paper>
      </Container>
    );
  }

  // Resolve the correct versioned shop profile for this invoice
  const shop = getShopProfileForInvoice(invoice, shopProfileVersions, currentShopProfile);

  const paperProfile = PAPER_PROFILES.a4;
  const printCount = getPrintCountForInvoice(invoice.invoiceNumber, 'a4');
  const isDuplicate = printCount > 0 || copyParam === 'office';
  const copyLabel =
    copyParam === 'office'
      ? 'DUPLICATE — OFFICE COPY'
      : isDuplicate
        ? 'DUPLICATE — CUSTOMER COPY'
        : 'ORIGINAL — CUSTOMER COPY';

  const payload = buildPrintPayload(invoice, shop, printSettings, copyLabel, isDuplicate);

  return (
    <Box style={{ backgroundColor: '#525659', minHeight: '100vh', padding: '16px 0' }}>
      {/* Top action bar (Hidden when printing) */}
      <style>{`
        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            background-color: #FFFFFF !important;
          }
        }
      `}</style>

      <Box
        className="no-print-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          padding: '8px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Text size="sm" fw={700}>
              Invoice #{invoice.invoiceNumber}
            </Text>
            <Text size="xs" c="dimmed">
              ({copyLabel} · {paperProfile.name})
            </Text>
          </Group>

          <Group gap="sm">
            <Text size="xs" c="dimmed" style={{ display: 'inline-block' }}>
              Tip: Select &quot;Save as PDF&quot; to download as a PDF file.
            </Text>
            <Button
              size="xs"
              color="blue"
              leftSection={<IconPrinter size={14} />}
              onClick={() => window.print()}
            >
              Print Document
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={() => window.close()}
            >
              Close
            </Button>
          </Group>
        </Group>
      </Box>

      <Box style={{ marginTop: 48, paddingBottom: 32 }}>
        <A4Invoice payload={payload} paperProfile={paperProfile} />
      </Box>
    </Box>
  );
};
