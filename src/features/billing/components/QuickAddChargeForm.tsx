import { useEffect, useState } from 'react';
import { Box, Button, Grid, Group, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { CURRENCY } from '@/constants';
import {
  buildChargeLine,
  chargeTotalCents,
  validateCharge,
  type ChargeDraft,
  type ChargeErrors,
  type ChargeLine,
} from '../lib/quickAddCharge';

/** Whole-number or two-decimal amount, or the empty string while the box is empty. */
const asAmount = (value: number | string): number | '' => (typeof value === 'number' ? value : '');

export interface QuickAddChargeFormProps {
  /** The name and price already typed in the other mode, so switching loses nothing. */
  initialName: string;
  initialPrice: number | '';
  /** Keeps the shared name and price in step while typing. */
  onBasics: (basics: { name: string; price: number | '' }) => void;
  onClose: () => void;
  /** Called with the validated charge, to put it in the cart. */
  onAdd: (charge: ChargeLine) => void;
  isMobile: boolean;
}

export const QuickAddChargeForm = ({
  initialName,
  initialPrice,
  onBasics,
  onClose,
  onAdd,
  isMobile,
}: QuickAddChargeFormProps) => {
  const [draft, setDraft] = useState<ChargeDraft>({
    name: initialName,
    unitPrice: initialPrice,
    quantity: 1,
  });
  const [errors, setErrors] = useState<ChargeErrors>({});

  useEffect(() => {
    onBasics({ name: draft.name, price: draft.unitPrice });
  }, [draft.name, draft.unitPrice, onBasics]);

  const patch = (changes: Partial<ChargeDraft>, cleared: (keyof ChargeDraft)[]) => {
    setDraft((prev) => ({ ...prev, ...changes }));
    setErrors((prev) => {
      const next = { ...prev };
      cleared.forEach((field) => delete next[field]);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateCharge(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onAdd(buildChargeLine(draft));
  };

  const total = chargeTotalCents(draft);
  const nameIsEmpty = draft.name.trim() === '';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="lg">
        <Stack gap="sm">
          <TextInput
            label={t('What is the charge for?')}
            placeholder={t('For example: Delivery, Setup, Cable fitting')}
            value={draft.name}
            onChange={(e) => patch({ name: e.currentTarget.value }, ['name'])}
            error={errors.name}
            required
            data-autofocus={!isMobile && nameIsEmpty ? true : undefined}
          />
          <Grid gap="xs" align="flex-start">
            <Grid.Col span={{ base: 7, sm: 8 }}>
              <NumberInput
                label={t('Price each')}
                placeholder="0.00"
                min={0.01}
                decimalScale={2}
                value={draft.unitPrice}
                onChange={(value) => patch({ unitPrice: asAmount(value) }, ['unitPrice'])}
                error={errors.unitPrice}
                inputMode="decimal"
                leftSection={
                  <Text size="xs" fw={700} c="dimmed">
                    {CURRENCY.symbol}
                  </Text>
                }
                required
                data-autofocus={!isMobile && !nameIsEmpty ? true : undefined}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 5, sm: 4 }}>
              <NumberInput
                label={t('How many?')}
                min={1}
                allowDecimal={false}
                value={draft.quantity}
                onChange={(value) => patch({ quantity: asAmount(value) }, ['quantity'])}
                error={errors.quantity}
                inputMode="numeric"
                required
              />
            </Grid.Col>
          </Grid>
          <Box aria-live="polite" mih={44}>
            {total !== null && (
              <Group justify="space-between" align="baseline" data-testid="quick-add-charge-total">
                <Text size="sm" c="dimmed">
                  {t('Charge total')}
                </Text>
                <Text size="xl" fw={700} style={{ fontFamily: 'monospace' }}>
                  {formatMoney(total)}
                </Text>
              </Group>
            )}
          </Box>
          <Text size="xs" c="dimmed">
            {t(
              'The whole amount counts as income. If you paid someone for this, record it under Expenses.'
            )}
          </Text>
        </Stack>

        <Group
          justify="flex-end"
          gap="sm"
          style={
            isMobile
              ? {
                  position: 'sticky',
                  bottom: 0,
                  background: 'var(--mantine-color-body)',
                  paddingBlock: 'var(--mantine-spacing-sm)',
                  borderTop: '1px solid var(--border)',
                }
              : undefined
          }
        >
          <Button variant="default" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            color="blue"
            data-log-id="billing.quick-add-charge-save"
            size={isMobile ? 'md' : 'sm'}
          >
            {t('Add to cart')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
