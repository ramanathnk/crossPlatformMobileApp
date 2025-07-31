import { LoginRequest, LoginResponse } from './types';

// Mocked login function for development
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return new Promise<LoginResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: 'sample-access-token',
        refreshToken: 'sample-refresh-token',
        expiresIn: 3600,
        user: {
          userId: 1,
          username: data.username,
          email: 'sample@example.com',
          firstName: 'Sample',
          lastName: 'User',
          role: 'admin',
          mfaEnabled: false,
        },
      });
    }, 500); // Simulate network delay
  });
}
