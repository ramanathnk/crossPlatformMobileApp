export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mfaEnabled: boolean;
}
console.log('userApi.ts loaded');
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorMsg = 'Login failed';
    try {
      const errorData = await response.json();
      errorMsg = errorData.description || errorMsg;
    } catch {
        // ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
}

// Add more user-related API methods as needed