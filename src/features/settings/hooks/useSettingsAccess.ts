import { useAppSelector } from '@/store/hooks';
import { selectUserPermissions, selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import type { SettingsAccess } from '../settingsSections';

/** Who is looking at Settings: an Admin sees everything, anyone else only what their permissions grant. */
export const useSettingsAccess = (): SettingsAccess => ({
  isAdmin: useAppSelector(selectUserRole) === USER_ROLES.ADMIN,
  permissions: useAppSelector(selectUserPermissions),
});
