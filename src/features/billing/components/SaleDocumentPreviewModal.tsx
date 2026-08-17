import { useMemo, useState } from 'react';
import { Modal, Box, Group, Button, ActionIcon, Text, Stack, Divider } from '@mantine/core';
import { IconX, IconPrinter, IconMinus, IconPlus } from '@tabler/icons-react';
import type { Invoice } from '../types';
import { buildPrintPayload } from '../lib/buildPrintPayload';
import { getShopProfileForInvoice } from '../lib/getShopProfileForInvoice';
import { getSaleHeroPresentation } from '../lib/saleHeroPresentation';
import { A4Invoice } from '@/shared/print/documents/A4Invoice';
import { ThermalReceipt } from '@/shared/print/documents/ThermalReceipt';
import { PAPER_PROFILES } from '@/shared/print/paperProfiles';
import { printA4Invoice, printThermalReceipt } from '@/shared/print/printService';
import {
  getPrintCountForInvoice,
  getPrintLogsForInvoice,
} from '@/features/invoices/api/printLogStore';
import { useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectShopProfileVersions,
  selectPrintSettings,
} from '@/store/slices/settingsSlice';
import { useIsMobile, useLayoutTier } from '@/shared/hooks/useResponsive';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime, formatTime } from '@/shared/lib/date';

export interface SaleDocumentPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  documentKind: 'invoice' | 'receipt' | null;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;

export const SaleDocumentPreviewModal = ({
  opened,
  onClose,
  invoice,
  documentKind,
}: SaleDocumentPreviewModalProps) => {
  const isMobile = useIsMobile();
  const tier = useLayoutTier();
  const currentShopProfile = useAppSelector(selectShopProfile);
  const shopProfileVersions = useAppSelector(selectShopProfileVersions);
  const printSettings = useAppSelector(selectPrintSettings);

  const [zoom, setZoom] = useState(() => (isMobile ? 0.6 : 0.85));
  // Bumped after a Print click to force a fresh read of the (localStorage-backed) print log below.
  const [, forcePrintLogRefresh] = useState(0);
  const printLogs = opened && invoice ? getPrintLogsForInvoice(invoice.invoiceNumber) : [];

  const payload = useMemo(() => {
    if (!invoice || !documentKind) return null;
    const shop = getShopProfileForInvoice(invoice, shopProfileVersions, currentShopProfile);
    const printCount = getPrintCountForInvoice(
      invoice.invoiceNumber,
      documentKind === 'invoice' ? 'a4' : 'receipt'
    );
    const isDuplicate = printCount > 0;
    const copyDesignation = isDuplicate ? 'DUPLICATE — CUSTOMER COPY' : 'ORIGINAL — CUSTOMER COPY';
    return buildPrintPayload(invoice, shop, printSettings, copyDesignation, isDuplicate);
  }, [invoice, documentKind, shopProfileVersions, currentShopProfile, printSettings]);

  const handlePrint = () => {
    if (!invoice || !payload) return;
    if (documentKind === 'invoice') {
      printA4Invoice(payload, 'customer');
    } else if (documentKind === 'receipt') {
      const paperProfile =
        printSettings.receiptPaper === '58mm' ? PAPER_PROFILES.thermal58 : PAPER_PROFILES.thermal80;
      printThermalReceipt(payload, paperProfile);
    }
    window.setTimeout(() => forcePrintLogRefresh((t) => t + 1), 300);
  };

  // Bound via the shared shortcut engine (not a focused-button click) so pressing
  // Enter never puts a visible focus ring on the Print button.
  useAppShortcuts(
    [
      { key: 'Enter', handler: handlePrint, ignoreInput: true },
      { key: 'Ctrl+P', handler: handlePrint, ignoreInput: true, preventDefault: true },
    ],
    opened
  );

  if (!invoice || !documentKind || !payload) return null;

  const hero = getSaleHeroPresentation(invoice, invoice.changeDueCents ?? 0);
  const isReceipt = documentKind === 'receipt';
  const statusWord = hero.isCreditCompleted
    ? 'On account'
    : hero.isChangeDue
      ? 'Change due'
      : 'Paid in full';
  const title = `${isReceipt ? 'Receipt' : 'Invoice'} — ${invoice.invoiceNumber}`;
  const subtitle = `${statusWord} · ${hero.methodLabel} · ${formatDateTime(invoice.createdAt)}`;
  const receiptPaperProfile =
    printSettings.receiptPaper === '58mm' ? PAPER_PROFILES.thermal58 : PAPER_PROFILES.thermal80;
  const isDesktopTier = tier === 'desktop';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      padding={0}
      withCloseButton={false}
      transitionProps={{ duration: 150 }}
      styles={{
        content: { backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' },
        body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0 },
      }}
    >
      <Box
        style={{
          height: isMobile ? 56 : 60,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: isMobile ? '0 12px' : '0 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${hero.heroColor}-6)`,
              flexShrink: 0,
            }}
          />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text fw={700} size="sm" truncate>
              {title}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {subtitle}
            </Text>
          </Stack>
        </Group>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          {!isReceipt && (
            <Group gap={4} wrap="nowrap" visibleFrom="xs">
              <ActionIcon
                variant="subtle"
                color="gray"
                size={isMobile ? 44 : 32}
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
              >
                <IconMinus size={14} />
              </ActionIcon>
              <Text size="xs" fw={600} style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
                {Math.round(zoom * 100)}%
              </Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                size={isMobile ? 44 : 32}
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Group>
          )}
          <Button
            size={isMobile ? 'sm' : 'md'}
            color="green"
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={isMobile ? 44 : 36}
            aria-label="Close preview"
            onClick={onClose}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {isReceipt ? (
        <Box style={{ flex: 1, overflow: 'auto' }}>
          <Box
            style={{
              display: 'flex',
              flexDirection: isDesktopTier ? 'row' : 'column',
              minHeight: '100%',
            }}
          >
            <Box
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: isMobile ? '24px 12px' : '40px 24px',
              }}
            >
              <Box
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.25)', backgroundColor: '#FFFFFF' }}
              >
                <ThermalReceipt payload={payload} paperProfile={receiptPaperProfile} />
              </Box>
            </Box>

            <Box
              style={{
                width: isDesktopTier ? 320 : '100%',
                flexShrink: 0,
                borderLeft: isDesktopTier ? '1px solid var(--border)' : undefined,
                borderTop: !isDesktopTier ? '1px solid var(--border)' : undefined,
                backgroundColor: 'var(--bg-card)',
                padding: 20,
              }}
            >
              <Stack gap="lg">
                <Box>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {hero.isCreditCompleted
                      ? 'Balance due'
                      : hero.isChangeDue
                        ? 'Change to hand back'
                        : 'Total paid'}
                  </Text>
                  <Text
                    fw={800}
                    c={hero.heroColor}
                    style={{
                      fontSize: 32,
                      lineHeight: 1.15,
                      fontFamily: 'monospace',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatMoney(hero.heroAmountCents)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {hero.heroCaption}
                  </Text>
                </Box>

                <Divider color="var(--border)" />

                <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                    Sale details
                  </Text>
                  <Stack gap={6}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Items
                      </Text>
                      <Text size="xs" fw={600}>
                        {invoice.items.length}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Payment method
                      </Text>
                      <Text size="xs" fw={600}>
                        {hero.methodLabel}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Cashier
                      </Text>
                      <Text size="xs" fw={600}>
                        {invoice.cashierName}
                      </Text>
                    </Group>
                    {invoice.customerName && (
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Customer
                        </Text>
                        <Text size="xs" fw={600}>
                          {invoice.customerName}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Box>

                <Divider color="var(--border)" />

                <Box>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                    Print activity
                  </Text>
                  {printLogs.length === 0 ? (
                    <Text size="xs" c="dimmed">
                      Not yet sent to printer
                    </Text>
                  ) : (
                    <Stack gap={4}>
                      {printLogs.map((log) => (
                        <Text key={log.id} size="xs" c="dimmed">
                          Printed at {formatTime(log.printedAt)}
                        </Text>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Button
                  fullWidth
                  color="green"
                  leftSection={<IconPrinter size={16} />}
                  onClick={handlePrint}
                >
                  Print receipt
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  Tip: choose &quot;Save as PDF&quot; in the print dialog to save a copy.
                </Text>
              </Stack>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: isMobile ? '16px 8px' : '32px 16px',
          }}
        >
          <Box
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              borderRadius: 4,
              backgroundColor: '#FFFFFF',
            }}
          >
            <A4Invoice payload={payload} paperProfile={PAPER_PROFILES.a4} />
          </Box>
        </Box>
      )}
    </Modal>
  );
};
