import { NumberInput, Stack, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { lineMoneyProps } from './lineMoney';

export interface CostToShopFieldProps {
  /** "Cost to shop", or "Cost to shop, each" on a line that has a quantity. */
  label: string;
  /** The line the box belongs to, read out after the label. */
  lineName: string;
  value: number | string;
  onChange: (value: number | string) => void;
  /** What the empty box says: that the cost may be left out, or that one is expected. */
  placeholder: string;
  invalid: boolean;
  disabled: boolean;
  /** The line's profit from the shared calculation; `null` while there is none to show. */
  profitCents: number | null;
}

/**
 * What one line of a job cost the shop, with the profit it leaves. Staff only: it is never
 * printed for the customer.
 */
export const CostToShopField = ({
  label,
  lineName,
  value,
  onChange,
  placeholder,
  invalid,
  disabled,
  profitCents,
}: CostToShopFieldProps) => {
  const isMobile = useIsMobile();

  return (
    <Stack gap={4}>
      <NumberInput
        {...lineMoneyProps(isMobile)}
        label={label}
        aria-label={`${label}: ${lineName}`}
        placeholder={placeholder}
        value={value}
        error={invalid}
        onChange={onChange}
        disabled={disabled}
      />
      {profitCents !== null && (
        <Text size="xs" fw={700} c={profitCents >= 0 ? 'teal' : 'red'}>
          {`${t('Profit')} ${formatMoney(profitCents)}`}
        </Text>
      )}
    </Stack>
  );
};
