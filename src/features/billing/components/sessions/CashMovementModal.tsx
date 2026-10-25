import React, { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  PasswordInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowBackUp,
  IconCash,
  IconCheck,
  IconLock,
  IconPrinter,
} from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { AnimatedNumber, FadeIn, useMotionPresets } from '@/shared/motion';
import { useCashCategories, useCashSettings, usePeriodStatus } from '../../hooks/useCashLookups';
import {
  useCreateCashMovement,
  useDrawerState,
  useReverseCashMovement,
  useSessionDetail,
  useVerifyPin,
} from '../../hooks/useRegisterSession';
import { useUndoWindow } from '../../hooks/useUndoWindow';
import type { CashMovement, CashMovementType } from '../../types';
import { CategoryPicker } from './movement/CategoryPicker';
import { MovementDetailFields } from './movement/MovementDetailFields';
import { MovementStep } from './movement/MovementStep';
import { MovementGroupTabs, MovementKindCards } from './movement/MovementTypePicker';
import { ShortcutPills, type ShortcutPill } from './movement/ShortcutPills';
import {
  drawerDelta,
  emptyForm,
  isOverDrawer,
  needsPin,
  switchType,
  toInput,
  validateForm,
  type MovementFormState,
} from './movement/movementForm';
import {
  ALWAYS_PIN_TYPES,
  CASHIER_CATEGORY_TYPES,
  MANAGED_TYPES,
  MOVEMENT_GROUPS,
  MOVEMENT_TYPES_IN_ORDER,
  getCategoryLabel,
  getGroupOf,
  getTypeLabel,
} from './movement/movementTypes';
import { printCashMovementVoucher } from './sessionPrint';

/** Starting values for a payment the person is about to make, e.g. a regular bill that is due. */
export interface CashMovementPrefill {
  movementType: CashMovementType;
  categoryKey: string;
  payeeKey?: string;
  amountCents: number;
  /** `YYYY-MM`, the month it covers. */
  period?: string;
}

export interface CashMovementModalProps {
  opened: boolean;
  onClose: () => void;
  terminalId: string;
  sessionKey?: string;
  /** Opens the window with these values filled in; they can all still be changed. */
  prefill?: CashMovementPrefill;
  onMovementCreated?: (movement: CashMovement) => void;
}

/** A block that fades and rises in, and fades out, when it appears or goes (opacity and transform only). */
const Reveal = ({ children }: { children: React.ReactNode }) => {
  const { fadeUp, transition } = useMotionPresets();
  return (
    <motion.div
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

const AMOUNT_FIELD_ID = 'cash-movement-amount';

const START_TYPE: CashMovementType = 'petty_expense';

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  opened,
  onClose,
  terminalId,
  sessionKey,
  prefill,
  onMovementCreated,
}) => {
  const isMobile = useIsMobile();
  const { data: cashSettings } = useCashSettings(opened);
  const createMovement = useCreateCashMovement();
  const reverseMovement = useReverseCashMovement();
  const verifyPin = useVerifyPin();

  const canRecordManaged = useHasPermission(PERMISSIONS.CASH_MOVEMENTS_CREATE_MANAGED);
  const canManageCategories = useHasPermission(PERMISSIONS.CASH_CATEGORIES_MANAGE);
  const canCreateCategories = useHasPermission(PERMISSIONS.CASH_CATEGORIES_CREATE);
  const canManagePayees = useHasPermission(PERMISSIONS.PAYEES_MANAGE);

  const [form, setForm] = useState<MovementFormState>(() =>
    prefill === undefined
      ? emptyForm(START_TYPE)
      : {
          ...emptyForm(prefill.movementType),
          categoryKey: prefill.categoryKey,
          payeeKey: prefill.payeeKey ?? null,
          amountCents: prefill.amountCents,
          period: prefill.period ?? null,
        }
  );
  // Set once the PIN is checked; `name` is what the server reports, if anything.
  const [verifiedApprover, setVerifiedApprover] = useState<{ name: string | undefined } | null>(
    null
  );
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<CashMovement | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useCashCategories(
    { movementType: form.type },
    opened
  );
  const category = categories.find((c) => c.key === form.categoryKey);
  // The cash the drawer holds right now, from the server: the shift's expected cash, or the drawer's
  // own balance between shifts. Unknown until it loads, and then nothing is blocked or previewed here
  // (the server checks it again either way).
  const { session: shift } = useSessionDetail(sessionKey);
  const { drawerState } = useDrawerState(sessionKey === undefined ? terminalId : undefined);
  const cashInDrawer =
    sessionKey === undefined ? drawerState?.currentBalanceCents : shift?.expectedCashCents;
  const overDrawer = isOverDrawer(form.type, form.amountCents, cashInDrawer);
  const cashAfter =
    cashInDrawer === undefined
      ? undefined
      : cashInDrawer + drawerDelta(form.type, form.amountCents);
  const isRent = form.type === 'rent_and_bills';
  const periodStatus = usePeriodStatus(
    isRent ? form.categoryKey : null,
    form.payeeKey,
    isRent ? form.period : null
  ).data;
  const periodAlreadyPaid = isRent && periodStatus?.alreadyPaid === true;
  const pinRequired = needsPin(form.type, category, form.amountCents, overDrawer);
  const canUndo = useUndoWindow(completed?.undoUntil);
  const isNoSale = form.type === 'no_sale';
  const groupIndex = MOVEMENT_GROUPS.findIndex((g) => g.id === getGroupOf(form.type));
  // The screen under the tabs slides the way the tabs moved; adjusted while rendering so the
  // direction is right on the very first frame.
  const [previousGroupIndex, setPreviousGroupIndex] = useState(groupIndex);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  if (groupIndex !== previousGroupIndex) {
    setSlideDirection(groupIndex > previousGroupIndex ? 1 : -1);
    setPreviousGroupIndex(groupIndex);
  }
  const { reduced: reducedMotion } = useMotionPresets();

  const canUseType = (type: CashMovementType) => !MANAGED_TYPES.has(type) || canRecordManaged;
  const canCreateCategory =
    canManageCategories || (canCreateCategories && CASHIER_CATEGORY_TYPES.has(form.type));

  const patch = (changes: Partial<MovementFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setSubmitError(null);
  };

  const changeType = (type: CashMovementType) => {
    if (type === form.type || !canUseType(type)) return;
    setForm((current) => switchType(current, type));
    setVerifiedApprover(null);
    setPinError(null);
    setSubmitError(null);
  };

  // Number keys pick a kind of payment on a computer; ignored while typing in a field.
  useAppShortcuts(
    MOVEMENT_TYPES_IN_ORDER.map((type, index) => ({
      key: String(index + 1),
      handler: () => changeType(type),
    })),
    opened && !completed && !isMobile
  );

  const focusAmount = () => {
    if (!isMobile) window.setTimeout(() => document.getElementById(AMOUNT_FIELD_ID)?.focus(), 0);
  };

  const handleVerifyPin = async () => {
    if (!form.managerPin.trim()) {
      setPinError(t('Please enter a PIN'));
      return;
    }
    try {
      const res = await verifyPin.mutateAsync({ pin: form.managerPin, requiredRole: 'manager' });
      if (res.valid) {
        setVerifiedApprover({ name: res.userName });
        setPinError(null);
      } else {
        setPinError(t('A manager or owner PIN is needed.'));
        setVerifiedApprover(null);
      }
    } catch {
      setPinError(t('That PIN did not work, or it does not belong to a manager or owner.'));
      setVerifiedApprover(null);
    }
  };

  const handleClose = () => {
    setForm(emptyForm(START_TYPE));
    setVerifiedApprover(null);
    setPinError(null);
    setSubmitError(null);
    setCompleted(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateForm(form, category, {
      pinVerified: verifiedApprover !== null,
      overDrawer,
      periodAlreadyPaid,
    });
    if (problem) {
      setSubmitError(problem);
      return;
    }
    try {
      const movement = await createMovement.mutateAsync(
        toInput(form, { terminalId, sessionKey }, pinRequired, overDrawer)
      );
      // The server saves a name typed on a small expense or cash received for next time.
      const typedName = form.payeeName.trim();
      const nameSaved =
        (form.type === 'petty_expense' || form.type === 'add_cash') &&
        form.payeeKey === null &&
        typedName !== '';
      notifications.show({
        title: t('Cash movement recorded'),
        message: nameSaved
          ? `${movement.movementNumber} ${t('was saved.')} "${typedName}" ${t('is in your list for next time.')}`
          : `${movement.movementNumber} ${t('was saved.')}`,
        color: 'teal',
      });
      setCompleted(movement);
      onMovementCreated?.(movement);
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, t('The cash movement could not be saved. Please try again.'))
      );
    }
  };

  const handleUndo = async () => {
    if (completed === null) return;
    try {
      await reverseMovement.mutateAsync({ key: completed.key, input: {} });
      notifications.show({
        title: t('Entry undone'),
        message: completed.movementNumber,
        color: 'teal',
      });
      handleClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err, t('The entry could not be undone. Please try again.')));
    }
  };

  const dropExcessCents =
    form.type === 'cash_drop' &&
    cashSettings?.floatTargetCents !== undefined &&
    cashInDrawer !== undefined &&
    cashInDrawer > cashSettings.floatTargetCents
      ? cashInDrawer - cashSettings.floatTargetCents
      : undefined;
  const pills: ShortcutPill[] = [
    ...(cashSettings?.quickAmountsCents ?? []).map((cents) => ({
      key: String(cents),
      label: formatMoney(cents),
      onSelect: () => patch({ amountCents: cents }),
    })),
    ...(dropExcessCents === undefined
      ? []
      : [
          {
            key: 'drop-excess',
            label: `${t('Drop excess')} (${formatMoney(dropExcessCents)})`,
            onSelect: () => patch({ amountCents: dropExcessCents }),
            dataLogId: 'cash.drop-excess',
          },
        ]),
  ];
  const amountStep = isNoSale ? 0 : 2;

  const pinReason = useMemo(() => {
    if (overDrawer) {
      return t(
        'This is more than the cash in the drawer, so a manager or owner must enter their PIN and say why.'
      );
    }
    if (form.type === 'owner_withdrawal')
      return t('Owner withdrawals need a manager or owner PIN.');
    if (ALWAYS_PIN_TYPES.has(form.type)) return t('Staff payments need a manager or owner PIN.');
    return t(
      'This amount is above the limit for this category, so a manager or owner PIN is needed.'
    );
  }, [form.type, overDrawer]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {t('Cash Movement')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {completed ? (
        <Stack gap="md">
          <FadeIn>
            <Alert color="teal" variant="light" icon={<IconCheck size={20} />} title={t('Saved')}>
              {t('The cash movement is recorded and the drawer has been updated.')}
            </Alert>
          </FadeIn>

          <FadeIn index={1}>
            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    {t('Voucher number')}
                  </Text>
                  <Text fw={700} ff="monospace">
                    {completed.movementNumber}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{getTypeLabel(completed.movementType)}</Text>
                  {completed.movementType !== 'no_sale' && (
                    <Text size="lg" fw={700}>
                      {formatMoney(completed.amountCents)}
                    </Text>
                  )}
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('For')}</Text>
                  <Text size="sm" fw={500}>
                    {completed.customLabel
                      ? `${completed.categoryName}: ${completed.customLabel}`
                      : completed.categoryName}
                  </Text>
                </Group>
                {completed.payeeName && (
                  <Group justify="space-between">
                    <Text size="sm">{t('Name')}</Text>
                    <Text size="sm" fw={500}>
                      {completed.payeeName}
                    </Text>
                  </Group>
                )}
                <Group justify="space-between">
                  <Text size="sm">{t('Recorded by')}</Text>
                  <Text size="sm">{completed.recordedByNameSnapshot}</Text>
                </Group>
                {completed.approvedByNameSnapshot && (
                  <Group justify="space-between">
                    <Text size="sm">{t('Approved by')}</Text>
                    <Text size="sm" fw={500}>
                      {completed.approvedByNameSnapshot}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>
          </FadeIn>

          <Group justify="space-between" mt="md" gap="sm">
            <Group gap="sm">
              <Button
                variant="default"
                leftSection={<IconPrinter size={18} />}
                onClick={() => printCashMovementVoucher(completed)}
              >
                {t('Print voucher')}
              </Button>
              {canUndo && (
                <Button
                  variant="default"
                  color="red"
                  leftSection={<IconArrowBackUp size={18} />}
                  loading={reverseMovement.isPending}
                  onClick={handleUndo}
                  data-log-id="cash-movement.undo"
                >
                  {t('Undo this entry')}
                </Button>
              )}
            </Group>
            <Button onClick={handleClose}>{t('Done')}</Button>
          </Group>

          {submitError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={t('Please check')}
            >
              {submitError}
            </Alert>
          )}
        </Stack>
      ) : (
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Stack gap="lg">
            <MovementStep number={1} title={t('What happened?')} required={false}>
              <MovementGroupTabs value={form.type} onChange={changeType} canUse={canUseType} />
            </MovementStep>

            {/* Everything under the tabs is one screen that slides left or right with the tabs. */}
            <div style={{ overflowX: 'clip' }}>
              <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                <motion.div
                  key={groupIndex}
                  custom={slideDirection}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, x: reducedMotion ? 0 : dir * 28 }),
                    center: { opacity: 1, x: 0 },
                    exit: (dir: number) => ({ opacity: 0, x: reducedMotion ? 0 : dir * -28 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Stack gap="lg">
                    <MovementKindCards
                      value={form.type}
                      onChange={changeType}
                      canUse={canUseType}
                    />

                    {!isNoSale && (
                      <MovementStep number={amountStep} title={t('How much?')} required>
                        <MoneyInput
                          id={AMOUNT_FIELD_ID}
                          aria-label={t('Amount')}
                          valueCents={form.amountCents}
                          onChangeCents={(cents) => patch({ amountCents: cents })}
                          size="md"
                          autoFocus={!isMobile}
                        />
                        {pills.length > 0 && (
                          <ShortcutPills
                            caption={t('Quick amounts')}
                            pills={pills}
                            tall={isMobile}
                          />
                        )}
                        {cashInDrawer !== undefined && (
                          <Group gap={6} wrap="nowrap">
                            <IconCash size={16} color="var(--text-muted)" aria-hidden />
                            <Text
                              size="sm"
                              c={cashAfter !== undefined && cashAfter < 0 ? 'red' : 'dimmed'}
                              data-testid="drawer-preview"
                            >
                              {form.amountCents > 0 &&
                              drawerDelta(form.type, form.amountCents) !== 0 ? (
                                <>
                                  {`${t('In the drawer')}: `}
                                  <AnimatedNumber value={cashInDrawer} format={formatMoney} />
                                  {' → '}
                                  <AnimatedNumber
                                    value={cashAfter as number}
                                    format={formatMoney}
                                  />
                                </>
                              ) : (
                                <>
                                  {`${t('In the drawer now')}: `}
                                  <AnimatedNumber value={cashInDrawer} format={formatMoney} />
                                </>
                              )}
                            </Text>
                          </Group>
                        )}
                        <AnimatePresence initial={false}>
                          {overDrawer && (
                            <Reveal key="over-drawer">
                              <Alert
                                icon={<IconAlertTriangle size={16} />}
                                color="orange"
                                variant="light"
                                title={t('More than the drawer holds')}
                              >
                                {t(
                                  'The drawer does not have this much cash. A manager or owner can still allow it.'
                                )}
                              </Alert>
                            </Reveal>
                          )}
                        </AnimatePresence>
                      </MovementStep>
                    )}

                    {/* Re-keyed by kind so the part that differs from kind to kind fades in as one piece. */}
                    <FadeIn key={form.type}>
                      <Stack gap="lg" style={{ minHeight: isMobile ? undefined : 320 }}>
                        <MovementStep
                          number={amountStep + 1}
                          title={getCategoryLabel(form.type)}
                          required
                        >
                          <CategoryPicker
                            key={form.type}
                            movementType={form.type}
                            categories={categories}
                            loading={categoriesLoading}
                            value={{ categoryKey: form.categoryKey, customLabel: form.customLabel }}
                            onChange={(choice) => patch(choice)}
                            canCreate={canCreateCategory}
                            onCreated={focusAmount}
                          />
                        </MovementStep>

                        <MovementStep number={amountStep + 2} title={t('Details')} required={false}>
                          <MovementDetailFields
                            form={form}
                            onChange={patch}
                            periodStatus={isRent ? periodStatus : undefined}
                            canCreatePayee={canManagePayees}
                          />
                        </MovementStep>
                      </Stack>
                    </FadeIn>
                  </Stack>
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {pinRequired && (
                <Reveal key="pin">
                  <Alert
                    icon={<IconLock size={18} />}
                    color="blue"
                    variant="light"
                    title={t('Manager or owner approval needed')}
                  >
                    <Stack gap="xs" mt="xs">
                      <Text size="xs">{pinReason}</Text>
                      {overDrawer && (
                        <TextInput
                          label={t('Why is this payout bigger than the drawer holds?')}
                          value={form.overrideReason}
                          onChange={(e) => patch({ overrideReason: e.currentTarget.value })}
                          maxLength={200}
                          required
                        />
                      )}
                      <Group align="flex-end" gap="xs" wrap="nowrap">
                        <PasswordInput
                          label={t('PIN')}
                          placeholder={t('Enter PIN')}
                          value={form.managerPin}
                          onChange={(e) => {
                            patch({ managerPin: e.currentTarget.value });
                            setPinError(null);
                            setVerifiedApprover(null);
                          }}
                          error={pinError}
                          style={{ flex: 1 }}
                        />
                        <Button
                          variant="light"
                          onClick={handleVerifyPin}
                          loading={verifyPin.isPending}
                          type="button"
                          disabled={!form.managerPin.trim()}
                          h={isMobile ? 44 : undefined}
                        >
                          {t('Check PIN')}
                        </Button>
                      </Group>
                      {verifiedApprover && (
                        <Badge color="green" variant="light" leftSection={<IconCheck size={14} />}>
                          {verifiedApprover.name
                            ? `${t('Approved by')} ${verifiedApprover.name}`
                            : t('PIN accepted')}
                        </Badge>
                      )}
                    </Stack>
                  </Alert>
                </Reveal>
              )}

              {submitError && (
                <Reveal key="error">
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                    title={t('Please check')}
                  >
                    {submitError}
                  </Alert>
                </Reveal>
              )}
            </AnimatePresence>

            <Group
              justify="flex-end"
              gap="sm"
              py="sm"
              style={{
                position: 'sticky',
                bottom: 0,
                marginBottom: 'calc(var(--mantine-spacing-md) * -1)',
                background: 'var(--mantine-color-body)',
                borderTop: '1px solid var(--border)',
                zIndex: 2,
              }}
            >
              <Button
                variant="default"
                onClick={handleClose}
                type="button"
                h={isMobile ? 44 : undefined}
              >
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                color="blue"
                loading={createMovement.isPending}
                h={isMobile ? 44 : undefined}
              >
                {isNoSale ? t('Open drawer') : t('Record')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
