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
  LogoutResponse
} from './types';

const DEFAULT_LOGIN_ERROR = 'Login failed';
const FORGOT_PASSWORD_DEFAULT_ERROR = 'Failed to initiate password reset';
const REFRESH_TOKEN_DEFAULT_ERROR = 'Failed to refresh token';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    `${API_BASE}/api/v1/auth/login`,
    'POST',
    DEFAULT_LOGIN_ERROR,
    undefined,
    data
  );
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>(
    `${API_BASE}/api/v1/auth/forgot-password`,
    'POST',
    FORGOT_PASSWORD_DEFAULT_ERROR,
    undefined,
    data
  );
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>(
    `${API_BASE}/api/v1/auth/verify-reset-token`,
    'POST',
    'Failed to reset password',
    undefined,
    data
  );
}

export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  return apiRequest<RefreshTokenResponse>(
    `${API_BASE}/api/v1/auth/refresh-token`,
    'POST',
    REFRESH_TOKEN_DEFAULT_ERROR,
    undefined,
    data
  );
}

export async function logout(token: string): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(
    `${API_BASE}/api/v1/auth/logout`,
    'POST',
    'Failed to logout',
    token
  );
}
