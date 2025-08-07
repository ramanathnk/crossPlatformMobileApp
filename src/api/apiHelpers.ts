const BAD_REQUEST_ERROR = 'Bad Request: Invalid format or missing fields.';
const UNAUTHORIZED_ERROR = 'Unauthorized: Invalid username or password.';
const INTERNAL_SERVER_ERROR = 'Internal Server Error: An unexpected error occurred.';
const NONSTANDARD_ERROR = 'An unexpected error occurred. Please try again later.';
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://www46.kisp.com/SnapTrackerMobileSecurity';

export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST',
  fallbackError: string,
  token?: string,
  body?: object
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMsg = fallbackError;
    let errorCode = response.status;
    let errorData: any = {};
    try {
      errorData = await response.json();
      errorMsg = getApiErrorMessageByCode(errorCode, errorData, errorMsg);
      console.log("errorData:", errorData);
    } catch {
      errorMsg = NONSTANDARD_ERROR;
    }
    // Throw a structured error object with all fields if available
    throw {
      code: errorCode,
      error: errorData.error || undefined,
      description: errorData.description || errorMsg,
      timestamp: errorData.timestamp || undefined,
      message: errorMsg,
    };
  }
  return response.json();
}

function getApiErrorMessageByCode(errorCode: number, errorData: any, fallback: string): string {
  switch (errorCode) {
    case 400:
      return (errorData && errorData.description) || BAD_REQUEST_ERROR;
    case 401:
      return (errorData && errorData.description) || UNAUTHORIZED_ERROR;
    case 500:
      return (errorData && errorData.description) || INTERNAL_SERVER_ERROR;
    default:
      return (errorData && errorData.description) || fallback;
  }
}
