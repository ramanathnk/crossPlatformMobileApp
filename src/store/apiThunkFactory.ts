import { createAsyncThunk, ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../api/apiHelpers';

export interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

export const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
  message: null,
};

/**
 * Small helper to extract a message from an unknown error value.
 */
function getErrorMessage(err: unknown): string | undefined {
  if (!err) return undefined;
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
  }
  return undefined;
}

/**
 * Small factory that creates createAsyncThunk wrappers around apiRequest.
 *
 * By default the payload is sent as the request body. If `useAuthToken` is true,
 * the payload is passed as the "token" argument to apiRequest (useful for logout).
 */
export function createApiThunk<Res, Req>(
  typePrefix: string,
  url: string,
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'POST',
  defaultError = 'Request failed',
  useAuthToken = false,
) {
  return createAsyncThunk<Res, Req>(`auth/${typePrefix}`, async (payload: Req, thunkAPI) => {
    try {
      const res = useAuthToken
        ? await apiRequest<Res>(url, method, defaultError, payload as unknown as string)
        : await apiRequest<Res>(url, method, defaultError, undefined, payload as unknown as object);
      return res;
    } catch (err: unknown) {
      const msg = getErrorMessage(err) ?? defaultError;
      return thunkAPI.rejectWithValue(msg);
    }
  });
}

/**
 * Helper to attach the standard pending/fulfilled/rejected handlers for a thunk.
 * Options allow customizing token/message extraction and whether to clear the token.
 *
 * The builder is typed as ActionReducerMapBuilder<AuthState> for stronger typing.
 * The thunk parameter is a generic AsyncThunk so we can preserve payload types and avoid `any`.
 */
export function attachThunkHandlers<TRes = unknown, TReq = unknown>(
  builder: ActionReducerMapBuilder<AuthState>,
  thunk: AsyncThunk<TRes, TReq, { rejectValue?: string }>,
  options?: {
    getToken?: (payload: TRes | null | undefined) => string | null;
    getMessage?: (payload: TRes | null | undefined) => string | null;
    clearTokenOnFulfilled?: boolean;
    defaultRejectedMessage?: string;
  },
) {
  const defaultRejectedMessage = options?.defaultRejectedMessage ?? 'Request failed';

  // pending
  builder.addCase(thunk.pending, (state: AuthState) => {
    state.loading = true;
    state.error = null;
    state.message = null;
  });

  // fulfilled
  builder.addCase(thunk.fulfilled, (state: AuthState, action: { payload: TRes | undefined }) => {
    state.loading = false;
    state.error = null;

    if (options?.clearTokenOnFulfilled) {
      state.token = null;
    }

    if (options?.getToken) {
      const token = options.getToken(action.payload);
      if (token) state.token = token;
    }

    if (options?.getMessage) {
      state.message = options.getMessage(action.payload) ?? null;
    } else {
      // Safe fallback: try to read message property if payload is an object
      const payload = action.payload as unknown;
      if (typeof payload === 'object' && payload !== null) {
        const p = payload as Record<string, unknown>;
        const maybeMessage = p.message;
        state.message = typeof maybeMessage === 'string' ? maybeMessage : null;
      } else {
        state.message = null;
      }
    }
  });

  // rejected
  builder.addCase(
    thunk.rejected,
    (state: AuthState, action: { payload?: unknown; error?: { message?: string } }) => {
      state.loading = false;
      const rejectedMessage =
        typeof action.payload === 'string'
          ? action.payload
          : (action.error?.message ?? defaultRejectedMessage);
      state.error = rejectedMessage;
    },
  );
}
