import type { UserRole } from '@/constants';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
}
