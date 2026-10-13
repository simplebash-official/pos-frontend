import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Button,
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconUserSearch } from '@tabler/icons-react';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import type { Customer } from '@/features/customers/types';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useCreateQuotation } from '../hooks/useQuotations';
import {
  buildCreateInput,
  draftTotals,
  emptyLine,
  lineFromProduct,
  todayString,
  validateDraft,
  type QuotationDraft,
  type QuotationLineDraft,
} from '../lib/quotationForm';
import type { Quotation } from '../types';

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

// Make a price offer for a customer. Nothing here is a sale: stock, payments and invoices are
// never touched. The backend works out every total itself; the figures shown are a live preview.
// Mount it fresh each time it opens (it reads `initialDraft` once).
export const QuotationFormModal = ({
  opened,
  onClose,
  initialDraft,
  onCreated,
}: QuotationFormModalProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  // Touch targets must be at least 44px on a phone (see the frontend CLAUDE.md).
  const touchHeight = isMobile ? 44 : undefined;
  // `md` inputs are 42px; raise them to 44px for fingers. Spread onto every field.
  const touchField = isMobile ? { styles: { input: { minHeight: 44 } } } : {};
  const authUser = useAppSelector(selectAuthUser);
  const create = useCreateQuotation();

  const [draft, setDraft] = useState<QuotationDraft>(initialDraft);
  const [problem, setProblem] = useState<string | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  // The product search box is cleared after a pick, so the next search starts fresh.
  const [productSearch, setProductSearch] = useState('');

  const { data: products } = useAllProducts({ enabled: opened });
  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.key, label: `${p.name} · ${p.sku}` })),
    [products]
  );

  const totals = draftTotals(draft);

  const patch = (changes: Partial<QuotationDraft>) => setDraft((d) => ({ ...d, ...changes }));
  const patchLine = (uid: string, changes: Partial<QuotationLineDraft>) =>
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((line) => (line.uid === uid ? { ...line, ...changes } : line)),
    }));
  const removeLine = (uid: string) =>
    setDraft((d) => ({ ...d, lines: d.lines.filter((line) => line.uid !== uid) }));

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

  const handleAddProduct = (key: string | null) => {
    const product = products.find((p) => p.key === key);
    if (product) {
      setDraft((d) => ({ ...d, lines: [...d.lines, lineFromProduct(product)] }));
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
          <Text fw={700} size="lg">
            {t('New Quotation')}
          </Text>
        }
        size="xl"
        centered
        fullScreen={isMobile}
        closeButtonProps={{ size: isMobile ? 44 : 28 }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t(
              'A quotation is a price offer. It is not a bill, and it does not change your stock.'
            )}
          </Text>

          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <SectionLabel>{t('Who is it for?')}</SectionLabel>
              <Group gap="xs">
                {customerLinked && (
                  <Button
                    size="xs"
                    h={touchHeight}
                    variant="subtle"
                    color="gray"
                    onClick={() => patch({ customerKey: null })}
                  >
                    {t('Type a name instead')}
                  </Button>
                )}
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
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label={t('Customer name')}
                size={fieldSize}
                {...touchField}
                value={draft.customerName}
                disabled={customerLinked}
                onChange={(e) => patch({ customerName: e.currentTarget.value })}
              />
              <TextInput
                label={t('Phone number')}
                size={fieldSize}
                {...touchField}
                value={draft.customerPhone}
                disabled={customerLinked}
                onChange={(e) => patch({ customerPhone: e.currentTarget.value })}
              />
            </SimpleGrid>
            <TextInput
              label={t('Address')}
              description={t('You can leave this empty.')}
              size={fieldSize}
              {...touchField}
              value={draft.customerAddress}
              disabled={customerLinked}
              onChange={(e) => patch({ customerAddress: e.currentTarget.value })}
            />
          </Stack>

          <Stack gap="xs">
            <SectionLabel>{t('What are you offering?')}</SectionLabel>
            <Group gap="sm" align="flex-end" wrap={isMobile ? 'wrap' : 'nowrap'}>
              <Select
                label={t('Add a product from your stock')}
                placeholder={t('Search by name or code')}
                size={fieldSize}
                {...touchField}
                searchable
                searchValue={productSearch}
                onSearchChange={setProductSearch}
                selectFirstOptionOnChange
                limit={30}
                nothingFoundMessage={t('No product found')}
                data={productOptions}
                value={null}
                onChange={handleAddProduct}
                // Full row on a phone, so the button wraps below instead of squeezing the search.
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
              <Text size="sm" c="dimmed">
                {t('No items yet. Add a product from your stock, or add your own item.')}
              </Text>
            ) : (
              <Stack gap="xs">
                {draft.lines.map((line, index) => {
                  const fromStock = line.productKey !== undefined;
                  return (
                    <Paper key={line.uid} p="sm" withBorder>
                      <Stack gap="xs">
                        <Group gap="xs" wrap="nowrap" align="flex-end">
                          <TextInput
                            label={`${t('Item')} ${index + 1}`}
                            description={fromStock ? line.sku : undefined}
                            size={fieldSize}
                            {...touchField}
                            value={line.name}
                            disabled={fromStock}
                            onChange={(e) => patchLine(line.uid, { name: e.currentTarget.value })}
                            style={{ flex: 1, minWidth: 0 }}
                          />
                          <ActionIcon
                            variant="light"
                            color="red"
                            size={isMobile ? 44 : 36}
                            aria-label={`${t('Remove item')} ${index + 1}`}
                            onClick={() => removeLine(line.uid)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                          <NumberInput
                            label={t('Quantity')}
                            size={fieldSize}
                            {...touchField}
                            min={1}
                            allowDecimal={false}
                            hideControls={isMobile}
                            value={line.quantity}
                            onChange={(value) =>
                              patchLine(line.uid, {
                                quantity: typeof value === 'number' ? value : 0,
                              })
                            }
                          />
                          <MoneyInput
                            label={t('Price each')}
                            size={fieldSize}
                            {...touchField}
                            hideControls={isMobile}
                            valueCents={line.unitPriceCents}
                            disabled={fromStock}
                            onChangeCents={(cents) =>
                              patchLine(line.uid, { unitPriceCents: cents })
                            }
                          />
                          <MoneyInput
                            label={t('Discount')}
                            size={fieldSize}
                            {...touchField}
                            hideControls={isMobile}
                            valueCents={line.discountCents}
                            onChangeCents={(cents) => patchLine(line.uid, { discountCents: cents })}
                          />
                          <Stack gap={2} justify="flex-end">
                            <Text size="xs" c="dimmed">
                              {t('Item total')}
                            </Text>
                            <Text fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {formatMoney(totals.lineTotals[index])}
                            </Text>
                          </Stack>
                        </SimpleGrid>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Stack gap="xs">
              <SectionLabel>{t('Discount on the whole quotation')}</SectionLabel>
              <Group gap="xs" wrap="nowrap" align="flex-end">
                <Select
                  aria-label={t('Discount type')}
                  size={fieldSize}
                  {...touchField}
                  allowDeselect={false}
                  data={[
                    { value: 'percentage', label: t('Percent (%)') },
                    { value: 'fixed', label: t('Amount') },
                  ]}
                  value={draft.discountType}
                  onChange={(value) =>
                    patch({
                      discountType: value === 'fixed' ? 'fixed' : 'percentage',
                      discountValue: 0,
                    })
                  }
                  style={{ width: 140, flexShrink: 0 }}
                />
                {draft.discountType === 'percentage' ? (
                  <NumberInput
                    aria-label={t('Discount percent')}
                    size={fieldSize}
                    {...touchField}
                    hideControls={isMobile}
                    min={0}
                    max={100}
                    suffix="%"
                    value={draft.discountValue}
                    onChange={(value) =>
                      patch({ discountValue: typeof value === 'number' ? value : 0 })
                    }
                    style={{ flex: 1, minWidth: 0 }}
                  />
                ) : (
                  <MoneyInput
                    aria-label={t('Discount amount')}
                    size={fieldSize}
                    {...touchField}
                    hideControls={isMobile}
                    valueCents={draft.discountValue}
                    onChangeCents={(cents) => patch({ discountValue: cents })}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                )}
              </Group>
            </Stack>

            <Stack gap="xs">
              <SectionLabel>{t('Offer is valid until')}</SectionLabel>
              <TextInput
                aria-label={t('Valid until')}
                type="date"
                size={fieldSize}
                {...touchField}
                min={todayString()}
                value={draft.validUntil}
                onChange={(e) => patch({ validUntil: e.currentTarget.value })}
              />
            </Stack>
          </SimpleGrid>

          <Paper p="sm" withBorder>
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('Subtotal')}
                </Text>
                <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(totals.subtotalCents)}
                </Text>
              </Group>
              {totals.discountCents > 0 && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('Discount')}
                  </Text>
                  <Text size="sm" c="red" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    -{formatMoney(totals.discountCents)}
                  </Text>
                </Group>
              )}
              <Group justify="space-between">
                <Text fw={700}>{t('Quoted total')}</Text>
                <Text fw={800} size="lg" c="blue" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(totals.totalCents)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          <Textarea
            label={t('Notes')}
            description={t('Printed on the quotation. You can leave this empty.')}
            size={fieldSize}
            {...touchField}
            autosize
            minRows={2}
            maxRows={5}
            maxLength={2000}
            value={draft.notes}
            onChange={(e) => patch({ notes: e.currentTarget.value })}
          />
          <Textarea
            label={t('Terms and conditions')}
            description={t('For example: how much to pay first, or how long the work takes.')}
            size={fieldSize}
            {...touchField}
            autosize
            minRows={2}
            maxRows={5}
            maxLength={2000}
            value={draft.terms}
            onChange={(e) => patch({ terms: e.currentTarget.value })}
          />

          {problem !== null && (
            <Text size="sm" c="red" role="alert">
              {problem}
            </Text>
          )}

          <Group justify="flex-end" mt="md" gap="sm">
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
              {t('Create Quotation')}
            </Button>
          </Group>
        </Stack>
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
