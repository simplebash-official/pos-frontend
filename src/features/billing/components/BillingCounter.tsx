import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Grid,
  Button,
  Group,
  Box,
  TextInput,
  Paper,
  Text,
  Badge,
  Stack,
  SegmentedControl,
  NumberInput,
  Drawer,
  ActionIcon,
  Card,
  ScrollArea,
  Title,
  Alert,
} from '@mantine/core';
import {
  IconBarcode,
  IconSearch,
  IconUser,
  IconPrinter,
  IconTrash,
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import { PageHeader } from '@/shared/components/PageHeader';
import { useCart } from '../hooks/useCart';
import { CartItemList } from './CartItemList';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { PAYMENT_METHODS, PaymentMethod } from '@/constants/payment';
import { createInvoice } from '../api/mockInvoices';
import { triggerThermalPrint } from '@/shared/lib/print';

export function BillingCounter() {
  const queryClient = useQueryClient();
  const {
    items,
    discountCents,
    subtotalCents,
    totalCents,
    itemCount,
    heldCarts,
    customerId,
    customerName,
    paymentMethod,
    add,
    setDiscount,
    attachCustomer,
    changePaymentMethod,
    holdCurrentCart,
    loadHeldCart,
    removeHeldCart,
    clear,
  } = useCart();

  // Scanner & Search state
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanQuery, setScanQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Customer & Parked Cart modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);

  // Payment state
  const [tenderedAmountRupees, setTenderedAmountRupees] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Products Query
  const { data: products = [] } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  // Auto-focus scanner on mount
  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  // Cash tendered calculations
  const tenderedCents =
    typeof tenderedAmountRupees === 'number' ? Math.round(tenderedAmountRupees * 100) : 0;
  const changeDueCents = Math.max(0, tenderedCents - totalCents);
  const isInsufficientCash =
    paymentMethod === PAYMENT_METHODS.CASH &&
    typeof tenderedAmountRupees === 'number' &&
    tenderedCents < totalCents;

  const handleCompleteCheckout = async () => {
    if (items.length === 0 || isProcessing) return;

    if (isInsufficientCash) {
      notifications.show({
        title: 'Insufficient Cash',
        message: 'Tendered cash amount is less than the cart total',
        color: 'red',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const invoice = await createInvoice({
        customerId,
        customerName,
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
          discountCents: i.discountCents,
          totalCents: i.totalCents,
        })),
        subtotalCents,
        discountCents,
        totalCents,
        paymentMethod,
        tenderedAmountCents: paymentMethod === PAYMENT_METHODS.CASH ? tenderedCents : totalCents,
        changeDueCents: paymentMethod === PAYMENT_METHODS.CASH ? changeDueCents : 0,
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });

      // Trigger Thermal Print
      triggerThermalPrint('thermal-receipt-printable');

      notifications.show({
        title: 'Payment Completed',
        message: `Invoice ${invoice.invoiceNumber} processed successfully.${
          changeDueCents > 0 ? ` Change due: ${formatMoney(changeDueCents)}` : ''
        }`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      clear();
      setTenderedAmountRupees('');
    } catch {
      notifications.show({
        title: 'Checkout Error',
        message: 'Failed to process payment invoice',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => scanInputRef.current?.focus(), 100);
    }
  };

  // Keyboard shortcuts (F2 = Checkout, F3 = Customer, Esc = Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleCompleteCheckout();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setCustomerModalOpen(true);
      } else if (e.key === 'Escape') {
        if (items.length > 0 && !customerModalOpen && !heldDrawerOpen) {
          clear();
          notifications.show({
            title: 'Cart Cleared',
            message: 'Billing cart has been emptied',
            color: 'gray',
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Handle direct barcode or SKU scan
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanQuery.trim()) return;

    const term = scanQuery.trim().toLowerCase();
    const matched = products.find(
      (p) =>
        p.sku.toLowerCase() === term ||
        (p.barcode && p.barcode.toLowerCase() === term) ||
        p.name.toLowerCase().includes(term)
    );

    if (matched) {
      if (matched.stockQuantity <= 0) {
        notifications.show({
          title: 'Out of Stock',
          message: `${matched.name} currently has 0 stock`,
          color: 'red',
        });
      } else {
        add({
          id: `item-${Date.now()}-${Math.random()}`,
          productId: matched.id,
          name: matched.name,
          sku: matched.sku,
          unitPriceCents: matched.sellingPriceCents,
          quantity: 1,
          discountCents: 0,
        });
        notifications.show({
          title: 'Item Added',
          message: `Added ${matched.name} to checkout cart`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }
    } else {
      notifications.show({
        title: 'Item Not Found',
        message: `No product found for SKU / Barcode "${scanQuery}"`,
        color: 'orange',
      });
    }

    setScanQuery('');
    setTimeout(() => scanInputRef.current?.focus(), 50);
  };

  // Filtered Products for fast grid picking
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'all' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <Box>
      <PageHeader
        title="Billing Counter"
        description="Fast retail point-of-sale checkout, customer attachment, and receipt printing"
        action={
          <Group gap="xs">
            <Button
              leftSection={<IconPlayerPause size={16} />}
              variant="light"
              color="orange"
              disabled={items.length === 0}
              onClick={holdCurrentCart}
            >
              Park Sale
            </Button>

            {heldCarts.length > 0 && (
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                variant="filled"
                color="orange"
                onClick={() => setHeldDrawerOpen(true)}
              >
                Held Carts ({heldCarts.length})
              </Button>
            )}

            <Button color="red" variant="subtle" onClick={clear} disabled={items.length === 0}>
              Clear Cart
            </Button>
          </Group>
        }
      />

      {/* Quick Barcode / SKU Auto-Focus Scanner Bar */}
      <Paper p="sm" withBorder mb="md" radius="var(--mantine-radius-default)">
        <form onSubmit={handleScanSubmit}>
          <Group gap="md">
            <TextInput
              ref={scanInputRef}
              placeholder="Auto-focus barcode / SKU scanner input (e.g. COV-001 or scan barcode)..."
              leftSection={<IconBarcode size={20} color="var(--mantine-color-blue-6)" />}
              value={scanQuery}
              onChange={(e) => setScanQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="md"
            />
            <Button type="submit" size="md" color="blue">
              Add Item
            </Button>
          </Group>
        </form>
      </Paper>

      <Grid>
        {/* Left / Top: Product Grid Search & Quick Pick */}
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Stack gap="sm">
            <Group justify="space-between">
              <TextInput
                placeholder="Search products by name or SKU..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1 }}
                size="sm"
              />
              <SegmentedControl
                size="xs"
                value={selectedCategory}
                onChange={setSelectedCategory}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Repairs', value: 'repairs' },
                  { label: 'Printing', value: 'print' },
                ]}
              />
            </Group>

            <ScrollArea.Autosize mah={520} offsetScrollbars>
              <Grid gap="xs">
                {filteredProducts.map((p) => {
                  const isOut = p.stockQuantity <= 0;
                  return (
                    <Grid.Col key={p.id} span={{ base: 6, sm: 4 }}>
                      <Card
                        p="xs"
                        withBorder
                        radius="var(--mantine-radius-default)"
                        style={{
                          cursor: isOut ? 'not-allowed' : 'pointer',
                          opacity: isOut ? 0.6 : 1,
                        }}
                        onClick={() => {
                          if (isOut) return;
                          add({
                            id: `item-${Date.now()}-${Math.random()}`,
                            productId: p.id,
                            name: p.name,
                            sku: p.sku,
                            unitPriceCents: p.sellingPriceCents,
                            quantity: 1,
                            discountCents: 0,
                          });
                        }}
                      >
                        <Stack gap={4}>
                          <Text size="xs" fw={700} lineClamp={2} style={{ height: 32 }}>
                            {p.name}
                          </Text>
                          <Group justify="space-between" align="center" mt={4}>
                            <Badge size="xs" variant="light" color={isOut ? 'red' : 'blue'}>
                              {p.sku} · Qty: {p.stockQuantity}
                            </Badge>
                            <Text size="xs" fw={800} c="blue" ta="right">
                              {formatMoney(p.sellingPriceCents)}
                            </Text>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </ScrollArea.Autosize>
          </Stack>
        </Grid.Col>

        {/* Right: Cart Item List & Checkout Section */}
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Stack gap="md">
            {/* Customer Attachment Header */}
            <Paper p="xs" withBorder radius="var(--mantine-radius-default)">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <IconUser size={18} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="xs" c="dimmed" fw={700}>
                      CUSTOMER ATTACHMENT
                    </Text>
                    <Text size="sm" fw={700}>
                      {customerName ? customerName : 'Walk-in Customer (Guest)'}
                    </Text>
                  </div>
                </Group>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => setCustomerModalOpen(true)}
                >
                  {customerName ? 'Change Customer' : 'Attach Customer (F3)'}
                </Button>
              </Group>
            </Paper>

            <CartItemList />

            {/* Checkout Payment Box */}
            <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-app)' }} radius="var(--mantine-radius-default)">
              <Title order={4} mb="sm">
                Checkout & Receipt (F2)
              </Title>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Subtotal ({itemCount} items):</Text>
                  <Text size="sm" fw={700} ta="right">
                    {formatMoney(subtotalCents)}
                  </Text>
                </Group>

                <Box my="xs">
                  <MoneyInput
                    label="Order Discount"
                    size="sm"
                    valueCents={discountCents}
                    onChangeCents={(cents) => setDiscount(cents)}
                  />
                </Box>

                <Group justify="space-between" pt="xs" style={{ borderTop: '2px solid var(--border-strong)' }}>
                  <Title order={3}>Total Due:</Title>
                  <Title order={3} c="blue" ta="right">
                    {formatMoney(totalCents)}
                  </Title>
                </Group>

                {/* Payment Method Selector */}
                <Box mt="xs">
                  <Text size="xs" fw={700} mb={4} c="dimmed">
                    PAYMENT METHOD
                  </Text>
                  <SegmentedControl
                    fullWidth
                    size="xs"
                    value={paymentMethod}
                    onChange={(val) => changePaymentMethod(val as PaymentMethod)}
                    data={[
                      { label: 'Cash', value: PAYMENT_METHODS.CASH },
                      { label: 'Card', value: PAYMENT_METHODS.CARD },
                      { label: 'Online / Transfer', value: PAYMENT_METHODS.ONLINE },
                    ]}
                  />
                </Box>

                {/* Cash Tendered & Change Calculation */}
                {paymentMethod === PAYMENT_METHODS.CASH && (
                  <Paper p="xs" withBorder mt="xs" radius="var(--mantine-radius-default)">
                    <Stack gap="xs">
                      <Group grow align="flex-end">
                        <NumberInput
                          label="Cash Tendered (LKR)"
                          placeholder="e.g. 5000"
                          prefix="Rs. "
                          min={0}
                          size="sm"
                          value={tenderedAmountRupees}
                          onChange={(val) => setTenderedAmountRupees(typeof val === 'number' ? val : '')}
                        />
                        <div>
                          <Text size="xs" fw={700} c="dimmed" mb={4}>
                            CHANGE DUE
                          </Text>
                          <Text size="lg" fw={800} c={changeDueCents >= 0 ? 'green' : 'red'} ta="right">
                            {formatMoney(changeDueCents)}
                          </Text>
                        </div>
                      </Group>

                      {isInsufficientCash && (
                        <Alert color="red" p="xs" icon={<IconAlertCircle size={14} />}>
                          Cash tendered is short by {formatMoney(totalCents - tenderedCents)}.
                        </Alert>
                      )}
                    </Stack>
                  </Paper>
                )}

                <Button
                  fullWidth
                  size="md"
                  mt="md"
                  color="blue"
                  leftSection={<IconPrinter size={18} />}
                  disabled={items.length === 0 || isInsufficientCash}
                  loading={isProcessing}
                  onClick={handleCompleteCheckout}
                >
                  Complete Payment & Print Receipt (F2)
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Hidden Printable Thermal Receipt Container */}
      <div style={{ display: 'none' }}>
        <div id="thermal-receipt-printable">
          <div className="text-center bold" style={{ fontSize: 16 }}>JANA2U POS</div>
          <div className="text-center">Phone Repairs & Custom Print Shop</div>
          <div className="divider"></div>
          <div>Customer: {customerName || 'Walk-in Guest'}</div>
          <div>Date: {new Date().toLocaleString()}</div>
          <div>Payment: {paymentMethod.toUpperCase()}</div>
          <div className="divider"></div>
          {items.map((item) => (
            <div key={item.id} style={{ marginBottom: 4 }}>
              <div>{item.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.quantity} x {formatMoney(item.unitPriceCents)}</span>
                <span className="bold">{formatMoney(item.totalCents)}</span>
              </div>
            </div>
          ))}
          <div className="divider"></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
          {discountCents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-{formatMoney(discountCents)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }} className="bold">
            <span>TOTAL:</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
          {paymentMethod === PAYMENT_METHODS.CASH && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tendered:</span>
                <span>{formatMoney(tenderedCents)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Change:</span>
                <span>{formatMoney(changeDueCents)}</span>
              </div>
            </>
          )}
          <div className="divider"></div>
          <div className="text-center">Thank you for your business!</div>
        </div>
      </div>

      {/* Customer Picker Modal */}
      <CustomerPickerModal
        opened={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        selectedCustomerId={customerId}
        onSelectCustomer={(cust) => {
          if (cust) {
            attachCustomer(cust.id, cust.name);
          } else {
            attachCustomer(null, null);
          }
        }}
      />

      {/* Held Carts Drawer */}
      <Drawer
        opened={heldDrawerOpen}
        onClose={() => setHeldDrawerOpen(false)}
        title={<Text fw={700}>Parked / Held Sales ({heldCarts.length})</Text>}
        position="right"
        size="md"
      >
        <Stack gap="md">
          {heldCarts.length === 0 ? (
            <Text c="dimmed">No sales currently parked.</Text>
          ) : (
            heldCarts.map((h) => (
              <Paper key={h.id} p="sm" withBorder radius="var(--mantine-radius-default)">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={700}>
                      {h.customerName || 'Walk-in Guest'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(h.heldAt).toLocaleTimeString()}
                    </Text>
                  </Group>
                  <Text size="xs">
                    {h.items.length} items · Total:{' '}
                    {formatMoney(
                      h.items.reduce((acc, i) => acc + i.totalCents, 0) - h.discountCents
                    )}
                  </Text>
                  <Group justify="flex-end" gap="xs">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeHeldCart(h.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                    <Button
                      size="xs"
                      color="blue"
                      leftSection={<IconPlayerPlay size={14} />}
                      onClick={() => {
                        loadHeldCart(h.id);
                        setHeldDrawerOpen(false);
                      }}
                    >
                      Restore Cart
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
