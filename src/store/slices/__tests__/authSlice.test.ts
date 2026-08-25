import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, {
  loginSuccess,
  login,
  setUser,
  restoreOfflineSession,
  logout,
  setInitialized,
  setLoading,
  lockPOS,
  unlockPOS,
  switchRole,
  selectAuthUser,
  selectUserRole,
  selectUserPermissions,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectIsAuthLoading,
  selectIsPOSLocked,
  selectIsOfflineSession,
  type AuthUser,
} from '../authSlice';
import { USER_ROLES } from '@/constants/roles';

vi.mock('@/offline/db/session', () => ({
  cacheSession: vi.fn().mockResolvedValue(undefined),
  clearCachedSession: vi.fn().mockResolvedValue(undefined),
  readCachedSession: vi.fn().mockResolvedValue(null),
}));

const mockUser: AuthUser = {
  id: 'user_1',
  email: 'test@example.com',
  name: 'Test Manager',
  role: USER_ROLES.MANAGER,
};

describe('authSlice reducer & actions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const getInitialState = () => authReducer(undefined, { type: '@@INIT' });

  it('sets correct default initial state', () => {
    const state = getInitialState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isLocked).toBe(false);
    expect(state.isOfflineSession).toBe(false);
  });

  it('handles loginSuccess and updates token and user', () => {
    const state = authReducer(
      getInitialState(),
      loginSuccess({ user: mockUser, token: 'token-123' })
    );

    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
    expect(state.isOfflineSession).toBe(false);
  });

  it('handles login action', () => {
    const state = authReducer(getInitialState(), login({ user: mockUser, token: 'token-456' }));

    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token-456');
    expect(state.isAuthenticated).toBe(true);
  });

  it('handles setUser', () => {
    const state = authReducer(getInitialState(), setUser(mockUser));
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isOfflineSession).toBe(false);
  });

  it('handles restoreOfflineSession and marks isOfflineSession true', () => {
    const state = authReducer(getInitialState(), restoreOfflineSession(mockUser));
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isOfflineSession).toBe(true);
  });

  it('handles logout and clears auth state', () => {
    const loggedInState = authReducer(
      getInitialState(),
      loginSuccess({ user: mockUser, token: 'token-123' })
    );

    const state = authReducer(loggedInState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isOfflineSession).toBe(false);
  });

  it('handles lockPOS and unlockPOS', () => {
    let state = authReducer(getInitialState(), lockPOS());
    expect(state.isLocked).toBe(true);

    state = authReducer(state, unlockPOS());
    expect(state.isLocked).toBe(false);
  });

  it('handles switchRole when user exists', () => {
    const loggedInState = authReducer(
      getInitialState(),
      loginSuccess({ user: mockUser, token: 'token-123' })
    );

    const state = authReducer(loggedInState, switchRole(USER_ROLES.ADMIN));
    expect(state.user?.role).toBe(USER_ROLES.ADMIN);
  });

  it('handles setInitialized and setLoading', () => {
    let state = authReducer(getInitialState(), setLoading(true));
    expect(state.isLoading).toBe(true);

    state = authReducer(state, setInitialized(true));
    expect(state.isInitialized).toBe(true);
  });

  describe('selectors', () => {
    it('returns values from state correctly', () => {
      const rootState = {
        auth: {
          user: mockUser,
          token: 'token-xyz',
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          isLocked: true,
          isOfflineSession: true,
        },
      };

      expect(selectAuthUser(rootState)).toEqual(mockUser);
      expect(selectUserRole(rootState)).toBe(USER_ROLES.MANAGER);
      expect(selectIsAuthenticated(rootState)).toBe(true);
      expect(selectIsAuthInitialized(rootState)).toBe(true);
      expect(selectIsAuthLoading(rootState)).toBe(false);
      expect(selectIsPOSLocked(rootState)).toBe(true);
      expect(selectIsOfflineSession(rootState)).toBe(true);
    });

    it('defaults to the least-privileged role, not Admin, when there is no user', () => {
      const rootState = { auth: getInitialState() };
      expect(rootState.auth.user).toBeNull();
      expect(selectUserRole(rootState)).toBe(USER_ROLES.STAFF);
    });

    it('returns an empty array from selectUserPermissions when there is no user', () => {
      const rootState = { auth: getInitialState() };
      expect(selectUserPermissions(rootState)).toEqual([]);
    });

    it('returns the permissions carried on the logged-in user', () => {
      const withPermissions: AuthUser = { ...mockUser, permissions: ['inventory:read'] };
      const state = authReducer(
        getInitialState(),
        loginSuccess({ user: withPermissions, token: 'token-123' })
      );
      expect(selectUserPermissions({ auth: state })).toEqual(['inventory:read']);
    });
  });
});
