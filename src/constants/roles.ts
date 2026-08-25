export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.STAFF]: 'Staff',
};
