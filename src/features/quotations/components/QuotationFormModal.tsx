import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCalendar,
  IconFileText,
  IconNotes,
  IconPlus,
  IconTag,
  IconTrash,
  IconUserCheck,
  IconUserSearch,
  IconX,
} from '@tabler/icons-react';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import type { Customer } from '@/features/customers/types';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { PriceTierPickerModal } from '@/features/inventory/components/PriceTierPickerModal';
import { formatCentsRange, sellingPriceRange } from '@/features/inventory/lib/priceTiers';
import type { PriceTier, Product } from '@/features/inventory/types';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useCreateQuotation } from '../hooks/useQuotations';
import {
  buildCreateInput,
  calculateLineDiscountCents,
  draftTotals,
  emptyLine,
  formatLineDiscountBadge,
  lineFromProduct,
  todayString,
  validateDraft,
  type LineDiscountScope,
  type LineDiscountType,
  type QuotationDraft,
  type QuotationLineDraft,
} from '../lib/quotationForm';
import type { Quotation } from '../types';
import { LineDiscountPopover } from './LineDiscountPopover';

export interface QuotationFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** The starting point — empty, or built from the billing cart. Read once, when the form opens. */
  initialDraft: QuotationDraft;
  onCreated: (quotation: Quotation) => void;
}

const SECTION_LABEL = { letterSpacing: '0.05em' } as const;

const SectionLabel = ({ children }: { children: string }) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={SECTION_LABEL}>
    {children}
  </Text>
);

/** A quotation holds no stock, so every unit of every price is on offer. */
const NOTHING_RESERVED: ReadonlyMap<number, number> = new Map();

const ORDER_PERCENT_PRESETS = [5, 10, 15, 20];

export const QuotationFormModal = ({
  opened,
  onClose,
  initialDraft,
  onCreated,
}: QuotationFormModalProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const touchHeight = isMobile ? 44 : undefined;
  const authUser = useAppSelector(selectAuthUser);
  const create = useCreateQuotation();

  const [draft, setDraft] = useState<QuotationDraft>(initialDraft);
  const [problem, setProblem] = useState<string | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [activeDiscountLineUid, setActiveDiscountLineUid] = useState<string | null>(null);
  const [tierPickerProduct, setTierPickerProduct] = useState<Product | null>(null);

  const { data: products = [] } = useAllProducts({ enabled: opened });
  const productOptions = useMemo(
    () =>
      // A quotation can only offer a price the product is in stock at today.
      products.flatMap((p) => {
        const range = sellingPriceRange(p);
        return range === null
          ? []
          : [{ value: p.key, label: `${p.name} · ${p.sku} (${formatCentsRange(range)})` }];
      }),
    [products]
  );

  const totals = draftTotals(draft);
  const grossSubtotalCents = draft.lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const totalLineDiscountsCents = draft.lines.reduce((sum, l) => sum + l.discountCents, 0);

  const daysFromToday = draft.validUntil
    ? dayjs(draft.validUntil).startOf('day').diff(dayjs().startOf('day'), 'day')
    : 0;

  const validityPresets = useMemo(
    () => [
      { label: t('7 Days'), days: 7 },
      { label: t('14 Days'), days: 14 },
      { label: t('30 Days'), days: 30 },
      { label: t('60 Days'), days: 60 },
    ],
    []
  );

  const patch = (changes: Partial<QuotationDraft>) => setDraft((d) => ({ ...d, ...changes }));

  const patchLine = (uid: string, changes: Partial<QuotationLineDraft>) =>
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((line) => (line.uid === uid ? { ...line, ...changes } : line)),
    }));

  const removeLine = (uid: string) =>
    setDraft((d) => ({ ...d, lines: d.lines.filter((line) => line.uid !== uid) }));

  const handleUpdateQuantity = (uid: string, quantity: number) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((line) => {
        if (line.uid !== uid) return line;
        const discountCents = calculateLineDiscountCents(
          line.unitPriceCents,
          quantity,
          line.discountType,
          line.discountScope,
          line.discountValue
        );
        return { ...line, quantity, discountCents };
      }),
    }));
  };

  const handleApplyLineDiscount = (
    uid: string,
    discountCents: number,
    discountType: LineDiscountType,
    discountScope: LineDiscountScope,
    discountValue: number
  ) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((line) => {
        if (line.uid !== uid) return line;
        return {
          ...line,
          discountType,
          discountScope,
          discountValue,
          discountCents,
        };
      }),
    }));
  };

  const handleRemoveLineDiscount = (uid: string) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((line) => {
        if (line.uid !== uid) return line;
        return {
          ...line,
          discountType: undefined,
          discountScope: undefined,
          discountValue: undefined,
          discountCents: 0,
        };
      }),
    }));
  };

  const handlePickCustomer = (customer: Customer | null) => {
    if (customer === null) {
      patch({ customerKey: null });
    } else {
      patch({
        customerKey: customer.key,
        customerName: customer.name,
        customerPhone: customer.primaryPhone,
        customerAddress: customer.address ?? '',
      });
    }
    setCustomerPickerOpen(false);
  };

  const addProductAt = (product: Product, tier: PriceTier) =>
    setDraft((d) => ({ ...d, lines: [...d.lines, lineFromProduct(product, tier)] }));

  const handleAddProduct = (key: string | null) => {
    const product = products.find((p) => p.key === key);
    if (product && product.priceTiers.length === 1) {
      addProductAt(product, product.priceTiers[0]);
    } else if (product) {
      // In stock at several prices: ask which one this offer is at.
      setTierPickerProduct(product);
    }
    setProductSearch('');
  };

  const handleSubmit = async () => {
    const found = validateDraft(draft);
    setProblem(found);
    if (found !== null) return;
    try {
      const created = await create.mutateAsync(buildCreateInput(draft, authUser?.name));
      notifications.show({
        title: t('Quotation created'),
        message: created.quotationNumber,
        color: 'green',
      });
      onCreated(created);
    } catch (error) {
      notifications.show({
        title: t('Could not create the quotation'),
        message: getErrorMessage(error),
        color: 'red',
      });
    }
  };

  const customerLinked = draft.customerKey !== null;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="sm" align="center">
            <ThemeIcon size={34} radius="md" color="blue" variant="light">
              <IconFileText size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="md">
                {t('New Quotation')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('Official price offer · Valid for 30 days')}
              </Text>
            </Box>
          </Group>
        }
        size="xl"
        centered
        fullScreen={isMobile}
        closeButtonProps={{ size: isMobile ? 44 : 28 }}
      >
        <Stack gap="md">
          {/* 1. CUSTOMER SECTION */}
          {customerLinked ? (
            <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-hover)' }}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <ThemeIcon size={36} radius="xl" color="blue" variant="light">
                    <IconUserCheck size={18} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={700} size="sm" lineClamp={1}>
                      {draft.customerName}
                    </Text>
                    <Group gap="xs" wrap="nowrap">
                      {draft.customerPhone && (
                        <Text size="xs" c="dimmed">
                          {draft.customerPhone}
                        </Text>
                      )}
                      {draft.customerAddress && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          · {draft.customerAddress}
                        </Text>
                      )}
                    </Group>
                  </Box>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <Button size="xs" variant="light" onClick={() => setCustomerPickerOpen(true)}>
                    {t('Change')}
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() =>
                      patch({
                        customerKey: null,
                        customerName: '',
                        customerPhone: '',
                        customerAddress: '',
                      })
                    }
                  >
                    {t('Clear')}
                  </Button>
                </Group>
              </Group>
            </Paper>
          ) : (
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <SectionLabel>{t('Who is it for?')}</SectionLabel>
                <Button
                  size="xs"
                  h={touchHeight}
                  variant="light"
                  leftSection={<IconUserSearch size={14} />}
                  onClick={() => setCustomerPickerOpen(true)}
                  data-log-id="quotations.choose-customer"
                >
                  {t('Choose a saved customer')}
                </Button>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <TextInput
                  label={t('Customer name')}
                  placeholder={t('e.g. Nimal Perera')}
                  size={fieldSize}
                  value={draft.customerName}
                  onChange={(e) => patch({ customerName: e.currentTarget.value })}
                  required
                />
                <TextInput
                  label={t('Phone number')}
                  placeholder={t('e.g. 077 123 4567')}
                  size={fieldSize}
                  value={draft.customerPhone}
                  onChange={(e) => patch({ customerPhone: e.currentTarget.value })}
                />
              </SimpleGrid>
              <TextInput
                label={t('Address')}
                placeholder={t('Delivery or billing address (optional)')}
                size={fieldSize}
                value={draft.customerAddress}
                onChange={(e) => patch({ customerAddress: e.currentTarget.value })}
              />
            </Stack>
          )}

          {/* 2. ITEMS SECTION */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <SectionLabel>{t('What are you offering?')}</SectionLabel>
              <Badge variant="light" color="blue" size="sm">
                {draft.lines.length} {draft.lines.length === 1 ? t('item') : t('items')}
              </Badge>
            </Group>

            <Group gap="sm" align="flex-end" wrap={isMobile ? 'wrap' : 'nowrap'}>
              <Select
                placeholder={t('Search product by name, SKU or barcode...')}
                size={fieldSize}
                searchable
                searchValue={productSearch}
                onSearchChange={setProductSearch}
                selectFirstOptionOnChange
                limit={30}
                nothingFoundMessage={t('No product found')}
                data={productOptions}
                value={null}
                onChange={handleAddProduct}
                style={{ flex: isMobile ? '1 1 100%' : 1, minWidth: 0 }}
              />
              <Button
                variant="default"
                size={fieldSize}
                h={touchHeight}
                leftSection={<IconPlus size={14} />}
                onClick={() => setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }))}
                style={{ flexShrink: 0 }}
                data-log-id="quotations.add-custom-item"
              >
                {t('Add your own item')}
              </Button>
            </Group>

            {draft.lines.length === 0 ? (
              <Paper p="xl" withBorder style={{ textAlign: 'center', borderStyle: 'dashed' }}>
                <Text size="sm" c="dimmed">
                  {t('No items yet. Search stock above or click "Add your own item".')}
                </Text>
              </Paper>
            ) : (
              <Stack gap="xs">
                {draft.lines.map((line, index) => {
                  const fromStock = line.productKey !== undefined;
                  const lineTotal = totals.lineTotals[index];
                  const grossLine = line.unitPriceCents * line.quantity;
                  const discountBadgeText = formatLineDiscountBadge(line);

                  return (
                    <Paper
                      key={line.uid}
                      p="sm"
                      withBorder
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor:
                          line.discountCents > 0 ? 'var(--mantine-color-blue-4)' : undefined,
                      }}
                    >
                      <Stack gap="xs">
                        {/* Top: Item Title & Delete */}
                        <Group justify="space-between" align="center" wrap="nowrap">
                          <Group gap="xs" style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
                            <Badge
                              size="md"
                              variant="light"
                              color="blue"
                              radius="xl"
                              style={{
                                minWidth: 26,
                                height: 22,
                                padding: '0 6px',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </Badge>
                            {fromStock ? (
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text fw={600} size="sm" lineClamp={1}>
                                  {line.name}
                                </Text>
                                {line.sku && (
                                  <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                    {line.sku}
                                  </Text>
                                )}
                              </Box>
                            ) : (
                              <TextInput
                                label={`${t('Item')} ${index + 1}`}
                                placeholder={t('Item name or service')}
                                size="sm"
                                value={line.name}
                                onChange={(e) =>
                                  patchLine(line.uid, { name: e.currentTarget.value })
                                }
                                style={{ flex: 1, minWidth: 0 }}
                              />
                            )}
                          </Group>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size={isMobile ? 36 : 28}
                            radius="sm"
                            aria-label={`${t('Remove item')} ${index + 1}`}
                            onClick={() => removeLine(line.uid)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>

                        <Divider />

                        {/* Bottom: Quantity, Unit Price, Discount Pill, Line Total */}
                        <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
                          <Group gap="md" align="flex-end" wrap="nowrap">
                            <Box style={{ width: 110, flexShrink: 0 }}>
                              <QuantityInput
                                label={t('Quantity')}
                                value={line.quantity}
                                onChange={(val) => {
                                  const qty =
                                    typeof val === 'number' && val >= 1 ? Math.floor(val) : 1;
                                  handleUpdateQuantity(line.uid, qty);
                                }}
                                min={1}
                                size="sm"
                              />
                            </Box>

                            <Box style={{ width: 120, flexShrink: 0 }}>
                              {fromStock ? (
                                <>
                                  <Text size="xs" c="dimmed" mb={2}>
                                    {t('Price each')}
                                  </Text>
                                  <Text
                                    size="sm"
                                    fw={600}
                                    style={{
                                      fontVariantNumeric: 'tabular-nums',
                                      height: 36,
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    {formatMoney(line.unitPriceCents)}
                                  </Text>
                                </>
                              ) : (
                                <MoneyInput
                                  label={t('Price each')}
                                  size="sm"
                                  valueCents={line.unitPriceCents}
                                  onChangeCents={(cents) => {
                                    const discountCents = calculateLineDiscountCents(
                                      cents,
                                      line.quantity,
                                      line.discountType,
                                      line.discountScope,
                                      line.discountValue
                                    );
                                    patchLine(line.uid, {
                                      unitPriceCents: cents,
                                      discountCents,
                                    });
                                  }}
                                  style={{ width: 120 }}
                                />
                              )}
                            </Box>
                          </Group>

                          <Group gap="lg" align="flex-end" wrap="nowrap" style={{ flexShrink: 0 }}>
                            {/* Line Discount Popover */}
                            <Box style={{ width: 160, flexShrink: 0 }}>
                              <Text size="xs" c="dimmed" mb={2}>
                                {t('Discount')}
                              </Text>
                              <LineDiscountPopover
                                opened={activeDiscountLineUid === line.uid}
                                onClose={() => setActiveDiscountLineUid(null)}
                                targetName={line.name || `${t('Item')} ${index + 1}`}
                                unitPriceCents={line.unitPriceCents}
                                quantity={line.quantity}
                                currentDiscountType={line.discountType}
                                currentDiscountScope={line.discountScope}
                                currentDiscountValue={line.discountValue}
                                currentDiscountCents={line.discountCents}
                                onApplyDiscount={(dCents, dType, dScope, dVal) =>
                                  handleApplyLineDiscount(line.uid, dCents, dType, dScope, dVal)
                                }
                                onRemoveDiscount={() => handleRemoveLineDiscount(line.uid)}
                              >
                                <Button
                                  size="xs"
                                  fullWidth
                                  variant="light"
                                  color={line.discountCents > 0 ? 'teal' : 'blue'}
                                  leftSection={<IconTag size={13} />}
                                  onClick={() =>
                                    setActiveDiscountLineUid(
                                      activeDiscountLineUid === line.uid ? null : line.uid
                                    )
                                  }
                                >
                                  {discountBadgeText ?? t('+ Discount')}
                                </Button>
                              </LineDiscountPopover>
                            </Box>

                            {/* Item Total */}
                            <Stack
                              gap={0}
                              align="flex-end"
                              justify="center"
                              style={{ width: 110, flexShrink: 0 }}
                            >
                              <Text size="xs" c="dimmed" mb={2}>
                                {t('Item total')}
                              </Text>
                              {line.discountCents > 0 && (
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  td="line-through"
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatMoney(grossLine)}
                                </Text>
                              )}
                              <Text
                                fw={800}
                                size="sm"
                                style={{
                                  fontVariantNumeric: 'tabular-nums',
                                  height: line.discountCents > 0 ? undefined : 30,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {formatMoney(lineTotal)}
                              </Text>
                            </Stack>
                          </Group>
                        </Group>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>

          {/* 3. SETTINGS & TOTALS SUMMARY */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* Left: Validity Date & Embedded Notes/Terms Card */}
            <Paper p="md" withBorder radius="md">
              <Stack gap="xs" justify="space-between" h="100%">
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <SectionLabel>{t('Offer Validity')}</SectionLabel>
                    <Badge size="xs" variant="light" color="blue">
                      {daysFromToday > 0 ? `${daysFromToday} ${t('days')}` : t('Today')}
                    </Badge>
                  </Group>

                  <Group grow gap={6}>
                    {validityPresets.map((preset) => {
                      const isSelected = daysFromToday === preset.days;
                      return (
                        <Button
                          key={preset.days}
                          size="compact-xs"
                          variant={isSelected ? 'filled' : 'default'}
                          color={isSelected ? 'blue' : undefined}
                          onClick={() =>
                            patch({
                              validUntil: dayjs().add(preset.days, 'day').format('YYYY-MM-DD'),
                            })
                          }
                        >
                          {preset.label}
                        </Button>
                      );
                    })}
                  </Group>

                  <TextInput
                    type="date"
                    size="sm"
                    leftSection={<IconCalendar size={14} />}
                    min={todayString()}
                    value={draft.validUntil}
                    onChange={(e) => patch({ validUntil: e.currentTarget.value })}
                  />

                  {draft.validUntil && (
                    <Text size="xs" c="dimmed">
                      {daysFromToday > 0
                        ? `${t('Offer holds until')} ${dayjs(draft.validUntil).format('dddd, MMMM D, YYYY')}`
                        : daysFromToday === 0
                          ? t('Expires at the end of today')
                          : t('Selected date is in the past')}
                    </Text>
                  )}
                </Stack>

                <Box pt="xs">
                  <Divider my="xs" />
                  <Accordion
                    variant="subtle"
                    radius="sm"
                    styles={{
                      item: { border: 'none' },
                      control: { padding: '4px 0' },
                      content: { padding: '8px 0 0 0' },
                    }}
                  >
                    <Accordion.Item value="notes-terms">
                      <Accordion.Control icon={<IconNotes size={16} />}>
                        <Group gap="xs">
                          <Text size="xs" fw={600}>
                            {t('Notes & Terms (Optional)')}
                          </Text>
                          {(draft.notes || draft.terms) && (
                            <Badge size="xs" variant="dot" color="blue">
                              {t('Specified')}
                            </Badge>
                          )}
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="xs">
                          <Textarea
                            label={t('Notes')}
                            placeholder={t('Printed on quotation, e.g. warranty coverage...')}
                            size="xs"
                            autosize
                            minRows={2}
                            maxRows={4}
                            maxLength={2000}
                            value={draft.notes}
                            onChange={(e) => patch({ notes: e.currentTarget.value })}
                          />
                          <Textarea
                            label={t('Terms and conditions')}
                            placeholder={t('e.g. 50% deposit required, 7-day turnaround...')}
                            size="xs"
                            autosize
                            minRows={2}
                            maxRows={4}
                            maxLength={2000}
                            value={draft.terms}
                            onChange={(e) => patch({ terms: e.currentTarget.value })}
                          />
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Box>
              </Stack>
            </Paper>

            {/* Right: Financial Summary Card */}
            <Paper p="md" withBorder radius="md">
              <Stack gap="xs" justify="space-between" h="100%">
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <SectionLabel>{t('Summary')}</SectionLabel>
                    <Badge size="xs" variant="light" color="gray">
                      {draft.lines.length} {draft.lines.length === 1 ? t('item') : t('items')}
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t('Gross subtotal')}
                    </Text>
                    <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(grossSubtotalCents)}
                    </Text>
                  </Group>

                  {totalLineDiscountsCents > 0 && (
                    <Group justify="space-between">
                      <Text size="sm" c="green" fw={500}>
                        {t('Line discounts saved')}
                      </Text>
                      <Text
                        size="sm"
                        c="green"
                        fw={600}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        -{formatMoney(totalLineDiscountsCents)}
                      </Text>
                    </Group>
                  )}

                  {/* Quotation-Level Discount Inset Card */}
                  <Paper
                    p="xs"
                    withBorder
                    radius="sm"
                    style={{
                      backgroundColor: 'var(--mantine-color-default-hover)',
                      borderColor:
                        draft.discountValue > 0 ? 'var(--mantine-color-blue-filled)' : undefined,
                    }}
                  >
                    <Stack gap={6}>
                      <Group justify="space-between" align="center">
                        <Group gap={6}>
                          <IconTag size={14} style={{ color: 'var(--mantine-color-blue-4)' }} />
                          <Text size="xs" fw={700}>
                            {t('Quotation Discount')}
                          </Text>
                        </Group>
                        {draft.discountValue > 0 && (
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            color="red"
                            leftSection={<IconX size={12} />}
                            onClick={() => patch({ discountValue: 0 })}
                          >
                            {t('Clear')}
                          </Button>
                        )}
                      </Group>

                      <Group gap="xs" wrap="nowrap">
                        <SegmentedToggle
                          size="xs"
                          value={draft.discountType}
                          onChange={(val) =>
                            patch({
                              discountType: val as 'percentage' | 'fixed',
                              discountValue: 0,
                            })
                          }
                          data={[
                            { label: '%', value: 'percentage' },
                            { label: 'Rs.', value: 'fixed' },
                          ]}
                        />
                        {draft.discountType === 'percentage' ? (
                          <NumberInput
                            aria-label={t('Discount percent')}
                            size="xs"
                            min={0}
                            max={100}
                            suffix="%"
                            placeholder="0%"
                            value={draft.discountValue === 0 ? '' : draft.discountValue}
                            onChange={(val) =>
                              patch({
                                discountValue: typeof val === 'number' ? val : 0,
                              })
                            }
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <MoneyInput
                            aria-label={t('Discount amount')}
                            size="xs"
                            placeholder="Rs. 0.00"
                            valueCents={draft.discountValue}
                            onChangeCents={(cents) => patch({ discountValue: cents })}
                            style={{ flex: 1 }}
                          />
                        )}
                      </Group>

                      {draft.discountType === 'percentage' && (
                        <Group gap={6} grow>
                          {ORDER_PERCENT_PRESETS.map((p) => {
                            const isSelected = draft.discountValue === p;
                            return (
                              <Button
                                key={p}
                                size="compact-xs"
                                variant={isSelected ? 'filled' : 'default'}
                                color={isSelected ? 'blue' : undefined}
                                onClick={() => patch({ discountValue: p })}
                              >
                                {p}%
                              </Button>
                            );
                          })}
                        </Group>
                      )}

                      {totals.discountCents > 0 && (
                        <Group justify="space-between" pt={2}>
                          <Text size="xs" c="dimmed">
                            {t('Order discount deducted')}:
                          </Text>
                          <Text
                            size="xs"
                            c="red"
                            fw={700}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            -{formatMoney(totals.discountCents)}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Paper>
                </Stack>

                <Box pt="xs">
                  <Divider my="xs" />
                  {/* Hero Quoted Total */}
                  <Group justify="space-between" align="center">
                    <Stack gap={0}>
                      <Text fw={700} size="md">
                        {t('Quoted Total')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('Net payable amount')}
                      </Text>
                    </Stack>
                    <Text
                      fw={900}
                      size="xl"
                      c="blue"
                      style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1.5rem' }}
                    >
                      {formatMoney(totals.totalCents)}
                    </Text>
                  </Group>
                </Box>
              </Stack>
            </Paper>
          </SimpleGrid>

          {problem !== null && (
            <Paper
              p="xs"
              withBorder
              style={{
                backgroundColor: 'var(--mantine-color-red-0)',
                borderColor: 'var(--mantine-color-red-3)',
              }}
            >
              <Text size="sm" c="red" role="alert" fw={600}>
                {problem}
              </Text>
            </Paper>
          )}

          <Group justify="flex-end" mt="sm" gap="sm">
            <Button variant="default" h={touchHeight} onClick={onClose} disabled={create.isPending}>
              {t('Cancel')}
            </Button>
            <Button
              color="blue"
              h={touchHeight}
              loading={create.isPending}
              onClick={() => void handleSubmit()}
              data-log-id="quotations.create"
            >
              {t('Create Quotation')} · {formatMoney(totals.totalCents)}
            </Button>
          </Group>
        </Stack>
        {tierPickerProduct !== null && (
          <PriceTierPickerModal
            key={tierPickerProduct.key}
            opened
            onClose={() => setTierPickerProduct(null)}
            product={tierPickerProduct}
            reservedByPrice={NOTHING_RESERVED}
            onSelect={(tier) => addProductAt(tierPickerProduct, tier)}
          />
        )}
      </Modal>

      <CustomerPickerModal
        opened={customerPickerOpen}
        onClose={() => setCustomerPickerOpen(false)}
        onSelectCustomer={handlePickCustomer}
        selectedCustomerId={draft.customerKey}
      />
    </>
  );
};
