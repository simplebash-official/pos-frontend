import type { Ref } from 'react';
import { Box, Grid, SegmentedControl } from '@mantine/core';

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
  onPreviewInvoice: (invoice: Invoice) => void;
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
export function BillingRegions({
  activePane,
  onChangePane,
  isProcessing,
  onCompleteCheckout,
  onOpenServicePicker,
  onOpenCustomerPicker,
  onOpenOrderDiscount,
  onPreviewInvoice,
  paymentPanelRef,
}: BillingRegionsProps) {
  const tier = useLayoutTier();

  const catalog = <CatalogPanel onOpenServicePicker={onOpenServicePicker} />;
  const cart = (
    <CartPanel
      onOpenCustomerPicker={onOpenCustomerPicker}
      onRequestPayment={() => onChangePane('pay')}
    />
  );
  const payment = (
    <PaymentPanel
      ref={paymentPanelRef}
      isProcessing={isProcessing}
      onCompleteCheckout={onCompleteCheckout}
      onOpenOrderDiscount={onOpenOrderDiscount}
      onPreviewInvoice={onPreviewInvoice}
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
          <SegmentedControl
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
      <BillingSummaryStrip onOpenCart={() => onChangePane('cart')} />
      <BillingTabBar active={activePane} onChange={onChangePane} />
    </Box>
  );
}
