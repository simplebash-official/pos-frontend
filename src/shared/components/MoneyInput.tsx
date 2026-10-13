import { NumberInput, NumberInputProps } from '@mantine/core';
import { CURRENCY } from '@/constants';
import { fromCents, toCents } from '@/shared/lib/money';

export interface MoneyInputProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  allowEmpty?: boolean;
}

export const MoneyInput = ({
  valueCents,
  onChangeCents,
  prefix = `${CURRENCY.symbol} `,
  allowEmpty = false,
  placeholder,
  ...props
}: MoneyInputProps) => {
  const displayValue = allowEmpty && valueCents === 0 ? '' : fromCents(valueCents);
  const resolvedPlaceholder = placeholder ?? (allowEmpty ? `${prefix}0.00` : undefined);

  const handleChange = (val: number | string) => {
    if (typeof val === 'number') {
      onChangeCents(toCents(val));
    } else if (val === '' || isNaN(Number(val))) {
      onChangeCents(0);
    } else {
      onChangeCents(toCents(parseFloat(val)));
    }
  };

  return (
    <NumberInput
      {...props}
      value={displayValue}
      placeholder={resolvedPlaceholder}
      onChange={handleChange}
      prefix={prefix}
      decimalScale={CURRENCY.decimals}
      fixedDecimalScale={displayValue !== ''}
      min={0}
      step={1}
    />
  );
};
