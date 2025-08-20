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
  [key: string]: unknown;
}

/**
 * Unified API request helper.
 *
 * Notes:
 * - For responses with empty body (e.g. 204 No Content), this returns `null` (as T).
 *   Callers should treat a null result as "no content" / successful-but-no-body.
 * - All non-OK responses will throw an object containing `code`, `message`, `description`
 *   and any parsed server error payload (if present).
 */
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

  const status = response.status;
  // Read raw text first so we can safely handle empty bodies without throwing.
  const rawText = await response.text();

  if (!response.ok) {
    let errorMsg = fallbackError;
    let errorData: ApiErrorData = {};

    if (rawText && rawText.trim().length > 0) {
      try {
        const parsed = JSON.parse(rawText);
        if (typeof parsed === 'object' && parsed !== null) {
          errorData = parsed as ApiErrorData;
          errorMsg = getApiErrorMessageByCode(status, errorData, errorMsg);
          console.log('errorData:', errorData);
        } else {
          // Unexpected non-object response body
          errorMsg = NONSTANDARD_ERROR;
        }
      } catch (parseErr) {
        // Couldn't parse error body as JSON; include rawText for debugging
        console.warn('apiRequest: failed to parse error response as JSON', {
          url,
          status,
          rawText,
          parseErr,
        });
        errorMsg = NONSTANDARD_ERROR;
      }
    } else {
      // No body provided by server with an error status
      errorMsg = NONSTANDARD_ERROR;
    }

    throw {
      code: status,
      error: errorData.error,
      description: errorData.description || errorMsg,
      timestamp: errorData.timestamp,
      message: errorMsg,
      rawText,
    };
  }

  // Successful response (2xx)
  // If body is empty (e.g. 204 No Content or empty string), return null so callers don't attempt JSON.parse on nothing.
  if (!rawText || rawText.trim().length === 0) {
    return null as unknown as T;
  }

  try {
    const parsed = JSON.parse(rawText) as T;
    return parsed;
  } catch (parseErr) {
    // Clearer error for invalid JSON on successful status
    // console.error('apiRequest: invalid JSON in successful response', {
    //   url,
    //   status,
    //   rawText,
    //   parseErr,
    // });
    throw {
      code: status,
      message: 'Invalid JSON response from server',
      description: NONSTANDARD_ERROR,
      rawText,
    };
  }
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
