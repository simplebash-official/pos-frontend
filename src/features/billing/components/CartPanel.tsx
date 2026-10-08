import { t } from '@/shared/i18n/t';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  Paper,
  Group,
  Text,
  Button,
  Stack,
  Badge,
  ActionIcon,
  ScrollArea,
  Box,
  ThemeIcon,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconPlayerPause,
  IconTrash,
  IconUser,
  IconPlus,
  IconChevronUp,
  IconChevronDown,
  IconArrowRight,
} from '@tabler/icons-react';

import { useCartItems, useCartTotals, useCartCustomer, useHeldCarts } from '../hooks/useCart';
import { CartLineItem } from './CartLineItem';
import { UndoRemoveBanner } from './UndoRemoveBanner';
import { formatMoney } from '@/shared/lib/money';
import { getActionShortcut } from '@/shared/lib/shortcuts';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { focusBarcodeScanner } from '../lib/focusScanner';

export interface CartPanelProps {
  onOpenCustomerPicker: () => void;
  /** Move on to the payment region. Only surfaced on the tab-switched mobile layout. */
  onRequestPayment: () => void;
}

export const CartPanel = memo(function CartPanel({
  onOpenCustomerPicker,
  onRequestPayment,
}: CartPanelProps) {
  const {
    items,
    itemCount,
    totalUnitCount,
    sourceBreakdown,
    lastRemovedItem,
    updateQty,
    updateLineDisc,
    remove,
    undoRemove,
    clearUndo,
    clear,
    isCredit,
    completedSale,
  } = useCartItems();
  const { totalCents } = useCartTotals();
  const { customerName, customerPhone, customerBalanceCents, attachCustomer } = useCartCustomer();
  const { holdCurrentCart } = useHeldCarts();

  const isMobile = useIsMobile();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    hasScroll: false,
    canScrollUp: false,
    canScrollDown: false,
  });

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight + 2;
    const canScrollUp = scrollTop > 2;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 2;

    setScrollState((prev) => {
      if (
        prev.hasScroll === hasScroll &&
        prev.canScrollUp === canScrollUp &&
        prev.canScrollDown === canScrollDown
      ) {
        return prev;
      }
      return { hasScroll, canScrollUp, canScrollDown };
    });
  }, []);

  const isCartEmpty = items.length === 0;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
    // The observer already watches the viewport and its first child directly, so in-place content
    // changes (quantity/discount edits) are caught live. The only reason to re-attach is the
    // empty <-> non-empty transition, which swaps which element is `firstElementChild`.
  }, [updateScrollState, isCartEmpty]);

  const scrollByAmount = (amount: number) => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ top: amount, behavior: 'smooth' });
    }
  };

  const hasMixedSources =
    [
      sourceBreakdown.retailCents > 0,
      sourceBreakdown.repairsCents > 0,
      sourceBreakdown.printCents > 0,
    ].filter(Boolean).length > 1;

  return (
    <Paper
      p="xs"
      withBorder
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        opacity: completedSale ? 0.75 : 1,
        pointerEvents: completedSale ? 'none' : 'auto',
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* 1. Cart Header Bar */}
      <Group
        justify="space-between"
        align="center"
        pb="xs"
        wrap={isMobile ? 'wrap' : 'nowrap'}
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Group gap={6} align="center" wrap="nowrap" style={{ minWidth: 0 }}>
          <Text fw={700} size="sm" style={{ whiteSpace: 'nowrap' }}>
            {t('Current Sale')}
          </Text>
          {completedSale ? (
            <Badge
              size="sm"
              color="green"
              variant="filled"
              style={{ fontWeight: 800, letterSpacing: '0.04em' }}
            >
              {t('COMPLETED')}
            </Badge>
          ) : (
            !isMobile && (
              <Badge size="xs" color="blue" variant="light" style={{ whiteSpace: 'nowrap' }}>
                {itemCount} {t('item')}
                {itemCount !== 1 ? 's' : ''} · {totalUnitCount} {t('unit')}
                {totalUnitCount !== 1 ? 's' : ''}
              </Badge>
            )
          )}
          {isCredit && !completedSale && (
            <Badge
              size="xs"
              color="amber"
              variant="filled"
              style={{ fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              {t('CREDIT')}
            </Badge>
          )}
        </Group>

        <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            size="xs"
            variant="light"
            color="orange"
            leftSection={<IconPlayerPause size={14} />}
            disabled={items.length === 0 || Boolean(completedSale)}
            onClick={() => holdCurrentCart()}
            style={{
              height: 30,
              paddingLeft: 10,
              paddingRight: 10,
              fontWeight: 600,
            }}
          >
            {isMobile
              ? t('Hold')
              : `${t('Hold')} (${getActionShortcut('holdSale').formattedPrimary})`}
          </Button>

          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconTrash size={14} />}
            disabled={items.length === 0 || Boolean(completedSale)}
            onClick={() => setClearDialogOpen(true)}
            style={{
              height: 30,
              paddingLeft: 10,
              paddingRight: 10,
              fontWeight: 600,
            }}
          >
            {t('Clear')}
          </Button>
        </Group>
      </Group>

      {/* 2. Customer Strip (Always present directly below header) */}
      <Box py="xs">
        {customerName ? (
          <Paper p="xs" withBorder style={{ backgroundColor: 'var(--mantine-color-body)' }}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="xs" wrap="nowrap" align="center" style={{ minWidth: 0, flex: 1 }}>
                <ThemeIcon size={36} color="blue" variant="light" style={{ flexShrink: 0 }}>
                  <IconUser size={18} />
                </ThemeIcon>
                <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                  <Group gap="xs" align="center" wrap="nowrap">
                    <Text size="sm" fw={700} lineClamp={1}>
                      {customerName}
                    </Text>
                    {customerBalanceCents > 0 && (
                      <Badge
                        size="xs"
                        color="red"
                        variant="light"
                        radius="xl"
                        fw={600}
                        style={{ flexShrink: 0 }}
                      >
                        {t('Bal:')} {formatMoney(customerBalanceCents)}
                      </Badge>
                    )}
                  </Group>
                  {customerPhone && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {customerPhone}
                    </Text>
                  )}
                </Stack>
              </Group>

              <Group gap={6} wrap="nowrap" align="center" style={{ flexShrink: 0 }}>
                <Button size="xs" variant="light" color="blue" onClick={onOpenCustomerPicker}>
                  {t('Change')}
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => {
                    attachCustomer(null, null);
                    focusBarcodeScanner(true);
                  }}
                >
                  {t('Detach')}
                </Button>
              </Group>
            </Group>
          </Paper>
        ) : (
          <Paper
            p="xs"
            withBorder
            style={{
              backgroundColor: 'var(--bg-hover)',
              cursor: 'pointer',
            }}
            onClick={onOpenCustomerPicker}
          >
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconUser size={18} color="var(--text-muted)" />
                <Text size="sm" c="dimmed">
                  {t('Walk-in customer')}
                </Text>
              </Group>
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<IconPlus size={12} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomerPicker();
                }}
              >
                {isMobile
                  ? t('Attach')
                  : `${t('Attach')} (${getActionShortcut('attachCustomer').formattedPrimary})`}
              </Button>
            </Group>
          </Paper>
        )}
      </Box>

      {/* 3. 4-Second Line Removal Undo Banner */}
      {lastRemovedItem && (
        <Box mb="xs">
          <UndoRemoveBanner
            itemName={lastRemovedItem.item.name}
            onUndo={() => {
              undoRemove();
              focusBarcodeScanner(true);
            }}
            onDismiss={clearUndo}
            durationMs={4000}
          />
        </Box>
      )}

      {/* 4. Line Items Scrollable Region */}
      <ScrollArea
        viewportRef={viewportRef}
        style={{ flex: 1 }}
        type="never"
        styles={{
          viewport: { overflowX: 'hidden' },
        }}
      >
        {items.length === 0 ? (
          <Stack align="center" justify="center" h={isMobile ? 180 : 260} gap="xs">
            <IconShoppingCart size={44} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center" fw={600}>
              {isMobile
                ? 'Add an item from the catalog to start a sale'
                : 'Scan an item or press F4 to bill a repair'}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              {t('Items added will appear instantly at the top.')}
            </Text>
          </Stack>
        ) : (
          <Stack gap={6}>
            {items.map((item, index) => (
              <CartLineItem
                key={item.id}
                item={item}
                isNewest={index === 0}
                onUpdateQty={updateQty}
                onUpdateLineDiscount={updateLineDisc}
                onRemove={(id) => {
                  remove(id);
                  focusBarcodeScanner(true);
                }}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>

      {/* Scroll Controls — touch devices scroll the list directly, so these would only cost
          vertical space on the smallest screens. */}
      {!isMobile && items.length > 0 && scrollState.hasScroll && (
        <Group justify="center" gap="xs" mt="xs">
          <ActionIcon
            variant="light"
            color="gray"
            size="md"
            disabled={!scrollState.canScrollUp}
            onClick={() => scrollByAmount(-200)}
          >
            <IconChevronUp size={18} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="gray"
            size="md"
            disabled={!scrollState.canScrollDown}
            onClick={() => scrollByAmount(200)}
          >
            <IconChevronDown size={18} />
          </ActionIcon>
        </Group>
      )}

      {/* 5. Mixed Cart Breakdown Footer (rendered when >1 source type present) */}
      {hasMixedSources && (
        <Box pt="xs" mt="xs" style={{ borderTop: '1px dashed var(--border-strong)' }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={2} style={{ fontSize: 10 }}>
            {t('Mixed Cart Source Breakdown')}
          </Text>
          <Group gap="md">
            {sourceBreakdown.retailCents > 0 && (
              <Text size="xs" c="blue.7" fw={600}>
                {t('Retail:')} <b>{formatMoney(sourceBreakdown.retailCents)}</b>
              </Text>
            )}
            {sourceBreakdown.repairsCents > 0 && (
              <Text size="xs" c="orange.7" fw={600}>
                {t('Repairs:')} <b>{formatMoney(sourceBreakdown.repairsCents)}</b>
              </Text>
            )}
            {sourceBreakdown.printCents > 0 && (
              <Text size="xs" c="teal.7" fw={600}>
                {t('Print:')} <b>{formatMoney(sourceBreakdown.printCents)}</b>
              </Text>
            )}
          </Group>
        </Box>
      )}

      {/* 6. Mobile hand-off to the payment region. On the wider tiers payment is already on screen,
             so this button would just be a second route to a visible panel. */}
      {isMobile && items.length > 0 && (
        <Button
          fullWidth
          size="lg"
          color="blue"
          mt="xs"
          rightSection={<IconArrowRight size={18} />}
          onClick={onRequestPayment}
          style={{ height: 52, flexShrink: 0 }}
        >
          {t('Charge')} {formatMoney(totalCents)}
        </Button>
      )}

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        opened={clearDialogOpen}
        onClose={() => {
          setClearDialogOpen(false);
          focusBarcodeScanner(true);
        }}
        onConfirm={() => {
          clear();
          setClearDialogOpen(false);
          focusBarcodeScanner(true);
        }}
        title={t('Clear Billing Cart?')}
        confirmLabel={t('Clear Cart')}
        confirmColor="red"
      >
        {t('Are you sure you want to clear')} {itemCount}{' '}
        {t('items from the current billing cart?')}
      </ConfirmDialog>
    </Paper>
  );
});
