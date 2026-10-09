import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginSuccess,
  login,
  setUser,
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
  initializeAuth,
  type AuthUser,
} from '../authSlice';
import * as authApi from '@/features/auth/api/authApi';
import { USER_ROLES } from '@/constants/roles';
import { STORAGE_KEYS } from '@/constants/storage';

const mockUser: AuthUser = {
  id: 'user_1',
  username: 'testuser',
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
        },
      };

      expect(selectAuthUser(rootState)).toEqual(mockUser);
      expect(selectUserRole(rootState)).toBe(USER_ROLES.MANAGER);
      expect(selectIsAuthenticated(rootState)).toBe(true);
      expect(selectIsAuthInitialized(rootState)).toBe(true);
      expect(selectIsAuthLoading(rootState)).toBe(false);
      expect(selectIsPOSLocked(rootState)).toBe(true);
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

  describe('initializeAuth (strict online-only)', () => {
    const buildStore = () => configureStore({ reducer: { auth: authReducer } });

    it('sets the user on a successful /auth/me', async () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'token-123');
      vi.spyOn(authApi, 'getMeApi').mockResolvedValue(mockUser);

      const store = buildStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isInitialized).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('logs out when /auth/me rejects with 401', async () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'token-123');
      vi.spyOn(authApi, 'getMeApi').mockRejectedValue({ statusCode: 401, message: 'Unauthorized' });

      const store = buildStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('logs out when the backend is unreachable, with no cached-session fallback', async () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'token-123');
      vi.spyOn(authApi, 'getMeApi').mockRejectedValue({ statusCode: 0, message: 'Network error' });

      const store = buildStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('does nothing when there is no stored token, other than marking initialized', async () => {
      const getMeApiSpy = vi.spyOn(authApi, 'getMeApi');
      const store = buildStore();
      await store.dispatch(initializeAuth());

      expect(getMeApiSpy).not.toHaveBeenCalled();
      const state = store.getState().auth;
      expect(state.isInitialized).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
