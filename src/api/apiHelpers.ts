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
 * Utility to mask long tokens for logs.
 */
function maskToken(value?: string) {
  if (!value) return '<none>';
  // Keep prefix if "Bearer " is present but mask the token part.
  if (value.startsWith('Bearer ')) {
    const t = value.slice(7);
    if (t.length <= 8) return `Bearer ${'*'.repeat(4)}`;
    return `Bearer ${t.slice(0, 6)}...${t.slice(-4)}`;
  }
  return value.length <= 10 ? '***' : `${value.slice(0, 6)}...${value.slice(-4)}`;
}

/**
 * Unified API request helper.
 *
 * - Only sets Content-Type when a body is provided.
 * - Does not send a request body when `body` is undefined or when it's an empty object.
 * - Adds debug logging of outgoing request (masked Authorization + body) when not in production.
 */
export async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  fallbackError: string,
  token?: string,
  body?: object,
): Promise<T> {
  // Treat empty plain object as "no body"
  const hasBody =
    body !== undefined &&
    !(Object.prototype.toString.call(body) === '[object Object]' && Object.keys(body).length === 0);

  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  // --- DEBUG LOGGING: show outgoing request details (masked token + body) ---
  // Only log when not in production. Use console.debug (or console.log) so logs are visible in RN dev.
  if (process.env.NODE_ENV !== 'production') {
    // Original (possibly structured) body
    const originalBody = body;
    // The actual JSON string we will send (or undefined)
    const bodyString = hasBody ? JSON.stringify(body) : undefined;

    // Mask Authorization header for logs
    const maskedHeaders = { ...headers };
    if (maskedHeaders.Authorization) {
      maskedHeaders.Authorization = maskToken(maskedHeaders.Authorization);
    }

    console.debug('[apiRequest] OUTGOING', {
      method,
      url,
      headers: maskedHeaders,
      // Print the structured object and the string to see exactly what will be transmitted
      bodyObject: originalBody,
      bodyString,
    });
  }
  // -------------------------------------------------------------------------

  const response = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
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
