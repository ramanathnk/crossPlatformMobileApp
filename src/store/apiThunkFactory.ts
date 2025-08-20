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
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || defaultError);
    }
  });
}

/**
 * Helper to attach the standard pending/fulfilled/rejected handlers for a thunk.
 * Options allow customizing token/message extraction and whether to clear the token.
 *
 * The builder is typed as ActionReducerMapBuilder<AuthState> for stronger typing.
 * The thunk parameter is typed as AsyncThunk<any, any, any> which matches createAsyncThunk return type.
 */
export function attachThunkHandlers(
  builder: ActionReducerMapBuilder<AuthState>,
  thunk: AsyncThunk<any, any, any>,
  options?: {
    getToken?: (payload: any) => string | null;
    getMessage?: (payload: any) => string | null;
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
  builder.addCase(thunk.fulfilled, (state: AuthState, action: any) => {
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
      // safe any-cast: some responses may not have a message property
      state.message = (action.payload && (action.payload as any).message) ?? null;
    }
  });

  // rejected
  builder.addCase(thunk.rejected, (state: AuthState, action: any) => {
    state.loading = false;
    state.error = (action.payload as string) || defaultRejectedMessage;
  });
}
