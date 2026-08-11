import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storage';
import { USER_ROLES, UserRole } from '@/constants/roles';
import { getMeApi } from '@/features/auth/api/authApi';
import type { AuthUser } from '@/features/auth/types';
import { cacheSession, clearCachedSession, readCachedSession } from '@/offline/db/session';
import type { ApiError } from '@/shared/types/common';

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isLocked: boolean;
  /** True when the identity was restored from cache because the backend was unreachable. */
  isOfflineSession: boolean;
}

/** A rejected request that never reached the server surfaces as `statusCode: 0`. */
const isNetworkError = (error: unknown): boolean => {
  return typeof error === 'object' && error !== null && (error as ApiError).statusCode === 0;
};

const savedToken =
  typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;

const initialState: AuthState = {
  user: null,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
  isInitialized: !savedToken,
  isLoading: false,
  isLocked: false,
  isOfflineSession: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch, getState }) => {
    const state = getState() as { auth: AuthState };
    if (state.auth.isLoading || (state.auth.isInitialized && state.auth.user)) {
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      dispatch(setInitialized(true));
      return;
    }

    dispatch(setLoading(true));
    try {
      const user = await getMeApi();
      dispatch(setUser(user));
      await cacheSession(user);
    } catch (error) {
      // A power cut is not a failed login. When the backend is simply
      // unreachable, restore the cached identity and carry on offline —
      // logging the cashier out would lock them out of their own till.
      if (isNetworkError(error)) {
        const cachedUser = await readCachedSession();
        if (cachedUser) {
          dispatch(restoreOfflineSession(cachedUser));
        } else {
          // Nothing cached and no way to verify — the app cannot proceed.
          dispatch(logout());
        }
      } else {
        console.warn('Failed to restore authentication session:', error);
        dispatch(logout());
      }
    } finally {
      dispatch(setLoading(false));
      dispatch(setInitialized(true));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
      state.isLocked = false;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
    },
    login: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
      state.isLocked = false;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
      state.isOfflineSession = false;
    },
    /** Identity restored from the local cache because the backend was unreachable. */
    restoreOfflineSession: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
      state.isOfflineSession = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.isLoading = false;
      state.isLocked = false;
      state.isOfflineSession = false;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      void clearCachedSession();
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    lockPOS: (state) => {
      state.isLocked = true;
    },
    unlockPOS: (state) => {
      state.isLocked = false;
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
});

export const {
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
} = authSlice.actions;

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }): UserRole =>
  (state.auth.user?.role as UserRole) || USER_ROLES.ADMIN;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectIsAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsPOSLocked = (state: { auth: AuthState }) => state.auth.isLocked;
export const selectIsOfflineSession = (state: { auth: AuthState }) => state.auth.isOfflineSession;

export default authSlice.reducer;
