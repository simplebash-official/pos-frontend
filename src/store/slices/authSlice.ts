import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/storage';
import { USER_ROLES, UserRole } from '@/constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLocked: boolean;
}

const DEFAULT_USER: AuthUser = {
  id: 'usr-admin',
  name: 'Store Owner (Admin)',
  email: 'admin@pos.lk',
  role: USER_ROLES.ADMIN,
};

const savedToken =
  typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;

const initialState: AuthState = {
  user: savedToken ? DEFAULT_USER : DEFAULT_USER,
  token: savedToken || 'fake-jwt-token-pos-system',
  isAuthenticated: true,
  isLocked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLocked = false;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLocked = false;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
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

export const { login, logout, lockPOS, unlockPOS, switchRole } = authSlice.actions;

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.role || USER_ROLES.ADMIN;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsPOSLocked = (state: { auth: AuthState }) => state.auth.isLocked;

export default authSlice.reducer;
