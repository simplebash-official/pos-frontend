import { useAppSelector } from '@/store/hooks';
import { selectUserPermissions, selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import type { Permission } from '@/constants/permissions';

export const usePermissions = (): string[] => useAppSelector(selectUserPermissions);

export const useHasPermission = (permission: Permission): boolean =>
  usePermissions().includes(permission);

/** OR semantics, matching the backend's `require_any_permission`. */
export const useHasAnyPermission = (permissions: Permission[]): boolean => {
  const mine = usePermissions();
  return permissions.some((permission) => mine.includes(permission));
};

/**
 * "Must literally be Admin" — mirrors the backend's `AdminUser` extractor
 * (used for suppliers/supplier-products/purchases and inventory category
 * management, which are deliberately role-gated, not permission-gated, on
 * the backend). Not every gate is expressible as a permission string; this
 * is the frontend equivalent of that specific backend pattern, kept
 * separate from `useHasPermission`/`useHasAnyPermission`.
 */
export const useIsAdmin = (): boolean => useAppSelector(selectUserRole) === USER_ROLES.ADMIN;
