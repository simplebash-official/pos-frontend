import { describe, it, expect } from 'vitest';
import { formatUserRole, USER_ROLES } from '../roles';

describe('formatUserRole', () => {
  it('capitalizes role strings properly', () => {
    expect(formatUserRole(USER_ROLES.ADMIN)).toBe('Admin');
    expect(formatUserRole(USER_ROLES.MANAGER)).toBe('Manager');
    expect(formatUserRole(USER_ROLES.STAFF)).toBe('Staff');
  });

  it('handles uppercase or mixed-case role strings', () => {
    expect(formatUserRole('ADMIN')).toBe('Admin');
    expect(formatUserRole('admin')).toBe('Admin');
    expect(formatUserRole('manager')).toBe('Manager');
    expect(formatUserRole('staff')).toBe('Staff');
  });

  it('returns empty string when given empty role', () => {
    expect(formatUserRole('')).toBe('');
  });
});
