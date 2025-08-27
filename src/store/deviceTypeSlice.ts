import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import {
  getAllDeviceTypes,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
  DeviceType,
  DeviceTypeRequestPayload,
} from '../api/deviceTypeApi';

/**
 * Device types state in Redux.
 */
interface DeviceTypesState {
  items: DeviceType[];
  loading: boolean;
  creating: boolean;
  submittingId: number | null; // id for update/delete in progress
  error: string | null;
}

const initialState: DeviceTypesState = {
  items: [],
  loading: false,
  creating: false,
  submittingId: null,
  error: null,
};

/**
 * Normalize server / thrown error into a string message.
 * Safe with unknown input (no `any`).
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.description === 'string') return e.description;
    if (typeof e.message === 'string') return e.message;
    if (e.error !== undefined) return String(e.error);
    if (typeof e.rawText === 'string') return e.rawText;
    // try nested response.data.message/data.error
    const response = e.response as Record<string, unknown> | undefined;
    if (response) {
      const data = response.data as Record<string, unknown> | undefined;
      if (data) {
        if (typeof data.message === 'string') return data.message;
        if (typeof data.error === 'string') return data.error;
        if (data.message !== undefined) return String(data.message);
        if (data.error !== undefined) return String(data.error);
      }
    }
  }
  return fallback;
}

/**
 * Thunks
 */
export const fetchDeviceTypes = createAsyncThunk<DeviceType[], void, { rejectValue: string }>(
  'deviceTypes/fetch',
  async (_, thunkAPI) => {
    try {
      const token = (await SecureStore.getItemAsync('accessToken')) || '';
      if (!token) throw new Error('No access token found. Please log in again.');
      const res = await getAllDeviceTypes(token);
      return res;
    } catch (err: unknown) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to fetch device types'));
    }
  },
);

export const createDeviceTypeRequest = createAsyncThunk<
  DeviceType,
  DeviceTypeRequestPayload,
  { rejectValue: string }
>('deviceTypes/create', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    const res = await createDeviceType(token, payload);
    return res;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to create device type'));
  }
});

export const updateDeviceTypeRequest = createAsyncThunk<
  DeviceType,
  { deviceTypeId: number; deviceType: DeviceTypeRequestPayload },
  { rejectValue: string }
>('deviceTypes/update', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    const res = await updateDeviceType(token, payload.deviceTypeId, payload.deviceType);
    return res;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to update device type'));
  }
});

export const deleteDeviceTypeRequest = createAsyncThunk<
  number,
  { deviceTypeId: number },
  { rejectValue: string }
>('deviceTypes/delete', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) throw new Error('No access token found. Please log in again.');
    await deleteDeviceType(token, payload.deviceTypeId);
    return payload.deviceTypeId;
  } catch (err: unknown) {
    // Safely inspect nested properties without `any`
    let status: number | undefined;
    let msg: string | undefined;

    if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>;
      const response = e.response as Record<string, unknown> | undefined;
      if (response && typeof response.status === 'number') {
        status = response.status;
      }
      if (typeof e.message === 'string') {
        msg = e.message;
      } else if (response && typeof response.data === 'object' && response.data !== null) {
        const data = response.data as Record<string, unknown>;
        if (typeof data.message === 'string') msg = data.message;
        else if (typeof data.error === 'string') msg = data.error;
      }
    }

    const parseErrorPattern = /Unexpected end of input|JSON Parse error|Unexpected token/u;
    if (status === 204 || (msg && parseErrorPattern.test(msg))) {
      // Treat empty-body JSON parse errors as success (server returned 204/empty)
      console.warn('deleteDeviceTypeRequest: treated JSON-parse-empty-body as success', { err });
      return payload.deviceTypeId;
    }

    const serverMessage = msg ?? extractErrorMessage(err, 'Failed to delete device type');
    return thunkAPI.rejectWithValue(serverMessage);
  }
});

const deviceTypesSlice = createSlice({
  name: 'deviceTypes',
  initialState,
  reducers: {
    clearDeviceTypesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDeviceTypes
    builder.addCase(fetchDeviceTypes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDeviceTypes.fulfilled, (state, action: PayloadAction<DeviceType[]>) => {
      state.loading = false;
      state.items = action.payload ?? [];
      state.error = null;
    });
    builder.addCase(fetchDeviceTypes.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to fetch device types';
    });

    // createDeviceTypeRequest
    builder.addCase(createDeviceTypeRequest.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(
      createDeviceTypeRequest.fulfilled,
      (state, action: PayloadAction<DeviceType>) => {
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
        state.creating = false;
        state.error = null;
      },
    );
    builder.addCase(createDeviceTypeRequest.rejected, (state, action) => {
      state.creating = false;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to create device type';
    });

    // updateDeviceTypeRequest
    builder.addCase(updateDeviceTypeRequest.pending, (state, action) => {
      state.submittingId = action.meta.arg.deviceTypeId;
      state.error = null;
    });
    builder.addCase(
      updateDeviceTypeRequest.fulfilled,
      (state, action: PayloadAction<DeviceType>) => {
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((dt) =>
            dt.deviceTypeId === updated.deviceTypeId ? updated : dt,
          );
        }
        state.submittingId = null;
        state.error = null;
      },
    );
    builder.addCase(updateDeviceTypeRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to update device type';
    });

    // deleteDeviceTypeRequest
    builder.addCase(deleteDeviceTypeRequest.pending, (state, action) => {
      state.submittingId = action.meta.arg.deviceTypeId;
      state.error = null;
    });
    builder.addCase(deleteDeviceTypeRequest.fulfilled, (state, action: PayloadAction<number>) => {
      const deletedId = action.payload;
      state.items = state.items.filter((dt) => dt.deviceTypeId !== deletedId);
      state.submittingId = null;
      state.error = null;
    });
    builder.addCase(deleteDeviceTypeRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to delete device type';
    });
  },
});

export const { clearDeviceTypesError } = deviceTypesSlice.actions;

// Local RootState type for selector typing. Replace/import your app RootState if available.
type RootState = {
  deviceTypes: DeviceTypesState;
};

// Selectors
export const selectDeviceTypesState = (state: RootState): DeviceTypesState => state.deviceTypes;
export const selectDeviceTypes = (state: RootState) => selectDeviceTypesState(state).items;
export const selectDeviceTypesLoading = (state: RootState) => selectDeviceTypesState(state).loading;
export const selectDeviceTypesCreating = (state: RootState) =>
  selectDeviceTypesState(state).creating;
export const selectDeviceTypesSubmittingId = (state: RootState) =>
  selectDeviceTypesState(state).submittingId;
export const selectDeviceTypesError = (state: RootState) => selectDeviceTypesState(state).error;

export default deviceTypesSlice.reducer;
