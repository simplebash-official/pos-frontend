import { useState, useCallback, useRef } from 'react';
import { Box } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useOutletContext } from 'react-router-dom';

import { useCart } from '../hooks/useCart';
import { usePrint } from '../hooks/usePrint';
import { BillingRegions } from './BillingRegions';
import type { BillingPane } from './BillingTabBar';
import { ServiceJobPickerModal } from './ServiceJobPickerModal';
import { CustomerPickerModal } from '@/features/customers';
import { DiscountPopover } from './DiscountPopover';
import { A4InvoicePreviewModal } from './A4InvoicePreviewModal';
import type { PaymentPanelHandle } from './PaymentPanel';
import { createInvoice } from '../api/mockInvoices';
import { updateRepairJob } from '@/features/repairs/api/mockRepairs';
import { updatePrintJob } from '@/features/print-jobs/api/mockPrintJobs';
import { queryKeys } from '@/api/queryKeys';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { playPaymentCompleteSound } from '../lib/audio';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectShopProfile, selectPrintSettings } from '@/store/slices/settingsSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts, type Shortcut } from '@/shared/hooks/useShortcuts';
import { BILLING_HEADER_HEIGHT } from '@/app/layout/constants';
import type { Invoice } from '../types';

export const BillingCounter = () => {
  const queryClient = useQueryClient();
  const authUser = useAppSelector(selectAuthUser);
  const shopProfile = useAppSelector(selectShopProfile);
  const printSettings = useAppSelector(selectPrintSettings);
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
    cardRef,
    onlineRef,
    onlineNote,
    notes,
    soundEnabled,
    attachCustomer,
    changePaymentMethod,
    setDiscount,
    markSaleCompleted,
    startNextSale,
    completedSale,
    holdCurrentCart,
  } = useCart();

  const {
    printReceipt,
    previewInvoiceDoc,
    previewModalOpen,
    previewInvoiceData,
    closePreviewModal,
  } = usePrint();

  const isMobile = useIsMobile();

  // Which region is on screen below desktop tier
  const [activePane, setActivePane] = useState<BillingPane>('catalog');

  // Modals state
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [orderDiscountOpen, setOrderDiscountOpen] = useState(false);

  // Processing & Last completed invoice state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCompletedInvoice, setLastCompletedInvoice] = useState<Invoice | null>(null);

  // Lets F2 run PaymentPanel's own guardrailed primary-action path (see the F2 shortcut below)
  // instead of jumping straight to checkout and bypassing the credit-limit confirmation.
  const paymentPanelRef = useRef<PaymentPanelHandle>(null);

  // Complete Payment Action (F2)
  const handleCompleteCheckout = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;
    if (
      paymentMethod === PAYMENT_METHODS.CARD &&
      !isCredit &&
      (!cardRef || cardRef.trim().length !== 4)
    ) {
      return;
    }
    if (
      paymentMethod === PAYMENT_METHODS.SPLIT &&
      !isCredit &&
      splitPayments.some(
        (sp) =>
          sp.method === PAYMENT_METHODS.CARD && (!sp.cardLast4 || sp.cardLast4.trim().length !== 4)
      )
    ) {
      return;
    }

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
        cardLast4: cardRef || undefined,
        cardRef: cardRef || undefined,
        onlineRef: onlineRef || undefined,
        onlineNote: onlineNote || undefined,
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

      // Open preview modal ONLY if "previewBeforePrinting" setting is ON
      if (
        printSettings.previewBeforePrinting &&
        (documentSelection === 'invoice' || documentSelection === 'both')
      ) {
        previewInvoiceDoc(invoice);
      }

      setLastCompletedInvoice(invoice);

      // Mark sale completed (transforms PaymentPanel in-place to Confirmation Card, keeps cart visible)
      markSaleCompleted(invoice, calculatedChangeCents);

      // On mobile tab layouts, remain on pay pane to view confirmation card
      if (isMobile) {
        setActivePane('pay');
      }
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
    cardRef,
    onlineRef,
    onlineNote,
    splitPayments,
    isCredit,
    tenderedAmountCents,
    dueDate,
    documentSelection,
    notes,
    soundEnabled,
    authUser,
    shopProfile,
    printSettings,
    queryClient,
    printReceipt,
    previewInvoiceDoc,
    markSaleCompleted,
    isMobile,
  ]);

  // Global Cashier Hotkeys Binding
  const focusScanBar = () => {
    const scanBar = document.querySelector(
      'input[placeholder*="Scan barcode"], input[placeholder*="Scan or search"]'
    ) as HTMLInputElement;
    scanBar?.focus();
  };

  const postSaleShortcuts: Shortcut[] = completedSale
    ? (() => {
        const docSel = completedSale.invoice.documentSelection;
        const isInvoiceMode = docSel === 'invoice' || docSel === 'both';

        const shortcuts: Shortcut[] = [
          {
            key: 'Enter',
            handler: () => {
              if (isInvoiceMode) {
                previewInvoiceDoc(completedSale.invoice);
              } else {
                startNextSale();
                setActivePane('catalog');
              }
            },
          },
          {
            key: 'N',
            handler: () => {
              startNextSale();
              setActivePane('catalog');
            },
          },
          { key: 'R', handler: () => printReceipt(completedSale.invoice) },
          { key: 'I', handler: () => previewInvoiceDoc(completedSale.invoice) },
        ];

        if (isInvoiceMode) {
          shortcuts.push({ key: 'P', handler: () => previewInvoiceDoc(completedSale.invoice) });
        }

        return shortcuts;
      })()
    : [];

  useAppShortcuts([
    { key: 'F1', ignoreInput: true, handler: focusScanBar },
    {
      key: 'F2',
      ignoreInput: true,
      handler: () => {
        if (completedSale) return;
        // Route through PaymentPanel's own primary-action path so the credit-limit
        // guardrail applies the same way it does for a click; fall back to a direct
        // checkout when the panel isn't mounted (tablet/mobile off the pay pane).
        if (paymentPanelRef.current) {
          paymentPanelRef.current.triggerPrimaryAction();
        } else {
          handleCompleteCheckout();
        }
      },
    },
    { key: 'F3', ignoreInput: true, handler: () => setCustomerModalOpen(true) },
    { key: 'F4', ignoreInput: true, handler: () => setServicePickerOpen(true) },
    {
      key: 'F6',
      ignoreInput: true,
      handler: () => {
        const methods: PaymentMethod[] = [
          PAYMENT_METHODS.CASH,
          PAYMENT_METHODS.CARD,
          PAYMENT_METHODS.SPLIT,
        ];
        const nextIdx = (methods.indexOf(paymentMethod) + 1) % methods.length;
        changePaymentMethod(methods[nextIdx]);
      },
    },
    { key: 'Ctrl+D', ignoreInput: true, handler: () => setOrderDiscountOpen(true) },
    { key: 'Ctrl+H', ignoreInput: true, handler: () => holdCurrentCart() },
    {
      key: 'Ctrl+Shift+H',
      ignoreInput: true,
      handler: () => outletContext.setHeldDrawerOpen?.(true),
    },
    {
      key: 'Ctrl+P',
      ignoreInput: true,
      handler: () => {
        const targetInv = completedSale?.invoice || lastCompletedInvoice;
        if (targetInv) {
          printReceipt(targetInv);
        } else {
          notifications.show({
            title: 'Reprint Last Receipt',
            message: 'No previous invoice found to reprint',
            color: 'orange',
          });
        }
      },
    },
    {
      key: 'Ctrl+Shift+P',
      ignoreInput: true,
      handler: () => {
        const targetInv = completedSale?.invoice || lastCompletedInvoice;
        if (targetInv) {
          previewInvoiceDoc(targetInv);
        } else {
          notifications.show({
            title: 'Preview Last Invoice',
            message: 'No previous invoice found to preview',
            color: 'orange',
          });
        }
      },
    },
    { key: '?', handler: () => outletContext.setShortcutsOpen?.(true) },
    ...postSaleShortcuts,
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
        onPreviewInvoice={previewInvoiceDoc}
        paymentPanelRef={paymentPanelRef}
      />

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
};
