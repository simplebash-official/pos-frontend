import { memo, useCallback, type Ref } from 'react';
import { Box, Grid } from '@mantine/core';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';

import { CatalogPanel } from './CatalogPanel';
import { CartPanel } from './CartPanel';
import { PaymentPanel, type PaymentPanelHandle } from './PaymentPanel';
import { BillingSummaryStrip, BillingTabBar, type BillingPane } from './BillingTabBar';
import { useLayoutTier } from '@/shared/hooks/useResponsive';

import type { Invoice } from '../types';

export interface BillingRegionsProps {
  activePane: BillingPane;
  onChangePane: (pane: BillingPane) => void;
  isProcessing: boolean;
  onCompleteCheckout: () => void;
  onOpenServicePicker: () => void;
  onOpenCustomerPicker: () => void;
  onOpenOrderDiscount: () => void;
  onOpenDocumentPreview: (invoice: Invoice, kind: 'invoice' | 'receipt') => void;
  paymentPanelRef: Ref<PaymentPanelHandle>;
}

/** Every region fills its container and scrolls internally; the page itself never scrolls. */
const FILL: React.CSSProperties = { height: '100%', minHeight: 0 };

/**
 * Arranges the three billing regions for the current layout tier. Everything else about the billing
 * screen — hotkeys, checkout, modals, the success overlay — stays in `BillingCounter`.
 *
 * - desktop (`lg`+): all three side by side, the original 5/4/3 split
 * - tablet (`sm`–`lg`): catalog plus a right column that toggles between cart and payment
 * - mobile (below `sm`): one full-screen region at a time, driven by the bottom tab bar
 */
export const BillingRegions = memo(function BillingRegions({
  activePane,
  onChangePane,
  isProcessing,
  onCompleteCheckout,
  onOpenServicePicker,
  onOpenCustomerPicker,
  onOpenOrderDiscount,
  onOpenDocumentPreview,
  paymentPanelRef,
}: BillingRegionsProps) {
  const tier = useLayoutTier();

  // Stable references so CartPanel (React.memo'd) doesn't re-render just because BillingRegions
  // re-rendered for an unrelated reason.
  const requestPayment = useCallback(() => onChangePane('pay'), [onChangePane]);
  const openCart = useCallback(() => onChangePane('cart'), [onChangePane]);

  const catalog = <CatalogPanel onOpenServicePicker={onOpenServicePicker} />;
  const cart = (
    <CartPanel onOpenCustomerPicker={onOpenCustomerPicker} onRequestPayment={requestPayment} />
  );
  const payment = (
    <PaymentPanel
      ref={paymentPanelRef}
      isProcessing={isProcessing}
      onCompleteCheckout={onCompleteCheckout}
      onOpenOrderDiscount={onOpenOrderDiscount}
      onOpenDocumentPreview={onOpenDocumentPreview}
    />
  );

  if (tier === 'desktop') {
    return (
      /* `inner` needs an explicit height so Grid.Col's height:100% has something definite to
         resolve against — otherwise columns grow to content height and break internal scrolling. */
      <Grid h="100%" styles={{ inner: { height: '100%' } }}>
        <Grid.Col span={5} style={FILL}>
          {catalog}
        </Grid.Col>
        <Grid.Col span={4} style={FILL}>
          {cart}
        </Grid.Col>
        <Grid.Col span={3} style={FILL}>
          {payment}
        </Grid.Col>
      </Grid>
    );
  }

  if (tier === 'tablet') {
    return (
      <Grid h="100%" styles={{ inner: { height: '100%' } }}>
        <Grid.Col span={7} style={FILL}>
          {catalog}
        </Grid.Col>
        <Grid.Col
          span={5}
          style={{
            ...FILL,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--mantine-spacing-2xs)',
          }}
        >
          <SegmentedToggle
            fullWidth
            size="sm"
            value={activePane === 'pay' ? 'pay' : 'cart'}
            onChange={(value) => onChangePane(value as BillingPane)}
            data={[
              { value: 'cart', label: 'Cart' },
              { value: 'pay', label: 'Payment' },
            ]}
          />
          <Box style={{ flex: 1, minHeight: 0 }}>{activePane === 'pay' ? payment : cart}</Box>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box style={{ flex: 1, minHeight: 0 }}>
        {activePane === 'catalog' && catalog}
        {activePane === 'cart' && cart}
        {activePane === 'pay' && payment}
      </Box>
      <BillingSummaryStrip onOpenCart={openCart} />
      <BillingTabBar active={activePane} onChange={onChangePane} />
    </Box>
  );
});
