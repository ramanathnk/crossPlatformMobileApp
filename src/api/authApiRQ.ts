// api/authHooks.ts
import { useMutation } from '@tanstack/react-query';
import { apiRequest, API_BASE } from './apiHelpers';
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
} from './types';

// Default error messages
const DEFAULT_LOGIN_ERROR = 'Login failed';
const FORGOT_PASSWORD_DEFAULT_ERROR = 'Failed to initiate password reset';
const RESET_PASSWORD_ERROR = 'Failed to reset password';
const REFRESH_TOKEN_DEFAULT_ERROR = 'Failed to refresh token';
const VERIFY_RESET_TOKEN_ERROR = 'Failed to verify reset token';
const LOGOUT_ERROR = 'Failed to logout';

// -------------------- HOOKS -------------------- //

export function useLogin() {
  return useMutation<LoginResponse, any, LoginRequest>({
    mutationFn: (data: LoginRequest) =>
      apiRequest<LoginResponse>(
        `${API_BASE}/api/v1/auth/login`,
        'POST',
        DEFAULT_LOGIN_ERROR,
        undefined,
        data,
      ),
  });
}

export function useVerifyResetToken() {
  return useMutation<VerifyResetTokenResponse, any, VerifyResetTokenRequest>({
    mutationFn: (data: VerifyResetTokenRequest) =>
      apiRequest<VerifyResetTokenResponse>(
        `${API_BASE}/api/v1/auth/verify-reset-token`,
        'POST',
        VERIFY_RESET_TOKEN_ERROR,
        undefined,
        data,
      ),
  });
}

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, any, ForgotPasswordRequest>({
    mutationFn: (data: ForgotPasswordRequest) =>
      apiRequest<ForgotPasswordResponse>(
        `${API_BASE}/api/v1/auth/forgot-password`,
        'POST',
        FORGOT_PASSWORD_DEFAULT_ERROR,
        undefined,
        data,
      ),
  });
}

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, any, ResetPasswordRequest>({
    mutationFn: (data: ResetPasswordRequest) =>
      apiRequest<ResetPasswordResponse>(
        `${API_BASE}/api/v1/auth/verify-reset-token`,
        'POST',
        RESET_PASSWORD_ERROR,
        undefined,
        data,
      ),
  });
}

export function useRefreshToken() {
  return useMutation<RefreshTokenResponse, any, RefreshTokenRequest>({
    mutationFn: (data: RefreshTokenRequest) =>
      apiRequest<RefreshTokenResponse>(
        `${API_BASE}/api/v1/auth/refresh-token`,
        'POST',
        REFRESH_TOKEN_DEFAULT_ERROR,
        undefined,
        data,
      ),
  });
}

export function useLogout() {
  return useMutation<LogoutResponse, any, string>({
    mutationFn: (token) =>
      apiRequest<LogoutResponse>(`${API_BASE}/api/v1/auth/logout`, 'POST', LOGOUT_ERROR, token),
  });
}
