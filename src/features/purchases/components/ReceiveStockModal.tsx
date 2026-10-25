import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBuildingStore, IconPlus, IconX } from '@tabler/icons-react';
import { getDeviceId } from '@/api/deviceId';
import type { ApiError } from '@/shared/types/common';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SupplierPickerModal } from '@/features/suppliers/components/SupplierPickerModal';
import { ProductPickerModal } from '@/features/inventory/components/ProductPickerModal';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useCashCategories } from '@/features/billing/hooks/useCashLookups';
import type { CashCategory } from '@/features/billing/types';
import { useCurrentSession } from '@/features/billing/hooks/useRegisterSession';
import { useCreateReceipt } from '../hooks/usePurchases';
import {
  emptyForm,
  emptyLine,
  leftOwedCents,
  payingNowCents,
  receiptTotalCents,
  toReceiptInput,
  validateReceipt,
  withSerialSlots,
  type LineState,
  type PaymentState,
  type ReceiptFormContext,
  type ReceiptFormState,
} from '../lib/receiptForm';
import { ReceiptLineCard } from './ReceiptLineCard';
import { ReceiptPaymentSection } from './ReceiptPaymentSection';

interface ReceiveStockModalProps {
  opened: boolean;
  onClose: () => void;
  initialProductKey?: string;
  initialSupplierKey?: string;
}

/** What went wrong that the person can act on, from the server's answer. */
type ServerProblem =
  | { kind: 'duplicate'; message: string; receiptNumber: string; date: string }
  | { kind: 'approval'; message: string }
  | { kind: 'other'; message: string };

const APPROVAL_CODES = new Set(['DRAWER_CASH_EXCEEDED', 'PIN_NOT_SET', 'INVALID_PIN']);

const today = () => formatDate(new Date(), 'YYYY-MM-DD');

const COD_CATEGORY_NAME = 'Stock purchase (cash on delivery)';
const NO_CATEGORIES: CashCategory[] = [];

const problemFrom = (error: ApiError): ServerProblem => {
  if (error.code === 'DUPLICATE_RECEIPT' && error.details) {
    return {
      kind: 'duplicate',
      message: error.message,
      receiptNumber: String(error.details.receiptNumber),
      date: String(error.details.date),
    };
  }
  if (error.code && APPROVAL_CODES.has(error.code)) {
    return { kind: 'approval', message: error.message };
  }
  return { kind: 'other', message: error.message };
};

/** Receive the stock of one supplier invoice: the products that arrived, and how they are paid for. */
export const ReceiveStockModal = ({
  opened,
  onClose,
  initialProductKey,
  initialSupplierKey,
}: ReceiveStockModalProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const freshForm = (): ReceiptFormState =>
    emptyForm(today(), initialSupplierKey ?? null, initialProductKey ?? null);

  const [form, setForm] = useState<ReceiptFormState>(freshForm);
  const [wasOpened, setWasOpened] = useState(opened);
  const [clientProblem, setClientProblem] = useState<string | null>(null);
  const [serverProblem, setServerProblem] = useState<ServerProblem | null>(null);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState<number | null>(null);

  // A window that opens again starts from a clean form.
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) {
      setForm(freshForm());
      setClientProblem(null);
      setServerProblem(null);
      setApprovalRequired(false);
    }
  }

  const { data: products } = useAllProducts({ enabled: opened });
  const { data: suppliers } = useAllSuppliers({ enabled: opened });
  const categoriesQuery = useCashCategories({ movementType: 'supplier_payment' }, opened);
  const categories = categoriesQuery.data === undefined ? NO_CATEGORIES : categoriesQuery.data;
  const terminalId = getDeviceId();
  const { session } = useCurrentSession(terminalId);
  const { mutate: createReceipt, isPending } = useCreateReceipt();

  const productByKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);
  const supplier = suppliers.find((s) => s.key === form.supplierKey);
  const serializedProductKeys = useMemo(
    () => new Set(products.filter((p) => p.isSerialized).map((p) => p.key)),
    [products]
  );
  const context: ReceiptFormContext = {
    serializedProductKeys,
    terminalId,
    sessionKey: session === null ? null : session.key,
  };

  const total = receiptTotalCents(form);
  const payingNow = payingNowCents(form);
  const leftOwed = leftOwedCents(form);

  const changeLine = (line: LineState) => {
    const product = line.productKey === null ? undefined : productByKey.get(line.productKey);
    const next = withSerialSlots(line, product !== undefined && product.isSerialized);
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((existing) => (existing.id === next.id ? next : existing)),
    }));
  };

  const changePayment = (payment: PaymentState) => {
    // The cash-on-delivery category is offered first the moment money is being paid.
    const cod = categories.find((c) => c.name === COD_CATEGORY_NAME);
    const next =
      payment.mode !== 'credit' && payment.categoryKey === null && cod !== undefined
        ? { ...payment, categoryKey: cod.key }
        : payment;
    setForm((prev) => ({ ...prev, payment: next }));
  };

  const submit = (confirmDuplicate: boolean) => {
    const toSend: ReceiptFormState = { ...form, confirmDuplicate };
    const problem = validateReceipt(toSend, context);
    setClientProblem(problem);
    setServerProblem(null);
    if (problem !== null) return;
    createReceipt(toReceiptInput(toSend, context), {
      onSuccess: (receipt) => {
        notifications.show({
          title: t('Stock received'),
          message:
            receipt.dueCents > 0
              ? `${receipt.receiptNumber}. ${t('Still owed to the supplier:')} ${formatMoney(receipt.dueCents)}`
              : `${receipt.receiptNumber}. ${t('Paid in full.')}`,
          color: 'teal',
        });
        onClose();
      },
      onError: (error) => {
        const problemFromServer = problemFrom(error as unknown as ApiError);
        if (problemFromServer.kind === 'approval') setApprovalRequired(true);
        setServerProblem(problemFromServer);
      },
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit(false);
  };

  const usedProductKeys = form.lines
    .filter((line) => line.id !== pickingFor)
    .map((line) => line.productKey)
    .filter((key): key is string => key !== null);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Text fw={700} size="lg">
            {t('Receive Stock')}
          </Text>
        }
        size="lg"
        centered
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            <Stack gap={4}>
              <Text size="sm" fw={500}>
                {t('Who did you buy this from?')}
              </Text>
              {supplier ? (
                <Group
                  justify="space-between"
                  p="xs"
                  wrap="nowrap"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--mantine-radius-default)',
                  }}
                >
                  <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                    <IconBuildingStore size={16} style={{ flexShrink: 0 }} />
                    <Text size="sm" lineClamp={1}>
                      {supplier.name}
                    </Text>
                  </Group>
                  {initialSupplierKey === undefined ? (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size={isMobile ? 44 : 32}
                      aria-label={t('Change supplier')}
                      onClick={() => setForm((prev) => ({ ...prev, supplierKey: null }))}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  ) : null}
                </Group>
              ) : (
                <Button
                  variant="light"
                  leftSection={<IconBuildingStore size={16} />}
                  onClick={() => setSupplierPickerOpen(true)}
                  size={fieldSize}
                >
                  {t('Select Supplier')}
                </Button>
              )}
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label={t("Supplier's invoice number")}
                description={t('Optional. Helps you find this bill later.')}
                placeholder={t('INV-1234')}
                value={form.referenceNo}
                onChange={(event) => {
                  const referenceNo = event.currentTarget.value;
                  setForm((prev) => ({ ...prev, referenceNo, confirmDuplicate: false }));
                }}
                size={fieldSize}
              />
              <TextInput
                type="date"
                label={t('Day received')}
                description={t('The day the stock arrived.')}
                value={form.date}
                onChange={(event) => {
                  const date = event.currentTarget.value;
                  setForm((prev) => ({ ...prev, date }));
                }}
                size={fieldSize}
              />
            </SimpleGrid>

            <Stack gap="sm">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: '0.05em' }}
              >
                {t('What arrived')}
              </Text>
              <Text size="xs" c="dimmed">
                {t(
                  'Add each product that came on this bill separately with "Add another product".'
                )}
              </Text>
              {form.lines.map((line, index) => (
                <ReceiptLineCard
                  key={line.id}
                  position={index + 1}
                  line={line}
                  product={
                    line.productKey === null ? null : (productByKey.get(line.productKey) ?? null)
                  }
                  onChange={changeLine}
                  onPickProduct={() => setPickingFor(line.id)}
                  onRemove={
                    form.lines.length > 1
                      ? () =>
                          setForm((prev) => ({
                            ...prev,
                            lines: prev.lines.filter((existing) => existing.id !== line.id),
                          }))
                      : null
                  }
                  isMobile={isMobile}
                />
              ))}
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine(null)] }))
                }
                size={fieldSize}
              >
                {t('Add another product')}
              </Button>
            </Stack>

            <TextInput
              label={t('Notes')}
              description={t('Optional.')}
              value={form.notes}
              onChange={(event) => {
                const notes = event.currentTarget.value;
                setForm((prev) => ({ ...prev, notes }));
              }}
              size={fieldSize}
            />

            <ReceiptPaymentSection
              payment={form.payment}
              onChange={changePayment}
              categories={categories}
              shiftOpen={session !== null}
              approvalRequired={approvalRequired}
              isMobile={isMobile}
            />

            <Paper p="md" bg="var(--bg-app)" aria-live="polite">
              <SimpleGrid cols={3} spacing="xs">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    {t('Bill total')}
                  </Text>
                  <Text fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(total)}
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    {t('Paying now')}
                  </Text>
                  <Text fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(payingNow)}
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    {t('Left to pay later')}
                  </Text>
                  <Text
                    fw={700}
                    c={leftOwed > 0 ? 'orange' : 'green'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatMoney(leftOwed)}
                  </Text>
                </Stack>
              </SimpleGrid>
            </Paper>

            {clientProblem !== null ? (
              <Alert color="red" role="alert">
                {clientProblem}
              </Alert>
            ) : null}
            {serverProblem !== null && serverProblem.kind === 'duplicate' ? (
              <Alert color="orange" title={t('This bill may already be recorded')} role="alert">
                <Stack gap="xs">
                  <Text size="sm">
                    {`${t('You already recorded a bill with this invoice number:')} ${serverProblem.receiptNumber} (${formatDate(serverProblem.date)}).`}
                  </Text>
                  <Group gap="sm">
                    <Button size="xs" variant="default" onClick={() => setServerProblem(null)}>
                      {t('Change the invoice number')}
                    </Button>
                    <Button
                      size="xs"
                      color="orange"
                      loading={isPending}
                      onClick={() => submit(true)}
                    >
                      {t('This is a different bill. Record it.')}
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            ) : null}
            {serverProblem !== null && serverProblem.kind !== 'duplicate' ? (
              <Alert color={serverProblem.kind === 'approval' ? 'orange' : 'red'} role="alert">
                {serverProblem.message}
              </Alert>
            ) : null}

            <Group justify="flex-end" mt="md" gap="sm">
              <Button variant="default" onClick={onClose} disabled={isPending}>
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                color="blue"
                loading={isPending}
                data-log-id="purchases.receive-stock"
              >
                {form.payment.mode === 'credit' ? t('Receive Stock') : t('Receive and pay')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ProductPickerModal
        opened={pickingFor !== null}
        onClose={() => setPickingFor(null)}
        onSelect={(productKey) => {
          const line = form.lines.find((existing) => existing.id === pickingFor);
          setPickingFor(null);
          if (line) changeLine({ ...line, productKey });
        }}
        excludeKeys={usedProductKeys}
      />

      <SupplierPickerModal
        opened={supplierPickerOpen}
        onClose={() => setSupplierPickerOpen(false)}
        onSelect={(key) => {
          setForm((prev) => ({ ...prev, supplierKey: key }));
          setSupplierPickerOpen(false);
        }}
        excludeKeys={[]}
      />
    </>
  );
};
