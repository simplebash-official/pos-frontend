import { TextInput } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { isShopCodeRequired } from '../lib/shopCode';

interface ShopCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

/** The multi-tenant login's shop code input. Renders nothing when a shop code is not needed. */
export const ShopCodeField = ({ value, onChange, error, className, size }: ShopCodeFieldProps) => {
  if (!isShopCodeRequired()) return null;
  return (
    <TextInput
      label={t('Shop code')}
      description={t('The short code for your business, e.g. test-shop')}
      placeholder="your-shop"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      error={error ? t(error) : undefined}
      className={className}
      size={size}
      required
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoComplete="organization"
      data-log-id="login-shop-code"
    />
  );
};
