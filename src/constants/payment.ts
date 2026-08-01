export const CURRENCY = {
  symbol: 'Rs.',
  code: 'LKR',
  decimals: 0,
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  SPLIT: 'split',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
