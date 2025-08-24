import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE, apiRequest } from '../api/apiHelpers';
import * as SecureStore from 'expo-secure-store';
import {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  VerifyResetTokenRequest,
  VerifyResetTokenResponse,
} from '../api/types';
import * as thunk from './apiThunkFactory';

// -------------------- Thunks (some custom to persist tokens) -------------------- //

/**
 * Login thunk: calls the login API, persists access token in SecureStore if returned.
 */
export const loginThunk = createAsyncThunk<LoginResponse, LoginRequest>(
  'auth/login',
  async (payload, thunkAPI) => {
    try {
      const res = await apiRequest<LoginResponse>(
        `${API_BASE}/api/v1/auth/login`,
        'POST',
        'Login failed',
        undefined,
        payload as object,
      );
      // persist token if returned
      if (res && (res as any).accessToken) {
        try {
          await SecureStore.setItemAsync('accessToken', (res as any).accessToken);
        } catch (e) {
          // don't block success if SecureStore fails; just log
          console.warn('Failed to persist accessToken in SecureStore', e);
        }
      }
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err || 'Login failed');
    }
  },
);

/**
 * refreshTokenThunk: calls refresh endpoint and persists new access token if provided.
 */
export const refreshTokenThunk = createAsyncThunk<RefreshTokenResponse, RefreshTokenRequest>(
  'auth/refreshToken',
  async (payload, thunkAPI) => {
    try {
      const res = await apiRequest<RefreshTokenResponse>(
        `${API_BASE}/api/v1/auth/refresh-token`,
        'POST',
        'Failed to refresh token',
        undefined,
        payload as object,
      );
      if (res && (res as any).accessToken) {
        try {
          await SecureStore.setItemAsync('accessToken', (res as any).accessToken);
        } catch (e) {
          console.warn('Failed to persist refreshed accessToken in SecureStore', e);
        }
      }
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err || 'Failed to refresh token');
    }
  },
);

/**
 * logoutThunk: call logout endpoint (pass token) and remove token from SecureStore on success.
 */
export const logoutThunk = createAsyncThunk<LogoutResponse, string>(
  'auth/logout',
  async (token, thunkAPI) => {
    try {
      const res = await apiRequest<LogoutResponse>(
        `${API_BASE}/api/v1/auth/logout`,
        'POST',
        'Failed to logout',
        token,
      );
      // remove persisted token on successful logout
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch (e) {
        console.warn('Failed to delete accessToken from SecureStore', e);
      }
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err || 'Failed to logout');
    }
  },
);

// Thunks that can be created with the generic factory (no extra side-effects)
export const forgotPasswordThunk = thunk.createApiThunk<
  ForgotPasswordResponse,
  ForgotPasswordRequest
>(
  'forgotPassword',
  `${API_BASE}/api/v1/auth/forgot-password`,
  'POST',
  'Failed to initiate password reset',
);

export const verifyResetTokenThunk = thunk.createApiThunk<
  VerifyResetTokenResponse,
  VerifyResetTokenRequest
>(
  'verifyResetToken',
  `${API_BASE}/api/v1/auth/verify-reset-token`,
  'POST',
  'Failed to verify reset token',
);

export const resetPasswordThunk = thunk.createApiThunk<ResetPasswordResponse, ResetPasswordRequest>(
  'resetPassword',
  `${API_BASE}/api/v1/auth/reset-password`,
  'POST',
  'Failed to reset password',
);

// -------------------- Slice -------------------- //

const authSlice = createSlice({
  name: 'auth',
  initialState: thunk.initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // login: store token from response.accessToken (if present) and message (guarded via any)
    thunk.attachThunkHandlers(builder, loginThunk, {
      getToken: (payload: any) => (payload ? ((payload as any).accessToken ?? null) : null),
      // message may not exist on LoginResponse in your typings; use a safe any-accessor
      getMessage: (payload: any) => (payload ? ((payload as any).message ?? null) : null),
      defaultRejectedMessage: 'Login failed',
    });

    // forgot password: store token if present, but only persist message when token exists
    thunk.attachThunkHandlers(builder, forgotPasswordThunk, {
      // If the forgot-password response contains a token (ephemeral reset token), store it in state.token.
      // This token will be used to allow the user to reset the password and will be cleared once reset is successful.
      getToken: (payload: any) => (payload ? ((payload as any).token ?? null) : null),
      // Only store a success message when the payload actually includes a token.
      getMessage: (payload: any) =>
        payload && (payload as any).token
          ? ((payload as ForgotPasswordResponse).message ?? 'Password reset email sent')
          : null,
      defaultRejectedMessage: 'Failed to initiate password reset',
    });

    // verify reset token: message only
    thunk.attachThunkHandlers(builder, verifyResetTokenThunk, {
      getMessage: (payload: any) =>
        payload
          ? ((payload as VerifyResetTokenResponse).message ?? 'Token verified')
          : 'Token verified',
      defaultRejectedMessage: 'Failed to verify reset token',
    });

    // reset password: do NOT store any message or token on success.
    // We still clear the ephemeral token (if present) so it cannot be reused.
    thunk.attachThunkHandlers(builder, resetPasswordThunk, {
      clearTokenOnFulfilled: true, // clear the ephemeral reset token once password reset succeeds
      // Explicitly return null to avoid storing any success message in the slice.
      getMessage: () => null,
      defaultRejectedMessage: 'Failed to reset password',
    });

    // refresh token: update token if returned (don't assume a message property exists)
    thunk.attachThunkHandlers(builder, refreshTokenThunk, {
      getToken: (payload: any) =>
        payload ? ((payload as RefreshTokenResponse).accessToken ?? null) : null,
      defaultRejectedMessage: 'Failed to refresh token',
    });

    // logout: clear token on fulfilled
    thunk.attachThunkHandlers(builder, logoutThunk, {
      clearTokenOnFulfilled: true,
      getMessage: (payload: any) =>
        payload ? ((payload as LogoutResponse).message ?? 'Logged out') : 'Logged out',
      defaultRejectedMessage: 'Failed to logout',
    });
  },
});

export const { setToken, clearToken, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
