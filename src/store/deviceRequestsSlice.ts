import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import {
  getPendingRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  registerDevice,
  DeviceRegistrationRequest,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from '../api/deviceRegistrationApi';

/**
 * State for device requests (pending registrations)
 */
interface DeviceRequestsState {
  items: DeviceRegistrationRequest[];
  loading: boolean;
  error: string | null;
  submittingRequestId: number | null; // id of request being approved/denied
  registering: boolean; // true while submitting a register-device request
  registerError: string | null;
}

const initialState: DeviceRequestsState = {
  items: [],
  loading: false,
  error: null,
  submittingRequestId: null,
  registering: false,
  registerError: null,
};

/**
 * Normalize server / thrown error into a string message.
 */
function extractErrorMessage(err: any, fallback: string) {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err?.description) return err.description;
  if (err?.message) return err.message;
  if (err?.error) return String(err.error);
  if (err?.rawText) return String(err.rawText);
  return fallback;
}

/**
 * Thunks
 */

// Fetch pending registration requests.
// Reads token from SecureStore so callers don't need to pass it.
export const fetchPendingRequests = createAsyncThunk<
  DeviceRegistrationRequest[],
  void,
  { rejectValue: string }
>('deviceRequests/fetchPending', async (_, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    const res = await getPendingRegistrationRequests(token);
    return res;
  } catch (err: any) {
    console.warn('fetchPendingRequests error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to fetch pending requests'));
  }
});

// Approve a single request. payload: { requestId, notes? }
export const approveRequest = createAsyncThunk<
  // return value: we don't rely on payload shape in reducer, but keep types aligned
  DeviceRegistrationRequest | void,
  { requestId: number; notes?: string },
  { rejectValue: string }
>('deviceRequests/approve', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    // call API; some implementations may return the updated request, some may return void
    const res = await approveRegistrationRequest(token, payload.requestId, payload.notes);
    return res;
  } catch (err: any) {
    console.warn('approveRequest error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to approve request'));
  }
});

// Reject a single request. payload: { requestId, rejectionReason, notes? }
export const rejectRequest = createAsyncThunk<
  DeviceRegistrationRequest | void,
  { requestId: number; rejectionReason: string; notes?: string },
  { rejectValue: string }
>('deviceRequests/reject', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    const res = await rejectRegistrationRequest(
      token,
      payload.requestId,
      payload.rejectionReason,
      payload.notes,
    );
    return res;
  } catch (err: any) {
    console.warn('rejectRequest error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to reject request'));
  }
});

/**
 * Register device thunk
 * payload is the RegisterDeviceRequest body; thunk reads token internally.
 */
export const registerDeviceRequest = createAsyncThunk<
  RegisterDeviceResponse | void,
  RegisterDeviceRequest,
  { rejectValue: string }
>('deviceRequests/register', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    // Note: registerDevice expects the RegisterDeviceRequest as the first argument (per API module types),
    // and the token as the second argument. Swap the order to match the function signature.
    const res = await registerDevice(payload, token);
    return res;
  } catch (err: any) {
    console.warn('registerDeviceRequest error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to register device'));
  }
});

const deviceRequestsSlice = createSlice({
  name: 'deviceRequests',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
      state.registerError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPendingRequests
    builder.addCase(fetchPendingRequests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPendingRequests.fulfilled,
      (state, action: PayloadAction<DeviceRegistrationRequest[]>) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.error = null;
      },
    );
    builder.addCase(fetchPendingRequests.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to load pending requests';
    });

    // approveRequest
    builder.addCase(approveRequest.pending, (state, action) => {
      state.error = null;
      state.submittingRequestId = action.meta.arg.requestId;
    });
    builder.addCase(approveRequest.fulfilled, (state, action) => {
      // Use the requestId from the thunk arg (meta.arg) which is always present.
      // If API returned an updated request, action.payload may exist; but do not rely on it.
      const requestId = action.meta?.arg?.requestId ?? (action.payload as any)?.requestId;
      if (typeof requestId === 'number') {
        state.items = state.items.filter((r) => r.requestId !== requestId);
      }
      state.submittingRequestId = null;
      state.error = null;
    });
    builder.addCase(approveRequest.rejected, (state, action) => {
      state.submittingRequestId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to approve request';
    });

    // rejectRequest
    builder.addCase(rejectRequest.pending, (state, action) => {
      state.error = null;
      state.submittingRequestId = action.meta.arg.requestId;
    });
    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const requestId = action.meta?.arg?.requestId ?? (action.payload as any)?.requestId;
      if (typeof requestId === 'number') {
        state.items = state.items.filter((r) => r.requestId !== requestId);
      }
      state.submittingRequestId = null;
      state.error = null;
    });
    builder.addCase(rejectRequest.rejected, (state, action) => {
      state.submittingRequestId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to reject request';
    });

    // registerDeviceRequest
    builder.addCase(registerDeviceRequest.pending, (state) => {
      state.registering = true;
      state.registerError = null;
    });
    builder.addCase(registerDeviceRequest.fulfilled, (state) => {
      // We don't necessarily update items here because registration may create a pending request
      // on the server that will be fetched by fetchPendingRequests. Caller can dispatch that if needed.
      state.registering = false;
      state.registerError = null;
    });
    builder.addCase(registerDeviceRequest.rejected, (state, action) => {
      state.registering = false;
      state.registerError =
        (action.payload as string) || action.error?.message || 'Failed to register device';
    });
  },
});

export const { clearError } = deviceRequestsSlice.actions;

// Selectors
export const selectDeviceRequestsState = (state: any) =>
  state.deviceRequests as DeviceRequestsState;
export const selectPendingRequests = (state: any) => selectDeviceRequestsState(state).items;
export const selectDeviceRequestsLoading = (state: any) => selectDeviceRequestsState(state).loading;
export const selectDeviceRequestsError = (state: any) => selectDeviceRequestsState(state).error;
export const selectSubmittingRequestId = (state: any) =>
  selectDeviceRequestsState(state).submittingRequestId;
export const selectRegistering = (state: any) => selectDeviceRequestsState(state).registering;
export const selectRegisterError = (state: any) => selectDeviceRequestsState(state).registerError;

export default deviceRequestsSlice.reducer;
