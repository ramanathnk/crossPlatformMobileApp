import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import {
  getAllDealers,
  createDealer,
  updateDealer,
  deleteDealer,
  Dealer,
  DealerCreateRequest,
  DealerUpdateRequest,
} from '../api/dealerApi';

/**
 * Dealers state kept in Redux so other screens can reuse it.
 */
interface DealersState {
  items: Dealer[];
  loading: boolean; // loading for fetch
  creating: boolean;
  submittingId: number | null; // id for update/delete in progress
  error: string | null;
}

const initialState: DealersState = {
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
function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;

  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.description === 'string') return e.description;
    if (typeof e.message === 'string') return e.message;
    if (e.error !== undefined) return String(e.error);
    if (typeof e.rawText === 'string') return e.rawText;
  }

  return fallback;
}

/**
 * Thunks
 */

// Fetch all dealers: thunk reads token from SecureStore internally
export const fetchDealers = createAsyncThunk<Dealer[], void, { rejectValue: string }>(
  'dealers/fetch',
  async (_, thunkAPI) => {
    try {
      const token = (await SecureStore.getItemAsync('accessToken')) || '';
      if (!token) {
        return thunkAPI.rejectWithValue('No access token found. Please log in again.');
      }
      const res = await getAllDealers(token);
      return res;
    } catch (err: unknown) {
      //console.error('fetchDealers error:', err);
      return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to fetch dealers'));
    }
  },
);

// Create dealer
export const createDealerRequest = createAsyncThunk<
  Dealer,
  DealerCreateRequest,
  { rejectValue: string }
>('dealers/create', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    const res = await createDealer(token, payload);
    return res;
  } catch (err: unknown) {
    //console.error('createDealerRequest error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to create dealer'));
  }
});

// Update dealer
export const updateDealerRequest = createAsyncThunk<
  Dealer,
  { dealerId: number; dealer: DealerUpdateRequest },
  { rejectValue: string }
>('dealers/update', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    const res = await updateDealer(token, payload.dealerId, payload.dealer);
    return res;
  } catch (err: unknown) {
    //console.error('updateDealerRequest error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to update dealer'));
  }
});

// Delete dealer
export const deleteDealerRequest = createAsyncThunk<
  number, // return the id that was deleted
  { dealerId: number },
  { rejectValue: string }
>('dealers/delete', async (payload, thunkAPI) => {
  try {
    const token = (await SecureStore.getItemAsync('accessToken')) || '';
    if (!token) {
      return thunkAPI.rejectWithValue('No access token found. Please log in again.');
    }
    // apiRequest now returns null for 204 / empty bodies, so this should resolve normally.
    await deleteDealer(token, payload.dealerId);
    // return the id so reducer can remove it
    return payload.dealerId;
  } catch (err: unknown) {
    //console.error('deleteDealerRequest error:', err);
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to delete dealer'));
  }
});

const dealersSlice = createSlice({
  name: 'dealers',
  initialState,
  reducers: {
    clearDealersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDealers
    builder.addCase(fetchDealers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDealers.fulfilled, (state, action: PayloadAction<Dealer[]>) => {
      state.loading = false;
      state.items = action.payload ?? [];
      state.error = null;
    });
    builder.addCase(fetchDealers.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string | undefined) || action.error?.message || 'Failed to fetch dealers';
    });

    // createDealerRequest
    builder.addCase(createDealerRequest.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(createDealerRequest.fulfilled, (state, action: PayloadAction<Dealer>) => {
      // prepend created dealer so UI sees the new record immediately
      if (action.payload) {
        state.items = [action.payload, ...state.items];
      }
      state.creating = false;
      state.error = null;
    });
    builder.addCase(createDealerRequest.rejected, (state, action) => {
      state.creating = false;
      state.error =
        (action.payload as string | undefined) || action.error?.message || 'Failed to create dealer';
    });

    // updateDealerRequest
    builder.addCase(updateDealerRequest.pending, (state, action) => {
      state.submittingId = action.meta.arg.dealerId;
      state.error = null;
    });
    builder.addCase(updateDealerRequest.fulfilled, (state, action: PayloadAction<Dealer>) => {
      const updated = action.payload;
      if (updated) {
        state.items = state.items.map((d) => (d.dealerId === updated.dealerId ? updated : d));
      }
      state.submittingId = null;
      state.error = null;
    });
    builder.addCase(updateDealerRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string | undefined) || action.error?.message || 'Failed to update dealer';
    });

    // deleteDealerRequest
    builder.addCase(deleteDealerRequest.pending, (state, action) => {
      state.submittingId = action.meta.arg.dealerId;
      state.error = null;
    });
    builder.addCase(deleteDealerRequest.fulfilled, (state, action: PayloadAction<number>) => {
      const deletedId = action.payload;
      state.items = state.items.filter((d) => d.dealerId !== deletedId);
      state.submittingId = null;
      state.error = null;
    });
    builder.addCase(deleteDealerRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string | undefined) || action.error?.message || 'Failed to delete dealer';
    });
  },
});

export const { clearDealersError } = dealersSlice.actions;

// Local RootState type for selector typing. Replace/import your app RootState if available.
type RootState = {
  dealers: DealersState;
};

// Selectors
export const selectDealersState = (state: RootState) => state.dealers;
export const selectDealers = (state: RootState) => selectDealersState(state).items;
export const selectDealersLoading = (state: RootState) => selectDealersState(state).loading;
export const selectDealersCreating = (state: RootState) => selectDealersState(state).creating;
export const selectDealersSubmittingId = (state: RootState) => selectDealersState(state).submittingId;
export const selectDealersError = (state: RootState) => selectDealersState(state).error;

export default dealersSlice.reducer;