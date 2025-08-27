import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * Mocked Manufacturer slice for local development / testing.
 * - Does not call any network APIs.
 * - Uses an in-memory dataset (module-level) to simulate server state.
 * - Exposes the same thunks/selectors signature as the real manufacturerSlice so it can be
 *   swapped into the store with minimal changes.
 */

/**
 * Types matching the real API shape
 */
export interface Manufacturer {
  manufacturerId: number;
  name: string;
  deviceTypeCount: number;
}

export type ManufacturerCreateRequest = {
  name: string;
};

export type ManufacturerUpdateRequest = {
  name: string;
};

/**
 * In-memory mock data. This persists across thunk calls while the app is running.
 * You can edit these initial records to suit testing needs.
 */
let mockManufacturers: Manufacturer[] = [
  { manufacturerId: 1, name: 'Honeywell', deviceTypeCount: 12 },
  { manufacturerId: 2, name: 'iOS', deviceTypeCount: 0 },
  { manufacturerId: 3, name: 'Apple', deviceTypeCount: 1 },
];

/**
 * Utility: simulate network latency
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Error normalization helper (keeps same shape/behavior as the real slice).
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
  }
  return fallback;
}

/**
 * Thunks (mocked)
 */

// Fetch all manufacturers (reads from in-memory mock)
export const fetchManufacturers = createAsyncThunk<Manufacturer[], void, { rejectValue: string }>(
  'manufacturers/fetch',
  async (_, thunkAPI) => {
    try {
      // simulate latency
      await delay(200);
      // Return a cloned array to avoid accidental external mutation
      return mockManufacturers.map((m) => ({ ...m }));
    } catch (err: unknown) {
      return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to fetch manufacturers'));
    }
  },
);

// Create manufacturer (adds to in-memory mock)
export const createManufacturerRequest = createAsyncThunk<
  Manufacturer,
  ManufacturerCreateRequest,
  { rejectValue: string }
>('manufacturers/create', async (payload, thunkAPI) => {
  try {
    await delay(250);
    if (!payload || !payload.name) {
      return thunkAPI.rejectWithValue('Invalid manufacturer payload');
    }
    const nextId =
      mockManufacturers.length > 0
        ? Math.max(...mockManufacturers.map((m) => m.manufacturerId)) + 1
        : 1;
    const newManufacturer: Manufacturer = {
      manufacturerId: nextId,
      name: payload.name,
      deviceTypeCount: 0,
    };
    mockManufacturers = [newManufacturer, ...mockManufacturers];
    // return a clone
    return { ...newManufacturer };
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to create manufacturer'));
  }
});

// Update manufacturer (updates in-memory mock)
export const updateManufacturerRequest = createAsyncThunk<
  Manufacturer,
  { manufacturerId: number; manufacturer: ManufacturerUpdateRequest },
  { rejectValue: string }
>('manufacturers/update', async (payload, thunkAPI) => {
  try {
    await delay(200);
    const { manufacturerId, manufacturer } = payload;
    const idx = mockManufacturers.findIndex((m) => m.manufacturerId === manufacturerId);
    if (idx === -1) {
      return thunkAPI.rejectWithValue('Manufacturer not found');
    }
    const updated: Manufacturer = {
      ...mockManufacturers[idx],
      name: manufacturer.name ?? mockManufacturers[idx].name,
    };
    // replace in mock array
    mockManufacturers = mockManufacturers.map((m) =>
      m.manufacturerId === manufacturerId ? updated : m,
    );
    return { ...updated };
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to update manufacturer'));
  }
});

// Delete manufacturer (removes from in-memory mock)
export const deleteManufacturerRequest = createAsyncThunk<
  number,
  { manufacturerId: number },
  { rejectValue: string }
>('manufacturers/delete', async (payload, thunkAPI) => {
  try {
    await delay(150);
    const { manufacturerId } = payload;
    const exists = mockManufacturers.some((m) => m.manufacturerId === manufacturerId);
    if (!exists) {
      return thunkAPI.rejectWithValue('Manufacturer not found');
    }
    mockManufacturers = mockManufacturers.filter((m) => m.manufacturerId !== manufacturerId);
    // return the id so reducers can remove it
    return manufacturerId;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Failed to delete manufacturer'));
  }
});

/**
 * Slice state and reducers (mirrors real manufacturerSlice)
 */
interface ManufacturersState {
  items: Manufacturer[];
  loading: boolean;
  creating: boolean;
  submittingId: number | null;
  error: string | null;
}

const initialState: ManufacturersState = {
  items: [],
  loading: false,
  creating: false,
  submittingId: null,
  error: null,
};

const manufacturersSlice = createSlice({
  name: 'manufacturersMock',
  initialState,
  reducers: {
    clearManufacturersError(state) {
      state.error = null;
    },
    // Optional: reset the mock dataset to initial sample data
    resetManufacturersMock(state) {
      mockManufacturers = [
        { manufacturerId: 1, name: 'Honeywell', deviceTypeCount: 12 },
        { manufacturerId: 2, name: 'iOS', deviceTypeCount: 0 },
        { manufacturerId: 3, name: 'Apple', deviceTypeCount: 1 },
      ];
      state.items = mockManufacturers.map((m) => ({ ...m }));
      state.loading = false;
      state.creating = false;
      state.submittingId = null;
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
    builder.addCase(deleteManufacturerRequest.fulfilled, (state, action: PayloadAction<number>) => {
      const deletedId = action.payload;
      state.items = state.items.filter((m) => m.manufacturerId !== deletedId);
      state.submittingId = null;
      state.error = null;
    });
    builder.addCase(deleteManufacturerRequest.rejected, (state, action) => {
      state.submittingId = null;
      state.error =
        (action.payload as string) || action.error?.message || 'Failed to delete manufacturer';
    });
  },
});

export const { clearManufacturersError, resetManufacturersMock } = manufacturersSlice.actions;

// Local RootState type for selector typing in tests
type RootState = {
  manufacturers: ManufacturersState;
};

// Selectors (adjusted to match the store key 'manufacturers' used in your index.ts)
export const selectManufacturersState = (state: RootState): ManufacturersState =>
  state.manufacturers;
export const selectManufacturers = (state: RootState) => selectManufacturersState(state).items;
export const selectManufacturersLoading = (state: RootState) =>
  selectManufacturersState(state).loading;
export const selectManufacturersCreating = (state: RootState) =>
  selectManufacturersState(state).creating;
export const selectManufacturersSubmittingId = (state: RootState) =>
  selectManufacturersState(state).submittingId;
export const selectManufacturersError = (state: RootState) => selectManufacturersState(state).error;

export default manufacturersSlice.reducer;
