import { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useOutletContext } from 'react-router-dom';

import {
  useCartItems,
  useCartTotals,
  useCartCustomer,
  useCartCheckout,
  useHeldCarts,
  useCartSound,
} from '../hooks/useCart';
import { usePrint } from '../hooks/usePrint';
import { BillingRegions } from './BillingRegions';
import type { BillingPane } from './BillingTabBar';
import type { CatalogMode } from './CatalogPanel';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { DiscountPopover } from './DiscountPopover';
import type { PaymentPanelHandle } from './PaymentPanel';

const SaleDocumentPreviewModal = lazy(() =>
  import('./SaleDocumentPreviewModal').then((m) => ({
    default: m.SaleDocumentPreviewModal,
  }))
);
import type { CompleteSaleInput } from '../api/invoicesApi';
import { useCompleteSale } from '../hooks/useInvoices';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { playPaymentCompleteSound } from '../lib/audio';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppShortcuts, type Shortcut } from '@/shared/hooks/useShortcuts';
import { BILLING_HEADER_HEIGHT } from '@/app/layout/constants';
import type { ApiError } from '@/shared/types/common';
import type { Invoice } from '../types';

export const BillingCounter = () => {
  const completeSaleMutation = useCompleteSale();
  const authUser = useAppSelector(selectAuthUser);
  const shopProfile = useAppSelector(selectShopProfile);
  const outletContext = useOutletContext<{
    setHeldDrawerOpen?: (open: boolean) => void;
    setShortcutsOpen?: (open: boolean) => void;
  }>();

  const { items } = useCartItems();
  const { customerId, customerName, customerPhone, customerAddress, attachCustomer } =
    useCartCustomer();
  const { discountCents, discountType, discountValue, subtotalCents, totalCents, setDiscount } =
    useCartTotals();
  const {
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
    changePaymentMethod,
    markSaleCompleted,
    startNextSale,
    completedSale,
  } = useCartCheckout();
  const { soundEnabled } = useCartSound();
  const { holdCurrentCart } = useHeldCarts();

  const { preview, openDocumentPreview, closeDocumentPreview } = usePrint();

  const isMobile = useIsMobile();

  // Which region is on screen below desktop tier
  const [activePane, setActivePane] = useState<BillingPane>('catalog');

  // Which mode CatalogPanel is showing: the product catalog, or the repair/print jobs list.
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('goods');

  // Modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [orderDiscountOpen, setOrderDiscountOpen] = useState(false);

  // Stable references so CatalogPanel/CartPanel (both React.memo'd) don't re-render just because
  // BillingCounter re-rendered for an unrelated reason (e.g. a Notes/Card-Ref keystroke).
  const openCustomerPicker = useCallback(() => setCustomerModalOpen(true), []);
  const openOrderDiscount = useCallback(() => setOrderDiscountOpen(true), []);

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

      const hasCustomer = Boolean(customerId || customerName || customerPhone || customerAddress);

      // Single call: the backend atomically creates the invoice, records
      // payment(s), decrements retail stock, marks any repair/print-job
      // lines delivered, and updates the customer's balance — see
      // `billing::service::sale::complete_sale`'s D4 fail-forward design.
      const payload: CompleteSaleInput = {
        staff: { cashierName },
        customer: hasCustomer
          ? {
              customerKey: customerId || undefined,
              customerName: customerName || undefined,
              customerPhone: customerPhone || undefined,
              customerAddress: customerAddress || undefined,
            }
          : undefined,
        items: items.map((i) => {
          const sourceType = i.sourceType || 'retail';
          const productKey = sourceType === 'retail' ? i.productKey : undefined;
          const sourceTicketKey =
            sourceType === 'repair' || sourceType === 'print' ? i.productId : undefined;
          const isResolved = Boolean(productKey || sourceTicketKey);

          return {
            productKey,
            sourceTicketKey,
            quantity: i.quantity,
            discountCents: i.discountCents,
            sourceType,
            serialNumbers: i.serialNumbers,
            ...(isResolved
              ? {}
              : {
                  name: i.name,
                  sku: i.sku,
                  unitPriceCents: i.unitPriceCents,
                  totalCents: i.totalCents,
                  sourceTicketNumber: i.sourceTicketNumber,
                  assignedEmployeeName: i.assignedEmployeeName,
                }),
          };
        }),
        pricingAdjustments:
          discountType && discountValue > 0 ? { discountType, discountValue } : undefined,
        payment: {
          paymentMethod,
          isCredit,
          amountReceivedCents:
            paymentMethod === PAYMENT_METHODS.CASH ? tenderedAmountCents : totalCents,
          splitPayments:
            paymentMethod === PAYMENT_METHODS.SPLIT
              ? splitPayments.map((sp) => ({
                  method: sp.method,
                  amountCents: sp.amountCents,
                  cardLast4: sp.cardLast4,
                  reference: sp.reference,
                }))
              : undefined,
          cardLast4: cardRef || undefined,
          cardRef: cardRef || undefined,
          onlineRef: onlineRef || undefined,
          onlineNote: onlineNote || undefined,
          dueDate: isCredit
            ? dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
            : undefined,
        },
        notes,
        shopProfileSnapshot: shopProfile,
        warrantyTermsSnapshot: shopProfile.defaultWarrantyText,
        documentSelection,
      };

      const { invoice, warnings } = await completeSaleMutation.mutateAsync(payload);

      if (warnings.length > 0) {
        notifications.show({
          title: 'Sale Completed With Warnings',
          message: warnings.join(' '),
          color: 'orange',
        });
      }

      // Play chime sound
      playPaymentCompleteSound(soundEnabled);

      // Preview-first: nothing auto-prints. Open the full-screen document preview so the
      // cashier reviews the invoice/receipt and prints from there themselves.
      if (documentSelection === 'invoice' || documentSelection === 'both') {
        openDocumentPreview(invoice, 'invoice');
      } else if (documentSelection === 'receipt') {
        openDocumentPreview(invoice, 'receipt');
      }

      setLastCompletedInvoice(invoice);

      // Mark sale completed (transforms PaymentPanel in-place to Confirmation Card, keeps cart visible)
      markSaleCompleted(invoice, calculatedChangeCents);

      // On mobile tab layouts, remain on pay pane to view confirmation card
      if (isMobile) {
        setActivePane('pay');
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const isNotFound = apiErr?.statusCode === 404;
      notifications.show({
        title: isNotFound ? 'Item No Longer Available' : 'Checkout Error',
        message: isNotFound
          ? apiErr.message ||
            'A product, ticket, or customer in this sale no longer exists. Please refresh and try again.'
          : apiErr?.message || 'Failed to process payment invoice',
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
    discountType,
    discountValue,
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
    completeSaleMutation,
    openDocumentPreview,
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
              startNextSale();
              setActivePane('catalog');
            },
          },
          {
            key: 'N',
            handler: () => {
              startNextSale();
              setActivePane('catalog');
            },
          },
          { key: 'R', handler: () => openDocumentPreview(completedSale.invoice, 'receipt') },
          { key: 'I', handler: () => openDocumentPreview(completedSale.invoice, 'invoice') },
        ];

        if (isInvoiceMode) {
          shortcuts.push({
            key: 'P',
            handler: () => openDocumentPreview(completedSale.invoice, 'invoice'),
          });
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
    { key: 'F4', ignoreInput: true, handler: () => setCatalogMode('jobs') },
    { key: 'Ctrl+G', ignoreInput: true, handler: () => setCatalogMode('goods') },
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
          openDocumentPreview(targetInv, 'receipt');
        } else {
          notifications.show({
            title: 'Preview Last Receipt',
            message: 'No previous invoice found to preview',
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
          openDocumentPreview(targetInv, 'invoice');
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
        catalogMode={catalogMode}
        onCatalogModeChange={setCatalogMode}
        onOpenCustomerPicker={openCustomerPicker}
        onOpenOrderDiscount={openOrderDiscount}
        onOpenDocumentPreview={openDocumentPreview}
        paymentPanelRef={paymentPanelRef}
      />

      {/* Modals */}
      <CustomerPickerModal
        opened={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        selectedCustomerId={customerId}
        onSelectCustomer={(cust) => {
          if (cust) {
            attachCustomer(
              cust.key,
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

      <Suspense fallback={null}>
        {preview && (
          <SaleDocumentPreviewModal
            opened={!!preview}
            onClose={closeDocumentPreview}
            subject={preview?.invoice ? { kind: 'invoice', invoice: preview.invoice } : null}
            documentKind={preview?.kind ?? null}
          />
        )}
      </Suspense>
    </Box>
  );
};
