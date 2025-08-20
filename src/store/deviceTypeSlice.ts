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
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message ?? 'Failed to fetch device types');
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
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message ?? 'Failed to create device type');
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
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.message ?? 'Failed to update device type');
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
  } catch (err: any) {
    const status = err?.response?.status;
    const msg = err?.message ?? '';
    if (status === 204 || /Unexpected end of input|JSON Parse error|Unexpected token/u.test(msg)) {
      console.warn('deleteDeviceTypeRequest: treated JSON-parse-empty-body as success', { err });
      return payload.deviceTypeId;
    }

    const serverMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      'Failed to delete device type';
    //console.error('deleteDeviceTypeRequest error:', err);
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

// Selectors
export const selectDeviceTypesState = (state: any) => state.deviceTypes as DeviceTypesState;
export const selectDeviceTypes = (state: any) => selectDeviceTypesState(state).items;
export const selectDeviceTypesLoading = (state: any) => selectDeviceTypesState(state).loading;
export const selectDeviceTypesCreating = (state: any) => selectDeviceTypesState(state).creating;
export const selectDeviceTypesSubmittingId = (state: any) =>
  selectDeviceTypesState(state).submittingId;
export const selectDeviceTypesError = (state: any) => selectDeviceTypesState(state).error;

export default deviceTypesSlice.reducer;
