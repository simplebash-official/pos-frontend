import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storage';
import { USER_ROLES, UserRole } from '@/constants/roles';
import { getMeApi } from '@/features/auth/api/authApi';
import type { AuthUser } from '@/features/auth/types';
import { cacheSession, clearCachedSession, readCachedSession } from '@/offline/db/session';
import { connectivityMonitor } from '@/offline/connectivity/ConnectivityMonitor';
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

/**
 * Only 401/403 mean the credentials are no longer good. A 500 from
 * `/auth/me` on a cold start would otherwise sign every terminal out and
 * clear its cached session over a transient backend problem.
 */
const isRejectedSession = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const status = (error as ApiError).statusCode;
  return status === 401 || status === 403;
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

/**
 * Restores the cached identity from Dexie, dispatching `restoreOfflineSession`
 * on a hit. Shared by the already-offline fast path and the slow-timeout
 * fallback below so both apply the same "unreachable backend never
 * invalidates a session" rule via one code path.
 */
const tryRestoreFromCache = async (
  dispatch: (action: ReturnType<typeof restoreOfflineSession>) => void
): Promise<boolean> => {
  const cachedUser = await readCachedSession();
  if (cachedUser) {
    dispatch(restoreOfflineSession(cachedUser));
    return true;
  }
  return false;
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

    // `subscribe()` replays the current snapshot synchronously, so if the
    // app already knows it's offline (e.g. the connection dropped before
    // this reload) this resolves in the same tick — instead of RequireAuth
    // blocking the entire app behind getMeApi()'s full network timeout for
    // a request that cannot possibly succeed.
    connectivityMonitor.start();
    let unsubscribe: (() => void) | undefined;
    const offlineDetected = new Promise<void>((resolve) => {
      unsubscribe = connectivityMonitor.subscribe((snapshot) => {
        if (snapshot.state === 'offline') {
          resolve();
        }
      });
    });

    try {
      const outcome = await Promise.race([
        getMeApi().then((user) => ({ kind: 'user' as const, user })),
        offlineDetected.then(() => ({ kind: 'offline' as const })),
      ]);

      if (outcome.kind === 'offline') {
        const restored = await tryRestoreFromCache(dispatch);
        if (!restored) {
          dispatch(logout());
        }
        return;
      }

      dispatch(setUser(outcome.user));
      await cacheSession(outcome.user);
    } catch (error) {
      // A power cut is not a failed login. When the backend is simply
      // unreachable, restore the cached identity and carry on offline —
      // logging the cashier out would lock them out of their own till.
      // Only the server actively rejecting the credentials is a reason to
      // sign someone out. An unreachable backend, or one that is up but
      // erroring, says nothing about whether the session is still valid.
      const rejected = isRejectedSession(error);
      if (!rejected) {
        const restored = await tryRestoreFromCache(dispatch);
        if (restored) {
          return;
        }
        if (isNetworkError(error)) {
          // Nothing cached and no way to verify — the app cannot proceed.
          dispatch(logout());
          return;
        }
      }
      console.warn('Failed to restore authentication session:', error);
      dispatch(logout());
    } finally {
      unsubscribe?.();
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
      state.isOfflineSession = false;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
      // Cache at login, not only when `initializeAuth` succeeds. Otherwise a
      // cashier who logs in and then loses connectivity has nothing to
      // restore from on the next reload, and gets logged straight back out —
      // the offline grace period never applies until they happen to reload
      // once while online.
      void cacheSession(action.payload.user);
    },
    login: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isLoading = false;
      state.isLocked = false;
      state.isOfflineSession = false;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
      void cacheSession(action.payload.user);
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
// Defaults to the least-privileged role, not Admin — a null/not-yet-loaded
// user should never briefly render as if it were the most powerful role.
export const selectUserRole = (state: { auth: AuthState }): UserRole =>
  (state.auth.user?.role as UserRole) || USER_ROLES.STAFF;
export const selectUserPermissions = (state: { auth: AuthState }): string[] =>
  state.auth.user?.permissions ?? [];
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectIsAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsPOSLocked = (state: { auth: AuthState }) => state.auth.isLocked;
export const selectIsOfflineSession = (state: { auth: AuthState }) => state.auth.isOfflineSession;

export default authSlice.reducer;
