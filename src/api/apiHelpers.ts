const BAD_REQUEST_ERROR = 'Bad Request: Invalid format or missing fields.';
const UNAUTHORIZED_ERROR = 'Unauthorized: Invalid username or password.';
const INTERNAL_SERVER_ERROR = 'Internal Server Error: An unexpected error occurred.';
const NONSTANDARD_ERROR = 'An unexpected error occurred. Please try again later.';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || 'https://www46.kisp.com/SnapTrackerMobileSecurity';

interface ApiErrorData {
  error?: string;
  description?: string;
  timestamp?: string;
  [key: string]: unknown; // any other unknown fields
}

export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  fallbackError: string,
  token?: string,
  body?: object,
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
    const errorCode: number = response.status;
    let errorData: ApiErrorData = {};

    try {
      const json = (await response.json()) as unknown;
      if (typeof json === 'object' && json !== null) {
        errorData = json as ApiErrorData;
        errorMsg = getApiErrorMessageByCode(errorCode, errorData, errorMsg);
        console.log('errorData:', errorData);
      } else {
        errorMsg = NONSTANDARD_ERROR;
      }
    } catch {
      errorMsg = NONSTANDARD_ERROR;
    }

    throw {
      code: errorCode,
      error: errorData.error,
      description: errorData.description || errorMsg,
      timestamp: errorData.timestamp,
      message: errorMsg,
    };
  }

  return response.json() as Promise<T>;
}

function getApiErrorMessageByCode(
  errorCode: number,
  errorData: ApiErrorData,
  fallback: string,
): string {
  switch (errorCode) {
    case 400:
      return errorData.description || BAD_REQUEST_ERROR;
    case 401:
      return errorData.description || UNAUTHORIZED_ERROR;
    case 500:
      return errorData.description || INTERNAL_SERVER_ERROR;
    default:
      return errorData.description || fallback;
  }
}
