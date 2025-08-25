import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import {
  getAllManufacturers,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  Manufacturer,
  ManufacturerCreateRequest,
  ManufacturerUpdateRequest,
} from '../api/manufacturerApi';

/**
 * Manufacturers state kept in Redux so other screens can reuse it.
 * Mirrors the dealerSlice pattern: items, loading, creating, submittingId, error.
 */
interface ManufacturersState {
  items: Manufacturer[];
  loading: boolean; // loading for fetch
  creating: boolean;
  submittingId: number | null; // id for update/delete in progress
  error: string | null;
}

const initialState: ManufacturersState = {
  items: [],
  loading: false,
  creating: false,
  submittingId: null,
  error: null,
};

/**
 * Normalize server / thrown error into a string message.
 * Looks for structured fields commonly set by apiRequest.
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

// Fetch all manufacturers: thunk reads token from SecureStore internally
export const fetchManufacturers = createAsyncThunk<
  Manufacturer[],
  void,
  { rejectValue: string }
>('manufacturers/fetch', async (_, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    const res = await getAllManufacturers(token);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to fetch manufacturers'));
  }
});

// Create manufacturer
export const createManufacturerRequest = createAsyncThunk<
  Manufacturer,
  ManufacturerCreateRequest,
  { rejectValue: string }
>('manufacturers/create', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    const res = await createManufacturer(token, payload);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to create manufacturer'));
  }
});

// Update manufacturer
export const updateManufacturerRequest = createAsyncThunk<
  Manufacturer,
  { manufacturerId: number; manufacturer: ManufacturerUpdateRequest },
  { rejectValue: string }
>('manufacturers/update', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    const res = await updateManufacturer(token, payload.manufacturerId, payload.manufacturer);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to update manufacturer'));
  }
});

// Delete manufacturer
export const deleteManufacturerRequest = createAsyncThunk<
  number, // return the id that was deleted
  { manufacturerId: number },
  { rejectValue: string }
>('manufacturers/delete', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    // apiRequest returns null for 204 / empty bodies, so this should resolve normally.
    await deleteManufacturer(token, payload.manufacturerId);
    // return the id so reducer can remove it
    return payload.manufacturerId;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to delete manufacturer'));
  }
});

const manufacturersSlice = createSlice({
  name: 'manufacturers',
  initialState,
  reducers: {
    clearManufacturersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchManufacturers
    builder.addCase(fetchManufacturers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchManufacturers.fulfilled,
      (state, action: PayloadAction<Manufacturer[]>) => {
        state.loading = false;
        state.items = action.payload ?? [];
        state.error = null;
      },
    );
    builder.addCase(fetchManufacturers.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to fetch manufacturers';
    });

    // createManufacturerRequest
    builder.addCase(createManufacturerRequest.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(
      createManufacturerRequest.fulfilled,
      (state, action: PayloadAction<Manufacturer>) => {
        // prepend created manufacturer so UI sees the new record immediately
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
        state.creating = false;
        state.error = null;
      },
    );
    builder.addCase(createManufacturerRequest.rejected, (state, action) => {
      state.creating = false;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to create manufacturer';
    });

    // updateManufacturerRequest
    builder.addCase(updateManufacturerRequest.pending, (state, action) => {
      state.submittingId = action.meta.arg.manufacturerId;
      state.error = null;
    });
    builder.addCase(
      updateManufacturerRequest.fulfilled,
      (state, action: PayloadAction<Manufacturer>) => {
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((m) =>
            m.manufacturerId === updated.manufacturerId ? updated : m,
          );
        }
        state.submittingId = null;
        state.error = null;
      },
    );
    builder.addCase(updateManufacturerRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to update manufacturer';
    });

    // deleteManufacturerRequest
    builder.addCase(deleteManufacturerRequest.pending, (state, action) => {
      state.submittingId = action.meta.arg.manufacturerId;
      state.error = null;
    });
    builder.addCase(
      deleteManufacturerRequest.fulfilled,
      (state, action: PayloadAction<number>) => {
        const deletedId = action.payload;
        state.items = state.items.filter((m) => m.manufacturerId !== deletedId);
        state.submittingId = null;
        state.error = null;
      },
    );
    builder.addCase(deleteManufacturerRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to delete manufacturer';
    });
  },
});

export const { clearManufacturersError } = manufacturersSlice.actions;

// Selectors
export const selectManufacturersState = (state: any) =>
  state.manufacturers as ManufacturersState;
export const selectManufacturers = (state: any) => selectManufacturersState(state).items;
export const selectManufacturersLoading = (state: any) =>
  selectManufacturersState(state).loading;
export const selectManufacturersCreating = (state: any) =>
  selectManufacturersState(state).creating;
export const selectManufacturersSubmittingId = (state: any) =>
  selectManufacturersState(state).submittingId;
export const selectManufacturersError = (state: any) => selectManufacturersState(state).error;

export default manufacturersSlice.reducer;