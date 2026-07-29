export const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  TECHNICIAN: 'technician',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.CASHIER]: 'Cashier',
  [USER_ROLES.TECHNICIAN]: 'Technician',
};
