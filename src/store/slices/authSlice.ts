import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storage';
import { USER_ROLES, UserRole } from '@/constants/roles';
import { getMeApi } from '@/features/auth/api/authApi';
import type { AuthUser } from '@/features/auth/types';

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isLocked: boolean;
}

const savedToken =
  typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;

const initialState: AuthState = {
  user: null,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
  isInitialized: !savedToken,
  isLoading: false,
  isLocked: false,
};

export const initializeAuth = createAsyncThunk('auth/initializeAuth', async (_, { dispatch }) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    dispatch(setInitialized(true));
    return;
  }

  dispatch(setLoading(true));
  try {
    const user = await getMeApi();
    dispatch(setUser(user));
  } catch (error) {
    console.warn('Failed to restore authentication session:', error);
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
    dispatch(setInitialized(true));
  }
});

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
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.isLoading = false;
      state.isLocked = false;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
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

export default authSlice.reducer;
