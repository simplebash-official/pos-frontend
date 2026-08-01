import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Button,
  ThemeIcon,
  Badge,
  Progress,
} from '@mantine/core';
import { IconCheck, IconPrinter, IconFileText, IconPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useOutletContext } from 'react-router-dom';

import { useCart } from '../hooks/useCart';
import { usePrint } from '../hooks/usePrint';
import { BillingRegions } from './BillingRegions';
import type { BillingPane } from './BillingTabBar';
import { ServiceJobPickerModal } from './ServiceJobPickerModal';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { DiscountPopover } from './DiscountPopover';
import { A4InvoicePreviewModal } from './A4InvoicePreviewModal';
import { createInvoice } from '../api/mockInvoices';
import { updateRepairJob } from '@/features/repairs/api/mockRepairs';
import { updatePrintJob } from '@/features/print-jobs/api/mockPrintJobs';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { playPaymentCompleteSound } from '../lib/audio';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { BILLING_HEADER_HEIGHT } from '@/app/layout/constants';
import type { Invoice } from '../types';

export function BillingCounter() {
  const queryClient = useQueryClient();
  const authUser = useAppSelector(selectAuthUser);
  const shopProfile = useAppSelector(selectShopProfile);
  const outletContext = useOutletContext<{
    setHeldDrawerOpen?: (open: boolean) => void;
    setShortcutsOpen?: (open: boolean) => void;
  }>();

  const {
    items,
    customerId,
    customerName,
    customerPhone,
    customerAddress,
    discountCents,
    subtotalCents,
    totalCents,
    paymentMethod,
    splitPayments,
    isCredit,
    tenderedAmountCents,
    documentSelection,
    dueDate,
    notes,
    soundEnabled,
    attachCustomer,
    changePaymentMethod,
    setDiscount,
    clear,
  } = useCart();

  const {
    printReceipt,
    previewInvoiceDoc,
    previewModalOpen,
    previewInvoiceData,
    closePreviewModal,
  } = usePrint();

  const isMobile = useIsMobile();

  // Which region is on screen below the desktop tier (ignored by the 3-column desktop layout).
  const [activePane, setActivePane] = useState<BillingPane>('catalog');

  // Modals state
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [orderDiscountOpen, setOrderDiscountOpen] = useState(false);

  // Processing & Success screen state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompletedInvoice, setLastCompletedInvoice] = useState<Invoice | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Timer & Countdown progress state
  const [countdownProgress, setCountdownProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedMsRef = useRef(0);

  // Auto-dismiss countdown timer logic
  useEffect(() => {
    if (!showSuccessOverlay) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      elapsedMsRef.current = 0;
      return;
    }

    const durationMs = 4000;
    const stepMs = 50;
    elapsedMsRef.current = 0;

    timerIntervalRef.current = setInterval(() => {
      if (isHovered) return; // Pause timer on hover/focus

      elapsedMsRef.current += stepMs;
      const remainingPct = Math.max(0, ((durationMs - elapsedMsRef.current) / durationMs) * 100);
      setCountdownProgress(remainingPct);

      if (elapsedMsRef.current >= durationMs) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setShowSuccessOverlay(false);
      }
    }, stepMs);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [showSuccessOverlay, isHovered]);

  // Complete Payment Action
  const handleCompleteCheckout = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const calculatedChangeCents =
        paymentMethod === PAYMENT_METHODS.CASH
          ? Math.max(0, (tenderedAmountCents || 0) - totalCents)
          : 0;

      const cashierName = authUser?.name || 'Store Cashier';

      // Create invoice record
      const invoice = await createInvoice({
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress || undefined,
        cashierId: authUser?.id || 'usr-cashier',
        cashierName,
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.name,
          productName: i.name,
          sku: i.sku,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
          discountCents: i.discountCents,
          totalCents: i.totalCents,
          sourceType: i.sourceType,
          sourceTicketNumber: i.sourceTicketNumber,
          assignedEmployeeId: i.assignedEmployeeId,
          assignedEmployeeName: i.assignedEmployeeName,
        })),
        subtotalCents,
        taxCents: shopProfile.isVatRegistered ? Math.round(subtotalCents * shopProfile.vatRate) : 0,
        discountCents,
        totalCents: shopProfile.isVatRegistered
          ? subtotalCents - discountCents + Math.round(subtotalCents * shopProfile.vatRate)
          : totalCents,
        paymentMethod,
        splitPayments,
        isCredit,
        tenderedAmountCents:
          paymentMethod === PAYMENT_METHODS.CASH ? tenderedAmountCents : totalCents,
        changeDueCents: calculatedChangeCents,
        dueDate: isCredit
          ? dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          : undefined,
        status: isCredit ? 'pending' : 'paid',
        notes,
        shopProfileVersion: shopProfile.version,
        warrantyTermsSnapshot: shopProfile.defaultWarrantyText,
        documentSelection,
      });

      // Update service tickets status to 'delivered' if applicable
      for (const item of items) {
        if (item.sourceType === 'repair' && item.productId) {
          await updateRepairJob(item.productId, { status: 'delivered' });
        } else if (item.sourceType === 'print' && item.productId) {
          await updatePrintJob(item.productId, { status: 'delivered' });
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });

      // Play chime sound
      playPaymentCompleteSound(soundEnabled);

      // Trigger automatic printing according to documentSelection
      if (documentSelection === 'receipt' || documentSelection === 'both') {
        printReceipt(invoice);
      }
      if (documentSelection === 'invoice' || documentSelection === 'both') {
        previewInvoiceDoc(invoice);
      }

      setLastCompletedInvoice(invoice);
      setShowSuccessOverlay(true);

      // Next sale starts from the catalog again on the tab-switched layouts.
      setActivePane('catalog');

      // Clear cart
      clear();
    } catch {
      notifications.show({
        title: 'Checkout Error',
        message: 'Failed to process payment invoice',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    items,
    isProcessing,
    customerId,
    customerName,
    customerPhone,
    customerAddress,
    subtotalCents,
    discountCents,
    totalCents,
    paymentMethod,
    splitPayments,
    isCredit,
    tenderedAmountCents,
    dueDate,
    documentSelection,
    notes,
    soundEnabled,
    authUser,
    shopProfile,
    clear,
    queryClient,
    printReceipt,
    previewInvoiceDoc,
  ]);

  // Global Cashier Hotkeys Binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        const scanBar = document.querySelector(
          'input[placeholder*="Scan barcode"]'
        ) as HTMLInputElement;
        scanBar?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleCompleteCheckout();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setCustomerModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setServicePickerOpen(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        const methods = [
          PAYMENT_METHODS.CASH,
          PAYMENT_METHODS.CARD,
          PAYMENT_METHODS.ONLINE,
          PAYMENT_METHODS.SPLIT,
        ];
        const nextIdx = (methods.indexOf(paymentMethod) + 1) % methods.length;
        changePaymentMethod(methods[nextIdx] as PaymentMethod);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setOrderDiscountOpen(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'h' && !e.shiftKey) {
        e.preventDefault();
        const scanBar = document.querySelector(
          'input[placeholder*="Scan barcode"]'
        ) as HTMLInputElement;
        scanBar?.blur();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        outletContext.setHeldDrawerOpen?.(true);
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (lastCompletedInvoice) {
          printReceipt(lastCompletedInvoice);
        } else {
          notifications.show({
            title: 'Reprint Last Receipt',
            message: 'No previous invoice found to reprint',
            color: 'orange',
          });
        }
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (lastCompletedInvoice) {
          previewInvoiceDoc(lastCompletedInvoice);
        } else {
          notifications.show({
            title: 'Preview Last Invoice',
            message: 'No previous invoice found to preview',
            color: 'orange',
          });
        }
      } else if (e.key === 'Enter' && showSuccessOverlay) {
        e.preventDefault();
        setShowSuccessOverlay(false);
      } else if (e.key === 'Escape' && showSuccessOverlay) {
        e.preventDefault();
        setShowSuccessOverlay(false);
      } else if (
        e.key.toLowerCase() === 'r' &&
        showSuccessOverlay &&
        lastCompletedInvoice &&
        (e.target as HTMLElement)?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        printReceipt(lastCompletedInvoice);
      } else if (
        e.key.toLowerCase() === 'i' &&
        showSuccessOverlay &&
        lastCompletedInvoice &&
        (e.target as HTMLElement)?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        previewInvoiceDoc(lastCompletedInvoice);
      } else if (e.key === '?') {
        if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
          e.preventDefault();
          outletContext.setShortcutsOpen?.(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleCompleteCheckout,
    paymentMethod,
    changePaymentMethod,
    outletContext,
    lastCompletedInvoice,
    showSuccessOverlay,
    printReceipt,
    previewInvoiceDoc,
  ]);

  return (
    <Box
      className="billing-root"
      style={{
        ['--billing-header-h' as string]: `${BILLING_HEADER_HEIGHT}px`,
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        padding: isMobile ? 4 : 8,
      }}
    >
      <BillingRegions
        activePane={activePane}
        onChangePane={setActivePane}
        isProcessing={isProcessing}
        onCompleteCheckout={handleCompleteCheckout}
        onOpenServicePicker={() => setServicePickerOpen(true)}
        onOpenCustomerPicker={() => setCustomerModalOpen(true)}
        onOpenOrderDiscount={() => setOrderDiscountOpen(true)}
      />

      {/* Redesigned Success Confirmation Overlay (480px Centered Card with Backdrop Blur) */}
      {showSuccessOverlay && lastCompletedInvoice && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(14, 15, 19, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Paper
            p="xl"
            radius="var(--mantine-radius-default)"
            style={{
              width: 480,
              maxWidth: '92vw',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
          >
            <Stack align="center" gap="md">
              <ThemeIcon
                size={72}
                radius="var(--mantine-radius-default)"
                color="green"
                variant="light"
              >
                <IconCheck size={44} stroke={3} />
              </ThemeIcon>

              <Stack align="center" gap={4}>
                <Title
                  order={2}
                  style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  Payment Completed!
                </Title>
                <Badge size="lg" color="gray" variant="light">
                  Invoice #{lastCompletedInvoice.invoiceNumber}
                </Badge>
                {lastCompletedInvoice.customerName && (
                  <Text size="sm" c="dimmed">
                    Customer: {lastCompletedInvoice.customerName}
                  </Text>
                )}
              </Stack>

              {lastCompletedInvoice.changeDueCents ? (
                <Paper
                  p="md"
                  radius="var(--mantine-radius-default)"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--mantine-color-green-light)',
                    border: '1px solid var(--mantine-color-green-filled)',
                    textAlign: 'center',
                  }}
                >
                  <Text
                    size="xs"
                    fw={700}
                    c="green.8"
                    tt="uppercase"
                    style={{ letterSpacing: '0.06em' }}
                  >
                    CHANGE DUE TO CUSTOMER
                  </Text>
                  <Text
                    fw={700}
                    c="green.9"
                    style={{
                      fontSize: 36,
                      lineHeight: 1.1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatMoney(lastCompletedInvoice.changeDueCents)}
                  </Text>
                </Paper>
              ) : null}

              {/* Three side-by-side buttons clip their own labels below ~420px, so the phone
                  layout stacks them full width instead. */}
              {isMobile ? (
                <Stack gap="xs" style={{ width: '100%' }} mt="xs">
                  <Button
                    fullWidth
                    variant="outline"
                    color="blue"
                    leftSection={<IconPrinter size={18} />}
                    onClick={() => printReceipt(lastCompletedInvoice)}
                  >
                    Receipt
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    color="violet"
                    leftSection={<IconFileText size={18} />}
                    onClick={() => previewInvoiceDoc(lastCompletedInvoice)}
                  >
                    Invoice
                  </Button>
                  <Button
                    fullWidth
                    size="md"
                    color="blue"
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setShowSuccessOverlay(false)}
                  >
                    New Sale
                  </Button>
                </Stack>
              ) : (
                <Group gap="sm" style={{ width: '100%' }} mt="xs">
                  <Button
                    flex={1}
                    variant="outline"
                    color="blue"
                    leftSection={<IconPrinter size={18} />}
                    onClick={() => printReceipt(lastCompletedInvoice)}
                  >
                    Receipt (R)
                  </Button>
                  <Button
                    flex={1}
                    variant="outline"
                    color="violet"
                    leftSection={<IconFileText size={18} />}
                    onClick={() => previewInvoiceDoc(lastCompletedInvoice)}
                  >
                    Invoice (I)
                  </Button>
                  <Button
                    flex={1}
                    color="blue"
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setShowSuccessOverlay(false)}
                  >
                    New Sale (↵)
                  </Button>
                </Group>
              )}
            </Stack>

            {/* Depleting progress bar */}
            <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <Progress value={countdownProgress} size="xs" color="blue" radius={0} />
            </Box>
          </Paper>
        </Box>
      )}

      {/* Modals */}
      <ServiceJobPickerModal
        opened={servicePickerOpen}
        onClose={() => setServicePickerOpen(false)}
      />

      <CustomerPickerModal
        opened={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        selectedCustomerId={customerId}
        onSelectCustomer={(cust) => {
          if (cust) {
            attachCustomer(
              cust.id,
              cust.name,
              cust.primaryPhone,
              cust.address,
              cust.outstandingBalanceCents
            );
          } else {
            attachCustomer(null, null);
          }
        }}
      />

      <DiscountPopover
        opened={orderDiscountOpen}
        onClose={() => setOrderDiscountOpen(false)}
        targetName="Entire Order"
        originalCents={subtotalCents}
        currentDiscountCents={discountCents}
        onApplyDiscount={setDiscount}
      >
        <span />
      </DiscountPopover>

      <A4InvoicePreviewModal
        opened={previewModalOpen}
        onClose={closePreviewModal}
        invoice={previewInvoiceData}
      />
    </Box>
  );
}
